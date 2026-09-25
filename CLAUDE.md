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

## Scheduled routines (claude.ai/code/routines)
- Petit Le Mans morning update: 6:00 AM ET on Oct 1, 2 and 3, 2026. Its cron repeats yearly, so **turn it off after Oct 3, 2026.**
- Barber GT World Challenge America one-off: Sun Sep 27, 2026, 11:00 AM CT.
