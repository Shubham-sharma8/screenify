#!/usr/bin/env bash
# ==============================================================================
# Screenify — One-Command Development & Installation Bootstrap
# ==============================================================================
set -euo pipefail

echo "=================================================="
echo "          Screenify Setup & Verification          "
echo "=================================================="

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 1. Verify Prerequisites
echo ""
echo "[1/5] Checking environment prerequisites..."
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required but was not found in PATH." >&2
  echo "Please install Node.js 20+ (https://nodejs.org) and try again." >&2
  exit 1
fi

NODE_VERSION="$(node -v | sed 's/^v//')"
NODE_MAJOR="${NODE_VERSION%%.*}"
echo "✓ Found Node.js v${NODE_VERSION}"

if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "Warning: Node.js version 18 or higher is recommended (found v${NODE_VERSION})." >&2
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required but was not found in PATH." >&2
  exit 1
fi
echo "✓ Found npm v$(npm -v)"

# 2. Environment Configuration
echo ""
echo "[2/5] Checking environment configuration..."
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✓ Created .env from .env.example (all keys optional; edit .env to enable optional AI APIs)"
  else
    touch .env
    echo "✓ Created empty .env"
  fi
else
  echo "✓ Existing .env detected"
fi

# 3. Syntax Verification
echo ""
echo "[3/5] Validating JavaScript syntax across main and scripts..."
npm run check
echo "✓ All source files passed node --check syntax validation"

# 4. Unit & Regression Tests
echo ""
echo "[4/5] Running Screenify automated test suite..."
npm test
echo "✓ All unit and regression tests passed successfully"

# 5. Optional macOS App Installation
echo ""
echo "[5/5] Checking for Screenify macOS application bundle..."
DEFAULT_APP_BUNDLE="$PROJECT_DIR/../Screenify.app"
APP_TARGET="${SCREENIFY_APP_BUNDLE:-$DEFAULT_APP_BUNDLE}"

if [ -d "$APP_TARGET" ]; then
  echo "Found Screenify application bundle at: $APP_TARGET"
  echo "Repacking source files and installing to /Applications/Screenify.app..."
  npm run install-app
  echo "✓ Successfully repacked and installed to /Applications/Screenify.app"
else
  echo "Info: Base application bundle not found at '$APP_TARGET'."
  echo "      Skipping repacking into /Applications/Screenify.app."
  echo "      To install later, ensure Screenify.app is present and run:"
  echo "        npm run install-app"
fi

echo ""
echo "=================================================="
echo "         Screenify Setup Complete! 🎉            "
echo "=================================================="
echo ""
echo "Quick Reference:"
echo "  • Run tests:        npm test"
echo "  • Syntax check:     npm run check"
echo "  • Repack app:       npm run pack-app"
echo "  • Install to /Apps: npm run install-app"
echo "  • Using Claude:     CLAUDE.md has full project context"
echo ""
