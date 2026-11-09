"use strict";

const { BrowserWindow, ipcMain, Menu, screen, app } = require("electron");
const path = require("path");
const fs = require("fs");

const TELEPROMPTER_STORE_KEY = "teleprompterPosition";
let teleprompterWindow = null;

function getTeleprompterHtml() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Screenify Teleprompter</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{
    width:100%;height:100%;overflow:hidden;background:transparent;
    font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',system-ui,sans-serif;
    -webkit-font-smoothing:antialiased;
  }
  .window{
    width:100%;height:100%;
    background:rgba(16,16,18,var(--bg-opacity, 0.96));
    border-radius:16px;
    border:1px solid rgba(255,255,255,0.09);
    display:flex;flex-direction:column;overflow:hidden;
    backdrop-filter:blur(40px);-webkit-backdrop-filter:blur(40px);
    box-shadow:0 24px 80px rgba(0,0,0,0.7),0 0 0 0.5px rgba(255,255,255,0.04) inset;
  }

  /* ── Titlebar ── */
  .titlebar{
    -webkit-app-region:drag;
    display:flex;align-items:center;justify-content:space-between;
    padding:10px 14px 8px;flex-shrink:0;gap:8px;
  }
  .close-dot{
    -webkit-app-region:no-drag;
    width:12px;height:12px;border-radius:50%;
    background:#3a3a3c;border:none;cursor:pointer;
    transition:background 150ms;flex-shrink:0;
  }
  .close-dot:hover{background:#ff5f57}
  .titlebar-center{
    display:flex;flex-direction:column;align-items:center;flex:1;pointer-events:none;
  }
  .titlebar-title{
    font-size:11px;font-weight:600;
    color:rgba(255,255,255,0.42);
    letter-spacing:0.06em;text-transform:uppercase;
  }
  .script-stats{
    font-size:10px;font-weight:400;
    color:rgba(255,255,255,0.28);
    margin-top:2px;
  }
  .titlebar-actions{
    -webkit-app-region:no-drag;
    display:flex;align-items:center;gap:4px;
  }
  .edit-dot{
    -webkit-app-region:no-drag;
    width:26px;height:26px;border-radius:8px;background:none;
    border:none;cursor:pointer;color:rgba(255,255,255,0.32);
    display:flex;align-items:center;justify-content:center;
    transition:all 150ms;flex-shrink:0;
  }
  .edit-dot:hover{background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.75)}
  .edit-dot.active{color:#60a5fa;background:rgba(96,165,250,0.12)}
  .edit-dot svg{width:13px;height:13px}

  /* ── Text body ── */
  .body{flex:1;position:relative;overflow:hidden;min-height:0}
  .body.mirrored .text-display,
  .body.mirrored textarea{
    transform:scaleX(-1);
  }

  .scroll-area{position:absolute;inset:0;overflow:hidden}
  .scroll-content{
    position:absolute;top:0;left:0;width:100%;
    will-change:transform;
    padding:10px 20px 200px;
  }
  .text-display{
    white-space:pre-wrap;word-break:break-word;
    line-height:1.65;color:rgba(255,255,255,0.9);
    font-weight:400;
    transition:transform 150ms ease;
  }

  .fade-top,.fade-bottom{
    position:absolute;left:0;right:0;height:36px;pointer-events:none;z-index:2;
  }
  .fade-top{top:0;background:linear-gradient(to bottom,rgba(16,16,18,0.95) 0%,transparent 100%)}
  .fade-bottom{bottom:0;background:linear-gradient(to top,rgba(16,16,18,0.95) 0%,transparent 100%)}

  .editor-area{
    position:absolute;inset:0;display:none;flex-direction:column;
  }
  textarea{
    flex:1;background:transparent;border:none;outline:none;resize:none;
    color:rgba(255,255,255,0.85);
    padding:10px 20px 20px;
    font-family:inherit;line-height:1.65;
    caret-color:rgba(255,255,255,0.65);
    transition:transform 150ms ease;
  }
  textarea::placeholder{color:rgba(255,255,255,0.22)}

  /* ── Bottom toolbar ── */
  .toolbar{
    -webkit-app-region:no-drag;
    display:flex;align-items:center;justify-content:space-between;
    padding:8px 14px 12px;flex-shrink:0;
    gap:6px;
  }
  .tb-group{display:flex;align-items:center;gap:4px}

  .tb-btn{
    width:28px;height:28px;background:none;border:none;cursor:pointer;
    border-radius:7px;
    color:rgba(255,255,255,0.38);
    display:flex;align-items:center;justify-content:center;
    transition:all 150ms;flex-shrink:0;
  }
  .tb-btn:hover{background:rgba(255,255,255,0.08);color:rgba(255,255,255,0.75)}
  .tb-btn svg{width:13px;height:13px}

  .tb-val{
    font-size:11px;font-weight:500;
    color:rgba(255,255,255,0.32);
    min-width:34px;text-align:center;
    letter-spacing:0.02em;
    pointer-events:none;
  }

  .opacity-slider{
    width:54px;height:4px;accent-color:#60a5fa;cursor:pointer;opacity:0.75;
  }
  .opacity-slider:hover{opacity:1}

  .play-btn{
    width:36px;height:36px;border-radius:50%;
    background:rgba(255,255,255,0.1);
    border:1px solid rgba(255,255,255,0.14);
    cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    transition:all 180ms;
    color:rgba(255,255,255,0.92);
    flex-shrink:0;
  }
  .play-btn:hover{background:rgba(255,255,255,0.16);border-color:rgba(255,255,255,0.24);transform:scale(1.06)}
  .play-btn:active{transform:scale(0.96)}
  .play-btn.playing{background:rgba(96,165,250,0.22);border-color:rgba(96,165,250,0.4)}
  .play-btn svg{width:14px;height:14px}
</style>
</head>
<body>
<div class="window" id="windowRoot">
  <div class="titlebar">
    <button class="close-dot" id="closeBtn" title="Close"></button>
    <div class="titlebar-center">
      <span class="titlebar-title">Screenify Teleprompter</span>
      <span class="script-stats" id="script-stats">0 words · ~0s</span>
    </div>
    <div class="titlebar-actions">
      <input type="range" id="opacity-slider" class="opacity-slider" min="25" max="100" value="96" title="Window Opacity" />
      <button class="edit-dot" id="mirror-btn" title="Mirror / Flip Horizontally (M)">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M7.5 1v14h1V1h-1zM1 8l5-4v8L1 8zm14 0l-5 4V4l5 4z"/></svg>
      </button>
      <button class="edit-dot active" id="pin-btn" title="Always on Top">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a5.927 5.927 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707-.195-.195.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72.342.024.687.077 1.013.16l3.134-3.133a2.772 2.772 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146z"/></svg>
      </button>
      <button class="edit-dot" id="editBtn" title="Edit Script">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M11.5 1.5a1.5 1.5 0 0 1 2.12 2.12l-9 9a1 1 0 0 1-.38.24l-3 1a.5.5 0 0 1-.63-.63l1-3a1 1 0 0 1 .24-.38l9-9z"/></svg>
      </button>
    </div>
  </div>

  <div class="body" id="bodyArea">
    <div class="scroll-area" id="scrollArea">
      <div class="fade-top"></div>
      <div class="scroll-content" id="scrollContent">
        <div class="text-display" id="textDisplay"></div>
      </div>
      <div class="fade-bottom"></div>
    </div>
    <div class="editor-area" id="editorArea">
      <textarea id="textarea" placeholder="Type or paste your speaker notes here…" spellcheck="true"></textarea>
    </div>
  </div>

  <div class="toolbar">
    <div class="tb-group">
      <button class="tb-btn" id="fontDown" title="Smaller text" style="font-size:11px;font-weight:600;letter-spacing:-0.02em">A</button>
      <span class="tb-val" id="sizeDisplay">18</span>
      <button class="tb-btn" id="fontUp" title="Larger text" style="font-size:14px;font-weight:600;letter-spacing:-0.02em">A</button>
    </div>

    <div class="tb-group" style="gap:8px">
      <button class="tb-btn" id="resetBtn" title="Reset (R)">
        <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 8a6 6 0 1 1 1.76 4.24l1.42-1.42A4 4 0 1 0 4 8H6.5L3.5 11 .5 8H2z"/></svg>
      </button>
      <button class="play-btn" id="playBtn" title="Play / Pause (Space)">
        <svg id="playIcon" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5l9 5.5-9 5.5z"/></svg>
        <svg id="pauseIcon" viewBox="0 0 16 16" fill="currentColor" style="display:none"><rect x="3" y="2" width="3" height="12" rx="1.2"/><rect x="10" y="2" width="3" height="12" rx="1.2"/></svg>
      </button>
    </div>

    <div class="tb-group">
      <button class="tb-btn" id="speedDown" title="Slower">
        <svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="7.5" width="10" height="1.5" rx="0.75"/></svg>
      </button>
      <span class="tb-val" id="speedDisplay">1×</span>
      <button class="tb-btn" id="speedUp" title="Faster">
        <svg viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="7.5" width="10" height="1.5" rx="0.75"/><rect x="7.5" y="3" width="1.5" height="10" rx="0.75"/></svg>
      </button>
    </div>
  </div>
</div>

<script>
  const teleprompterBridge = window.teleprompterApi || (() => {
    const { ipcRenderer } = require('electron');
    return {
      getText: () => ipcRenderer.invoke('teleprompter-get-text'),
      saveText: (t) => ipcRenderer.send('teleprompter-save-text', t),
      getSettings: () => ipcRenderer.invoke('teleprompter-get-settings'),
      saveSettings: (s) => ipcRenderer.send('teleprompter-save-settings', s),
      setAlwaysOnTop: (p) => ipcRenderer.send('teleprompter-set-always-on-top', p),
      close: () => ipcRenderer.send('teleprompter-close'),
    };
  })();

  let isPlaying = false;
  let isEditing = true;
  let isMirrored = false;
  let isPinned = true;
  let opacityPct = 96;
  let scrollY = 0;
  let speedIdx = 0;
  let fontSize = 18;
  let animId = null;
  let lastTime = null;

  const windowRoot  = document.getElementById('windowRoot');
  const bodyArea    = document.getElementById('bodyArea');
  const playBtn     = document.getElementById('playBtn');
  const playIcon    = document.getElementById('playIcon');
  const pauseIcon   = document.getElementById('pauseIcon');
  const resetBtn    = document.getElementById('resetBtn');
  const speedDown   = document.getElementById('speedDown');
  const speedUp     = document.getElementById('speedUp');
  const speedDisp   = document.getElementById('speedDisplay');
  const fontDown    = document.getElementById('fontDown');
  const fontUp      = document.getElementById('fontUp');
  const sizeDisp    = document.getElementById('sizeDisplay');
  const editBtn     = document.getElementById('editBtn');
  const mirrorBtn   = document.getElementById('mirror-btn');
  const pinBtn      = document.getElementById('pin-btn');
  const opacitySlider = document.getElementById('opacity-slider');
  const scriptStats = document.getElementById('script-stats');
  const scrollArea  = document.getElementById('scrollArea');
  const scrollContent = document.getElementById('scrollContent');
  const textDisplay = document.getElementById('textDisplay');
  const textarea    = document.getElementById('textarea');
  const editorArea  = document.getElementById('editorArea');
  const closeBtn    = document.getElementById('closeBtn');

  const SPEED_STEPS = [
    0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95,
    1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.4, 1.5, 1.6, 1.7, 1.75, 1.8, 1.9,
    2, 2.1, 2.25, 2.4, 2.5, 2.75, 3, 3.25, 3.5, 3.75,
    4, 4.5, 5, 5.5, 6,
  ];
  const LEGACY_SPEED_STEPS = [
    0.2, 0.35, 0.5, 0.65, 0.8,
    1, 1.15, 1.3, 1.5, 1.75,
    2, 2.25, 2.5, 3, 3.5,
    4, 5, 6,
  ];
  const BASE_PX_PER_SEC = 30;
  const SPEAKING_WPM = 140;

  function nearestSpeedIdx(value) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < SPEED_STEPS.length; i++) {
      const d = Math.abs(SPEED_STEPS[i] - value);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  function resolveSpeedIdx(settings) {
    if (settings && typeof settings.speedValue === 'number' && Number.isFinite(settings.speedValue)) {
      return nearestSpeedIdx(settings.speedValue);
    }
    if (settings && Number.isInteger(settings.speed) && settings.speed >= 0 && settings.speed < LEGACY_SPEED_STEPS.length) {
      return nearestSpeedIdx(LEGACY_SPEED_STEPS[settings.speed]);
    }
    return nearestSpeedIdx(1);
  }

  speedIdx = nearestSpeedIdx(1);

  function updateScriptStats() {
    const raw = (textarea.value || '').trim();
    const words = raw ? raw.split(/\\s+/).length : 0;
    const totalSec = Math.round((words / SPEAKING_WPM) * 60);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const timeLabel = mins > 0 ? \`~\${mins}m \${String(secs).padStart(2, '0')}s\` : \`~\${secs}s\`;
    scriptStats.textContent = \`\${words} word\${words === 1 ? '' : 's'} · \${timeLabel}\`;
  }

  function updateSpeedDisplay() {
    speedDisp.textContent = SPEED_STEPS[speedIdx] + '×';
  }

  function updateFontDisplay() {
    sizeDisp.textContent = fontSize;
    textDisplay.style.fontSize = fontSize + 'px';
    textarea.style.fontSize = fontSize + 'px';
  }

  function updateMirrorState() {
    bodyArea.classList.toggle('mirrored', isMirrored);
    mirrorBtn.classList.toggle('active', isMirrored);
  }

  function updateOpacityState() {
    const clamped = Math.max(25, Math.min(100, Number(opacityPct) || 96));
    opacitySlider.value = String(clamped);
    windowRoot.style.setProperty('--bg-opacity', (clamped / 100).toFixed(2));
  }

  function setMode(editing) {
    isEditing = editing;
    if (editing) {
      editorArea.style.display = 'flex';
      scrollArea.style.display = 'none';
      editBtn.classList.add('active');
      stopPlay();
    } else {
      editorArea.style.display = 'none';
      scrollArea.style.display = 'block';
      editBtn.classList.remove('active');
      textDisplay.textContent = textarea.value;
      saveText();
    }
  }

  function saveText() {
    updateScriptStats();
    teleprompterBridge.saveText(textarea.value);
  }

  function togglePlay() {
    if (isEditing) { setMode(false); startPlay(); return; }
    isPlaying ? stopPlay() : startPlay();
  }

  function startPlay() {
    if (isEditing) setMode(false);
    isPlaying = true;
    playBtn.classList.add('playing');
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    lastTime = null;
    animId = requestAnimationFrame(tick);
  }

  function stopPlay() {
    isPlaying = false;
    playBtn.classList.remove('playing');
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    if (animId) { cancelAnimationFrame(animId); animId = null; }
    lastTime = null;
  }

  function tick(ts) {
    if (!isPlaying) return;
    if (lastTime !== null) {
      const dt = (ts - lastTime) / 1000;
      scrollY += BASE_PX_PER_SEC * SPEED_STEPS[speedIdx] * dt;
      const maxScroll = Math.max(0, scrollContent.scrollHeight - scrollArea.clientHeight);
      if (scrollY >= maxScroll) {
        scrollY = 0;
        scrollContent.style.transform = 'translateY(0)';
        stopPlay();
      }
      scrollContent.style.transform = 'translateY(-' + scrollY + 'px)';
    }
    lastTime = ts;
    animId = requestAnimationFrame(tick);
  }

  function resetScroll() {
    stopPlay();
    scrollY = 0;
    scrollContent.style.transform = 'translateY(0)';
  }

  function persist() {
    teleprompterBridge.saveSettings({
      speed: speedIdx,
      speedValue: SPEED_STEPS[speedIdx],
      fontSize,
      mirrored: isMirrored,
      opacityPct,
    });
  }

  teleprompterBridge.getText().then(text => {
    if (text) {
      textarea.value = text;
      textDisplay.textContent = text;
    }
    updateScriptStats();
  });

  teleprompterBridge.getSettings().then(s => {
    speedIdx = resolveSpeedIdx(s);
    if (s && s.fontSize !== undefined) fontSize = s.fontSize;
    if (s && typeof s.mirrored === 'boolean') isMirrored = s.mirrored;
    if (s && typeof s.opacityPct === 'number') opacityPct = s.opacityPct;
    updateSpeedDisplay();
    updateFontDisplay();
    updateMirrorState();
    updateOpacityState();
  });

  playBtn.addEventListener('click', togglePlay);
  resetBtn.addEventListener('click', resetScroll);

  speedDown.addEventListener('click', () => { if (speedIdx > 0) speedIdx--; updateSpeedDisplay(); persist(); });
  speedUp.addEventListener('click',   () => { if (speedIdx < SPEED_STEPS.length - 1) speedIdx++; updateSpeedDisplay(); persist(); });

  fontDown.addEventListener('click', () => { if (fontSize > 12) fontSize -= 2; updateFontDisplay(); persist(); });
  fontUp.addEventListener('click',   () => { if (fontSize < 48) fontSize += 2; updateFontDisplay(); persist(); });

  mirrorBtn.addEventListener('click', () => {
    isMirrored = !isMirrored;
    updateMirrorState();
    persist();
  });

  pinBtn.addEventListener('click', () => {
    isPinned = !isPinned;
    pinBtn.classList.toggle('active', isPinned);
    teleprompterBridge.setAlwaysOnTop(isPinned);
  });

  opacitySlider.addEventListener('input', () => {
    opacityPct = Number(opacitySlider.value) || 96;
    updateOpacityState();
    persist();
  });

  editBtn.addEventListener('click', () => setMode(!isEditing));
  closeBtn.addEventListener('click', () => teleprompterBridge.close());

  document.addEventListener('keydown', e => {
    if (e.target === textarea) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'KeyR' && !e.metaKey && !e.ctrlKey) resetScroll();
    if (e.code === 'KeyM' && !e.metaKey && !e.ctrlKey) {
      isMirrored = !isMirrored;
      updateMirrorState();
      persist();
    }
  });

  textarea.addEventListener('input', saveText);

  setMode(true);
  updateSpeedDisplay();
  updateFontDisplay();
  updateScriptStats();
</script>
</body>
</html>`;
}

function createTeleprompterWindow(store, getSafeWindowPosition, log) {
  if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
    teleprompterWindow.show();
    teleprompterWindow.focus();
    return;
  }

  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;
  const winWidth = 480;
  const winHeight = 320;
  const defaultX = Math.floor(screenWidth / 2 - winWidth / 2);
  const defaultY = 20;
  const { x, y } = getSafeWindowPosition(
    TELEPROMPTER_STORE_KEY,
    winWidth,
    winHeight,
    defaultX,
    defaultY,
  );

  teleprompterWindow = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    minWidth: 360,
    minHeight: 240,
    x,
    y,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    hasShadow: true,
    alwaysOnTop: true,
    resizable: true,
    movable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  teleprompterWindow.setContentProtection(true);

  teleprompterWindow.on("moved", () => {
    if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
      const [curX, curY] = teleprompterWindow.getPosition();
      store.set(TELEPROMPTER_STORE_KEY, { x: curX, y: curY });
    }
  });

  const userDataDir = app.getPath("userData");
  fs.mkdirSync(userDataDir, { recursive: true });
  const htmlFile = path.join(userDataDir, "teleprompter.html");
  fs.writeFileSync(htmlFile, getTeleprompterHtml(), { mode: 0o600 });
  teleprompterWindow.loadFile(htmlFile);

  teleprompterWindow.on("closed", () => {
    teleprompterWindow = null;
  });

  if (log) {
    log("📜 Screenify Teleprompter window created");
  }
}

