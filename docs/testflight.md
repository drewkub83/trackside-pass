# TestFlight (iPhone beta): checklist (Nov 19 2026)

Status: the iPhone project was checked for TestFlight. Already in place: Apple team `7L7SG5VT23`, bundle ids `com.tracksidepass.app` (app) and `com.tracksidepass.app.TracksideLive` (Live Activity), automatic signing, push entitlement, `ITSAppUsesNonExemptEncryption = false` (no export-compliance question), privacy manifest, account deletion in the app, a report-player option, a privacy policy at https://tracksidepass.com/privacy.html. Done in this pass: the privacy manifest now also declares the anonymous usage counts and feedback; build number raised from 6 to 7 (every upload needs a higher number than the last: raise `CURRENT_PROJECT_VERSION` in all four places in `ios/App/App.xcodeproj/project.pbxproj`, or in Xcode, General > Build).

## 1. Make the app record (App Store Connect, once)
1. appstoreconnect.apple.com > Apps > + > New App. Platform iOS. Name "Trackside Pass" (if Apple says the name is taken, add a subtitle word, e.g. "Trackside Pass: Race Day"). Language English (US). Bundle ID `com.tracksidepass.app` (if it is not in the list, add it at developer.apple.com > Identifiers). SKU `tracksidepass`.

## 2. Upload a build (Xcode, on your Mac)
1. Open `ios/App/App.xcodeproj`. Pick the scheme **App** and the destination **Any iOS Device (arm64)**.
2. For both targets (App and TracksideLive) > Signing & Capabilities: Automatic signing, team set. The app needs Push Notifications and the Live Activities setting on; they already are.
3. Product > Archive. When it finishes, the Organizer opens: **Distribute App > App Store Connect > Distribute** (Upload), keep automatic signing. The first time, Xcode creates the Apple Distribution certificate for you.
4. Wait 10 to 30 minutes for "processing" to finish; App Store Connect emails you.

## 3. TestFlight page (App Store Connect > your app > TestFlight)
- **Test Information** (needed before outside testers): Beta App Description (one paragraph: what the app does), Feedback Email, your contact details, Privacy Policy URL `https://tracksidepass.com/privacy.html`, and "What to test": *Open a track page, try walking directions, pick a podium, mark a race you are going to, then use Settings > Send feedback to tell me what was confusing.*
- **App Review Information / notes** (a reviewer reads this): *Trackside Pass is a race-weekend companion: maps and walking directions for race tracks, schedules, weather and a Pick your podium game. An account is optional (email code, no password), so no demo login is needed. Native features: local and push notifications (race reminders, rain alerts), a lock screen Live Activity for the session at the track, device location for walking directions, and an in-app browser for live timing. Account deletion is in Settings > Your data.*
- **App Privacy** (App Store Connect > App Privacy) must match `ios/App/App/PrivacyInfo.xcprivacy`: Contact info (email, name), Identifiers (user ID, device ID), User content (gameplay content, other user content), Usage data (product interaction, not linked to identity, analytics). Location is used on the phone only and is not collected. Nothing is used for tracking.

## 4. Testers
- **You and anyone you add as an App Store Connect user (internal):** available straight after processing, no review.
- **Everyone else (external):** TestFlight > + next to External Testing > make a group (e.g. "Public beta") > add the build > Submit for Beta App Review (usually 1 to 2 days the first time; later builds of the same version are usually quicker). When approved, open the group > **Enable Public Link**, set a tester limit (say 100), copy the link. Put that link on the landing page (`welcome/index.html`, a "Join the iPhone beta" button next to Open the app).
- Testers need the free TestFlight app from the App Store, then tap your link.

## 5. Things that could slow it down
- **Guideline 4.2 (minimum functionality):** the app shows the live website in a native shell, which reviewers sometimes question. The native features above are the answer; keep them listed in the review notes. A beta review is usually more lenient than a full App Store review, but expect a question.
- The first upload can ask about Live Activity push or push capability: the app uses the standard capabilities; answer from the checklist above.
- Name already taken: pick the subtitle variant.
- A build that does not appear after an hour: check the email from App Store Connect for the reason (usually a missing icon or an old build number).

## Updating the beta
The app loads the live site, so ordinary changes reach TestFlight testers the same way as everyone else (git push). A new TestFlight build is only needed when something in `ios/` changes (plugin, permission, icon, version).
