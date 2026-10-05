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
- `window.Capacitor` only exists inside this native shell -- `js/app.js` must keep guarding every use of it
  (`window.Capacitor && window.Capacitor.isNativePlatform && ...`) and fall back to normal web behavior, since
  the exact same code also runs for any plain browser/installed-PWA visit.

## Scheduled routines (claude.ai/code/routines)
- Petit Le Mans morning update: 6:00 AM ET on Oct 1, 2 and 3, 2026. Its cron repeats yearly, so **turn it off after Oct 3, 2026.**
- Barber GT World Challenge America one-off: Sun Sep 27, 2026, 11:00 AM CT.
