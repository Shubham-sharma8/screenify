"use strict";

const fs = require("fs");
const path = require("path");
const {
  PORTABLE_PLAYER_PROP_KEYS,
  pickPortableSettings,
} = require("./editorPresetSettings");

const PRESET_VERSION = 1;
const PRESETS_FOLDER_NAME = "Screenify Presets";
const LEGACY_PRESETS_FOLDER_NAME = "Screen Charm Presets";

const BUILT_IN_STUDIO_PRESETS = Object.freeze([
  Object.freeze({
    name: "Cinematic macOS Glass",
    settings: Object.freeze({
      padding: 120,
      aspectRatio: "16:9",
      borderRadius: 20,
      shadowIntensity: 75,
      backgroundImage: "15-Sequoia-Light.jpeg",
      backgroundImageBlur: 18,
      defaultZoomInLevel: 1.85,
      zoomInEffect: true,
      showClickEffect: true,
      cursorSize: 1.35,
      enhanceMicAudio: true,
    }),
  }),
  Object.freeze({
    name: "Product Launch Zoom",
    settings: Object.freeze({
      padding: 96,
      aspectRatio: "16:9",
      borderRadius: 24,
      shadowIntensity: 85,
      backgroundImage: "Chaotic-Gradients-100.jpeg",
      backgroundImageBlur: 10,
      defaultZoomInLevel: 2.2,
      zoomInEffect: true,
      showClickEffect: true,
      trailEffect: true,
      cursorSize: 1.5,
      backgroundMusicTrack: "Product Launch.mp3",
      backgroundMusicVolume: 0.18,
    }),
  }),
  Object.freeze({
    name: "Tutorial Crisp",
    settings: Object.freeze({
      padding: 64,
      aspectRatio: "16:9",
      borderRadius: 14,
      shadowIntensity: 45,
      backgroundImage: "14-Sonoma-Dark.jpeg",
      backgroundImageBlur: 8,
      defaultZoomInLevel: 1.65,
      zoomInEffect: true,
      showClickEffect: true,
      cursorSize: 1.4,
      subtitlesEnabled: true,
      enhanceMicAudio: true,
    }),
  }),
  Object.freeze({
    name: "Social Reels 9:16",
    settings: Object.freeze({
      padding: 72,
      aspectRatio: "9:16",
      borderRadius: 22,
      shadowIntensity: 70,
      backgroundImage: "Dreamy-Fabrica-06.jpeg",
      backgroundImageBlur: 14,
      reelsScreenZoom: 1.25,
      defaultZoomInLevel: 2.0,
      zoomInEffect: true,
      showClickEffect: true,
      subtitlesEnabled: true,
    }),
  }),
  Object.freeze({
    name: "Minimal Dark",
    settings: Object.freeze({
      padding: 80,
      aspectRatio: "16:9",
      borderRadius: 16,
      shadowIntensity: 60,
      backgroundColor: "#0f172a",
      defaultZoomInLevel: 1.75,
      zoomInEffect: true,
      showClickEffect: false,
      cursorSize: 1.2,
    }),
  }),
]);

