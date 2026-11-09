"use strict";

const crypto = require("crypto");

const VIDEO_STATS_URL = process.env.SCREENIFY_VIDEO_STATS_URL || "";
const VIDEO_STATS_REQUEST_TIMEOUT_MS = 10000;
const VIDEO_STATS_RETRY_DELAY_MS = 5000;

function createVideoStatsReporter({
  appSecret = "",
  log = () => {},
  fetchImpl = fetch,
  statsUrl = VIDEO_STATS_URL,
  retryDelayMs = VIDEO_STATS_RETRY_DELAY_MS,
  requestTimeoutMs = VIDEO_STATS_REQUEST_TIMEOUT_MS,
} = {}) {
  async function sendOnce(videoId) {
    if (!statsUrl) {
      return 204;
    }
    const response = await fetchImpl(statsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(appSecret ? { "x-app-secret": appSecret } : {}),
      },
      body: JSON.stringify({ videoId }),
      signal: AbortSignal.timeout(requestTimeoutMs),
    });
    return response.status;
  }

  async function reportWithRetry(videoId) {
    if (!statsUrl) {
      return;
    }
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const status = await sendOnce(videoId);
        if (status < 400) {
          return;
        }
        if (status < 500) {
          log(`video stats rejected with HTTP ${status}`);
          return;
        }
        log(`video stats server error HTTP ${status}`);
      } catch (err) {
        log(`video stats request failed: ${err.message}`);
      }
      if (attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  function reportVideoCreated() {
    const videoId = crypto.randomUUID();
    return reportWithRetry(videoId);
  }

  return {
    reportVideoCreated,
  };
}

module.exports = {
  createVideoStatsReporter,
  VIDEO_STATS_URL,
};
