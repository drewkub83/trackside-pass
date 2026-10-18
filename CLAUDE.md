# Trackside Pass

A race-day companion web app (PWA): track maps and walking directions, schedules, weather, and a Race Day hub. Plain HTML/CSS/JS, no framework. The user is a fan who uses it in person at race weekends, mostly on a phone, so it has to work on a phone with poor signal.

## Layout
- `index.html`, `css/styles.css`, `js/app.js` (the app; section index at its top), `js/passport.js`
- `data/<track-id>.js` one file per track (POIs, sessions, events, facts, outline: small, loaded at startup) plus
  `data/maps/<track-id>.js` (base map, walking grid, elevation: ~90% of the bytes, fetched when the track is opened by
  `ensureMap()` in `js/app.js`; `openTrack()` returns a Promise). **Edit events/POIs in `data/<id>.js` as before.** Tools that
  rewrite a whole track go through `build_route.load()/save()`, which merge and re-split automatically. After the Ruby
  builder (`build_permanent.rb`) writes a whole file, run `python3 tools/track-data/split_tracks.py <id>`.
  Never add `base`/`route`/`elev` back into the light file. `data/series.js` series guides; `data/watch.js` "What to watch"; `data/results.js` finished-race results; `data/champs.js` standings
- `sw.js` service worker. Its `VERSION` is set to the commit hash by `build.sh` at deploy time, so phones refresh on every deploy and nobody bumps it by hand (the `vNNN` in the source is ignored).
- `build.sh` copies the live files into `dist/` and stamps the service-worker version; Netlify runs it on every push to `main`. It first runs `node tools/validate.js` (syntax, data loads, cross-references, sw/index/data consistency): if that fails the build fails and Netlify keeps serving the last good version. `.github/workflows/validate.yml` runs the same check on every push. Adding a track file to `data/` is all that is needed for the track lists: `node tools/sync_tracks.js` (run by build.sh) makes `index.html` and `sw.js` match the folder. Run `node tools/validate.js` before pushing data changes; `SKIP_VALIDATE=1` skips it in an emergency.

## Hosting: https://tracksidepass.com on Cloudflare Workers (moved from Netlify, Oct 18 2026)
Netlify's credits ran out (15 per deploy), so the site moves to Cloudflare (free static hosting with no bandwidth charge; the domain is registered there). Cloudflare's dashboard now creates a Worker with static assets (Workers Builds) rather than a Pages project. `wrangler.jsonc` (name `trackside-pass`, must match the dashboard project name) serves `dist/` and runs `worker/index.js` only for `/api/*`: `/api/ytlive` and `/api/gtwce` are the Netlify functions `netlify/functions/{ytlive,gtwce}.mjs` reused unchanged (one implementation, `env` carries the `YT_API_KEY` secret). Dashboard build settings: build command `bash build.sh`, deploy command `npx wrangler deploy`, variable `NODE_VERSION=20`; the secret goes in the Worker's Settings > Variables and secrets; the domain in Settings > Domains & Routes. `_headers` (Android installer, service worker) is read by both hosts. Tested with `npx wrangler dev`. `fnUrl()` in `js/app.js` picks `/api/<name>` or `/.netlify/functions/<name>` by hostname; `SITE` there and `server.url` in `capacitor.config.json` (plus the generated copies under `ios/` and `android/`) are `https://tracksidepass.com`; changing the address in the native apps needs an iOS/Android rebuild. The live site is `https://tracksidepass.com` (backup `trackside-pass.drewkub83.workers.dev`); `www.` is not set up. Old APKs and the old iPhone build still load the Netlify address. Workers Builds rebuilds on every push to main (free plan: 3,000 build minutes a month); a commit message containing `[skip ci]` skips one. The Netlify site is no longer live; the [deploy] gate below only matters if it is ever used again.

