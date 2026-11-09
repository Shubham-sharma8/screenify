"use strict";

const os = require("os");
const crypto = require("crypto");
const { execFile } = require("child_process");
const { machineIdSync } = require("node-machine-id");

const LICENSE_API_BASE =
  process.env.SCREENIFY_LICENSE_API_BASE || "https://example.com";
const ACCOUNT_URL = `${LICENSE_API_BASE}/account`;
const LICENSE_REQUEST_TIMEOUT_MS = 15000;
const EXPORT_CHECK_TIMEOUT_MS = 2000;
const DEVICE_NAME_TIMEOUT_MS = 2000;
const LICENSE_STATUS_INTERVAL_MS = 24 * 60 * 60 * 1000;
const FOCUS_CHECK_INTERVAL_MS = 60 * 60 * 1000;
const UPGRADE_MAX_VIDEO_IDS = 500;
const LICENSE_PUBLIC_KEY_B64 =
  process.env.SCREENIFY_LICENSE_PUBLIC_KEY_B64 ||
  "MCowBQYDK2VwAyEAIbxIfrAuIzYNhyoIX421BWs8gJRiGFsQRCdLOQ6Ot08=";

const PUBLIC_KEY = crypto.createPublicKey({
  key: Buffer.from(LICENSE_PUBLIC_KEY_B64, "base64"),
  format: "der",
  type: "spki",
});

const STORE_KEYS = Object.freeze({
  unlocked: "lifetimeSubscription",
  code: "licenseCode",
  email: "licenseEmail",
  lastVerifiedAt: "licenseLastVerifiedAt",
  deviceId: "licenseDeviceId",
  lease: "licenseLease",
  upgradeStarted: "licenseUpgradeStarted",
  sharedVideos: "sharedVideos",
});

function verifyLease(leaseToken, expectedDeviceId) {
  const [payloadB64, sigB64, ...extra] = String(leaseToken || "").split(".");
  if (!payloadB64 || !sigB64 || extra.length > 0) {
    return null;
  }
  if (
    !crypto.verify(
      null,
      Buffer.from(payloadB64),
      PUBLIC_KEY,
      Buffer.from(sigB64, "base64url"),
    )
  ) {
    return null;
  }
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (payload.v !== 1 || payload.dev !== expectedDeviceId) {
    return null;
  }
  if (payload.exp * 1000 <= Date.now()) {
    return null;
  }
  return payload;
}

const MESSAGES = Object.freeze({
  network: "Couldn't reach the license server. Check your connection.",
  no_lease:
    "Your key is valid, but the license server couldn't unlock this Mac right now. Please try again in a few minutes.",
  invalid_format: "That doesn't look like a valid Screenify license key.",
  not_found: "License key not found. Check for typos.",
  revoked:
    "This license key has been revoked. Contact support if you think this is a mistake.",
  rate_limited: "Too many attempts, try again in a few minutes.",
  generic: "Something went wrong. Please try again later.",
  removed:
    "This Mac was removed from your license. Enter your key to activate it again.",
  subscription_inactive: "Your subscription ended.",
});

function deviceLimitMessage(maxDevices) {
  return `This key is already active on ${maxDevices} Macs. Remove one from your account and try again.`;
}

function describeFailure(status, body) {
  const errorCode = body?.error;
  if (status === 409 && errorCode === "device_limit") {
    return {
      error: errorCode,
      message: deviceLimitMessage(body.maxDevices ?? 3),
      devices: body.devices || [],
    };
  }
  if (status === 402 && errorCode === "subscription_inactive") {
    return { error: errorCode, message: MESSAGES.subscription_inactive };
  }
  if (status === 400) {
    return { error: "invalid_code", message: MESSAGES.invalid_format };
  }
  if (status === 404) {
    return { error: "invalid_code", message: MESSAGES.not_found };
  }
  if (status === 403) {
    return { error: "revoked", message: MESSAGES.revoked };
  }
  if (status === 429) {
    return { error: "rate_limited", message: MESSAGES.rate_limited };
  }
  return {
    error: errorCode || `http_${status}`,
    message: MESSAGES.generic,
  };
}

