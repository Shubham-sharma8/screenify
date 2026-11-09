"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const EventEmitter = require("node:events");

const MAIN_DIR = path.join(__dirname, "..", "main");

test("Bug 1, 2, 3, 4: preload.js defines path, has no duplicate keys, and cleans up only specific IPC listeners", () => {
  const preloadPath = path.join(MAIN_DIR, "preload.js");
  const code = fs.readFileSync(preloadPath, "utf8");

  // Bug 2 & 3: Check that duplicate keys in window.api are removed
  const onDownloadMatches = code.match(/^\s*onDownloadProgress\s*:/gm) || [];
  assert.equal(
    onDownloadMatches.length,
    1,
    `Expected exactly 1 onDownloadProgress definition, found ${onDownloadMatches.length}`,
  );

  const openProjectsMatches = code.match(/^\s*openProjectsFolder\s*:/gm) || [];
  assert.equal(
    openProjectsMatches.length,
    1,
    `Expected exactly 1 openProjectsFolder definition, found ${openProjectsMatches.length}`,
  );

  // Execute preload.js in a mocked Electron renderer context
  const emitter = new EventEmitter();
  const mockIpcRenderer = {
    invoke: async (channel, ...args) => ({ channel, args }),
    send: (channel, ...args) => emitter.emit(`sent:${channel}`, ...args),
    on: (channel, listener) => {
      emitter.on(channel, listener);
    },
    once: (channel, listener) => {
      emitter.once(channel, listener);
    },
    removeListener: (channel, listener) => {
      emitter.removeListener(channel, listener);
    },
    removeAllListeners: (channel) => {
      emitter.removeAllListeners(channel);
    },
  };

  const sandboxWindow = {};
  const customRequire = (id) => {
    if (id === "electron") {
      return {
        ipcRenderer: mockIpcRenderer,
        contextBridge: {
          exposeInMainWorld: (key, val) => {
            sandboxWindow[key] = val;
          },
        },
      };
    }
    return require(id);
  };

  const context = vm.createContext({
    require: customRequire,
    window: sandboxWindow,
    console,
    process,
    Buffer,
    setTimeout,
    clearTimeout,
  });

  vm.runInContext(code, context, { filename: "preload.js" });

  // Bug 1: window.nodePath.join and window.nodePath.resolve must work without ReferenceError
  assert.ok(sandboxWindow.nodePath, "window.nodePath should be exposed");
  assert.equal(
    sandboxWindow.nodePath.join("/Users/test", "Projects", "demo.mp4"),
    path.join("/Users/test", "Projects", "demo.mp4"),
  );
  assert.equal(
    sandboxWindow.nodePath.resolve("demo.mp4"),
    path.resolve("demo.mp4"),
  );

  // Bug 4: Calling unsubscribe on one listener should NOT wipe out a second listener on the same channel
  const receivedA = [];
  const receivedB = [];
  const unsubA = sandboxWindow.api.onRecordingComplete((data) => receivedA.push(data));
  const unsubB = sandboxWindow.api.onRecordingComplete((data) => receivedB.push(data));

  emitter.emit("recording-complete", {}, { file: "first.mp4" });
  assert.equal(receivedA.length, 1);
  assert.equal(receivedB.length, 1);

  // Unsubscribe only A
  unsubA();
  emitter.emit("recording-complete", {}, { file: "second.mp4" });
  assert.equal(receivedA.length, 1, "Unsubscribed listener A should not receive second event");
  assert.equal(
    receivedB.length,
    2,
    "Remaining listener B must still receive events after A unsubscribes",
  );
  unsubB();
});

test("Bug 5: editorPresetSettings.js preserves and deep-clones subtitleStyle object in pickPortableSettings", () => {
  const {
    PORTABLE_PLAYER_PROP_KEYS,
    pickPortableSettings,
  } = require(path.join(MAIN_DIR, "editorPresetSettings.js"));

  assert.ok(PORTABLE_PLAYER_PROP_KEYS.includes("subtitleStyle"));

  const originalSubtitleStyle = {
    fontFamily: "Inter",
    fontSize: 42,
    textColor: "#ffffff",
    backgroundColor: "rgba(0,0,0,0.65)",
    position: "bottom",
  };

  const picked = pickPortableSettings({
    padding: 120,
    aspectRatio: "16:9",
    clickEffects: true,
    trailEffect: false,
    subtitleStyle: originalSubtitleStyle,
    nonPortableSecret: "ignore-me",
  });

  assert.equal(picked.padding, 120);
  assert.equal(picked.aspectRatio, "16:9");
  assert.equal(picked.clickEffects, true);
  assert.equal(picked.trailEffect, false);
  assert.equal(picked.nonPortableSecret, undefined);
  assert.deepEqual(
    picked.subtitleStyle,
    originalSubtitleStyle,
    "subtitleStyle object must be preserved by pickPortableSettings",
  );

  // Immutability check: mutating originalSubtitleStyle must not mutate picked.subtitleStyle
  originalSubtitleStyle.fontSize = 99;
  assert.equal(picked.subtitleStyle.fontSize, 42);
});

