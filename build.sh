#!/bin/bash
# Packs just the files the live app needs into ./dist (no archive, no dev files).
# Drag the dist folder onto a static host (e.g. Netlify Drop) to publish or update the app.
cd "$(dirname "$0")" || exit 1
rm -rf dist && mkdir dist
cp -R index.html sw.js manifest.webmanifest css js data icons dist/
echo "dist ready: $(find dist -type f | wc -l | tr -d ' ') files, $(du -sh dist | cut -f1)"
