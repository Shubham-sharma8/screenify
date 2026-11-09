"use strict";

const { contextBridge, ipcRenderer } = require("electron");
const path = require("path");

function registerIpcSubscriber(channel, callback, passData = true) {
  const handler = passData
    ? (_event, data) => callback(data)
    : () => callback();
  ipcRenderer.on(channel, handler);
  return () => ipcRenderer.removeListener(channel, handler);
}

globalThis.global = globalThis;
window.global = window;

contextBridge.exposeInMainWorld("api", {
  startRecording: (config, options) =>
    ipcRenderer.invoke("start-recording", config, options),
  getRunningApps: () => ipcRenderer.invoke("get-running-apps"),
  stopRecording: () => ipcRenderer.invoke("stop-recording"),
  updateSystemAudio: (enabled) =>
    ipcRenderer.invoke("update-system-audio", enabled),
  showNotification: () => ipcRenderer.invoke("show-notification"),
  stopMouseTracking: () => ipcRenderer.invoke("stop-mouse-tracking"),
  getAnonymousId: () => ipcRenderer.invoke("get-anonymous-id"),
  renderMedia: (props, options) =>
    ipcRenderer.invoke("render-media", props, options),
  onRenderProgress: (cb) => ipcRenderer.on("render-progress", cb),
  onRenderError: (cb) => ipcRenderer.on("render-error", cb),
  onRenderComplete: (cb) => ipcRenderer.on("render-complete", cb),
  onRenderReset: (cb) => ipcRenderer.on("render-reset", cb),
  onDownloadError: (cb) => ipcRenderer.on("download-error", cb),
  activateWindow: (windowId) => ipcRenderer.invoke("activate-window", windowId),
  onDownloadComplete: (cb) => ipcRenderer.on("download-complete", cb),
  getWindowPositionAndSize: (windowId) =>
    ipcRenderer.invoke("getWindowPositionAndSize", windowId),
  getPrimaryScreenSize: () => ipcRenderer.invoke("get-primary-screen-size"),
  getSizeForVideoEditor: () => ipcRenderer.invoke("get-size-for-video-editor"),
  setTransparency: (transparent) =>
    ipcRenderer.invoke("set-transparency", transparent),
  showRecordingStarter: () => ipcRenderer.invoke("show-recording-starter"),
  getScreenSizeWithDisplays: () =>
    ipcRenderer.invoke("get-screen-size-with-displays"),
  getActiveWindow: () => ipcRenderer.invoke("get-active-window"),
  openLogsFolder: () => ipcRenderer.invoke("open-logs-folder"),
  showNoMicrophoneWarning: () =>
    ipcRenderer.invoke("show-no-microphone-warning"),
  setCameraStatus: (enabled, deviceId, shape, size) =>
    ipcRenderer.invoke("set-camera-status", enabled, deviceId, shape, size),
  showErrorNotification: (title, body) =>
    ipcRenderer.invoke("show-error-notification", title, body),
  setWindowSizeAndPosition: (x, y, width, height) =>
    ipcRenderer.invoke("set-window-size-and-position", x, y, width, height),
  setAspectRatio: (ratio) => ipcRenderer.invoke("set-aspect-ratio", ratio),
  resizeTargetWindow: (target) =>
    ipcRenderer.invoke("resize-target-window", target),
  getWindowDefaultSizeAndPosition: () =>
    ipcRenderer.invoke("get-window-default-size-and-position"),
  getCurrentWindowPositionAndSize: () =>
    ipcRenderer.invoke("get-current-window-position-and-size"),
  setWindowDefaultSizeAndPosition: () =>
    ipcRenderer.invoke("set-window-default-size-and-position"),
  closeAllWindows: () => ipcRenderer.invoke("close-all-windows"),
  closeApp: () => ipcRenderer.invoke("close-app"),
  starterDragStart: (screenX, screenY) =>
    ipcRenderer.send("starter-drag-start", { screenX, screenY }),
  starterDragEnd: () => ipcRenderer.send("starter-drag-end"),
  showNewRecordingDialog: () => ipcRenderer.invoke("show-new-recording-dialog"),
  setTrafficLightsVisibility: (visible) =>
    ipcRenderer.invoke("set-traffic-lights-visibility", visible),
  getDisplayScaleFactor: (displayId) =>
    ipcRenderer.invoke("get-display-scale-factor", displayId),
  getDisplays: () => ipcRenderer.invoke("get-displays"),
  hideWindow: () => ipcRenderer.invoke("hide-window"),
  showWindow: () => ipcRenderer.invoke("show-window"),
  refreshWindow: () => ipcRenderer.invoke("refresh-window"),
  openExternal: (url) => ipcRenderer.invoke("open-external", url),
  openDownloadFolder: () => ipcRenderer.invoke("open-download-folder"),
  openProjectsFolder: () => ipcRenderer.invoke("open-projects-folder"),
  setFocus: () => ipcRenderer.invoke("set-focus"),
  getFreeDownloadsAvailable: () =>
    ipcRenderer.invoke("get-free-downloads-available"),
  showAccessibilityPermissionDialogIfNeeded: () =>
    ipcRenderer.invoke("show-accessibility-permission-dialog-if-needed"),
  cancelRendering: () => ipcRenderer.invoke("cancel-rendering"),
  setFullscreen: (fullscreen) =>
    ipcRenderer.invoke("set-fullscreen", fullscreen),
  getLicenseState: () => ipcRenderer.invoke("license-get-state"),
  isLicenseUnlocked: () => ipcRenderer.invoke("license-is-unlocked"),
  verifyLicenseForExport: () => ipcRenderer.invoke("license-verify-for-export"),
  activateLicense: (key) => ipcRenderer.invoke("license-activate", key),
  openLicenseUpgrade: () => ipcRenderer.invoke("license-open-upgrade"),
  onLicenseLocked: (cb) => registerIpcSubscriber("license-locked", cb),
  setDownloadCount: (count) => ipcRenderer.invoke("set-download-count", count),
  getDownloadCount: () => ipcRenderer.invoke("get-download-count"),
  readSamplesBatch: (startIndex, count, videoType = "screen") =>
    ipcRenderer.invoke("read-samples-batch", {
      startIndex,
      count,
      videoType,
    }),
  cleanupTempVideo: (videoType) =>
    ipcRenderer.invoke("cleanup-temp-video", videoType),
  startExport: (videoType, intervalData, frameRate, webcamFile) =>
    ipcRenderer.invoke("start-export", {
      videoType,
      intervalData,
      frameRate,
      webcamFile,
    }),
  endExport: (videoType = "screen") =>
    ipcRenderer.invoke("end-export", { videoType }),
  readLocalFile: (filePath) => ipcRenderer.invoke("read-local-file", filePath),
  getVideoUrl: (filePath) => ipcRenderer.invoke("get-video-url", filePath),
  readAudioFile: (filePath) => ipcRenderer.invoke("read-audio-file", filePath),
  readChunk: async (offset, length) => {
    const chunk = await ipcRenderer.invoke("read-video-chunk", {
      offset,
      length,
    });
    if (!chunk) return new ArrayBuffer(0);
    if (chunk instanceof ArrayBuffer) return chunk;
    if (chunk.buffer && chunk.byteLength !== undefined) {
      try {
        const view = new Uint8Array(chunk);
        return view.buffer.slice(
          view.byteOffset,
          view.byteOffset + view.byteLength,
        );
      } catch {
        return Uint8Array.from(chunk).buffer;
      }
    }
    if (chunk.type === "Buffer" && Array.isArray(chunk.data)) {
      return new Uint8Array(chunk.data).buffer;
    }
    try {
      const view = new Uint8Array(chunk);
      return view.buffer.slice(
        view.byteOffset,
        view.byteOffset + view.byteLength,
      );
    } catch {
      return new ArrayBuffer(0);
    }
  },
  getVideoSize: async () => {
    try {
      return await ipcRenderer.invoke("get-video-size");
    } catch {
      return 0;
    }
  },
  onRenderCancelled: (cb) => ipcRenderer.on("render-cancelled", cb),
  onFFmpegDone: (cb) => ipcRenderer.on("ffmpeg-done", cb),
  exitFullscreen: () => ipcRenderer.invoke("exit-fullscreen"),
  addControls: () => ipcRenderer.invoke("add-controls"),
  isProduction: () => ipcRenderer.invoke("is-production"),
  getNewVersionUrl: () => ipcRenderer.invoke("get-new-version-url"),
  validatePromoCode: (code) => ipcRenderer.invoke("validate-promo-code", code),
  startDownloadNewVersion: (url) =>
    ipcRenderer.invoke("start-download-new-version", url),
  installNewVersion: () => ipcRenderer.invoke("install-new-version"),
  posthogEvent: (event, properties) =>
    ipcRenderer.invoke("posthog-event", event, properties),
  removeControls: () => ipcRenderer.invoke("remove-controls"),
  setMainWindowAlwaysOnTop: (flag) =>
    ipcRenderer.invoke("set-main-window-always-on-top", flag),
  onOverlayDimensionsChange: (cb) => {
    ipcRenderer.on("overlay-dimensions-change", cb);
  },
  removeOverlayDimensionsListener: (cb) => {
    ipcRenderer.removeListener("overlay-dimensions-change", cb);
  },
  updateOverlayDimensions: (dims) => {
    ipcRenderer.send("update-overlay-dimensions", dims);
  },
  quit: () => ipcRenderer.invoke("quit"),
  removeRenderListeners: () => {
    ipcRenderer.removeAllListeners("render-progress");
    ipcRenderer.removeAllListeners("render-error");
    ipcRenderer.removeAllListeners("render-complete");
    ipcRenderer.removeAllListeners("render-reset");
    ipcRenderer.removeAllListeners("render-cancelled");
    ipcRenderer.removeAllListeners("ffmpeg-done");
  },
  removeFFmpegListener: () => {
    ipcRenderer.removeAllListeners("ffmpeg-done");
  },
  showInFinder: (filePath) => ipcRenderer.invoke("show-in-finder", filePath),
  setTextInputFocused: (focused) =>
    ipcRenderer.send("text-input-focused", !!focused),
  onKeyboardShortcut: (cb) => registerIpcSubscriber("keyboard-shortcut", cb),
  getAvailableCameras: () => ipcRenderer.invoke("getAvailableCameras"),
  getAvailableMicrophones: () => ipcRenderer.invoke("getAvailableMicrophones"),
  showDisplaysMenu: (arg) => ipcRenderer.invoke("show-displays-menu", arg),
  showCamerasMenu: (a, b) => ipcRenderer.invoke("show-cameras-menu", a, b),
  showMicrophonesMenu: (a, b) =>
    ipcRenderer.invoke("show-microphones-menu", a, b),
  showWindowsMenu: (arg) => ipcRenderer.invoke("show-windows-menu", arg),
  showIntervalContextMenu: (arg) =>
    ipcRenderer.invoke("show-interval-context-menu", arg),
  onDisplaySelected: (cb) => registerIpcSubscriber("display-selected", cb),
  onCameraSelected: (cb) => registerIpcSubscriber("camera-selected", cb),
  onMicrophoneSelected: (cb) =>
    registerIpcSubscriber("microphone-selected", cb),
  onWindowSelected: (cb) => registerIpcSubscriber("window-selected", cb),
  onIntervalContextMenuAction: (cb) =>
    registerIpcSubscriber("interval-context-menu-action", cb),
  requestCameraAccess: () => ipcRenderer.invoke("requestCameraAccess"),
  requestMicrophoneAccess: () => ipcRenderer.invoke("requestMicrophoneAccess"),
  updateMicrophone: (micId) => ipcRenderer.invoke("updateMicrophone", micId),
  onOpenProjectFromFile: (cb) => {
    ipcRenderer.on("open-project-from-file", cb);
  },
  getPendingProject: () => ipcRenderer.invoke("get-pending-project"),
  notifyRendererReady: () => ipcRenderer.send("renderer-ready"),
  onProjectArchived: (cb) => {
    ipcRenderer.on("project-archived", cb);
  },
  onAudioEnhancementReady: (cb) =>
    registerIpcSubscriber("audio-enhancement-ready", cb),
  onAudioEnhancementFailed: (cb) =>
    registerIpcSubscriber("audio-enhancement-failed", cb),
  getExtractedMediaUrl: (projectId, fileName) =>
    ipcRenderer.invoke("get-extracted-media-url", projectId, fileName),
  processScreencharmArchive: (archivePath) =>
    ipcRenderer.invoke("process-screencharm-archive", archivePath),
  setCountdownFinishedTime: (timestamp) =>
    ipcRenderer.invoke("set-countdown-finished-time", timestamp),
  uploadToR2: (filePath, metadata) =>
    ipcRenderer.invoke("upload-to-r2", filePath, metadata),
  getThumbnailDataUrl: (videoPath) =>
    ipcRenderer.invoke("get-thumbnail-data-url", videoPath),
  deleteSharedVideo: (videoId) =>
    ipcRenderer.invoke("delete-shared-video", videoId),
  onUploadProgress: (cb) => ipcRenderer.on("upload-progress", cb),
  removeUploadListeners: () =>
    ipcRenderer.removeAllListeners("upload-progress"),
  getTempExportPath: () => ipcRenderer.invoke("get-temp-export-path"),
  showSaveDialog: () => ipcRenderer.invoke("show-save-dialog"),
  checkDiskSpaceForExport: (duration, resolution) =>
    ipcRenderer.invoke("check-disk-space-for-export", duration, resolution),
  createOffscreenRenderer: (width, height, props) =>
    ipcRenderer.invoke("create-offscreen-renderer", width, height, props),
  getPlayerProps: () => ipcRenderer.invoke("get-player-props"),
  destroyOffscreenRenderer: (reason = null) =>
    ipcRenderer.invoke("destroy-offscreen-renderer", reason),
  stopOffscreenRendering: () => ipcRenderer.invoke("stop-offscreen-rendering"),
  getBackgroundImagePath: (name) =>
    ipcRenderer.invoke("get-background-image-path", name),
  getAssetPath: (type, name) =>
    ipcRenderer.invoke("get-asset-path", type, name),
  getFetchableAssetPath: (type, name) =>
    ipcRenderer.invoke("get-fetchable-asset-path", type, name),
  pickCustomBackground: () => ipcRenderer.invoke("pick-custom-background"),
  getCustomBackgrounds: () => ipcRenderer.invoke("get-custom-backgrounds"),
  removeCustomBackground: (filePath) =>
    ipcRenderer.invoke("remove-custom-background", filePath),
  getCustomBgDataUrl: (filePath) =>
    ipcRenderer.invoke("get-custom-bg-data-url", filePath),
  listAssetFiles: (folder) => ipcRenderer.invoke("list-asset-files", folder),
  isPackaged: () => ipcRenderer.invoke("is-packaged"),
  writeVideoChunk: (streamId, chunk, frameIndex) =>
    ipcRenderer.invoke("writeVideoChunk", streamId, chunk, frameIndex),
  finalizeVideoStream: (streamId, options) =>
    ipcRenderer.invoke("finalizeVideoStream", streamId, options),
  sendOffscreenProgress: (progress) =>
    ipcRenderer.send("offscreen-render-progress", progress),
  sendOffscreenError: (error) =>
    ipcRenderer.send("offscreen-render-error", error),
  onNextFrame: (cb) => {
    ipcRenderer.on("next-frame", cb);
    return () => ipcRenderer.removeListener("next-frame", cb);
  },
  removeNextFrameListener: () => {
    ipcRenderer.removeAllListeners("next-frame");
  },
  getCurrentProjectName: () => ipcRenderer.invoke("get-current-project-name"),
  renameProjectFile: (newName) =>
    ipcRenderer.invoke("rename-project-file", newName),
  savePlayerPropsToFile: (props) =>
    ipcRenderer.invoke("save-player-props-to-file", props),
  savePlayerPropsToBundle: (props) =>
    ipcRenderer.invoke("save-playerprops-to-bundle", props),
  getCurrentPlayerProps: () => ipcRenderer.invoke("get-current-player-props"),
  listEditorPresets: () => ipcRenderer.invoke("list-editor-presets"),
  loadEditorPreset: (id) => ipcRenderer.invoke("load-editor-preset", id),
  saveEditorPreset: (name, settings) =>
    ipcRenderer.invoke("save-editor-preset", name, settings),
  updateEditorPreset: (id, payload) =>
    ipcRenderer.invoke("update-editor-preset", id, payload),
  deleteEditorPreset: (id) => ipcRenderer.invoke("delete-editor-preset", id),
  openEditorPresetsFolder: () =>
    ipcRenderer.invoke("open-editor-presets-folder"),
  aiEditTranscribe: (payload) =>
    ipcRenderer.invoke("ai-edit-transcribe", payload),
  aiEditRequest: (payload) => ipcRenderer.invoke("ai-edit-request", payload),
  aiEditQuota: () => ipcRenderer.invoke("ai-edit-quota"),
  ensureSubtitleModel: () => ipcRenderer.invoke("subtitles-ensure-model"),
  extractSubtitleAudio: (payload) =>
    ipcRenderer.invoke("subtitles-extract-audio", payload),
  cleanupSubtitleAudio: (payload) =>
    ipcRenderer.invoke("subtitles-cleanup-audio", payload),
  onSubtitleModelProgress: (cb) =>
    registerIpcSubscriber("subtitles-model-progress", cb),
  checkForUpdates: () => ipcRenderer.invoke("check-for-updates"),
  downloadUpdate: () => ipcRenderer.invoke("download-update"),
  quitAndInstall: () => ipcRenderer.invoke("quit-and-install"),
  getUpdateStatus: () => ipcRenderer.invoke("get-update-status"),
  onUpdateAvailable: (cb) => registerIpcSubscriber("update-available", cb),
  onDownloadProgress: (cb) => registerIpcSubscriber("download-progress", cb),
  onUpdateDownloaded: (cb) => registerIpcSubscriber("update-downloaded", cb),
  onUpdateError: (cb) => registerIpcSubscriber("update-error", cb),
  onRecordingStoppedLowDisk: (cb) =>
    registerIpcSubscriber("recording-stopped-low-disk", cb),
  onRecordingStoppingLowDisk: (cb) =>
    registerIpcSubscriber("recording-stopping-low-disk", cb, false),
  getStoreValue: (key) => ipcRenderer.invoke("get-store-value", key),
  setStoreValue: (key, val) => ipcRenderer.invoke("set-store-value", key, val),
  saveFileToBundle: (name, data) =>
    ipcRenderer.invoke("save-file-to-bundle", name, data),
  checkInternetConnectivity: () =>
    ipcRenderer.invoke("check-internet-connectivity"),
  resembleConvertVoice: (a, b) =>
    ipcRenderer.invoke("resemble-convert-voice", a, b),
  heygenUploadAudio: (arg) => ipcRenderer.invoke("heygen-upload-audio", arg),
  heygenCreateAvatarVideo: (a, b) =>
    ipcRenderer.invoke("heygen-create-avatar-video", a, b),
  heygenGetVideoStatus: (id) =>
    ipcRenderer.invoke("heygen-get-video-status", id),
  heygenDownloadAndSave: (a, b) =>
    ipcRenderer.invoke("heygen-download-and-save", a, b),
  heygenGetAvatarLook: (id) => ipcRenderer.invoke("heygen-get-avatar-look", id),
  listAiAvatars: () => ipcRenderer.invoke("list-ai-avatars"),
  deleteAiAvatar: (id) => ipcRenderer.invoke("delete-ai-avatar", id),
  getDevFlags: () => ipcRenderer.invoke("get-dev-flags"),
  showOverlayWindow: (arg) => ipcRenderer.invoke("show-overlay-window", arg),
  editorMounted: () => ipcRenderer.send("editor-mounted"),
  onRecordingComplete: (cb) => registerIpcSubscriber("recording-complete", cb),
  onRecordingError: (cb) => registerIpcSubscriber("recording-error", cb),
  onRecordingCancelled: (cb) =>
    registerIpcSubscriber("recording-cancelled", cb, false),
  onOverlayCancelled: (cb) =>
    registerIpcSubscriber("overlay-cancelled", cb, false),
  onSaveAreaConfig: (cb) => registerIpcSubscriber("save-area-config", cb),
  showSettingsMenu: () => ipcRenderer.invoke("show-settings-menu"),
  openTeleprompter: () => ipcRenderer.invoke("open-teleprompter"),
});

contextBridge.exposeInMainWorld("nodePath", {
  join: (...args) => path.join(...args),
  resolve: (...args) => path.resolve(...args),
});

contextBridge.exposeInMainWorld("teleprompterApi", {
  getText: () => ipcRenderer.invoke("teleprompter-get-text"),
  saveText: (text) => ipcRenderer.send("teleprompter-save-text", text),
  getSettings: () => ipcRenderer.invoke("teleprompter-get-settings"),
  saveSettings: (settings) =>
    ipcRenderer.send("teleprompter-save-settings", settings),
  setAlwaysOnTop: (pinned) =>
    ipcRenderer.send("teleprompter-set-always-on-top", Boolean(pinned)),
  close: () => ipcRenderer.send("teleprompter-close"),
});

contextBridge.exposeInMainWorld("permissionsApi", {
  openSetting: (id) => ipcRenderer.invoke("open-permission-settings", id),
  continueToApp: () => ipcRenderer.invoke("permissions-continue"),
  checkAll: () => ipcRenderer.invoke("check-all-permissions"),
});