test("Feature 1: editorPresets.js seeds curated built-in Screenify Studio Presets and preserves immutability", () => {
  const editorPresetsMod = require(path.join(MAIN_DIR, "editorPresets.js"));
  assert.ok(
    Array.isArray(editorPresetsMod.BUILT_IN_STUDIO_PRESETS),
    "BUILT_IN_STUDIO_PRESETS should be exported",
  );
  assert.ok(
    editorPresetsMod.BUILT_IN_STUDIO_PRESETS.length >= 5,
    "Should include at least 5 curated built-in studio presets",
  );

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "screenify-presets-"));
  const handlers = {};
  const mockIpcMain = {
    handle: (channel, fn) => {
      handlers[channel] = fn;
    },
  };
  const mockApp = {
    getPath: () => tmpDir,
  };

  editorPresetsMod.registerEditorPresetIpc({
    ipcMain: mockIpcMain,
    app: mockApp,
    log: () => {},
  });

  const listResult = handlers["editor-presets-list"]();
  assert.equal(listResult.success, true);
  assert.ok(
    listResult.presets.length >= 5,
    "Empty preset store should automatically seed built-in Screenify Studio Presets",
  );
  const presetNames = listResult.presets.map((p) => p.name);
  assert.ok(presetNames.includes("Cinematic macOS Glass"));
  assert.ok(presetNames.includes("Product Launch Zoom"));
  assert.ok(presetNames.includes("Social Reels 9:16"));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test("Feature 2: teleprompter.js includes Screenify branding, opacity control, mirror mode, and live script stats", () => {
  const teleprompterPath = path.join(MAIN_DIR, "teleprompter.js");
  const code = fs.readFileSync(teleprompterPath, "utf8");

  assert.ok(code.includes("Screenify Teleprompter"), "Should have Screenify Teleprompter title");
  assert.ok(code.includes("opacity-slider"), "Should include opacity slider control");
  assert.ok(code.includes("mirror-btn"), "Should include mirror/flip toggle button");
  assert.ok(code.includes("script-stats"), "Should include live word count and speaking duration stats");
  assert.ok(code.includes("contextIsolation: true"), "Should enforce contextIsolation: true");
  assert.ok(code.includes("nodeIntegration: false"), "Should enforce nodeIntegration: false");
});

test("Feature 3: aiEditService.js provides local offline Smart Edit fallback when API key is not configured", async () => {
  const aiEditMod = require(path.join(MAIN_DIR, "aiEditService.js"));
  assert.equal(
    typeof aiEditMod.buildOfflineEditPlan,
    "function",
    "buildOfflineEditPlan should be exported",
  );

  const sampleContext = {
    durationSec: 30,
    playheadSec: 10,
    fps: 60,
    hasMicAudio: true,
    hasSystemAudio: true,
    hasWebcam: true,
    hasSubtitles: true,
    settings: {
      aspectRatio: "16:9",
      padding: 100,
      borderRadius: 16,
      shadowIntensity: 50,
    },
    zooms: [],
    cuts: [],
    intervals: [{ index: 0, startSec: 0, endSec: 30, speed: 1, muted: false }],
    blurs: [],
  };

  // 1. Zoom in command
  const zoomPlan = aiEditMod.buildOfflineEditPlan("Zoom in 2.2x here for 4 seconds", sampleContext);
  assert.ok(zoomPlan, "Should produce an offline plan for zoom command");
  assert.equal(zoomPlan.operations.length, 1);
  assert.equal(zoomPlan.operations[0].tool, "addZoom");
  assert.equal(zoomPlan.operations[0].args.zoomLevel, 2.2);

  // 2. Speed +Aspect ratio + Padding command
  const multiPlan = aiEditMod.buildOfflineEditPlan(
    "Switch aspect ratio to 9:16, set speed to 1.5x, and mute microphone",
    sampleContext,
  );
  assert.ok(multiPlan);
  const tools = multiPlan.operations.map((op) => op.tool);
  assert.ok(tools.includes("updateSettings"));
  assert.ok(tools.includes("setIntervalSpeed"));
  assert.ok(tools.includes("setIntervalMute"));

  // 3. Verify IPC handler falls back to offline parser when getApiKey returns empty string
  const handlers = {};
  aiEditMod.registerAIEditIpc({
    ipcMain: {
      handle: (ch, fn) => {
        handlers[ch] = fn;
      },
    },
    getApiKey: () => "",
    log: () => {},
  });

  const status = await handlers["ai-edit-status"]();
  assert.equal(status.configured, true, "ai-edit-status should report configured via offline fallback");
  assert.equal(status.mode, "offline-local");

  const planRes = await handlers["ai-edit-plan"]({}, {
    prompt: "Add a zoom at 5s and cut the first 2 seconds",
    context: sampleContext,
    history: [],
  });
  assert.equal(planRes.success, true);
  assert.ok(planRes.operations.length >= 2);
});

