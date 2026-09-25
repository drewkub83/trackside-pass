# Trackside Pass logo

A coral map pin whose dot is a black and white chequered disc (4 x 4, radius 24 in a 120 unit box). Day = coral pin on sage `#DCE8E0`, night = same pin on `#16191D`.
The pin sits inside the middle 80% of the icon so Android's masks never cut it.

- `make_icons.rb` writes the SVG masters here (`icon-day.svg`, `icon-night.svg`, `favicon.svg`, `pin.svg`).
- PNGs: `qlmanage -t -s 1024 -o out icon-day.svg`, then `sips -z 512 512 ...` for the other sizes. Output goes to `icons/`.
- In the app: `icons/icon-192.png`, `icon-512.png` (also used as maskable), `apple-touch-icon.png` (180, day), `favicon.svg` (switches to the dark background in dark mode), `favicon-32.png`, `pin.svg` (header). The night PNGs (`*-night-*`) are ready for an alternate or dark icon.
- `old/` keeps the previous "ring and dot" icons. `pin-*.html` are the design sketches.
- After changing the apple-touch-icon, delete the old home-screen icon on the iPhone and add it again (iOS caches it).
