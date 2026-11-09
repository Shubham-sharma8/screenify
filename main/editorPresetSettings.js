"use strict";

const PORTABLE_PLAYER_PROP_KEYS = Object.freeze([
  "padding",
  "aspectRatio",
  "borderRadius",
  "shadowIntensity",
  "backgroundImage",
  "backgroundColor",
  "backgroundImageBlur",
  "deviceFrame",
  "defaultZoomInLevel",
  "defaultPlaybackSpeed",
  "zoomInEffect",
  "cameraZoomEffect",
  "zoomDurationSec",
  "zoomInFreezeDurationSec",
  "zoomOutFreezeDurationSec",
  "clickEffects",
  "showClickEffect",
  "trailEffect",
  "cursorSize",
  "cursorSpeed",
  "showCursor",
  "useDefaultCursor",
  "cameraLayout",
  "cameraPosition",
  "cameraSize",
  "cameraBorderRadius",
  "cameraContentZoom",
  "cameraRemoveBackground",
  "showCamera",
  "showIntro",
  "showOutro",
  "introText",
  "outroText",
  "introDurationInFrames",
  "outroDurationInFrames",
  "textColor",
  "fontFamily",
  "fontSize",
  "textEffect",
  "outroBackgroundColor",
  "backgroundMusicTrack",
  "backgroundMusicVolume",
  "systemSoundOn",
  "muteMic",
  "enhanceMicAudio",
  "microphoneVolume",
  "bitrateMultiplier",
  "outputFrameRate",
  "reelsScreenZoom",
  "subtitlesEnabled",
  "subtitleStyle",
]);

function clonePlainObject(obj, depth = 0) {
  if (depth > 3 || !obj || typeof obj !== "object" || Array.isArray(obj)) {
    return null;
  }
  const cloned = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "__proto__" || k === "constructor" || k === "prototype") {
      continue;
    }
    if (
      v === null ||
      typeof v === "string" ||
      typeof v === "boolean" ||
      (typeof v === "number" && Number.isFinite(v))
    ) {
      cloned[k] = v;
    } else if (typeof v === "object" && !Array.isArray(v)) {
      const nested = clonePlainObject(v, depth + 1);
      if (nested) {
        cloned[k] = nested;
      }
    }
  }
  return cloned;
}

function pickPortableSettings(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    return {};
  }

  return PORTABLE_PLAYER_PROP_KEYS.reduce((acc, key) => {
    const value = source[key];
    if (value === undefined) {
      return acc;
    }
    const isPrimitive =
      value === null ||
      typeof value === "string" ||
      typeof value === "boolean" ||
      (typeof value === "number" && Number.isFinite(value));

    if (isPrimitive) {
      acc[key] = value;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      const cloned = clonePlainObject(value);
      if (cloned && Object.keys(cloned).length > 0) {
        acc[key] = cloned;
      }
    }
    return acc;
  }, {});
}

module.exports = {
  PORTABLE_PLAYER_PROP_KEYS,
  pickPortableSettings,
};
