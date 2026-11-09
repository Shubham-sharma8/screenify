# Screenify

> **The open-source, studio-grade screen recording & video editor built for macOS creators.**  
> Featuring spring-physics cursor smoothing, intelligent auto-zoom, local offline Whisper captions, rule-based & cloud AI Smart Edit, curated studio presets, and a transparent floating teleprompter.

---

## Overview

**Screenify** turns raw screen captures into cinematic, production-ready product demos, tutorials, and social media videos in minutes. Built on Electron and Next.js for macOS, Screenify combines a hardware-accelerated screen recorder with a rich post-production studio timeline.

Every cursor interaction is enhanced using a 240Hz Runge-Kutta spring-physics pipeline. Spoken audio is transcribed on-device using a local, quantized Whisper model without ever sending audio to the cloud. The AI Smart Edit engine interprets natural language instructions (e.g., *"zoom into the button and cut out silences"*) using either an offline regex rule engine or an optional OpenAI endpoint.

---

## Key Features

### 🎯 Spring-Physics Cursor Smoothing & Auto-Zoom
- **240Hz RK4 Simulation:** Simulates physical mass, damping, and tension for ultra-smooth cursor movement.
- **Outlier Clamping & Stabilization:** Eliminates accidental mouse jitter, trackpad stalls, and sudden off-screen spikes.
- **Click Anticipation:** Automatically decelerates and locks onto targets prior to clicks for crisp focus.
- **Dynamic Follow-Zoom:** Automatically zooms into active focal points with adjustable depth and cinematic pan.

### 🎙️ 100% Local Whisper Captions (Offline-First)
- Powered by `@xenova/transformers` running the quantized `Xenova/whisper-small` ONNX model directly on Apple Silicon / Intel CPUs.
- Zero audio uploads required — private, free, and completely offline.
- Generates word-level timestamps and animated, customizable subtitle cards (Inter typography, custom backgrounds, position adjustments).

### 🤖 Hybrid AI Smart Edit (Offline & Cloud)
- **Offline Rule Engine:** Works out of the box with zero configuration or API keys. Understands commands like *"zoom in 2x for 4 seconds"*, *"change aspect ratio to 9:16"*, *"cut first 3 seconds"*, or *"mute audio"*.
- **Cloud OpenAI Planner (Optional):** Plug in an OpenAI API key in `.env` to leverage GPT-4o for complex semantic script editing, silence removal, and multi-step timeline composition.

### 🎨 Built-In Studio Presets
Jumpstart production with 5 curated studio presets:
1. **Cinematic macOS Glass** — 16:9 canvas, deep window shadows, macOS Sequoia wallpaper, subtle blur.
2. **Product Launch Zoom** — High-contrast gradients, punchy 2.2x zooms, cursor click trails, and background music.
3. **Tutorial Crisp** — Minimal padding, crisp dark background, moderate zoom, microphone speech enhancement.
4. **Social Reels 9:16** — Vertical aspect ratio optimized for TikTok, Instagram Reels, and YouTube Shorts.
5. **Clean Minimal** — Clean framing, no distracting background, subtle drop shadow.

### 📝 Floating Studio Teleprompter
- Dedicated resizable, transparent overlay window.
- **Customizable Controls:** Real-time opacity slider, font size adjustment, and variable scroll speed.
- **Mirror Mode:** One-click horizontal flip for hardware beam-splitter glass rigs.
- **Live Script Telemetry:** Dynamic word count and estimated speaking duration.

### ⚡ Zero-Lag Video Streaming Server
- Built-in local HTTP streaming server (`127.0.0.1`) supporting standard HTTP `206 Partial Content` Range requests.
- Eliminates memory bloat when scrubbing large 4K 60fps recordings.
- Strict MIME detection and out-of-bounds byte range safety (HTTP `416`).

---

## Architecture & Project Structure

```
screenify-src/
├── main/                       # Electron main process & core services
│   ├── index.js                # App lifecycle, IPC registration, HTTP streaming server
│   ├── preload.js              # Secure contextBridge API for renderer (window.api, window.nodePath)
│   ├── cursorMotionPipeline.js # 240Hz spring physics, outlier clamping & smoothing
│   ├── subtitleTranscription.js# Local Whisper ONNX model pipeline (@xenova/transformers)
│   ├── aiEditService.js        # Offline regex smart edit + OpenAI planner fallback
│   ├── editorPresets.js        # Built-in studio presets & JSON storage
│   ├── editorPresetSettings.js # Portable player prop extraction & deep-cloning
│   ├── teleprompter.js         # Floating transparent teleprompter window
│   ├── videoStats.js           # Video metadata & frame inspection
│   ├── aiQuota.js              # Token and API quota manager
│   ├── license.js              # Offline open-source license verification
│   └── helpers.js              # Path resolution and local URL utilities
├── macos/                      # Native Swift helpers, Info.plist & XCTest suite
│   ├── Sources/GetWindows/     # Native CoreGraphics window enumeration CLI (get-windows-arm64)
│   ├── Sources/ActivateWindow/ # Native Accessibility window activation CLI (activate-window-arm64)
│   ├── Tests/ScreenifyTests/   # XCTest bundle verifying app bundle, code signing & Node tests
│   └── Info.plist              # macOS bundle metadata & TCC privacy descriptions
├── Screenify.xcodeproj/        # Xcode project for building, signing, running & testing
├── out/                        # Next.js static renderer UI (React bundles & assets)
├── scripts/
│   ├── install-macos-app.js    # ASAR repacker, inside-out codesigning & installer
│   ├── xcode-build-app.sh      # Xcode build phase script for Electron bundle assembly
│   └── entitlements.mac.plist  # Hardened Runtime, V8 JIT & macOS capture entitlements
├── tests/
│   └── screenify.test.js       # Node native test runner suite
└── package.json
```

