"use strict";

const { app } = require("electron");
const axios = require("axios");
const semver = require("semver");

const LEGACY_REDIRECT_VERSION = "1.0.26";

async function checkForUpdates() {
  const feedUrl = (process.env.SCREENIFY_UPDATE_FEED_URL || "").trim();
  if (!feedUrl) {
    return null;
  }

  try {
    const response = await axios.get(feedUrl, { timeout: 10000 });
    const data = response && response.data ? response.data : null;
    const remoteVersion = data && data.version ? String(data.version) : "";
    const currentVersion =
      app && typeof app.getVersion === "function" ? app.getVersion() : "1.12.0";

    if (!remoteVersion || !semver.valid(remoteVersion)) {
      return null;
    }

    if (!semver.gt(remoteVersion, currentVersion)) {
      return null;
    }

    const isArm64 = process.arch === "arm64";
    let newVersionUrl = null;
    if (semver.lte(currentVersion, LEGACY_REDIRECT_VERSION)) {
      newVersionUrl = isArm64 ? data.urlArm64 : data.urlX64;
    } else {
      newVersionUrl = isArm64
        ? data.urlArm64WithRedirects || data.urlArm64
        : data.urlX64WithRedirects || data.urlX64;
    }

    if (!newVersionUrl) {
      return null;
    }

    return {
      newVersionUrl,
      newVersion: remoteVersion,
    };
  } catch (err) {
    console.warn("Update check skipped:", err.message);
    return null;
  }
}

module.exports = {
  checkForUpdates,
};
