#!/bin/bash
set -euo pipefail

# Add Homebrew, /usr/local, Volta, fnm, asdf, and nvm Node.js bins so Xcode GUI builds always find node
export PATH="/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${HOME}/.volta/bin:${HOME}/.asdf/shims:${HOME}/.local/share/fnm:${PATH:-}"
if [ -d "${HOME}/.nvm/versions/node" ]; then
  LATEST_NVM_NODE_BIN="$(ls -1d "${HOME}/.nvm/versions/node/"*/bin 2>/dev/null | tail -n 1 || true)"
  if [ -n "${LATEST_NVM_NODE_BIN}" ]; then
    export PATH="${LATEST_NVM_NODE_BIN}:${PATH}"
  fi
fi

NODE_BIN="$(command -v node || true)"
if [ -z "${NODE_BIN}" ]; then
  echo "error: Could not find 'node' binary in PATH (${PATH}). Install Node.js via Homebrew or nvm." >&2
  exit 1
fi

SRC_ROOT="${SRCROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
DEST_APP="${TARGET_BUILD_DIR}/${FULL_PRODUCT_NAME}"

TEMPLATE_APP="${SCREENIFY_TEMPLATE_APP:-${SRC_ROOT}/../Screenify.app}"
if [ ! -d "${TEMPLATE_APP}" ]; then
  if [ -d "/Applications/Screenify.app" ]; then
    TEMPLATE_APP="/Applications/Screenify.app"
  else
    echo "error: Base Screenify.app bundle not found at ${SRC_ROOT}/../Screenify.app or /Applications/Screenify.app" >&2
    exit 1
  fi
fi

echo "📦 Assembling Screenify.app inside Xcode build directory: ${DEST_APP}"
mkdir -p "${DEST_APP}/Contents/MacOS" "${DEST_APP}/Contents/Resources" "${DEST_APP}/Contents/Frameworks"

# 1. Remove any temporary Xcode Swift preview/debug dylibs and copy Electron runtime executable, Frameworks, Resources, and PkgInfo
rm -f "${DEST_APP}/Contents/MacOS/"*.dylib
cp -f "${TEMPLATE_APP}/Contents/MacOS/Screenify" "${DEST_APP}/Contents/MacOS/Screenify"
chmod +x "${DEST_APP}/Contents/MacOS/Screenify"
if [ -f "${TEMPLATE_APP}/Contents/PkgInfo" ]; then
  cp -f "${TEMPLATE_APP}/Contents/PkgInfo" "${DEST_APP}/Contents/PkgInfo"
fi

rsync -a --delete "${TEMPLATE_APP}/Contents/Frameworks/" "${DEST_APP}/Contents/Frameworks/"
rsync -a --delete "${TEMPLATE_APP}/Contents/Resources/" "${DEST_APP}/Contents/Resources/"

# 2. Inject freshly compiled native Swift helper binaries if built by Xcode
if [ -n "${BUILT_PRODUCTS_DIR:-}" ]; then
  if [ -f "${BUILT_PRODUCTS_DIR}/get-windows-arm64" ]; then
    cp -f "${BUILT_PRODUCTS_DIR}/get-windows-arm64" "${DEST_APP}/Contents/Resources/get-windows-arm64"
    chmod +x "${DEST_APP}/Contents/Resources/get-windows-arm64"
  fi
  if [ -f "${BUILT_PRODUCTS_DIR}/activate-window-arm64" ]; then
    cp -f "${BUILT_PRODUCTS_DIR}/activate-window-arm64" "${DEST_APP}/Contents/Resources/activate-window-arm64"
    chmod +x "${DEST_APP}/Contents/Resources/activate-window-arm64"
  fi
fi

# 3. Synchronize Electron Helper bundle identifiers with PRODUCT_BUNDLE_IDENTIFIER
BUNDLE_ID="${PRODUCT_BUNDLE_IDENTIFIER:-com.screenCharm.app}"
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier ${BUNDLE_ID}" "${DEST_APP}/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier ${BUNDLE_ID}.helper" "${DEST_APP}/Contents/Frameworks/Screenify Helper.app/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier ${BUNDLE_ID}.helper.GPU" "${DEST_APP}/Contents/Frameworks/Screenify Helper (GPU).app/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier ${BUNDLE_ID}.helper.Plugin" "${DEST_APP}/Contents/Frameworks/Screenify Helper (Plugin).app/Contents/Info.plist" 2>/dev/null || true
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier ${BUNDLE_ID}.helper.Renderer" "${DEST_APP}/Contents/Frameworks/Screenify Helper (Renderer).app/Contents/Info.plist" 2>/dev/null || true

# 4. Repack app.asar from main/ & out/, update ElectronAsarIntegrity hash, and sign all nested bundles/helpers
SIGN_ID="${EXPANDED_CODE_SIGN_IDENTITY:-}"
if [ -z "${SIGN_ID}" ]; then
  SIGN_ID="-"
fi

SCREENIFY_APP_BUNDLE="${DEST_APP}" CODESIGN_IDENTITY="${SIGN_ID}" "${NODE_BIN}" "${SRC_ROOT}/scripts/install-macos-app.js"
echo "✅ Xcode Screenify.app assembly and signing complete (${DEST_APP})"