- **Main Process (`main/`):** Manages native windowing, screen capture permissions, local HTTP range video streaming, Whisper transcription worker threads, and filesystem I/O.
- **Renderer Process (`out/`):** Static Next.js React application served securely with `contextIsolation: true` and `nodeIntegration: false`.
- **Repack & Install Pipeline (`scripts/install-macos-app.js`):** Injects updated source code directly into `Screenify.app/Contents/Resources/app.asar`, updates Info.plist header hashes, ad-hoc signs with `codesign`, and installs directly to `/Applications/Screenify.app`.

---

## Quick Start

### 1. Prerequisites
- **macOS:** macOS 13 Ventura, macOS 14 Sonoma, or macOS 15 Sequoia (Apple Silicon or Intel)
- **Node.js:** v20.0.0 or later (v24 supported)
- **npm:** v9.0.0 or later

### 2. Bootstrap Setup
Run the one-command bootstrap script:
```bash
./setup.sh
```

`setup.sh` will:
1. Verify Node.js and npm versions.
2. Initialize `.env` from `.env.example`.
3. Check code syntax (`npm run check`).
4. Run all unit and regression tests (`npm test`).
5. Repack and install `/Applications/Screenify.app` if the base application bundle is present.

---

## Building, Signing & Testing in Xcode (`Screenify.xcodeproj`)

Screenify includes a native Xcode project (`Screenify.xcodeproj`) so you can manage Apple Developer code signing, compile the native Swift helpers (`get-windows-arm64`, `activate-window-arm64`), launch the app (`⌘R`), and run the full XCTest + Node test suite (`⌘U`) directly inside Xcode.

```bash
# Open the project in Xcode
npm run xcode
# or: open Screenify.xcodeproj

# Build and sign Screenify.app from the command line via xcodebuild
npm run xcode:build

# Run XCTest + Node test suite via xcodebuild
npm run xcode:test
```

### Signing in Xcode
1. Open `Screenify.xcodeproj` in Xcode.
2. Select the **Screenify** project in the Project Navigator and choose the **Screenify** target.
3. Open the **Signing & Capabilities** tab and select your Apple Developer Team (pre-configured for Automatic Signing with `scripts/entitlements.mac.plist`).
4. Press **⌘R** to build, sign all nested Electron helpers/frameworks with your certificate, and run `Screenify.app`, or press **⌘U** to run the `ScreenifyTests` suite.

---

## Building & Installing to `/Applications` (CLI)

To package your code changes into the macOS desktop app directly from the terminal:

```bash
# Repack source files into the parent Screenify.app bundle
npm run pack-app

# Repack and install directly to /Applications/Screenify.app (ad-hoc signed)
npm run install-app

# Repack, sign with your Apple Development certificate, and install to /Applications/Screenify.app
npm run sign-app
```

Once installed, open **Screenify** from your `Applications` folder or Spotlight.

---

## Running Tests

Screenify uses Node's native test runner (`node:test`) for instant, dependency-free test execution:

```bash
# Run all unit and regression tests
npm test

# Run syntax check across all main process files and scripts
npm run check
```

---

## Configuration & Environment Variables

All configuration is optional. Screenify works 100% offline without any API keys.

To configure optional integrations, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | *(empty)* | Optional. When present, enables GPT-based Smart Edit and cloud Whisper. When empty, Screenify runs its built-in offline engine. |
| `OPENAI_EDIT_MODEL` | `gpt-4o-mini` | Model used for cloud AI Smart Edit planning. |
| `RESEMBLE_API_KEY` | *(empty)* | Optional. API key for Resemble AI voice synthesis overlays. |
| `HEYGEN_API_KEY` | *(empty)* | Optional. API key for HeyGen AI video avatars. |
| `SCREENIFY_API_BASE_URL`| *(empty)* | Optional. Base URL for self-hosted API endpoints. |
| `SCREENIFY_APP_BUNDLE` | `../Screenify.app` | Target path to the base `.app` bundle for repacking. |

---

## Using with Claude Code

This project includes a [`CLAUDE.md`](CLAUDE.md) file that gives Claude Code complete architectural context, commands, and rules.

```bash
# Start Claude Code in the project root
claude
```

Claude Code will automatically detect `CLAUDE.md` and use the verified commands (`npm test`, `npm run check`, `npm run install-app`).

---

## Contributing

We welcome community contributions! Please review [CONTRIBUTING.md](CONTRIBUTING.md) for our Test-Driven Development (TDD) guidelines, PR process, and code quality standards.

---

## License

Screenify is open-source software licensed under the [MIT License](LICENSE).