## Publishing
Pushing to `main` deploys the site (https://tracksidepass.com) through Cloudflare Workers Builds (`bash build.sh`, then `npx wrangler deploy`); a commit message containing `[skip ci]` skips the build. The free plan allows 3,000 build minutes a month and a build takes about a minute, so pushing often is fine, but still batch tiny commits. (The old Netlify site charged 15 credits per deploy, ran out at 3,375 of 3,390.8 on Oct 17 2026 and is no longer live; its `[deploy]` gate in `netlify.toml` is left in place.) Ship after every change unless the user says "hold off". Test first (`node tools/validate.js`), commit, push. Cloud routines also push to `main`, so pull before editing. There are no secrets in this repo; never add any (a Netlify token lives only on the user's Mac in `tools/.netlify-token`, which is gitignored).

## Accuracy rule
Never invent facts. Race facts (results, standings, points, cars, drivers) must come from published sources (imsa.com, racer.com, sportscar365.com, series sites, Porsche, etc.). Cross-check numbers. Do not use Wikipedia for numbers (its standings were wrong) -- except circuit lap records, where Wikipedia is fine (the user OK'd it). If something cannot be verified, leave it out and say so in the entry's `note`. Do not use IMSA/Alkamel live timing data: it carries an explicit no-redistribution notice.

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

## Working on js/app.js
- Section index is at the top of the file. Every localStorage key lives in the `K` table near the top (add new keys there; `tools/validate.js` fails on stray `paddock:` literals). The Race Day hub is one builder function per card (`hubSessionCard`, `hubWatchCard`, ...) composed by `renderHub()`.
- Before refactoring anything the hub renders, run the regression harness in `tools/hub_snapshot.js` (instructions in its header): it hashes the hub HTML for every track at ~10 pretend moments, so "nothing changed" can be proven.

## Lap records (`lapRecord` in `data/<track>.js`)
A list, one entry per series (per class for IMSA and WEC): the series' **track record on the layout the map draws** -- the fastest lap ever
in any session (race, qualifying, pole, even practice), whatever the year; the user does not care when it was set. Only top series that are
on that track's calendar in the app (IMSA, IndyCar, GT World Challenge America/Europe) plus F1/MotoGP/NASCAR where they appear there, and WEC
(not set up yet, but its venues Imola, Spa, COTA and Portimao already carry its Hypercar and LMGT3 records). No support series (Pilot Challenge,
Carrera Cup, MX-5, GT4, ELMS, Indy NXT...). Layouts stay apart (oval vs road course, chicane vs no chicane). `note` says whether the lap was a
race or qualifying lap. Wikipedia is fine for circuit lap records; IMSA's class "track records" (qualifying) come from IMSA's own reports.
Never guess a number: if a record cannot be found, leave the entry out. The Info tab shows series, time and driver (no year).
Repeatable tools (read each series' own results, fastest lap over every session, no guessing): `tools/indycar_laprecords.py` (INDYCAR's results API, lap times exist from 2010 on; ovals publish no single qualifying laps; run `scan` once, then `best`), `tools/gtwce_laprecords.py` (GT World Challenge Europe, 2014 on, practice, qualifying, race), `tools/gtwca_laprecords.py` (GT World Challenge America, practice and qualifying only: the site has no per-car race page). These pages name a car's crew, not who set the lap: Sprint qualifying N is driven by the Nth-listed driver (Endurance qualifying too when the crew list is complete), but confirm the driver in a series report before writing `who`; for a practice lap list the crew. Check the layout (Barcelona's final chicane was removed in 2023 and the map shows the current no-chicane layout, Zandvoort's 2020 layout, Phoenix's 2018 re-profile, the Nurburgring Sprint circuit in 2016 all change lap times).

## Adding a new circuit (US or overseas)
1. `tools/track-data/fetch_track_osm.py <id> <lat> <lon> [radius]` downloads the OpenStreetMap data (it uses a working Overpass
   mirror; the main one is often down). `osm_raceways.py` lists raceway pieces; `chain_circuit.py <id> <official_km>` chains
   them into one closed lap and prints the way ids (compare the length with the official one; several layouts can share a site
   -- Barcelona has the chicane and no-chicane laps -- so pick the one whose turn count matches the series' published layout).
2. `make_config.py` (edit SPECS) writes `tools/street-circuits/permanent/<id>.rb`: official length / turns / lap record from the
   series' own event page, corner labels from OpenStreetMap's own piece names (never invented). Then
   `ruby tools/street-circuits/build_permanent.rb tools/street-circuits/permanent/<id>.rb` builds `data/<id>.js` and registers it
   in `index.html` and `sw.js`.
3. Run `python3 tools/track-data/split_tracks.py <id>` (the builder writes a whole file), then crossings, walking grid, elevation as in the section above. For new tracks build the grid with `build(tid, rle=True)`: the
   rows are run-length encoded (`route.rle`, decoded in `walkRows()`) to keep data files small.
4. Grandstands: OpenStreetMap often has them (`leisure=bleachers`, `building=grandstand`) even though the first build ignores them:
   run `python3 tools/track-data/osm_stands.py <id> --write` (named stands keep their name, unnamed ones are clustered and named after the
   nearest corner), then nudge any badge the walking grid cannot reach. Other fan facilities (gates, food stands, restrooms, event parking)
   are mostly NOT in OpenStreetMap and need the circuit's official fan map; say so in the track's `facts` rather than leaving the map looking complete.
Venues of a series that have no map yet go in that series' `stops` in `data/champs.js` as "Map coming soon" (with real dates);
a stop disappears by itself once a track with the same id exists.

## Accounts, friends and leaderboards (Supabase, Oct 2026)
Optional, local-first. The project is `https://hspehgxhksctfegcfgyv.supabase.co` (public URL; the publishable key goes in `SB` at the top of `js/account.js`; the service-role key lives ONLY in GitHub secrets, never here or in chat). `supabase/schema.sql` is the whole database (tables, row-level security, `save_picks()`, `leaderboard()` ...); re-run it in the Supabase SQL editor after changing it (it is idempotent). Picks are written only through `save_picks()`, which locks at the race start and banks the server's win chance and timing bonus; scoring in SQL equals `gameScore()` in `js/app.js` (parity-tested on 4,000 random cases: if you change the scoring in one, change the other). `tools/sync_games.mjs` publishes `data/entries.js`, `data/results.js` and each track's session times to the `games` table (workflow `sync-games.yml`, also run by `race-weekend.yml`; secrets `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`). Never delete a game row: it cascades to everybody's picks. Sign-in emails go through Resend (domain tracksidepass.com) with the Magic Link and Confirm signup templates containing `{{ .Token }}`. `privacy.html` is the draft policy and terms (contact privacy@tracksidepass.com needs Cloudflare Email Routing).

## Race Day hub is the landing page
Opening any track lands on the Hub tab (`enterHub()` in `openTrackNow`); Map is the second tab, then Events and Info. The back arrow and swipe-back step Map/Events/Info -> Hub -> track list (`goHome`). Off-season the hub's top card shows the next event and its date.

## Styles (Settings > Look and units > Style)
`<html data-style="race">` switches on the Race Control look: one clearly marked override block at the bottom of `css/styles.css` (tokens for light, auto-dark and
forced-dark, then component rules). Classic is the default and has no attribute. Preference key `paddock:style`; index.html applies it before first
paint; `js/app.js` has `stylePref/applyStyle/setStyle`. Fonts (Barlow, Barlow Condensed) are in the index.html link AND `FONT_CSS` in sw.js: keep
the two strings identical or the fonts are not saved for offline. Series stripe colours are the `--s-*` tokens, keyed by `data-s` on home rows.

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
- The iPhone app is locked to portrait (`UISupportedInterfaceOrientations` in `ios/App/App/Info.plist` lists only Portrait; changing
  it needs an Xcode rebuild). iPad keeps all orientations. In a browser/PWA, landscape just widens the layout (css `@media (orientation:landscape)`).
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

## Android wrapper (`android/`, personal use, sideloaded)
Same idea as the iPhone app: Capacitor shell that loads the live Netlify site (`capacitor.config.json` `server.url`), so every data/css/js push reaches it with no rebuild. `android/` is committed (project source only; Gradle/build output is ignored by `android/.gitignore`). A rebuild is needed only when `android/` itself changes: a new plugin (`npm install`, `npx cap sync android`), a permission in `android/app/src/main/AndroidManifest.xml`, the icon/splash (`python3 tools/android_assets.py`), the app id or version.
- Plugins shared with iOS: `@capacitor/geolocation` (permissions ACCESS_FINE/COARSE_LOCATION are in the manifest; `js/native.js` routes `navigator.geolocation` through it), `@capacitor/local-notifications` (POST_NOTIFICATIONS and SCHEDULE_EXACT_ALARM come from the plugin; status-bar icon `ic_stat_icon`), `@capacitor/browser` (live timing sheet). `@capacitor/app` is Android-only use: `js/native.js` maps the system back button/gesture to `swipeBack()` and exits only from the track list (the app does not use browser history). `window.Capacitor.getPlatform()` is `"android"` there.
- **Release build (Oct 18 2026, versionCode 2 / 1.1, signed):** `JAVA_HOME=~/Library/Java/JavaVirtualMachines/jbr-21.0.11/Contents/Home ./gradlew assembleRelease bundleRelease` in `android/` (works from a Claude session on this Mac), after `npx cap sync android`. It signs with the release key in `~/.trackside/trackside-release.jks` (alias `trackside`; passwords in `~/.trackside/keystore.properties`, both outside the repo and NOT backed up anywhere else: losing them means friends must uninstall and reinstall; certificate SHA-256 `da4fe8d7...ab6c`). Outputs: `android/app/build/outputs/apk/release/app-release.apk` (copy to `downloads/TracksidePass.apk`) and `.../bundle/release/app-release.aab` (for Google Play later: a $25 one-time developer account; Play internal testing is the proper way to share beyond a few friends). Bump `versionCode` for every APK you give out so it installs over the last one. The app loads https://tracksidepass.com, so web changes never need a new APK. The earlier debug-signed APK cannot be updated by this one: uninstall it first.
- Build (on the user's Mac; this repo's sessions have no Java/Android SDK): install Android Studio, `npx cap sync android`, open the `android/` folder (`npm run android:open`), wait for the Gradle sync, then Build > Build Bundle(s) / APK(s) > Build APK(s). A debug APK is enough for sideloading: send `android/app/build/outputs/apk/debug/app-debug.apk` to the phone, allow "install unknown apps" for the app that opened it, tap it. Rebuild from the same Mac so the debug signing key stays the same and the new APK installs over the old one.
- Sharing the APK: email and most chat apps block `.apk` files, and cloud previewers (Drive, iCloud) often fail on them. `downloads/TracksidePass.apk` is deployed with the site, so `https://tracksidepass.com/downloads/TracksidePass.apk` downloads straight in Chrome. After rebuilding the APK, copy it over `downloads/TracksidePass.apk` and push. It is public (anyone with the link); remove the `downloads/` folder, the header block in `netlify.toml` and the `build.sh` line to take it down.
- Not tested on a real phone yet: edge-to-edge layout on Android 15 (safe-area insets), the notification permission prompt on Android 13+, exact-alarm behaviour, the back button.

## Scheduled routines and automation
Long-term goal: the app runs without the owner's computer. Cloud routines (claude.ai/code/routines, run in Anthropic's cloud, push to `main`) are the durable mechanism; desktop scheduled tasks only run while the Mac's Claude app is open, so treat them as backups. Cloud routines must NOT have connectors attached (clear with `clear_mcp_connections` after creating).
- Petit Le Mans morning update (cloud, cron repeated yearly): switched OFF Oct 15, 2026. Turn it back on only for 2027 (cron `0 10 1,2,3 10 *`).
- Portimao GT World Europe finale (Oct 16-17, 2026): cloud backups for the Friday and Saturday 6:30 AM ET "What to watch" updates (they check for the Mac task's entry first and skip if present). The Mac tasks (quali odds, race result, Friday/Saturday 6:00 AM) are primary this weekend.
- Live stream (hub "Watch here"): `netlify/functions/ytlive.mjs` finds the video live now on a series' YouTube channel (`yt` in `data/series.js`) through YouTube's Data API, using the `YT_API_KEY` environment variable set in Netlify (Site configuration > Environment variables; never in this repo). Without it the function falls back to reading the channel page, which YouTube blocks from servers with a bot check. A new env var only takes effect after a deploy.
- Live results (instant): `netlify/functions/gtwce.mjs` reads GT World Europe's official results pages; the hub shows them (`liveSrc`, `data/entries.js` `live:{round}`). Runs on Netlify, no computer needed.
- Automation that needs no computer (GitHub Actions, `.github/workflows/`): `race-weekend.yml` (every 30 min Thu-Mon) runs `tools/auto_update.py`, which for each `data/entries.js` entry with `live:{round}` refreshes the entry list, rebuilds the podium-game win chances once qualifying is published (`tools/podium_odds.py --quali`), imports the race classification into `data/results.js` (`tools/gtwce_result.py`, re-read for 2 days to catch penalties) and refreshes standings (`tools/gtwce_standings.py`), then commits to `main`. `standings.yml` refreshes GT World Europe standings every Monday. Shared parsing is `tools/gtwce_lib.py`. New GT World Europe Endurance weekends need no manual step: about 8 days before one that the app has an event for, `auto_update.py` finds the round on the series' entry-list page, creates the `data/entries.js` entry (with `live:{round}`) and fills the cars (`tools/gtwce_entries.py`). If it cannot (no entry list yet, site layout changed), the weekend is simply skipped; you can do it by hand with `python3 tools/gtwce_entries.py --round <slug>` after adding a skeleton entry. Sprint Cup weekends are not covered (different session structure). Formula 1 is covered by `tools/f1_update.py` (Jolpica F1 API = Ergast-compatible mirror of FIA results; formula1.com blocks servers): from 8 days before a Grand Prix at a venue the app has an F1 event for it writes the 'Pick your podium' entry in `data/entries.js` (drivers with their race numbers; win chances from form before qualifying, form + grid after: backtested on 2024-26), then the top ten into `data/results.js` as `#NUMBER Driver (Team)` and the standings into `data/standings.js` (a hand-written entry for the same race is kept). The game scores by `#NN`, so any new series' results lines must carry the car or driver number. IndyCar and GT World Challenge America are covered by their own readers, run from the same job: `tools/indycar_update.py` (INDYCAR's results API: top ten of the race, driver standings top 15 from indycar.com/Standings, and the venue's lap record if any session of the weekend beat it) and `tools/gtwca_update.py` (the series' results pages: race winner only, because the site lists just each session's top car; Pro / Pro-Am / Am driver standings top 6; practice and qualifying lap records). Both only act on races of the last 10 days at venues the app has an event for, write entries whose note starts with "(automatic update)", and NEVER overwrite a hand-written entry for the same race or season. GT World Europe also lowers lap records during a weekend (`gtwce_laprecords.py` `weekend()`, Barcelona counted from 2023: the map shows the no-chicane layout). Driver credit on automatic lap records follows qualifying order (qualifying N = N-th listed driver); check it against a series report when you can. IMSA has no machine-readable source we may use, so its results, standings and lap records stay manual. Other series need their own parser (and a backtest for the odds) before they can be added.
