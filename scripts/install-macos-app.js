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

function findFilesByExtension(rootDir, predicate) {
  const results = [];
  if (!fs.existsSync(rootDir)) return results;
  for (const entry of fs.readdirSync(rootDir, { withFileTypes: true })) {
    const fullPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findFilesByExtension(fullPath, predicate));
    } else if (entry.isFile() && predicate(fullPath, entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function signUnpackedNodeAddons(appBundlePath, signIdentity) {
  const identity = signIdentity && signIdentity.trim() ? signIdentity.trim() : "-";
  const unpackedDir = path.join(appBundlePath, "Contents/Resources/app.asar.unpacked");
  for (const nodeAddon of findFilesByExtension(unpackedDir, (_p, name) => name.endsWith(".node"))) {
    execFileSync(
      "codesign",
      ["--force", "--sign", identity, "--preserve-metadata=identifier,flags", nodeAddon],
      { stdio: "inherit" },
    );
  }
}

function signNestedBundleContents(appBundlePath, signIdentity, entitlementsPath) {
  const identity = signIdentity && signIdentity.trim() ? signIdentity.trim() : "-";
  execFileSync("xattr", ["-cr", appBundlePath], { stdio: "inherit" });

  const signBinary = (targetPath, withEntitlements = false) => {
    if (!fs.existsSync(targetPath)) return;
    const args = ["--force", "--sign", identity];
    if (withEntitlements) {
      args.push("--entitlements", entitlementsPath);
    } else {
      args.push("--preserve-metadata=identifier,flags");
    }
    args.push(targetPath);
    execFileSync("codesign", args, { stdio: "inherit" });
  };

  // 2. Sign standalone Mach-O helper binaries in Contents/Resources
  const resourceBins = [
    "get-windows-arm64",
    "activate-window-arm64",
    "RecordingCoordinator-arm64",
    "deep-filter-arm64",
    "ffmpeg-arm64",
  ];
  for (const binName of resourceBins) {
    signBinary(path.join(appBundlePath, "Contents/Resources", binName), true);
  }

  // 3. Sign nested libraries and helpers inside Electron Framework & Squirrel
  const electronFw = path.join(
    appBundlePath,
    "Contents/Frameworks/Electron Framework.framework",
  );
  const electronLibsDir = path.join(electronFw, "Versions/A/Libraries");
  for (const dylib of findFilesByExtension(electronLibsDir, (_p, name) => name.endsWith(".dylib"))) {
    signBinary(dylib, false);
  }
  signBinary(path.join(electronFw, "Versions/A/Helpers/chrome_crashpad_handler"), false);
  signBinary(path.join(electronFw, "Versions/A/Electron Framework"), false);
  signBinary(electronFw, false);

  const squirrelFw = path.join(appBundlePath, "Contents/Frameworks/Squirrel.framework");
  signBinary(path.join(squirrelFw, "Versions/A/Resources/ShipIt"), false);
  signBinary(path.join(squirrelFw, "Versions/A/Squirrel"), false);
  signBinary(squirrelFw, false);

  const reactiveFw = path.join(appBundlePath, "Contents/Frameworks/ReactiveObjC.framework");
  signBinary(path.join(reactiveFw, "Versions/A/ReactiveObjC"), false);
  signBinary(reactiveFw, false);

  const mantleFw = path.join(appBundlePath, "Contents/Frameworks/Mantle.framework");
  signBinary(path.join(mantleFw, "Versions/A/Mantle"), false);
  signBinary(mantleFw, false);

  // 4. Sign each Electron Helper .app bundle with V8 JIT & media capture entitlements
  const helperApps = [
    "Screenify Helper (Renderer).app",
    "Screenify Helper (GPU).app",
    "Screenify Helper (Plugin).app",
    "Screenify Helper.app",
  ];
  for (const helperName of helperApps) {
    const helperPath = path.join(appBundlePath, "Contents/Frameworks", helperName);
    signBinary(helperPath, true);
  }

  // 5. Sign top-level Screenify.app (without --deep so nested helper entitlements remain intact)
  signBinary(appBundlePath, true);
  execFileSync("codesign", ["--verify", "--deep", "--strict", appBundlePath], {
    stdio: "inherit",
  });
}

function repackScreenifyBundle({
  srcRoot,
  appBundlePath,
  installToApplications,
  signIdentity,
}) {
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

  const resolvedIdentity =
    signIdentity ||
    process.env.EXPANDED_CODE_SIGN_IDENTITY ||
    process.env.CODESIGN_IDENTITY ||
    "-";

  // Sign unpacked .node binaries before computing their integrity hashes for app.asar
  signUnpackedNodeAddons(appBundlePath, resolvedIdentity);

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
  plist = plist.replace(
    /(<key>ElectronAsarIntegrity<\/key>[\s\S]*?<key>hash<\/key>\s*<string>)[a-f0-9]{64}(<\/string>)/,
    `$1${newHeaderHash}$2`,
  );
  fs.writeFileSync(plistPath, plist, "utf8");

  const macosTemplatePlist = path.join(srcRoot, "macos/Info.plist");
  if (fs.existsSync(macosTemplatePlist)) {
    let templatePlist = fs.readFileSync(macosTemplatePlist, "utf8");
    templatePlist = templatePlist.replace(
      /(<key>ElectronAsarIntegrity<\/key>[\s\S]*?<key>hash<\/key>\s*<string>)[a-f0-9]{64}(<\/string>)/,
      `$1${newHeaderHash}$2`,
    );
    fs.writeFileSync(macosTemplatePlist, templatePlist, "utf8");
  }

  const entitlementsPath = path.join(__dirname, "entitlements.mac.plist");
  signNestedBundleContents(appBundlePath, resolvedIdentity, entitlementsPath);

  if (installToApplications) {
    const destApp = "/Applications/Screenify.app";
    if (fs.existsSync(destApp)) {
      fs.rmSync(destApp, { recursive: true, force: true });
    }
    execFileSync("ditto", [appBundlePath, destApp], { stdio: "inherit" });
    console.log(`Installed Screenify to ${destApp}`);
  }

  return { newHeaderHash, asarBytes: finalAsarBuf.length, signIdentity: resolvedIdentity };
}

if (require.main === module) {
  const srcRoot = path.resolve(__dirname, "..");
  const defaultAppPath = path.resolve(srcRoot, "..", "Screenify.app");
  const installFlag = process.argv.includes("--install");
  const signIdx = process.argv.indexOf("--sign");
  const cliSignIdentity = signIdx !== -1 ? process.argv[signIdx + 1] : undefined;
  const result = repackScreenifyBundle({
    srcRoot,
    appBundlePath: process.env.SCREENIFY_APP_BUNDLE || defaultAppPath,
    installToApplications: installFlag,
    signIdentity: cliSignIdentity,
  });
  console.log(
    `Packed Screenify.app (${result.asarBytes} bytes, header SHA256: ${result.newHeaderHash}, signed with: ${result.signIdentity})`,
  );
}

module.exports = {
  repackScreenifyBundle,
  signNestedBundleContents,
};
