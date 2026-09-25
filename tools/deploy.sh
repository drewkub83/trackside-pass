#!/bin/bash
# Publishes dist/ straight to Netlify, so nothing needs a manual drag-and-drop.
# One-time setup: put a Netlify Personal Access Token in tools/.netlify-token (nothing else reads that file).
# Used by the weekly refresh task, and safe to run by hand any time: ruby build.sh already having run, then this.
set -e
cd "$(dirname "$0")/.."
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

TOKEN_FILE="tools/.netlify-token"
SITE_FILE="tools/.netlify-site"
if [ ! -f "$TOKEN_FILE" ]; then
  echo "No Netlify token yet — put one in $TOKEN_FILE (see tools/DEPLOY-SETUP.md)." >&2
  exit 1
fi
export NETLIFY_AUTH_TOKEN="$(cat "$TOKEN_FILE")"
SITE_ARG=""
if [ -f "$SITE_FILE" ]; then SITE_ARG="--site $(cat "$SITE_FILE")"; fi

./build.sh
netlify deploy --prod --dir=dist $SITE_ARG
