# Contributing to Screenify

Thank you for your interest in contributing to **Screenify**! Screenify is an open-source, studio-grade screen recording and video editor designed specifically for macOS creators.

---

## Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for everyone. Please be respectful, constructive, and considerate in all communications, issues, and pull requests.

---

## Development Prerequisites

- **Operating System:** macOS (macOS 13+ recommended; Apple Silicon or Intel)
- **Runtime:** Node.js 20+ (Node.js 24 supported) and npm
- **Base Bundle (Optional for repack/install):** Base `Screenify.app` bundle in parent folder

---

## Getting Started

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/your-username/screenify.git
   cd screenify/screenify-src
   ```

2. **Run the bootstrap script:**
   ```bash
   ./setup.sh
   ```
   This will verify your Node.js environment, initialize `.env` from `.env.example`, validate syntax, run unit tests, and optionally repack the macOS app bundle if available.

3. **Verify tests and syntax:**
   ```bash
   npm test
   npm run check
   ```

---

## Development & Test-Driven Workflow (TDD)

Screenify enforces high code quality through automated tests and syntax checks.

### 1. Test-Driven Development (TDD)
When fixing bugs or adding new features:
1. **Write a failing test first (RED):** Add a unit or behavioral test to `tests/screenify.test.js`.
2. **Run tests to observe the failure:**
   ```bash
   npm test
   ```
3. **Implement the minimal fix/feature (GREEN):** Edit the relevant module under `main/`.
4. **Refactor and verify:** Ensure all tests pass with zero regressions.
5. **Run syntax validation:**
   ```bash
   npm run check
   ```

### 2. Testing Your Changes in the macOS App
To test changes directly within the Electron desktop app:
```bash
# Repack source changes into the local bundle
npm run pack-app

# Repack and install directly to /Applications/Screenify.app
npm run install-app
```

---

## Engineering & Architecture Guidelines

### Immutability
- Always return new objects or arrays instead of mutating arguments.
- When passing configuration objects (e.g., subtitle styles or canvas presets), deep clone to prevent unintended side-effects across timeline renders:
  ```javascript
  const safeCopy = JSON.parse(JSON.stringify(inputSettings));
  ```

### Secure Electron IPC Architecture
- All communication between the renderer (`out/`) and the main process (`main/`) must pass through the secure preload context bridge (`main/preload.js`).
- Never enable `nodeIntegration: true` or disable `contextIsolation`.
- IPC listener registration in preload must support unsubscribing specific listeners without wiping out unrelated subscribers on the same channel.
- Validate and sanitize all IPC arguments before passing them into native methods or filesystem operations.

### Media Streaming & File Handling
- The embedded HTTP streaming server (`main/index.js`) serves local media over HTTP byte ranges.
- Always determine the `Content-Type` dynamically based on file extension (`.mp4`, `.wav`, `.mp3`) — never hardcode MIME types.
- Always validate byte ranges against the file size and return HTTP `416 Range Not Satisfiable` for out-of-bounds or zero-byte requests.
- Clean up file streams, temporary files, and spawned processes gracefully when recordings or exports complete or error.

---

## Security Practices

- **Never hardcode or commit secrets:** Keep all API keys, access tokens, and sensitive URLs in `.env`.
- Ensure all subprocess executions (`spawn`, `execFile`) use explicit argument arrays instead of raw shell command strings to prevent injection.
- Validate paths using canonical path resolution (`path.resolve`, `path.normalize`) to prevent directory traversal vulnerabilities.

---

## Pull Request Checklist

Before submitting a pull request:

- [ ] Ran `npm test` and all tests pass cleanly.
- [ ] Ran `npm run check` with zero syntax errors.
- [ ] Kept any state mutations immutable.
- [ ] Maintained secure context isolation for renderer-facing APIs.
- [ ] Updated documentation or `CLAUDE.md` if any new commands, env variables, or architecture changes were introduced.
- [ ] Formatted commit messages clearly (e.g., `feat: add preset export`, `fix: handle 0-byte range request in video streaming`).

---

## Working with Claude Code

This repository includes a `CLAUDE.md` file designed to provide AI developer tools (such as Claude Code) with complete architecture and command context.

When working with Claude Code:
```bash
claude
```
Claude Code automatically ingests `CLAUDE.md` to follow all project workflows and testing conventions.
