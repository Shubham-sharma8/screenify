#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execFileSync } = require("child_process");

const BLOCK_SIZE = 4194304;

function computeIntegrity(buf) {
  const hash = crypto.createHash("sha256").update(buf).digest("hex");
  const blocks = [];
  if (buf.length === 0) {
    blocks.push(
      crypto.createHash("sha256").update(Buffer.alloc(0)).digest("hex"),
    );
  } else {
    for (let i = 0; i < buf.length; i += BLOCK_SIZE) {
      const slice = buf.slice(i, Math.min(i + BLOCK_SIZE, buf.length));
      blocks.push(crypto.createHash("sha256").update(slice).digest("hex"));
    }
  }
  return {
    algorithm: "SHA256",
    hash,
    blockSize: BLOCK_SIZE,
    blocks,
  };
}

function repackScreenifyBundle({ srcRoot, appBundlePath, installToApplications }) {
  if (!fs.existsSync(appBundlePath)) {
    throw new Error(`App bundle not found at: ${appBundlePath}`);
  }

  const asarPath = path.join(appBundlePath, "Contents/Resources/app.asar");
  const unpackedRoot = path.join(
    appBundlePath,
    "Contents/Resources/app.asar.unpacked",
  );
  const origBuf = fs.readFileSync(asarPath);
  const origU1 = origBuf.readUInt32LE(4);
  const origU3 = origBuf.readUInt32LE(12);
  const origPayloadStart = 8 + origU1;
  const oldHeaderHash = crypto
    .createHash("sha256")
    .update(origBuf.slice(16, 16 + origU3))
    .digest("hex");
  const header = JSON.parse(origBuf.slice(16, 16 + origU3).toString("utf8"));

  const mainDir = path.join(srcRoot, "main");
  if (fs.existsSync(mainDir) && header.files && header.files.main && header.files.main.files) {
    for (const entry of fs.readdirSync(mainDir)) {
      const fullPath = path.join(mainDir, entry);
      if (fs.statSync(fullPath).isFile() && !header.files.main.files[entry]) {
        header.files.main.files[entry] = { size: 0, offset: "0" };
      }
    }
  }

  const payloadChunks = [];
  let currentOffset = 0n;

  function processNode(node, relPath = "") {
    if (node.files) {
      for (const [name, child] of Object.entries(node.files)) {
        processNode(child, relPath ? `${relPath}/${name}` : name);
      }
      return;
    }
    if (node.link) {
      return;
    }
    if (node.unpacked) {
      const diskPath = path.join(unpackedRoot, relPath);
      if (fs.existsSync(diskPath)) {
        const fileBuf = fs.readFileSync(diskPath);
        node.size = fileBuf.length;
        node.integrity = computeIntegrity(fileBuf);
      }
      return;
    }

    let fileBuf;
    if (relPath === "package.json" || relPath.startsWith("main/")) {
      fileBuf = fs.readFileSync(path.join(srcRoot, relPath));
    } else {
      const oldOffset = Number(node.offset);
      const oldSize = Number(node.size);
      fileBuf = origBuf.slice(
        origPayloadStart + oldOffset,
        origPayloadStart + oldOffset + oldSize,
      );
    }

    node.size = fileBuf.length;
    node.offset = currentOffset.toString();
    node.integrity = computeIntegrity(fileBuf);
    payloadChunks.push(fileBuf);
    currentOffset += BigInt(fileBuf.length);
  }

  processNode(header);

  const newHeaderBuf = Buffer.from(JSON.stringify(header), "utf8");
  const u3 = newHeaderBuf.length;
  const alignedSize = Math.ceil(u3 / 4) * 4;
  const padLen = alignedSize - u3;
  const pickleHeader = Buffer.alloc(16);
  pickleHeader.writeUInt32LE(4, 0);
  pickleHeader.writeUInt32LE(alignedSize + 8, 4);
  pickleHeader.writeUInt32LE(alignedSize + 4, 8);
  pickleHeader.writeUInt32LE(u3, 12);

  const finalAsarBuf = Buffer.concat([
    pickleHeader,
    newHeaderBuf,
    Buffer.alloc(padLen, 0),
    ...payloadChunks,
  ]);
  fs.writeFileSync(asarPath, finalAsarBuf);

  const newHeaderHash = crypto
    .createHash("sha256")
    .update(newHeaderBuf)
    .digest("hex");

  const plistPath = path.join(appBundlePath, "Contents/Info.plist");
  let plist = fs.readFileSync(plistPath, "utf8");
  plist = plist.replace(oldHeaderHash, newHeaderHash);
  fs.writeFileSync(plistPath, plist, "utf8");

  const entitlementsPath = path.join(__dirname, "entitlements.mac.plist");
  execFileSync("xattr", ["-cr", appBundlePath], { stdio: "inherit" });

  // Step 1: Deep-sign all nested frameworks, dylibs, and Mach-O helpers
  execFileSync(
    "codesign",
    ["--force", "--deep", "--sign", "-", appBundlePath],
    { stdio: "inherit" },
  );

  // Step 2: Sign each Electron Helper bundle with entitlements (V8 JIT, media capture)
  const helperApps = [
    "Screenify Helper (Renderer).app",
    "Screenify Helper (GPU).app",
    "Screenify Helper (Plugin).app",
    "Screenify Helper.app",
  ];
  for (const helperName of helperApps) {
    const helperPath = path.join(appBundlePath, "Contents/Frameworks", helperName);
    if (fs.existsSync(helperPath)) {
      execFileSync(
        "codesign",
        [
          "--force",
          "--sign",
          "-",
          "--entitlements",
          entitlementsPath,
          helperPath,
        ],
        { stdio: "inherit" },
      );
    }
  }

  // Step 3: Sign the top-level app bundle (without --deep so helper entitlements remain intact)
  execFileSync(
    "codesign",
    [
      "--force",
      "--sign",
      "-",
      "--entitlements",
      entitlementsPath,
      appBundlePath,
    ],
    { stdio: "inherit" },
  );
  execFileSync("codesign", ["--verify", "--deep", "--strict", appBundlePath], {
    stdio: "inherit",
  });

  if (installToApplications) {
    const destApp = "/Applications/Screenify.app";
    if (fs.existsSync(destApp)) {
      fs.rmSync(destApp, { recursive: true, force: true });
    }
    execFileSync("ditto", [appBundlePath, destApp], { stdio: "inherit" });
    console.log(`Installed Screenify to ${destApp}`);
  }

  return { newHeaderHash, asarBytes: finalAsarBuf.length };
}

if (require.main === module) {
  const srcRoot = path.resolve(__dirname, "..");
  const defaultAppPath = path.resolve(srcRoot, "..", "Screenify.app");
  const installFlag = process.argv.includes("--install");
  const result = repackScreenifyBundle({
    srcRoot,
    appBundlePath: process.env.SCREENIFY_APP_BUNDLE || defaultAppPath,
    installToApplications: installFlag,
  });
  console.log(
    `Packed Screenify.app (${result.asarBytes} bytes, header SHA256: ${result.newHeaderHash})`,
  );
}

module.exports = {
  repackScreenifyBundle,
};