test("Bugs 6-12 & Feature 4: main/index.js static & behavioral verification", () => {
  const indexPath = path.join(MAIN_DIR, "index.js");
  const code = fs.readFileSync(indexPath, "utf8");

  // Rebranding check
  assert.ok(
    code.includes('APP_NAME = "Screenify"'),
    "APP_NAME should be rebranded to Screenify",
  );

  // Bug 6: createVideoStreamingServer Range response uses dynamic Content-Type, not hardcoded video/mp4
  const serverFnStart = code.indexOf("function createVideoStreamingServer()");
  const serverFnEnd = code.indexOf("function isSafeProjectId", serverFnStart);
  const serverFnCode = code.slice(serverFnStart, serverFnEnd);
  assert.ok(
    !serverFnCode.includes('"Content-Type": "video/mp4"'),
    "Range response in createVideoStreamingServer must not hardcode Content-Type: video/mp4 for .wav files",
  );
  assert.ok(
    serverFnCode.includes("416"),
    "createVideoStreamingServer must guard against 0-byte or out-of-bounds Range requests with HTTP 416",
  );

  // Bug 7: startRecording uses passed coordinates (_0x19ffe0 / _0x3cc54d) when computing display offset
  assert.ok(
    !code.includes("xOffset = xOffset - _0x436a66"),
    "startRecording must not subtract display.bounds.x from stale xOffset",
  );

  // Bug 8: console.log is wrapped only once in whenReady
  const origConsoleMatches = code.match(/console\["log"\]\s*=\s*\(\.\.\./g) || [];
  assert.equal(
    origConsoleMatches.length,
    1,
    `Expected console.log to be wrapped once, found ${origConsoleMatches.length}`,
  );

  // Bug 9: No undeclared tmpMp3 identifier in heygen-upload-audio
  assert.ok(
    !code.includes("if (tmpMp3)"),
    "Undeclared tmpMp3 reference must be replaced with _0x48be90",
  );

  // Bug 10: No undeclared ffmpeg["stdin"] in end-stream handler
  assert.ok(
    !code.includes('ffmpeg["stdin"]["end"]()'),
    "Undeclared ffmpeg.stdin.end() must be replaced with ffmpegProcess?.stdin?.end?.()",
  );

  // Bug 11: No unsafe ["writeStream"]["destroy"]() without optional chaining
  assert.ok(
    !code.includes('["writeStream"]["destroy"]()'),
    "videoStreams cleanup must safely kill ffmpegProcess and optionally destroy writeStream",
  );

  // Bug 12: app.on("activate") registered only once
  const activateMatches = code.match(/app\["on"\]\("activate"/g) || [];
  assert.equal(
    activateMatches.length,
    1,
    `Expected exactly 1 app.on("activate") registration, found ${activateMatches.length}`,
  );

  // Feature 4: Native macOS Tools menu included in Menu.buildFromTemplate
  assert.ok(
    code.includes("Copy Diagnostics Info"),
    "Main menu should include the new Tools menu with Copy Diagnostics Info",
  );

  // Bug 17: Broken stdout/stderr (EIO/EPIPE) guard and uncaughtException re-entrancy guard
  assert.ok(
    code.includes("isStdioBroken") && code.includes("_safeStdioWrite"),
    "main/index.js must guard stdout/stderr writes against EIO/EPIPE when terminal disconnects",
  );
  assert.ok(
    code.includes("_isHandlingUncaughtException"),
    "uncaughtException handler must prevent recursive re-entry",
  );

  // Bug 18: Permissions onboarding completion persisted in store
  assert.ok(
    code.includes('store["set"]("permissionsOnboardingCompleted", !![])'),
    "permissions-continue must persist permissionsOnboardingCompleted in store",
  );

  // Bug 19: macOS entitlements plist and helper signing in install-macos-app.js
  const entitlementsPlist = path.join(__dirname, "..", "scripts", "entitlements.mac.plist");
  assert.ok(
    fs.existsSync(entitlementsPlist),
    "scripts/entitlements.mac.plist must exist for V8 JIT and macOS capture entitlements",
  );
  const plistContent = fs.readFileSync(entitlementsPlist, "utf8");
  assert.ok(
    plistContent.includes("com.apple.security.cs.allow-jit") &&
      plistContent.includes("com.apple.security.device.screen-capture"),
    "entitlements.mac.plist must include allow-jit and screen-capture entitlements",
  );

  // Bug 20: Editor presets directory uses userData instead of Documents to avoid macOS launchd TCC hang
  const editorPresetsCode = fs.readFileSync(
    path.join(__dirname, "..", "main", "editorPresets.js"),
    "utf8",
  );
  assert.ok(
    editorPresetsCode.includes('app.getPath("userData")') &&
      !editorPresetsCode.includes('app.getPath("documents")'),
    "editorPresets.js must use app.getPath('userData') to prevent macOS launchd TCC startup hangs",
  );
});

test("main/preload.js works inside Electron sandboxed renderers where require('path') is unavailable", () => {
  const vm = require("node:vm");
  const preloadCode = fs.readFileSync(
    path.join(__dirname, "..", "main", "preload.js"),
    "utf8",
  );
  const exposed = {};
  const sandbox = {
    require: (mod) => {
      if (mod === "electron") {
        return {
          contextBridge: {
            exposeInMainWorld: (key, val) => {
              exposed[key] = val;
            },
          },
          ipcRenderer: {
            invoke: () => Promise.resolve(),
            send: () => {},
            on: () => {},
            removeListener: () => {},
          },
        };
      }
      throw new Error(`module not found: ${mod}`);
    },
    process: { env: {} },
    console,
  };
  sandbox.globalThis = sandbox;
  vm.runInNewContext(preloadCode, sandbox);

  assert.ok(exposed.api, "window.api must be exposed in sandboxed preload");
  assert.ok(exposed.nodePath, "window.nodePath must be exposed in sandboxed preload");
  assert.ok(exposed.electron, "window.electron must be exposed in sandboxed preload");
  assert.equal(exposed.nodePath.join("/Users/test/", "/project", "clip.mp4"), "/Users/test/project/clip.mp4");
  assert.equal(exposed.nodePath.resolve("/Users/test/a/b", "../c.mp4"), "/Users/test/a/c.mp4");
});

test("Xcode project (Screenify.xcodeproj) and native Swift helper targets are present and configured", () => {
  const rootDir = path.join(__dirname, "..");
  const pbxprojPath = path.join(rootDir, "Screenify.xcodeproj", "project.pbxproj");
  const schemePath = path.join(
    rootDir,
    "Screenify.xcodeproj",
    "xcshareddata",
    "xcschemes",
    "Screenify.xcscheme",
  );
  const getWindowsSwift = path.join(rootDir, "macos", "Sources", "GetWindows", "main.swift");
  const activateWindowSwift = path.join(rootDir, "macos", "Sources", "ActivateWindow", "main.swift");
  const xcodeTestsSwift = path.join(rootDir, "macos", "Tests", "ScreenifyTests", "ScreenifyXcodeTests.swift");
  const xcodeBuildScript = path.join(rootDir, "scripts", "xcode-build-app.sh");

  assert.ok(fs.existsSync(pbxprojPath), "Screenify.xcodeproj/project.pbxproj must exist");
  assert.ok(fs.existsSync(schemePath), "Screenify.xcscheme must exist");
  assert.ok(fs.existsSync(getWindowsSwift), "macos/Sources/GetWindows/main.swift must exist");
  assert.ok(fs.existsSync(activateWindowSwift), "macos/Sources/ActivateWindow/main.swift must exist");
  assert.ok(fs.existsSync(xcodeTestsSwift), "macos/Tests/ScreenifyTests/ScreenifyXcodeTests.swift must exist");
  assert.ok(fs.existsSync(xcodeBuildScript), "scripts/xcode-build-app.sh must exist");

  const pbxproj = fs.readFileSync(pbxprojPath, "utf8");
  assert.ok(pbxproj.includes("scripts/entitlements.mac.plist"), "Xcode project must reference entitlements.mac.plist");
  assert.ok(pbxproj.includes("get-windows-arm64"), "Xcode project must include get-windows-arm64 target");
  assert.ok(pbxproj.includes("activate-window-arm64"), "Xcode project must include activate-window-arm64 target");
  assert.ok(pbxproj.includes("ScreenifyTests"), "Xcode project must include ScreenifyTests XCTest target");
});


