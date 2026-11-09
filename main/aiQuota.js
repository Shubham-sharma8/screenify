"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const FREE_TOTAL_MESSAGES = 3;
const PRO_DAILY_MESSAGES = 50;
const MAX_PROMPT_CHARS = 500;
const STORE_KEY = "aiAssistant.quota";
const SIGNING_SALT =
  process.env.SCREENIFY_QUOTA_SALT || "screenify-ai-assistant-quota-v1";

class QuotaError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "QuotaError";
    this.code = code;
  }
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextLocalMidnight(date) {
  const midnight = new Date(date);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime();
}

const toCount = (value) => {
  const truncated = Math.trunc(Number(value));
  return Number.isFinite(truncated) && truncated > 0 ? truncated : 0;
};

function normalizeState(raw) {
  return {
    freeUsed: toCount(raw?.freeUsed),
    day: typeof raw?.day === "string" ? raw.day : "",
    dayUsed: toCount(raw?.dayUsed),
  };
}

const TAMPERED_STATE = Object.freeze({
  freeUsed: FREE_TOTAL_MESSAGES,
  day: "",
  dayUsed: 0,
});

function createAiQuota({
  app,
  store,
  getMachineId,
  isLicensed,
  now = () => new Date(),
  log = () => {},
}) {
  const mirrorFiles = [
    path.join(app.getPath("appData"), ".screenify", "assistant-quota.json"),
    path.join(app.getPath("home"), ".screenify-assistant"),
  ];

  let keyPromise = null;
  function getSigningKey() {
    if (!keyPromise) {
      keyPromise = Promise.resolve()
        .then(() => getMachineId())
        .then((machineId) =>
          crypto
            .createHmac("sha256", SIGNING_SALT)
            .update(String(machineId || ""))
            .digest(),
        )
        .catch((err) => {
          keyPromise = null;
          throw err;
        });
    }
    return keyPromise;
  }

  const serializeState = (state) =>
    JSON.stringify([state.freeUsed, state.day, state.dayUsed]);

  const computeSignature = (state, key) =>
    crypto
      .createHmac("sha256", key)
      .update(serializeState(state))
      .digest("hex");

  function verifyRecord(record, key) {
    if (!record || typeof record !== "object") {
      return null;
    }
    const state = normalizeState(record.state);
    const expectedSig = computeSignature(state, key);
    const actualSig = String(record.sig || "");
    if (
      actualSig.length !== expectedSig.length ||
      !crypto.timingSafeEqual(
        Buffer.from(actualSig),
        Buffer.from(expectedSig),
      )
    ) {
      return TAMPERED_STATE;
    }
    return state;
  }

  function readMirrorFile(filePath, key) {
    let raw;
    try {
      raw = fs.readFileSync(filePath, "utf8");
    } catch (err) {
      return err.code === "ENOENT" ? null : TAMPERED_STATE;
    }
    try {
      return verifyRecord(JSON.parse(raw), key);
    } catch {
      return TAMPERED_STATE;
    }
  }

  function writeMirrorFile(filePath, payload) {
    try {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(payload));
    } catch (err) {
      log(`AI quota: could not write ${filePath}: ${err.message}`);
    }
  }

  async function loadMergedState() {
    const key = await getSigningKey();
    const todayKey = localDateKey(now());
    const candidates = [
      verifyRecord(store.get(STORE_KEY), key),
      ...mirrorFiles.map((filePath) => readMirrorFile(filePath, key)),
    ].filter(Boolean);

    let freeUsed = 0;
    let dayUsed = 0;
    for (const candidate of candidates) {
      freeUsed = Math.max(freeUsed, candidate.freeUsed);
      if (candidate.day === todayKey) {
        dayUsed = Math.max(dayUsed, candidate.dayUsed);
      }
    }

    return {
      freeUsed,
      day: todayKey,
      dayUsed,
    };
  }

  async function saveState(state) {
    const key = await getSigningKey();
    const payload = { state, sig: computeSignature(state, key) };
    store.set(STORE_KEY, payload);
    mirrorFiles.forEach((filePath) => writeMirrorFile(filePath, payload));
  }

  function buildStatusSummary(state) {
    const unlocked = Boolean(isLicensed());
    const limit = unlocked ? PRO_DAILY_MESSAGES : FREE_TOTAL_MESSAGES;
    const used = Math.min(limit, unlocked ? state.dayUsed : state.freeUsed);
    return {
      plan: unlocked ? "pro" : "free",
      period: unlocked ? "day" : "trial",
      used,
      limit,
      remaining: limit - used,
      resetsAt: unlocked ? nextLocalMidnight(now()) : null,
      maxPromptChars: MAX_PROMPT_CHARS,
    };
  }

  function buildExhaustedError(summary) {
    if (summary.plan === "free") {
      return new QuotaError(
        "FREE_EXHAUSTED",
        `You have used your ${FREE_TOTAL_MESSAGES} free AI Assistant messages. Activate a license to continue.`,
      );
    }
    return new QuotaError(
      "DAILY_EXHAUSTED",
      `You have used today's ${PRO_DAILY_MESSAGES} AI Assistant messages. The limit resets at midnight.`,
    );
  }

  async function status() {
    return buildStatusSummary(await loadMergedState());
  }

  async function assertAvailable() {
    const summary = buildStatusSummary(await loadMergedState());
    if (summary.remaining <= 0) {
      throw buildExhaustedError(summary);
    }
    return summary;
  }

  async function consume() {
    const currentState = await loadMergedState();
    const summary = buildStatusSummary(currentState);
    if (summary.remaining <= 0) {
      throw buildExhaustedError(summary);
    }
    const nextState = isLicensed()
      ? { ...currentState, dayUsed: currentState.dayUsed + 1 }
      : { ...currentState, freeUsed: currentState.freeUsed + 1 };
    await saveState(nextState);
    return buildStatusSummary(nextState);
  }

  return {
    status,
    assertAvailable,
    consume,
    mirrorFiles,
  };
}

module.exports = {
  createAiQuota,
  QuotaError,
  FREE_TOTAL_MESSAGES,
  PRO_DAILY_MESSAGES,
  MAX_PROMPT_CHARS,
};
