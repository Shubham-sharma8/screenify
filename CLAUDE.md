# Screenify

**Version:** 1.12.0 | **Platform:** macOS (arm64/x64) | **Stack:** Electron 32, Node.js 20+, Next.js (SSG exported to `out/`)

## What
Open-source macOS screen recording and studio video editor featuring spring-physics cursor smoothing and auto-zoom, local Whisper ONNX subtitle transcription, rule-based offline and cloud AI Smart Edit, curated studio presets, and a transparent floating teleprompter.

## Quick Start

```bash
./setup.sh              # First-time setup, syntax validation & test suite
npm test                # Run unit test suite (node:test)
npm run check           # Syntax-check main and scripts files
npm run install-app     # Repack source changes into /Applications/Screenify.app
```

## Commands

```bash
# Verification & Testing
npm test                # Run tests with node --test tests/*.test.js
npm run check           # Syntax check: node --check on main/*.js and scripts/*.js

# macOS App Bundle Repacking & Installation
npm run pack-app        # Repack modified code into ../Screenify.app bundle
npm run install-app     # Repack and install directly to /Applications/Screenify.app
```

## Architecture

```
screenify-src/
├── main/                       # Electron main process & backend services
│   ├── index.js                # App lifecycle, IPC routing, video streaming server
│   ├── preload.js              # Secure contextBridge API for renderer
│   ├── cursorMotionPipeline.js # 240Hz spring physics, outlier clamping & smoothing
│   ├── subtitleTranscription.js# Local Whisper ONNX quantized transcription
│   ├── aiEditService.js        # Offline regex smart edit + OpenAI planner fallback
│   ├── editorPresets.js        # Built-in studio presets & JSON storage
│   ├── editorPresetSettings.js # Portable player prop extraction & cloning
│   ├── teleprompter.js         # Floating transparent teleprompter window
│   ├── videoStats.js           # Frame, resolution, bitrate & stream metrics
│   ├── aiQuota.js              # Token and API quota tracking
│   └── helpers.js              # App paths, URL conversions, file utilities
├── out/                        # Next.js static renderer UI (React bundles)
├── scripts/
│   └── install-macos-app.js    # In-place ASAR repacker, ad-hoc codesigning & installer
├── tests/
│   └── screenify.test.js       # Node native test runner test suite
└── package.json
```

- **Main Process (`main/`):** Manages native windowing, hardware capture, local HTTP video streaming (`127.0.0.1`), Whisper ONNX inference, and disk I/O.
- **Renderer (`out/`):** Next.js exported UI running in sandboxed web view with `contextIsolation: true`.
- **Packaging (`scripts/install-macos-app.js`):** Injects updated `main/` and `package.json` into `app.asar`, recalculates pickle headers and Info.plist hashes, signs with `codesign`, and installs to `/Applications/Screenify.app`.

## Key Files

- `main/index.js` — Core Electron entry point, HTTP range streaming, IPC setup
- `main/preload.js` — Safe `window.api` and `window.nodePath` context bridge
- `main/cursorMotionPipeline.js` — RK4 spring-physics cursor smoothing and zoom tracking
- `main/subtitleTranscription.js` — `@xenova/transformers` local Whisper model pipeline
- `main/aiEditService.js` — Natural language timeline editing (offline & OpenAI)
- `main/editorPresets.js` — 5 curated built-in video styles (glass, zoom, reels, crisp, clean)
- `main/teleprompter.js` — Resizable transparent script prompter overlay
- `scripts/install-macos-app.js` — Binary ASAR patcher and application installer
- `tests/screenify.test.js` — Unit and regression tests covering all services

## Configuration

All configuration is optional via `.env` (copy from `.env.example`):

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | No | Enables cloud AI Smart Edit & Whisper (uses offline engine when empty) |
| `OPENAI_EDIT_MODEL` | No | OpenAI model for edit planning (defaults to `gpt-4o-mini`) |
| `RESEMBLE_API_KEY` | No | Optional API key for Resemble AI voice synthesis |
| `HEYGEN_API_KEY` | No | Optional API key for HeyGen avatar video overlay |
| `SCREENIFY_API_BASE_URL` | No | Custom self-hosted backend API endpoint |
| `SCREENIFY_APP_BUNDLE` | No | Path to `Screenify.app` target for repacker script |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
