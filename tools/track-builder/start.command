#!/bin/bash
# Double-click to open the Track Builder. It must be served from http://localhost (not opened as a file),
# because OpenStreetMap's tile servers block requests that carry no referrer.
cd "$(dirname "$0")/../.."
PORT=8123
URL="http://localhost:$PORT/tools/track-builder/builder.html"
echo "Track Builder: $URL"
echo "Leave this window open while you work. Close it (or press Ctrl+C) when you are done."
( sleep 1; open -a "Google Chrome" "$URL" 2>/dev/null || open "$URL" ) &
exec ruby -run -e httpd . -p $PORT
