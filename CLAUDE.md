# Trackside Pass

A race-day companion web app (PWA): track maps and walking directions, schedules, weather, and a Race Day hub. Plain HTML/CSS/JS, no framework. The user is a fan who uses it in person at race weekends, mostly on a phone, so it has to work on a phone with poor signal.

## Layout
- `index.html`, `css/styles.css`, `js/app.js` (the app), `js/passport.js`
- `data/<track-id>.js` one file per track (map, POIs, sessions, events); `data/series.js` series guides; `data/watch.js` "What to watch"; `data/results.js` finished-race results; `data/champs.js` standings
- `sw.js` service worker. **Bump `VERSION` on every change** or phones keep the old files.
- `build.sh` copies the live files into `dist/`; Netlify runs it on every push to `main`.

## Publishing
Pushing to `main` deploys the site (https://deft-medovik-55a935.netlify.app). Test first, bump `sw.js` VERSION, commit, push. Ship after every change unless the user says "hold off". Cloud routines also push to `main`, so pull before editing. There are no secrets in this repo; never add any (a Netlify token lives only on the user's Mac in `tools/.netlify-token`, which is gitignored).

## Accuracy rule
Never invent facts. Race facts (results, standings, points, cars, drivers) must come from published sources (imsa.com, racer.com, sportscar365.com, series sites, Porsche, etc.). Cross-check numbers. Do not use Wikipedia for numbers (its standings were wrong). If something cannot be verified, leave it out and say so in the entry's `note`. Do not use IMSA/Alkamel live timing data: it carries an explicit no-redistribution notice.

## Track data: walking routes, crossings, elevation (`tools/track-data/`)
Every track has a walking grid (`route`). Three things make Directions actually work -- check all three for a new track:
- **Crossings.** A walking route crosses the circuit ONLY at badges of kind `cross`, and each must sit within 60 m of the
  circuit `path` or the app can't link it (a mis-placed crossing silently strands the infield -- Daytona's were 79 and 161 m
  off). `python3 tools/track-data/find_cross.py <id>` lists real bridges/tunnels over the circuit from OpenStreetMap;
  `add_cross.py <id> --write` adds the vetted ones (footway/path, named, or explicitly permissive; never `access=private`).
- **Walking grid.** `build_route.py <id>` regenerates `route` from the track's own `base` map data. Only use it for tracks
  with no grid; don't overwrite a hand-tuned one.
- **Elevation** (hill notes in Directions). `elev_build.py <id>` downloads a ~100 m grid (USGS in the US, Open-Meteo for
  Canada), `apply_elev.py <id>` bakes it in. Only worth it where the terrain has relief; flat tracks (Daytona, Sebring,
  Indianapolis road course and oval) are skipped on purpose.
- **Check:** in the browser console, from a gate / restroom / food / parking badge, `walkMetresTo()` should reach >= 98% of a
  track's badges. Don't bump a track's `rev` for this: it wipes the user's own badge edits.

## Event schedules (`sessions` in `data/<track>.js`)
Fans only need **practice, qualifying and races** (plus the odd headline on-track event like a pole shootout or
parade). Leave out team-only test/shakedown days, paddock logistics, briefings, registration, tech inspection,
paid test sessions, autograph sessions. The official schedule PDFs list all of it -- filter it down.

## "What to watch" data (`data/watch.js`)
One entry per series per weekend: `{t: track id, d: event start day, s: series id (see SERIES in data/series.js), from?: first day it shows, asOf, groups:[{h: class, items:[[car or driver, why]]}], note: sources}`. The app shows only the NEWEST entry per series whose `from` has arrived, so a mid-weekend update is a NEW entry with the same t/d/s and a later `from` that fully replaces the old one (write it as a fresh preview, drop stale claims, never an addendum). Old entries stay as history. The Race Day hub shows the entry for the series currently on track.

## Native app wrapper (`ios/`, personal use only)
The live PWA is also wrapped as a personal-use-only iOS app with Capacitor, so it can do things the web app
can't: a real in-app browser sheet for "Live timing" (see `js/app.js` `openLiveTiming`), and later push
notifications. It is **not published anywhere** -- sideloaded to the user's own phone via Xcode, free Apple ID,
needs re-signing roughly every 7 days.
- It is **remote-loaded**, not bundled: `capacitor.config.json`'s `server.url` points at the live Netlify site,
  so the native app just shows that site in a WKWebView with Capacitor's bridge injected. This means **every
  ordinary change to this repo (data, css, js) ships to the native app the exact same way it already does --
  git push, Netlify deploys, done.** No Xcode rebuild, no re-signing, nothing native-specific to do.
- `www-shell/` is a throwaway placeholder page (Capacitor requires *some* local `webDir` to exist) -- it is
  never actually seen except for a flash on a cold launch or if the live site is briefly unreachable. Don't
  bother keeping it in sync with `index.html`.
- An Xcode rebuild (by the user, on their Mac -- a cloud routine/CLI session cannot sign or run this) is only
  needed when something changes in `ios/` itself: a new Capacitor plugin (`npm install`, then `npx cap sync
  ios`), a new native permission in `ios/App/App/Info.plist`, the app icon, or the bundle id/version.
- `ios/` **is committed to git** -- it's the actual native project source, not a build artifact. `node_modules/`
  and Xcode's own derived/user-state files are gitignored; see `.gitignore`.
- Session alerts use `@capacitor/local-notifications` (`scheduleSessionAlerts` in `js/app.js`): on each app
  open while physically at a track, that track's next event's sessions get a local notification 10 min before
  start (not at a track: the existing schedule is left alone). These are on-device only --
  true server-pushed notifications would need a paid Apple developer account, not the free personal one.
- `capacitor.config.json` must keep `ios.contentInset: "never"` (Capacitor's default). `"automatic"` makes the
  native scroll view add its own safe-area padding, leaving dark bars top/bottom and re-measuring the layout on
  every tab change. The web CSS handles safe areas itself with `env(safe-area-inset-*)`.
- `js/native.js` (loaded before `app.js`, no-op outside the shell) routes `navigator.geolocation` and
  `permissions.query({name:"geolocation"})` through `@capacitor/geolocation`. Without it the web view asks
  "<site> would like to use your location" on every launch.
- The app icon has a dark-mode variant (`AppIcon-dark.png`, from `icons/icon-night-1024.png`). Icons for iOS
  must have no alpha channel.
- `window.Capacitor` only exists inside this native shell -- `js/app.js` must keep guarding every use of it
  (`window.Capacitor && window.Capacitor.isNativePlatform && ...`) and fall back to normal web behavior, since
  the exact same code also runs for any plain browser/installed-PWA visit.

## Scheduled routines (claude.ai/code/routines)
- Petit Le Mans morning update: 6:00 AM ET on Oct 1, 2 and 3, 2026. Its cron repeats yearly, so **turn it off after Oct 3, 2026.**
- Barber GT World Challenge America one-off: Sun Sep 27, 2026, 11:00 AM CT.
