# iPhone (Capacitor) and Android wrappers, builds, APK sharing

(Moved out of CLAUDE.md Nov 2 2026 to keep that file small. Read this file only when working on the topic.)

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
- Add to calendar was built (a native calendar plugin) and removed again on Oct 21 2026 at the user's request: adding 16 to 20 sessions to a calendar was not wanted. The plugin, its Info.plist strings and the Android permissions are gone from the native projects too (the next iOS and Android builds are clean).
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


## Offline on iPhone: app-bound domains (Nov 3 2026, needs an Xcode rebuild)
The native apps load https://tracksidepass.com, so offline depends on the service worker (`sw.js`). iOS's WKWebView only runs service workers for **app-bound domains**, so `ios/App/App/Info.plist` now has `WKAppBoundDomains` (tracksidepass.com and www.youtube.com, the hub's live-stream iframe) and `capacitor.config.json` has `ios.limitsNavigationsToAppBoundDomains: true` (also in the generated `ios/App/App/capacitor.config.json`; `npx cap sync ios` regenerates it). Rebuild in Xcode to take effect. Android's WebView already supports service workers. The offline cache is about 15 MB (all 93 tracks' maps): the first launch should be on Wi-Fi. **Test on the phone**: install, open on Wi-Fi, wait about a minute, switch to airplane mode, kill and reopen the app: the home screen, a track map and Directions should work. Things to check after the rebuild because the restriction is new: links to other sites (Capacitor should open them in Safari), the Live timing sheet, the live-stream iframe in the hub (www.youtube.com is listed; if it is blank, YouTube may also need youtube-nocookie.com or other hosts), sign-in emails, photo upload and weather. If something external breaks and cannot be listed (max 10 domains), set `limitsNavigationsToAppBoundDomains` back to false: the cost is no offline on iPhone.

**Verified on a real iPhone (Nov 3 2026):** after the Xcode rebuild with the app-bound domains, the app launched (the first launch prints three red "took 1.7 seconds to launch" lines for the WebContent, Networking and GPU processes: normal WebKit start-up warnings, not errors) and worked offline in airplane mode after being force-quit and reopened. A build number bump (General > Identity > Build, now 6) is only needed for TestFlight or App Store uploads.
