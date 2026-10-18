#!/bin/bash
# Packs just the files the live app needs into ./dist (no archive, no dev files). Netlify runs this on every push to main.
#  0. node tools/sync_tracks.js makes index.html and sw.js list exactly the tracks in data/ (a track file added without registering it still deploys).
#  1. node tools/validate.js must pass, otherwise the build fails and Netlify keeps serving the last good version
#     (SKIP_VALIDATE=1 skips it in an emergency).
#  2. The service worker VERSION is set to the commit being built, so every deploy refreshes phones and nobody has to bump it by hand.
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then node tools/sync_tracks.js || exit 1; fi   # the data folder is the source of truth for the track list
if [ -z "$SKIP_VALIDATE" ] && command -v node >/dev/null 2>&1; then
  node tools/validate.js || { echo "validate failed: not building" >&2; exit 1; }
fi
rm -rf dist && mkdir dist
cp -R index.html sw.js manifest.webmanifest css js data icons dist/
cp _headers dist/   # headers for the Android installer and the service worker (Cloudflare Pages and Netlify both read it)
[ -d downloads ] && cp -R downloads dist/   # the sideloadable Android app (see CLAUDE.md, Android wrapper)
V="${COMMIT_REF:-$(git rev-parse HEAD 2>/dev/null)}"; V="${V:0:8}"; [ -z "$V" ] && V="$(date +%y%m%d%H%M)"
sed -i.bak "s/^const VERSION = \"[^\"]*\"/const VERSION = \"$V\"/" dist/sw.js && rm -f dist/sw.js.bak
grep -q "^const VERSION = \"$V\"" dist/sw.js || { echo "could not set the service worker version" >&2; exit 1; }
echo "dist ready: $(find dist -type f | wc -l | tr -d ' ') files, $(du -sh dist | cut -f1), version $V"
