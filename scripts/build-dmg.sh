#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
WORKSPACE_ROOT="$(cd "${PROJECT_ROOT}/.." && pwd)"

APP_PATH="${1:-${WORKSPACE_ROOT}/Screenify.app}"
BG_PNG="${2:-${WORKSPACE_ROOT}/00-dmg-background.png}"
OUT_DMG="${3:-${WORKSPACE_ROOT}/Screenify-1.12.0-arm64.dmg}"
OUT_DMG_ALIAS="${WORKSPACE_ROOT}/Screenify.dmg"
VOL_NAME="Screenify"

if [[ ! -d "${APP_PATH}" ]]; then
  echo "Error: Signed app bundle not found at ${APP_PATH}" >&2
  exit 1
fi

if [[ ! -f "${BG_PNG}" ]]; then
  BG_PNG="${PROJECT_ROOT}/marketing/00-dmg-background.png"
fi

if [[ ! -f "${BG_PNG}" ]]; then
  echo "Error: Background image not found at ${BG_PNG}" >&2
  exit 1
fi

echo "==> Verifying signature on source app: ${APP_PATH}"
codesign -dvvv "${APP_PATH}" 2>&1 | grep -E "Authority=|Notarization|flags=" || true

WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/screenify-dmg.XXXXXX")"
STAGE_DIR="${WORK_DIR}/stage"
RW_DMG="${WORK_DIR}/Screenify-rw.dmg"

cleanup() {
  if [[ -d "/Volumes/${VOL_NAME}" ]]; then
    hdiutil detach "/Volumes/${VOL_NAME}" -force >/dev/null 2>&1 || true
  fi
  rm -rf "${WORK_DIR}"
}
trap cleanup EXIT

mkdir -p "${STAGE_DIR}/.background"

echo "==> Copying signed Screenify.app (preserving signature & notarization ticket)..."
ditto "${APP_PATH}" "${STAGE_DIR}/Screenify.app"
ln -s /Applications "${STAGE_DIR}/Applications"

echo "==> Preparing Retina multi-resolution background (600x400 @1x + 1200x800 @2x)..."
cp "${BG_PNG}" "${STAGE_DIR}/.background/00-dmg-background.png"
sips -z 400 600 -s dpiWidth 72 -s dpiHeight 72 "${BG_PNG}" --out "${WORK_DIR}/bg-1x.png" >/dev/null
sips -z 800 1200 -s dpiWidth 144 -s dpiHeight 144 "${BG_PNG}" --out "${WORK_DIR}/bg-2x.png" >/dev/null
tiffutil -cathidpicheck "${WORK_DIR}/bg-1x.png" "${WORK_DIR}/bg-2x.png" -out "${STAGE_DIR}/.background/00-dmg-background.tiff" >/dev/null 2>&1 || cp "${BG_PNG}" "${STAGE_DIR}/.background/00-dmg-background.tiff"

if [[ -f "${APP_PATH}/Contents/Resources/icon.icns" ]]; then
  cp "${APP_PATH}/Contents/Resources/icon.icns" "${STAGE_DIR}/.VolumeIcon.icns"
fi

# Detach any existing Screenify volume before mounting
if [[ -d "/Volumes/${VOL_NAME}" ]]; then
  hdiutil detach "/Volumes/${VOL_NAME}" -force >/dev/null 2>&1 || true
fi

APP_SIZE_MB="$(du -sm "${STAGE_DIR}" | awk '{print $1}')"
DMG_SIZE_MB="$((APP_SIZE_MB + 80))"

echo "==> Creating writable disk image (${DMG_SIZE_MB} MB)..."
hdiutil create \
  -srcfolder "${STAGE_DIR}" \
  -volname "${VOL_NAME}" \
  -fs HFS+ \
  -fsargs "-c c=64,a=16,e=16" \
  -format UDRW \
  -size "${DMG_SIZE_MB}m" \
  "${RW_DMG}" >/dev/null

echo "==> Mounting writable disk image..."
ATTACH_OUT="$(hdiutil attach -readwrite -noverify -noautoopen "${RW_DMG}")"
DEV_NAME="$(echo "${ATTACH_OUT}" | grep -E '^/dev/' | head -n 1 | awk '{print $1}')"
MOUNT_DIR="/Volumes/${VOL_NAME}"

if [[ -f "${MOUNT_DIR}/.VolumeIcon.icns" ]] && [[ -x /usr/bin/SetFile ]]; then
  /usr/bin/SetFile -a C "${MOUNT_DIR}" || true
fi

echo "==> Configuring Finder window layout & background via AppleScript..."
osascript <<EOF
tell application "Finder"
  tell disk "${VOL_NAME}"
    open
    set current view of container window to icon view
    set toolbar visible of container window to false
    set statusbar visible of container window to false
    set the bounds of container window to {200, 160, 800, 588}
    set theViewOptions to the icon view options of container window
    set arrangement of theViewOptions to not arranged
    set icon size of theViewOptions to 112
    set text size of theViewOptions to 13
    set background picture of theViewOptions to file ".background:00-dmg-background.tiff"
    set position of item "Screenify.app" of container window to {165, 175}
    set position of item "Applications" of container window to {435, 175}
    close
    open
    update without registering applications
    delay 2
    close
  end tell
end tell
EOF

# Hide internal volume items if present
if [[ -x /usr/bin/SetFile ]]; then
  [[ -d "${MOUNT_DIR}/.background" ]] && /usr/bin/SetFile -a V "${MOUNT_DIR}/.background" || true
  [[ -f "${MOUNT_DIR}/.VolumeIcon.icns" ]] && /usr/bin/SetFile -a V "${MOUNT_DIR}/.VolumeIcon.icns" || true
fi

rm -rf "${MOUNT_DIR}/.fseventsd" "${MOUNT_DIR}/.Trashes" 2>/dev/null || true
sync

echo "==> Detaching writable volume (${DEV_NAME})..."
hdiutil detach "${DEV_NAME}" -force >/dev/null

rm -f "${OUT_DMG}" "${OUT_DMG_ALIAS}"

echo "==> Compressing final DMG to ${OUT_DMG}..."
hdiutil convert "${RW_DMG}" -format UDZO -imagekey zlib-level=9 -o "${OUT_DMG}" >/dev/null

# Sign the DMG with Developer ID if available
DEV_ID_CERT="$(security find-identity -v -p codesigning 2>/dev/null | grep "Developer ID Application" | head -n 1 | sed -E 's/.*"([^"]+)".*/\1/' || true)"
if [[ -n "${DEV_ID_CERT}" ]]; then
  echo "==> Signing DMG with ${DEV_ID_CERT}..."
  codesign --force --sign "${DEV_ID_CERT}" --timestamp "${OUT_DMG}"
fi

cp -f "${OUT_DMG}" "${OUT_DMG_ALIAS}"

echo "==> DMG build complete:"
ls -lh "${OUT_DMG}" "${OUT_DMG_ALIAS}"