function registerTeleprompterIpc(store, getSafeWindowPosition, log) {
  ipcMain.handle("show-settings-menu", async (event) => {
    try {
      const { shell } = require("electron");
      const menu = Menu.buildFromTemplate([
        {
          label: "Open Speaker Notes (Teleprompter)",
          click: () =>
            createTeleprompterWindow(store, getSafeWindowPosition, log),
        },
        { type: "separator" },
        {
          label: "Open Log Files",
          click: () =>
            shell.openPath(path.join(app.getPath("userData"), "logs")),
        },
      ]);
      menu.popup({
        window: BrowserWindow.fromWebContents(event.sender),
      });
      return { success: true };
    } catch (err) {
      if (log) {
        log("Error showing settings menu: " + err.message);
      }
      return {
        success: false,
        error: err.message,
      };
    }
  });

  ipcMain.on("teleprompter-save-text", (_event, text) => {
    store.set("teleprompterText", text);
  });

  ipcMain.handle("teleprompter-get-text", () => {
    return store.get("teleprompterText", "");
  });

  ipcMain.on("teleprompter-save-settings", (_event, settings) => {
    store.set("teleprompterSettings", settings);
  });

  ipcMain.handle("teleprompter-get-settings", () => {
    return store.get("teleprompterSettings", {
      speed: 5,
      fontSize: 18,
      mirrored: false,
      opacityPct: 96,
    });
  });

  ipcMain.on("teleprompter-set-always-on-top", (_event, flag) => {
    if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
      teleprompterWindow.setAlwaysOnTop(Boolean(flag));
    }
  });

  ipcMain.on("teleprompter-close", () => {
    if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
      teleprompterWindow.close();
    }
  });

  ipcMain.handle("open-teleprompter", () => {
    createTeleprompterWindow(store, getSafeWindowPosition, log);
    return { success: true };
  });
}

module.exports = {
  registerTeleprompterIpc,
  createTeleprompterWindow,
};
