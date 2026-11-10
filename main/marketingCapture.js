"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function resolveFfmpegBinary() {
  const packagedFfmpeg = path.join(process.resourcesPath || "", "ffmpeg-arm64");
  if (packagedFfmpeg && fs.existsSync(packagedFfmpeg)) {
    return packagedFfmpeg;
  }
  const appFfmpeg = "/Applications/Screenify.app/Contents/Resources/ffmpeg-arm64";
  if (fs.existsSync(appFfmpeg)) {
    return appFfmpeg;
  }
  return "ffmpeg";
}

async function generateDemoProjectBundle(BrowserWindow, log) {
  const demoDir = path.join(os.tmpdir(), "screenify-product-tour.screencharm");
  fs.rmSync(demoDir, { recursive: true, force: true });
  fs.mkdirSync(demoDir, { recursive: true });

  const videoPath = path.join(demoDir, "screen.mp4");
  const micPath = path.join(demoDir, "microphone.wav");
  const micEnhancedPath = path.join(demoDir, "microphone_enhanced.wav");
  const framePngPath = path.join(demoDir, "demo-frame.png");

  // Render a crisp 1920x1200 macOS app UI mockup to PNG using an offscreen BrowserWindow
  const win = new BrowserWindow({
    width: 1920,
    height: 1200,
    show: false,
    frame: false,
    enableLargerThanScreen: true,
    backgroundColor: "#f7f7f6",
    webPreferences: {
      offscreen: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.setSize(1920, 1200);

  const mockupHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1920px; height: 1200px; overflow: hidden;
    background: #f7f7f6;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
    color: #111110;
    -webkit-font-smoothing: antialiased;
    display: flex; flex-direction: column;
  }
  .topbar {
    height: 54px; background: #ffffff; border-bottom: 1px solid #e4e4e0;
    display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
  }
  .dots { display: flex; gap: 8px; align-items: center; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot.r { background: #ff5f57; } .dot.y { background: #febc2e; } .dot.g { background: #28c840; }
  .crumb { font-size: 13px; font-weight: 600; color: #111110; letter-spacing: -0.01em; display: flex; align-items: center; gap: 8px; }
  .crumb span { color: #676764; font-weight: 500; }
  .pill { background: #111110; color: #ffffff; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 999px; }
  .layout { flex: 1; display: grid; grid-template-columns: 260px 1fr 340px; }
  .sidebar {
    background: #ffffff; border-right: 1px solid #e4e4e0; padding: 24px 18px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .sec-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #8c8c87; padding: 8px 10px 4px; }
  .nav-item {
    padding: 10px 12px; border-radius: 10px; font-size: 13.5px; font-weight: 500; color: #676764;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-item.active { background: #f1f1ee; color: #111110; font-weight: 600; }
  .badge { font-size: 11px; padding: 2px 8px; border-radius: 99px; background: #e8e8e3; color: #111110; font-weight: 600; }
  .main { padding: 36px 44px; display: flex; flex-direction: column; gap: 24px; }
  .hero-card {
    background: #ffffff; border: 1px solid #e4e4e0; border-radius: 18px; padding: 28px 32px;
    box-shadow: 0 1px 3px rgba(17,17,16,0.04), 0 12px 32px -12px rgba(17,17,16,0.06);
  }
  .eyebrow { font-size: 11.5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #676764; margin-bottom: 8px; }
  h1 { font-size: 28px; font-weight: 650; letter-spacing: -0.025em; color: #111110; margin-bottom: 8px; }
  .sub { font-size: 14.5px; color: #676764; line-height: 1.5; }
  .metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .metric {
    background: #ffffff; border: 1px solid #e4e4e0; border-radius: 16px; padding: 20px 22px;
    box-shadow: 0 1px 2px rgba(17,17,16,0.03);
  }
  .m-label { font-size: 12px; font-weight: 500; color: #676764; margin-bottom: 6px; }
  .m-val { font-size: 26px; font-weight: 650; letter-spacing: -0.03em; color: #111110; font-variant-numeric: tabular-nums; }
  .m-delta { font-size: 11.5px; font-weight: 600; color: #16a34a; margin-top: 4px; }
  .code-card {
    flex: 1; background: #ffffff; border: 1px solid #e4e4e0; border-radius: 18px; padding: 24px 28px;
    font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, monospace; font-size: 13.5px; line-height: 1.7; color: #111110;
    box-shadow: 0 1px 3px rgba(17,17,16,0.04);
  }
  .code-head {
    display: flex; align-items: center; justify-content: space-between;
    padding-bottom: 14px; margin-bottom: 16px; border-bottom: 1px solid #f0f0ed;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
    font-size: 12.5px; font-weight: 600; color: #676764;
  }
  .kw { color: #111110; font-weight: 600; }
  .cm { color: #8c8c87; }
  .st { color: #2563eb; }
  .inspector {
    background: #ffffff; border-left: 1px solid #e4e4e0; padding: 24px 22px;
    display: flex; flex-direction: column; gap: 18px;
  }
  .prop-group { border: 1px solid #e4e4e0; border-radius: 14px; padding: 16px; background: #fafaf9; }
  .prop-title { font-size: 12.5px; font-weight: 600; color: #111110; margin-bottom: 10px; }
  .prop-row { display: flex; justify-content: space-between; font-size: 12.5px; color: #676764; padding: 6px 0; }
  .prop-row strong { color: #111110; font-weight: 600; }
</style>
</head>
<body>
  <div class="topbar">
    <div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div>
    <div class="crumb">Cogify Workspace <span>/</span> Screenify Native Engine <span>/</span> SpringCamera.swift</div>
    <div class="pill">60 FPS · ProRes / H.264</div>
  </div>
  <div class="layout">
    <div class="sidebar">
      <div class="sec-label">Architecture</div>
      <div class="nav-item active">Spring Zoom Engine <span class="badge">v1.12</span></div>
      <div class="nav-item">ScreenCaptureKit <span class="badge">Zero-Copy</span></div>
      <div class="nav-item">Whisper AI Captions</div>
      <div class="nav-item">AI Smart Edit</div>
      <div class="nav-item">Teleprompter HUD</div>
      <div class="sec-label" style="margin-top:14px">Targets</div>
      <div class="nav-item">Screenify.app</div>
      <div class="nav-item">get-windows-arm64</div>
      <div class="nav-item">activate-window-arm64</div>
    </div>
    <div class="main">
      <div class="hero-card">
        <div class="eyebrow">Native macOS Screen Studio · Open Source</div>
        <h1>Cinematic product demos at 60fps — zero manual keyframing.</h1>
        <p class="sub">Screenify records your screen, camera, microphone, and cursor telemetry simultaneously, synthesizing smooth critically-damped spring zooms around every click.</p>
      </div>
      <div class="metrics">
        <div class="metric">
          <div class="m-label">Frame Pacing</div>
          <div class="m-val">60.0 fps</div>
          <div class="m-delta">ScreenCaptureKit hardware pipeline</div>
        </div>
        <div class="metric">
          <div class="m-label">Audio Enhancement</div>
          <div class="m-val">DeepFilterNet</div>
          <div class="m-delta">On-device neural noise suppression</div>
        </div>
        <div class="metric">
          <div class="m-label">Captions &amp; AI Edit</div>
          <div class="m-val">100% Local</div>
          <div class="m-delta">Whisper.cpp + Smart Edit Assistant</div>
        </div>
      </div>
      <div class="code-card">
        <div class="code-head"><span>macos/Sources/SpringZoomEngine.swift</span><span>Apple Silicon arm64</span></div>
        <div><span class="cm">// Critically-damped spring interpolation for automatic cursor &amp; click zoom</span></div>
        <div><span class="kw">public struct</span> SpringCameraKeyframe {</div>
        <div>&nbsp;&nbsp;<span class="kw">public let</span> targetCenter: CGPoint</div>
        <div>&nbsp;&nbsp;<span class="kw">public let</span> zoomScale: CGFloat = <span class="st">2.0</span></div>
        <div>&nbsp;&nbsp;<span class="kw">public let</span> response: Double = <span class="st">0.42</span></div>
        <div>&nbsp;&nbsp;<span class="kw">public let</span> dampingFraction: Double = <span class="st">0.88</span></div>
        <div>}</div>
      </div>
    </div>
    <div class="inspector">
      <div class="prop-group">
        <div class="prop-title">Capture Telemetry</div>
        <div class="prop-row"><span>Resolution</span><strong>3840 × 2400 (Retina)</strong></div>
        <div class="prop-row"><span>Color Space</span><strong>Display P3</strong></div>
        <div class="prop-row"><span>Cursor Vectors</span><strong>60 Hz SVG</strong></div>
        <div class="prop-row"><span>Motion Blur</span><strong>180° Shutter</strong></div>
      </div>
      <div class="prop-group">
        <div class="prop-title">Export Pipeline</div>
        <div class="prop-row"><span>Encoder</span><strong>VideoToolbox H.264</strong></div>
        <div class="prop-row"><span>Preset</span><strong>Screenify Minimal Light</strong></div>
        <div class="prop-row"><span>License</span><strong>MIT Open Source</strong></div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const tmpHtml = path.join(demoDir, "mockup.html");
  fs.writeFileSync(tmpHtml, mockupHtml, "utf8");
  await win.loadFile(tmpHtml);
  await sleep(300);
  const img = await win.webContents.capturePage();
  fs.writeFileSync(framePngPath, img.toPNG());
  win.destroy();
  try {
    fs.unlinkSync(tmpHtml);
  } catch (_) {}

  const ffmpeg = resolveFfmpegBinary();
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-loop",
      "1",
      "-i",
      framePngPath,
      "-t",
      "10",
      "-r",
      "60",
      "-vf",
      "scale=1920:1200",
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "ultrafast",
      videoPath,
    ],
    { stdio: "ignore" },
  );

  execFileSync(
    ffmpeg,
    [
      "-y",
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=44100:duration=10",
      "-af",
      "volume=0.02",
      "-c:a",
      "pcm_s16le",
      micPath,
    ],
    { stdio: "ignore" },
  );
  fs.copyFileSync(micPath, micEnhancedPath);

  // Build realistic cursor movements + clicks across 600 frames (10s @ 60fps)
  const inputEvents = [];
  for (let f = 0; f < 600; f += 2) {
    const t = f / 600;
    const x = Math.round(520 + 680 * Math.sin(t * Math.PI * 1.4));
    const y = Math.round(360 + 260 * Math.cos(t * Math.PI * 1.1));
    inputEvents.push({
      frame: f,
      eventType: "moved",
      x,
      y,
      cursorType: f > 120 && f < 280 ? "pointer" : "default",
    });
  }
  inputEvents.push(
    {
      frame: 90,
      eventType: "down",
      x: 640,
      y: 340,
      cursorEvent: true,
      cursorType: "pointer",
    },
    {
      frame: 330,
      eventType: "down",
      x: 1120,
      y: 520,
      cursorEvent: true,
      cursorType: "pointer",
    },
  );

  const projectJson = {
    projectInfo: {
      name: "screenify-product-tour",
      version: "1.12.0",
      createdAt: new Date().toISOString(),
    },
    projectSettings: {
      editorSettings: {
        zoomInEffect: true,
      },
    },
    recording: {
      fileName: "screen.mp4",
      microphoneFileName: "microphone.wav",
      width: 1920,
      height: 1200,
      screenWidth: 1920,
      screenHeight: 1200,
      frameCount: 600,
      frameRate: 60,
      displayScaleFactor: 2,
      cursorTrackVersion: 2,
      xOffset: 0,
      yOffset: 0,
      recordingAreaWidth: 1920,
      recordingAreaHeight: 1200,
      recordingStartTime: 1700000000000,
      countdownFinishedTime: 1700000000000,
      inputEvents,
    },
    files: {
      mainVideo: {
        filename: "screen.mp4",
        path: videoPath,
        extractedPath: videoPath,
      },
      microphoneAudio: {
        filename: "microphone.wav",
        path: micPath,
        extractedPath: micPath,
      },
    },
  };

  fs.writeFileSync(
    path.join(demoDir, "project.json"),
    JSON.stringify(projectJson, null, 2),
    "utf8",
  );
  if (log) {
    log("🎬 Created marketing demo bundle at: " + demoDir);
  }
  return demoDir;
}

async function renderCompositeSlide(BrowserWindow, { width = 1440, height = 900, html }) {
  const win = new BrowserWindow({
    width,
    height,
    show: false,
    frame: false,
    enableLargerThanScreen: true,
    backgroundColor: "#f7f7f6",
    webPreferences: {
      offscreen: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  const tmpHtml = path.join(os.tmpdir(), `screenify-slide-${Date.now()}-${Math.random().toString(36).slice(2)}.html`);
  fs.writeFileSync(tmpHtml, html, "utf8");
  await win.loadFile(tmpHtml);
  await sleep(450);
  const image = await win.webContents.capturePage();
  win.destroy();
  try {
    fs.unlinkSync(tmpHtml);
  } catch (_) {}
  return image.toPNG();
}

async function runMarketingCapture({
  app,
  BrowserWindow,
  getMainWindow,
  createOverlayWindow,
  getOverlayWindow,
  destroyOverlayWindow,
  createPermissionsWindow,
  getPermissionsWindow,
  createStopperWindow,
  getStopperWindow,
  destroyStopperWindow,
  handleScreencharmFileOpen,
  store,
  getSafeWindowPosition,
  log,
}) {
  const outDir = process.env.SCREENIFY_CAPTURE_MARKETING_DIR;
  if (!outDir) return;

  try {
    fs.mkdirSync(outDir, { recursive: true });
    log("📸 Starting Screenify marketing screenshot capture into: " + outDir);

    await sleep(1200);
    const mainWin = getMainWindow();
    if (!mainWin || mainWin.isDestroyed()) {
      throw new Error("mainWindow not available");
    }

    // 1. Capture the Floating White Minimal Recorder Bar
    mainWin.show();
    mainWin.focus();
    await sleep(600);
    const recorderPngBuf = (await mainWin.webContents.capturePage()).toPNG();
    const recorderB64 = recorderPngBuf.toString("base64");

    // 2. Capture the White Minimal Aspect Ratio Crop Overlay Window
    createOverlayWindow({
      x: 240,
      y: 140,
      width: 780,
      height: 520,
      type: "area",
      selectedAspectRatio: "16:10",
      zoomInEffect: true,
      displayScaleFactor: 2,
    });
    await sleep(800);
    const overlayWin = getOverlayWindow();
    let overlayB64 = "";
    if (overlayWin && !overlayWin.isDestroyed()) {
      overlayB64 = (await overlayWin.webContents.capturePage()).toPNG().toString("base64");
      destroyOverlayWindow();
    }

    // 3. Capture the White Minimal Teleprompter Window
    const { createTeleprompterWindow, getTeleprompterWindow } = require("./teleprompter");
    store.set(
      "teleprompterText",
      "Welcome to Screenify — the native macOS screen studio built for effortless product demos.\n\nEvery cursor movement and click is tracked at 60 frames per second, automatically creating smooth spring-physics zooms.\n\nUse the built-in AI Smart Edit Assistant to refine cuts, generate captions with local Whisper AI, and export in crystal-clear 4K.",
    );
    createTeleprompterWindow(store, getSafeWindowPosition, log);
    await sleep(800);
    const teleWin = getTeleprompterWindow();
    let teleB64 = "";
    if (teleWin && !teleWin.isDestroyed()) {
      teleB64 = (await teleWin.webContents.capturePage()).toPNG().toString("base64");
      teleWin.close();
    }

    // 4. Capture the White Minimal Permissions Onboarding Window
    await createPermissionsWindow(true);
    await sleep(500);
    const permWin = getPermissionsWindow();
    let permB64 = "";
    if (permWin && !permWin.isDestroyed()) {
      await permWin.webContents.executeJavaScript(`
        if (typeof setStatus === 'function') {
          setStatus('screen', 'granted');
          setStatus('accessibility', 'granted');
        }
        var h = document.getElementById('permHint');
        if (h) h.textContent = 'All permissions granted — ready to record!';
      `);
      await sleep(300);
      permB64 = (await permWin.webContents.capturePage()).toPNG().toString("base64");
      permWin.close();
    }

    // 5. Capture the White Minimal Recording Stopper Pill
    let stopperB64 = "";
    if (typeof createStopperWindow === "function") {
      createStopperWindow();
      await sleep(600);
      const stopWin = getStopperWindow ? getStopperWindow() : null;
      if (stopWin && !stopWin.isDestroyed()) {
        await stopWin.webContents.executeJavaScript(`
          var t = document.getElementById('timer');
          if (t) t.textContent = '00:18';
        `);
        await sleep(200);
        stopperB64 = (await stopWin.webContents.capturePage()).toPNG().toString("base64");
        if (typeof destroyStopperWindow === "function") destroyStopperWindow();
      }
    }

    // Compose Screenshot 01: Recorder Bar + Aspect Ratio Crop Overlay
    const slide01Png = await renderCompositeSlide(BrowserWindow, {
      width: 1440,
      height: 900,
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1440px; height: 900px; overflow: hidden;
    background: radial-gradient(120% 100% at 50% 0%, #ffffff 0%, #f5f5f2 55%, #ecece6 100%);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
    display: flex; flex-direction: column; align-items: center; justify-content: space-between;
    padding: 46px 64px 52px;
    -webkit-font-smoothing: antialiased;
  }
  .grid-bg {
    position: absolute; inset: 0;
    background-image: linear-gradient(to right, rgba(17,17,16,0.03) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(17,17,16,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    mask-image: radial-gradient(circle at 50% 45%, black 35%, transparent 85%);
    -webkit-mask-image: radial-gradient(circle at 50% 45%, black 35%, transparent 85%);
    pointer-events: none;
  }
  .header { text-align: center; z-index: 2; }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 999px;
    background: #ffffff; border: 1px solid #e4e4e0;
    font-size: 11.5px; font-weight: 600; color: #676764; letter-spacing: 0.02em;
    box-shadow: 0 1px 2px rgba(17,17,16,0.04);
    margin-bottom: 12px;
  }
  .eyebrow .dot { width: 7px; height: 7px; border-radius: 50%; background: #ef4444; }
  h1 { font-size: 30px; font-weight: 650; color: #111110; letter-spacing: -0.03em; }
  .stage {
    position: relative; z-index: 2;
    display: flex; align-items: center; justify-content: center; gap: 36px;
    width: 100%; flex: 1; margin: 18px 0;
  }
  .overlay-wrap {
    border-radius: 20px; overflow: hidden;
    box-shadow: 0 24px 60px -16px rgba(17,17,16,0.16), 0 0 0 1px rgba(17,17,16,0.08);
  }
  .overlay-wrap img { display: block; width: 680px; height: auto; }
  .recorder-dock {
    z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 10px;
  }
  .recorder-dock img {
    display: block; height: 96px; width: auto;
    filter: drop-shadow(0 16px 36px rgba(17,17,16,0.14));
  }
</style></head>
<body>
  <div class="grid-bg"></div>
  <div class="header">
    <div class="eyebrow"><span class="dot"></span> Native ScreenCaptureKit · Aspect Ratio Framing · Auto Spring Zoom</div>
    <h1>Precision capture that stays out of your way.</h1>
  </div>
  <div class="stage">
    <div class="overlay-wrap"><img src="data:image/png;base64,${overlayB64}" /></div>
  </div>
  <div class="recorder-dock">
    <img src="data:image/png;base64,${recorderB64}" />
  </div>
</body></html>`,
    });
    fs.writeFileSync(path.join(outDir, "01-recorder-and-overlay.png"), slide01Png);
    log("✅ Saved 01-recorder-and-overlay.png");

    // Compose Screenshot 05: Teleprompter + Permissions + Stopper Pill
    const slide05Png = await renderCompositeSlide(BrowserWindow, {
      width: 1440,
      height: 900,
      html: `<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1440px; height: 900px; overflow: hidden;
    background: radial-gradient(120% 100% at 50% 0%, #ffffff 0%, #f5f5f2 55%, #ecece6 100%);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif;
    display: flex; flex-direction: column; align-items: center; justify-content: space-between;
    padding: 48px 72px 54px;
    -webkit-font-smoothing: antialiased;
  }
  .header { text-align: center; z-index: 2; }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 999px;
    background: #ffffff; border: 1px solid #e4e4e0;
    font-size: 11.5px; font-weight: 600; color: #676764;
    box-shadow: 0 1px 2px rgba(17,17,16,0.04);
    margin-bottom: 12px;
  }
  h1 { font-size: 30px; font-weight: 650; color: #111110; letter-spacing: -0.03em; }
  .cards {
    display: flex; align-items: center; justify-content: center; gap: 56px;
    flex: 1; width: 100%;
  }
  .card-col { display: flex; flex-direction: column; align-items: center; gap: 18px; }
  .card-label {
    font-size: 12.5px; font-weight: 600; color: #676764;
    background: #ffffff; border: 1px solid #e4e4e0; border-radius: 999px;
    padding: 5px 14px;
  }
  .win-img {
    border-radius: 18px;
    filter: drop-shadow(0 20px 48px rgba(17,17,16,0.14));
  }
  .perm-img { width: 440px; height: auto; border-radius: 14px; border: 1px solid #e4e4e0; }
  .tele-img { width: 420px; height: auto; }
  .stopper-img { height: 68px; width: auto; filter: drop-shadow(0 12px 28px rgba(17,17,16,0.14)); }
</style></head>
<body>
  <div class="header">
    <div class="eyebrow">Content-Protected HUD · Live Word &amp; Time Telemetry · Native TCC Onboarding</div>
    <h1>Built-in Teleprompter &amp; macOS-native controls.</h1>
  </div>
  <div class="cards">
    <div class="card-col">
      <img class="win-img tele-img" src="data:image/png;base64,${teleB64}" />
      ${stopperB64 ? `<img class="stopper-img" src="data:image/png;base64,${stopperB64}" />` : ""}
      <div class="card-label">Floating Teleprompter (Invisible to Screen Capture) + Live HUD</div>
    </div>
    <div class="card-col">
      <img class="win-img perm-img" src="data:image/png;base64,${permB64}" />
      <div class="card-label">One-Click macOS Screen Recording &amp; Accessibility Setup</div>
    </div>
  </div>
</body></html>`,
    });
    fs.writeFileSync(path.join(outDir, "05-teleprompter-and-permissions.png"), slide05Png);
    log("✅ Saved 05-teleprompter-and-permissions.png");

    // 6. Generate Demo Project Bundle and Open in Studio Video Editor
    const demoBundleDir = await generateDemoProjectBundle(BrowserWindow, log);
    await handleScreencharmFileOpen(demoBundleDir);

    // Wait for Studio Video Editor + PixiJS canvas + video stream to mount and render
    for (let attempt = 0; attempt < 25; attempt++) {
      await sleep(400);
      const isReady = await mainWin.webContents.executeJavaScript(`
        (function() {
          const text = document.body ? document.body.innerText : '';
          const hasCanvas = !!document.querySelector('canvas');
          return hasCanvas && !text.includes('Preparing your video');
        })();
      `);
      if (isReady) {
        log("✅ Studio Video Editor canvas & timeline ready (attempt " + (attempt + 1) + ")");
        break;
      }
    }

    // Ensure mainWindow is sized to clean 1440x900 for crisp 2880x1800 Retina screenshots
    mainWin.setSize(1440, 900);
    mainWin.center();
    mainWin.show();
    mainWin.focus();
    await sleep(2600);

    // Select the warm stone/silver light wallpaper (2nd thumbnail in Background grid) and pause playback on a crisp frame
    await mainWin.webContents.executeJavaScript(`
      (function() {
        const bgImgs = Array.from(document.querySelectorAll('img[src*="background"], img[alt*="background"], fieldset img'));
        if (bgImgs.length >= 2 && bgImgs[1].parentElement) {
          bgImgs[1].parentElement.click();
        }
        // Pause playback if playing so every screenshot has a rock-solid frame
        const pauseBtn = Array.from(document.querySelectorAll('button')).find(b => b.querySelector('svg.lucide-pause'));
        if (pauseBtn) pauseBtn.click();
      })();
    `);
    await sleep(800);

    // Capture Screenshot 02: Studio Video Editor (General Inspector & Timeline)
    const studio02Png = (await mainWin.webContents.capturePage()).toPNG();
    fs.writeFileSync(path.join(outDir, "02-studio-editor.png"), studio02Png);
    log("✅ Saved 02-studio-editor.png");

    // 7. Open the AI Smart Edit Assistant Drawer & Populate + Submit a Natural-Language Prompt
    await mainWin.webContents.executeJavaScript(`
      (function() {
        const buttons = Array.from(document.querySelectorAll('button'));
        const aiBtn = buttons.find(b => b.textContent && b.textContent.trim().includes('Assistant'));
        if (aiBtn) aiBtn.click();
      })();
    `);
    await sleep(600);
    await mainWin.webContents.executeJavaScript(`
      (function() {
        const input = document.querySelector('textarea[placeholder*="Describe"], textarea');
        if (input) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
          if (setter) {
            setter.call(input, 'Zoom in 2.2x at 0:02 for 3s, switch aspect ratio to 16:9, and set padding to 8%');
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      })();
    `);
    await sleep(350);
    await mainWin.webContents.executeJavaScript(`
      (function() {
        const micBtn = document.querySelector('button[aria-label*="Dictate"]');
        const sendBtn = micBtn && micBtn.nextElementSibling ? micBtn.nextElementSibling : null;
        if (sendBtn && !sendBtn.disabled) {
          sendBtn.click();
        } else {
          const input = document.querySelector('textarea[placeholder*="Describe"], textarea');
          if (input) {
            input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
          }
        }
      })();
    `);
    await sleep(1400);

    const studio03Png = (await mainWin.webContents.capturePage()).toPNG();
    fs.writeFileSync(path.join(outDir, "03-ai-smart-edit-assistant.png"), studio03Png);
    log("✅ Saved 03-ai-smart-edit-assistant.png");

    // 8. Close AI Assistant Drawer & Switch Left Rail to Captions Tab
    await mainWin.webContents.executeJavaScript(`
      (function() {
        const closeBtn = document.querySelector('button[aria-label="Close Assistant"]');
        if (closeBtn) {
          closeBtn.click();
        } else {
          const buttons = Array.from(document.querySelectorAll('button'));
          const aiBtn = buttons.find(b => b.textContent && b.textContent.trim().includes('Assistant'));
          if (aiBtn) aiBtn.click();
        }

        const buttons = Array.from(document.querySelectorAll('button'));
        const captionsBtn = buttons.find(b => {
          const txt = (b.textContent || '').trim().toLowerCase();
          return txt === 'captions' || txt === 'subtitles';
        });
        if (captionsBtn) {
          captionsBtn.click();
        } else {
          const cursorBtn = buttons.find(b => (b.textContent || '').trim().toLowerCase() === 'cursor');
          if (cursorBtn) cursorBtn.click();
        }
      })();
    `);
    await sleep(1000);

    const studio04Png = (await mainWin.webContents.capturePage()).toPNG();
    fs.writeFileSync(path.join(outDir, "04-cursor-and-captions.png"), studio04Png);
    log("✅ Saved 04-cursor-and-captions.png");

    // 9. Switch back to General tab so 02-studio-editor.png shows the full rendered canvas, wallpaper, and General inspector
    await mainWin.webContents.executeJavaScript(`
      (function() {
        const generalBtn = Array.from(document.querySelectorAll('button')).find(
          b => (b.textContent || '').trim().toLowerCase() === 'general'
        );
        if (generalBtn) generalBtn.click();
      })();
    `);
    await sleep(700);
    const studio02FinalPng = (await mainWin.webContents.capturePage()).toPNG();
    fs.writeFileSync(path.join(outDir, "02-studio-editor.png"), studio02FinalPng);
    log("✅ Updated 02-studio-editor.png with rendered video canvas");

    log("🎉 All 5 marketing screenshots captured successfully!");
    setTimeout(() => {
      app.exit(0);
    }, 300);
  } catch (err) {
    log("❌ Marketing screenshot capture error: " + (err && err.stack ? err.stack : err));
    setTimeout(() => {
      app.exit(1);
    }, 300);
  }
}

module.exports = {
  runMarketingCapture,
};