function registerLicenseIpc({
  ipcMain,
  app,
  shell,
  store,
  appSecret,
  isLegacyCode,
  getMainWindow,
  log = () => {},
}) {
  let cachedDeviceNamePromise = null;
  let statusInterval = null;
  let cachedMachineId = null;
  let lastFocusCheckAt = 0;

  function getDeviceId() {
    const stored = store.get(STORE_KEYS.deviceId);
    if (stored) {
      return stored;
    }
    if (!cachedMachineId) {
      cachedMachineId = machineIdSync();
    }
    return cachedMachineId;
  }

  function cleanupUnusedDeviceId() {
    const hasLicenseOrUpgrade =
      Boolean(store.get(STORE_KEYS.code)) ||
      store.get(STORE_KEYS.upgradeStarted) === true;
    if (!hasLicenseOrUpgrade) {
      store.delete(STORE_KEYS.deviceId);
    }
  }
  cleanupUnusedDeviceId();

  const hasValidLease = () =>
    verifyLease(store.get(STORE_KEYS.lease), getDeviceId()) !== null;

  const isLegacyUnlocked = () =>
    store.get(STORE_KEYS.unlocked) === true && !store.get(STORE_KEYS.code);

  const isUnlocked = () =>
    (hasValidLease() && Boolean(store.get(STORE_KEYS.code))) ||
    isLegacyUnlocked();

  function saveLease(leaseToken) {
    if (typeof leaseToken !== "string" || !leaseToken) {
      return;
    }
    store.set(STORE_KEYS.lease, leaseToken);
  }

  function getDeviceName() {
    if (cachedDeviceNamePromise) {
      return cachedDeviceNamePromise;
    }
    cachedDeviceNamePromise = new Promise((resolve) => {
      if (process.platform !== "darwin") {
        resolve(os.hostname() || "Mac");
        return;
      }
      execFile(
        "scutil",
        ["--get", "ComputerName"],
        { timeout: DEVICE_NAME_TIMEOUT_MS },
        (err, stdout) => {
          const name = err ? "" : String(stdout).trim();
          resolve(name || os.hostname() || "Mac");
        },
      );
    });
    return cachedDeviceNamePromise;
  }

  async function postLicenseApi(
    endpoint,
    payload,
    timeoutMs = LICENSE_REQUEST_TIMEOUT_MS,
  ) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${LICENSE_API_BASE}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(appSecret ? { "x-app-secret": appSecret } : {}),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const body = await response.json().catch(() => null);
      return {
        status: response.status,
        body,
      };
    } finally {
      clearTimeout(timer);
    }
  }

  function getState() {
    const unlockedFlag = store.get(STORE_KEYS.unlocked) === true;
    const code = store.get(STORE_KEYS.code) || null;
    return {
      unlocked: isUnlocked(),
      code,
      email: store.get(STORE_KEYS.email) || null,
      legacy: unlockedFlag && !code,
      upgradePending:
        !unlockedFlag && store.get(STORE_KEYS.upgradeStarted) === true,
    };
  }

  function persistActivatedLicense(licenseInfo, leaseToken) {
    store.set(STORE_KEYS.unlocked, true);
    store.set(STORE_KEYS.code, licenseInfo.code);
    store.set(STORE_KEYS.email, licenseInfo.email || null);
    store.set(STORE_KEYS.lastVerifiedAt, Date.now());
    store.delete(STORE_KEYS.upgradeStarted);
    saveLease(leaseToken);
  }

  function clearLicenseStore() {
    store.delete(STORE_KEYS.code);
    store.delete(STORE_KEYS.email);
    store.delete(STORE_KEYS.lastVerifiedAt);
    store.delete(STORE_KEYS.lease);
    store.delete(STORE_KEYS.deviceId);
    store.delete(STORE_KEYS.upgradeStarted);
    store.set(STORE_KEYS.unlocked, false);
  }

  function lockLicenseWithReason(reason) {
    clearLicenseStore();
    log(`🔒 License: locked (${reason})`);
    const win = getMainWindow ? getMainWindow() : null;
    if (win && !win.isDestroyed()) {
      win.webContents.send("license-locked", { message: reason });
    }
  }

  async function activateLicense(rawCode) {
    const code = String(rawCode || "").trim();
    if (!code) {
      return {
        ok: false,
        error: "invalid_code",
        message: MESSAGES.invalid_format,
      };
    }

    if (typeof isLegacyCode === "function" && isLegacyCode(code)) {
      if (store.get(STORE_KEYS.upgradeStarted) === true) {
        return { ok: false, ...describeFailure(404) };
      }
      store.set(STORE_KEYS.unlocked, true);
      return {
        ok: true,
        status: "legacy",
      };
    }

    let response;
    try {
      response = await postLicenseApi("/api/license/activate", {
        code,
        deviceId: getDeviceId(),
        deviceName: await getDeviceName(),
        appVersion: app.getVersion(),
      });
    } catch (err) {
      log(`⚠️ License: activate request failed (${err.message})`);
      return {
        ok: false,
        error: "network",
        message: MESSAGES.network,
      };
    }

    if (
      response.status === 200 &&
      response.body?.ok &&
      response.body.entitlement?.entitled === false
    ) {
      return {
        ok: false,
        error: "subscription_inactive",
        message: MESSAGES.subscription_inactive,
      };
    }

    if (
      response.status === 200 &&
      response.body?.ok &&
      response.body.license?.code
    ) {
      persistActivatedLicense(response.body.license, response.body.lease);
      if (!hasValidLease()) {
        log(
          "❌ License: activation succeeded but the server sent no valid lease for this Mac",
        );
        return {
          ok: false,
          error: "no_lease",
          message: MESSAGES.no_lease,
        };
      }
      return {
        ok: true,
        status: response.body.status,
        email: response.body.license.email || null,
      };
    }

    if (response.status === 401) {
      log("❌ License: app secret rejected by server");
    }
    return {
      ok: false,
      ...describeFailure(response.status, response.body),
    };
  }

  async function checkLicenseStatus({ timeoutMs } = {}) {
    const code = store.get(STORE_KEYS.code);
    if (!code) {
      return;
    }
    let response;
    try {
      response = await postLicenseApi(
        "/api/license/status",
        { code, deviceId: getDeviceId() },
        timeoutMs,
      );
    } catch (err) {
      log(`⚠️ License: status check skipped (${err.message})`);
      return;
    }

    const body = response.body;
    if (response.status === 200 && body?.ok) {
      if (body.active === false) {
        lockLicenseWithReason(MESSAGES.removed);
      } else if (body.entitlement?.entitled === false) {
        lockLicenseWithReason(MESSAGES.subscription_inactive);
      } else {
        saveLease(body.lease);
        store.set(STORE_KEYS.lastVerifiedAt, Date.now());
      }
      return;
    }

    if (response.status === 402 && body?.error === "subscription_inactive") {
      lockLicenseWithReason(MESSAGES.subscription_inactive);
      return;
    }
    if (response.status === 403 || response.status === 404) {
      lockLicenseWithReason(describeFailure(response.status, body).message);
      return;
    }
    log(
      `⚠️ License: status check returned ${response.status}, keeping current state`,
    );
  }

  async function verifyForExport() {
    await checkLicenseStatus({ timeoutMs: EXPORT_CHECK_TIMEOUT_MS });
    return isUnlocked();
  }

  function startStatusChecks() {
    checkLicenseStatus();
    statusInterval = setInterval(checkLicenseStatus, LICENSE_STATUS_INTERVAL_MS);
    statusInterval.unref?.();
    lastFocusCheckAt = Date.now();
    app.on("browser-window-focus", () => {
      if (Date.now() - lastFocusCheckAt < FOCUS_CHECK_INTERVAL_MS) {
        return;
      }
      lastFocusCheckAt = Date.now();
      checkLicenseStatus();
    });
  }

  async function deactivate() {
    const code = store.get(STORE_KEYS.code);
    if (!code) {
      return {
        ok: false,
        error: "no_license",
        message: "This Mac has no personal license key to deactivate.",
      };
    }
    let response;
    try {
      response = await postLicenseApi("/api/license/deactivate", {
        code,
        deviceId: getDeviceId(),
      });
    } catch (err) {
      log(`⚠️ License: deactivate request failed (${err.message})`);
      return {
        ok: false,
        error: "network",
        message: MESSAGES.network,
      };
    }

    if (response.status === 200 && response.body?.ok) {
      clearLicenseStore();
      return {
        ok: true,
        removed: response.body.removed === true,
      };
    }
    return {
      ok: false,
      ...describeFailure(response.status, response.body),
    };
  }

  function getSharedVideoIds() {
    const list = store.get(STORE_KEYS.sharedVideos);
    if (!Array.isArray(list)) {
      return [];
    }
    return list
      .map((item) => item?.id)
      .filter(
        (id) => typeof id === "string" && id && !id.startsWith("manual-"),
      )
      .reverse()
      .slice(0, UPGRADE_MAX_VIDEO_IDS);
  }

  async function openUpgradeLink() {
    let response;
    try {
      response = await postLicenseApi("/api/migrate/start", {
        videoIds: getSharedVideoIds(),
        deviceId: getDeviceId(),
        deviceName: await getDeviceName(),
        appVersion: app.getVersion(),
      });
    } catch (err) {
      log(`⚠️ License: upgrade link request failed (${err.message})`);
      return {
        ok: false,
        error: "network",
        message: MESSAGES.network,
      };
    }

    const url = response.body?.url;
    if (
      response.status !== 200 ||
      typeof url !== "string" ||
      !url.startsWith(`${LICENSE_API_BASE}/`)
    ) {
      if (response.status === 401) {
        log("❌ License: app secret rejected by server");
      }
      return {
        ok: false,
        ...describeFailure(response.status, response.body),
      };
    }

    await shell.openExternal(url);
    store.set(STORE_KEYS.upgradeStarted, true);
    store.set(STORE_KEYS.unlocked, false);
    return {
      ok: true,
      videoCount: response.body.videoCount ?? 0,
    };
  }

  function getUploadHeaders() {
    const lease = verifyLease(store.get(STORE_KEYS.lease), getDeviceId());
    return lease ? { "x-license-code": lease.lic } : {};
  }

  ipcMain.handle("license-get-state", () => getState());
  ipcMain.handle("license-is-unlocked", () => isUnlocked());
  ipcMain.handle("license-verify-for-export", () => verifyForExport());
  ipcMain.handle("license-activate", (_event, code) => activateLicense(code));
  ipcMain.handle("license-open-upgrade", () => openUpgradeLink());
  ipcMain.handle("license-deactivate", () => deactivate());

  return {
    getState,
    isUnlocked,
    deactivate,
    startStatusChecks,
    getUploadHeaders,
  };
}

module.exports = {
  registerLicenseIpc,
  ACCOUNT_URL,
};
