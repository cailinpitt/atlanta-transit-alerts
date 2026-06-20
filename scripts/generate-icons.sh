#!/usr/bin/env bash
# Regenerate the favicon / app-icon PNGs from their SVG sources (MARTA colors).
# Pairs with `npm run og` (which builds public/og-image.png from og-template.html).
#
# macOS only: uses QuickLook (qlmanage) to rasterize SVG and sips to resize, since
# the repo carries no SVG-rendering dependency.
#
# Sources -> outputs:
#   public/favicon.svg          -> public/favicon-16.png, public/favicon-32.png
#   public/apple-touch-icon.svg -> public/apple-touch-icon.png (180)
#   scripts/icon-maskable.svg   -> public/icon-maskable-192.png, -512.png
#
# qlmanage anchors content by the SVG's intrinsic width/height, so we render from
# temp copies whose width/height fill a 512px canvas (the viewBox is unchanged,
# so coordinates are untouched) and then downscale to each target size.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# favicon.svg is viewBox-only — give it an explicit 512px render canvas.
sed 's/viewBox="0 0 32 32"/width="512" height="512" viewBox="0 0 32 32"/' \
  "$ROOT/public/favicon.svg" > "$TMP/favicon.svg"
# apple-touch-icon.svg renders at 180 intrinsically — bump it to 512.
sed 's/width="180" height="180"/width="512" height="512"/' \
  "$ROOT/public/apple-touch-icon.svg" > "$TMP/apple-touch-icon.svg"
# icon-maskable.svg is already 512x512.
cp "$ROOT/scripts/icon-maskable.svg" "$TMP/icon-maskable.svg"

for f in favicon apple-touch-icon icon-maskable; do
  qlmanage -t -s 512 -o "$TMP" "$TMP/$f.svg" >/dev/null 2>&1
done

sips -z 32 32   "$TMP/favicon.svg.png"          --out "$ROOT/public/favicon-32.png" >/dev/null
sips -z 16 16   "$TMP/favicon.svg.png"          --out "$ROOT/public/favicon-16.png" >/dev/null
sips -z 180 180 "$TMP/apple-touch-icon.svg.png" --out "$ROOT/public/apple-touch-icon.png" >/dev/null
sips -z 512 512 "$TMP/icon-maskable.svg.png"    --out "$ROOT/public/icon-maskable-512.png" >/dev/null
sips -z 192 192 "$TMP/icon-maskable.svg.png"    --out "$ROOT/public/icon-maskable-192.png" >/dev/null

echo "Wrote favicon-16/32, apple-touch-icon (180), icon-maskable-192/512"