function sanitizePresetName(name) {
  return String(name || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\.+$/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function filenameForPreset(name) {
  const slug = sanitizePresetName(name)
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return (slug || "preset") + ".json";
}

function isSafePresetId(presetId) {
  return (
    typeof presetId === "string" &&
    presetId.endsWith(".json") &&
    path.basename(presetId) === presetId
  );
}

function seedBuiltInPresetsIfNeeded(presetsDir, log = console.log) {
  try {
    const existingJsonFiles = fs
      .readdirSync(presetsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"));
    if (existingJsonFiles.length > 0) {
      return;
    }
    const nowIso = new Date().toISOString();
    for (const preset of BUILT_IN_STUDIO_PRESETS) {
      const fileName = filenameForPreset(preset.name);
      const filePath = path.join(presetsDir, fileName);
      if (!fs.existsSync(filePath)) {
        const payload = {
          version: PRESET_VERSION,
          name: preset.name,
          createdAt: nowIso,
          updatedAt: nowIso,
          settings: pickPortableSettings(preset.settings),
        };
        fs.writeFileSync(
          filePath,
          JSON.stringify(payload, null, 2) + "\n",
          "utf8",
        );
      }
    }
  } catch (err) {
    log("Failed to seed built-in studio presets: " + err.message);
  }
}

function registerEditorPresetIpc({
  ipcMain,
  app,
  shell,
  log = console.log,
}) {
  const getPresetsPath = () =>
    path.join(app.getPath("userData"), PRESETS_FOLDER_NAME);

  const ensurePresetsDir = () => {
    let dirPath = getPresetsPath();
    try {
      fs.mkdirSync(dirPath, { recursive: true });
    } catch {
      const fallbackBase =
        typeof app.getPath === "function"
          ? app.getPath("temp")
          : process.cwd();
      dirPath = path.join(fallbackBase, PRESETS_FOLDER_NAME);
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Migrate any legacy "Screen Charm Presets" files inside userData if present
    try {
      const legacyDir = path.join(
        app.getPath("userData"),
        LEGACY_PRESETS_FOLDER_NAME,
      );
      if (fs.existsSync(legacyDir)) {
        for (const entry of fs.readdirSync(legacyDir, {
          withFileTypes: true,
        })) {
          if (entry.isFile() && entry.name.endsWith(".json")) {
            const dst = path.join(dirPath, entry.name);
            if (!fs.existsSync(dst)) {
              fs.copyFileSync(path.join(legacyDir, entry.name), dst);
            }
          }
        }
      }
    } catch {
      // Ignore legacy migration errors
    }

    seedBuiltInPresetsIfNeeded(dirPath, log);
    return dirPath;
  };

  if (app && typeof app.whenReady === "function") {
    app
      .whenReady()
      .then(() => {
        try {
          ensurePresetsDir();
        } catch {}
      })
      .catch(() => {});
  } else {
    try {
      ensurePresetsDir();
    } catch {}
  }

  const readPresetById = (presetId) => {
    if (!isSafePresetId(presetId)) {
      throw new Error("Invalid preset identifier.");
    }
    const raw = fs.readFileSync(
      path.join(ensurePresetsDir(), presetId),
      "utf8",
    );
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || typeof parsed.name !== "string") {
      throw new Error("Invalid preset file.");
    }
    return {
      id: presetId,
      name: parsed.name,
      version: parsed.version || PRESET_VERSION,
      createdAt: parsed.createdAt || null,
      updatedAt: parsed.updatedAt || null,
      settings: pickPortableSettings(parsed.settings),
    };
  };

  const listPresetsHandler = () => {
    try {
      const dirPath = ensurePresetsDir();
      const presets = fs
        .readdirSync(dirPath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
        .map((entry) => {
          try {
            return readPresetById(entry.name);
          } catch (err) {
            log(`Ignoring invalid editor preset ${entry.name}: ${err.message}`);
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name));
      return {
        success: true,
        presets,
      };
    } catch (err) {
      log("Failed to list editor presets: " + err.message);
      return {
        success: false,
        error: err.message,
        presets: [],
      };
    }
  };

  ipcMain.handle("list-editor-presets", listPresetsHandler);
  ipcMain.handle("editor-presets-list", listPresetsHandler);

  ipcMain.handle("load-editor-preset", (_event, presetId) => {
    try {
      return {
        success: true,
        preset: readPresetById(presetId),
      };
    } catch (err) {
      log("Failed to load editor preset: " + err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  });

  ipcMain.handle("save-editor-preset", (_event, rawName, rawSettings) => {
    try {
      const name = sanitizePresetName(rawName);
      if (!name) {
        return {
          success: false,
          error: "Enter a preset name.",
        };
      }
      const settings = pickPortableSettings(rawSettings);
      if (Object.keys(settings).length === 0) {
        return {
          success: false,
          error: "There are no reusable settings to save.",
        };
      }
      const dirPath = ensurePresetsDir();
      const baseFilename = filenameForPreset(name);
      const ext = path.extname(baseFilename);
      const stem = path.basename(baseFilename, ext);
      let candidate = baseFilename;
      let counter = 2;
      while (fs.existsSync(path.join(dirPath, candidate))) {
        candidate = `${stem}-${counter}${ext}`;
        counter += 1;
      }
      const nowIso = new Date().toISOString();
      const payload = {
        version: PRESET_VERSION,
        name,
        createdAt: nowIso,
        updatedAt: nowIso,
        settings,
      };
      fs.writeFileSync(
        path.join(dirPath, candidate),
        JSON.stringify(payload, null, 2) + "\n",
        "utf8",
      );
      return {
        success: true,
        preset: { id: candidate, ...payload },
      };
    } catch (err) {
      log("Failed to save editor preset: " + err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  });

  ipcMain.handle("update-editor-preset", (_event, presetId, rawSettings) => {
    try {
      const existing = readPresetById(presetId);
      const settings = pickPortableSettings(rawSettings);
      if (Object.keys(settings).length === 0) {
        return {
          success: false,
          error: "There are no reusable settings to save.",
        };
      }
      const updated = {
        version: PRESET_VERSION,
        name: existing.name,
        createdAt: existing.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings,
      };
      fs.writeFileSync(
        path.join(ensurePresetsDir(), presetId),
        JSON.stringify(updated, null, 2) + "\n",
        "utf8",
      );
      return {
        success: true,
        preset: { id: presetId, ...updated },
      };
    } catch (err) {
      log("Failed to update editor preset: " + err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  });

  ipcMain.handle("delete-editor-preset", (_event, presetId) => {
    try {
      if (!isSafePresetId(presetId)) {
        throw new Error("Invalid preset identifier.");
      }
      fs.unlinkSync(path.join(ensurePresetsDir(), presetId));
      return { success: true };
    } catch (err) {
      log("Failed to delete editor preset: " + err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  });

  ipcMain.handle("open-editor-presets-folder", async () => {
    try {
      const errMsg = await shell.openPath(ensurePresetsDir());
      if (errMsg) {
        throw new Error(errMsg);
      }
      return { success: true };
    } catch (err) {
      log("Failed to open editor presets folder: " + err.message);
      return {
        success: false,
        error: err.message,
      };
    }
  });
}

module.exports = {
  PORTABLE_PLAYER_PROP_KEYS,
  BUILT_IN_STUDIO_PRESETS,
  pickPortableSettings,
  sanitizePresetName,
  registerEditorPresetIpc,
};
