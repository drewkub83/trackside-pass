# Android beta on Google Play (Nov 19 2026)

State: `android/` builds a signed release bundle (`app-release.aab`) with the release key in `~/.trackside/` (back that key up: Google's "upload key" is this one). Application id `com.tracksidepass.app`, versionCode 6 / versionName 1.5 (every Play upload needs a higher versionCode than the last: `android/app/build.gradle`). Push works through Firebase (`android/app/google-services.json`, gitignored; the server side `supabase/functions/push` already sends FCM). **This repo sits on the Desktop, which iCloud syncs: Gradle builds inside it fail with 'Duplicate resources' errors because iCloud makes copies named `... 2.xml`.** Build from a copy outside iCloud instead: `rsync -a --exclude build --exclude .gradle --exclude '* 2.*' android node_modules package.json capacitor.config.json www-shell ~/trackside-android-build/`, then run the Gradle command in `~/trackside-android-build/android`. Built Nov 19 2026: `~/Downloads/TracksidePass-1.5-code6.aab` (versionCode 6). Build recipe: `npx cap sync android`, then in `android/`: `JAVA_HOME=~/Library/Java/JavaVirtualMachines/jbr-21.0.11/Contents/Home ./gradlew bundleRelease` (output `android/app/build/outputs/bundle/release/app-release.aab`).

## 1. The developer account (once)
play.google.com/console > create a developer account ($25 one time). Google verifies your identity (ID, sometimes a phone and address): this can take a few days, so start now. Choose **Personal** unless you have a registered business. Personal accounts created recently must run a closed test with a minimum number of testers (currently 12, for 14 days in a row) before they may publish to production: confirm the current numbers on the Play Console "Production access" page. That does not stop a beta.

## 2. Create the app
Play Console > Create app: name "Trackside Pass", English (US), **App**, **Free**, accept the declarations.

## 3. Set up the app (Dashboard > "Set up your app"; paste these answers)
- **Privacy policy:** `https://tracksidepass.com/privacy.html`
- **App access:** all functionality is available without special access (an account is optional, no login needed to review).
- **Ads:** no ads.
- **Content rating:** answer the IARC questionnaire honestly: no violence, no gambling with money (Pick your podium is a free game with no prizes or purchases), users can see each other's chosen names and photos (friends) but there is no chat.
- **Target audience:** 13 and over (the privacy policy says accounts are for 13+). Not designed for children.
- **Data safety** (must match `ios/App/App/PrivacyInfo.xcprivacy`): collected: email and name (account, optional), user IDs, device or other IDs (push token, random anonymous number), app interactions (anonymous usage counts), photos (the optional profile picture), other user content (podium picks, feedback notes). Precise location is used on the phone only and is not collected. Approximate location IS collected (optional, app functionality, linked to the account): a signed-in check-in saves which track and which day. Data is encrypted in transit. Users can ask for deletion: Settings > Your data > Delete my account, or by email. No data is sold or shared for advertising.
- **Government app, financial features, health, news:** none.

## 4. Upload the build and make a test link
1. Testing > **Internal testing** > Create new release > accept **Play App Signing** > upload `app-release.aab` > release notes ("First beta") > Save and Roll out.
2. Internal testing > Testers tab > make an email list and add testers' **Gmail** addresses (up to 100; it is the Google account on their phone). Copy the **opt-in link** from that page. Testers open it on their phone, tap Become a tester, then install from Google Play. Available within minutes, no review.
3. For more people than you can list, or for the 14-day production-access requirement, use **Closed testing** (email lists or a Google Group) with the same bundle. **Open testing** gives a public Play Store listing anyone can join, but needs a store listing (description, 2+ phone screenshots, icon 512x512, feature graphic 1024x500) and a Google review.

## 5. Things to know
- A Play install is signed by Google's key, not the October APK's: friends who sideloaded `TracksidePass.apk` must uninstall it first, then install from Play.
- Keep `downloads/TracksidePass.apk` only for people who cannot use Play; it will not update once they move to Play.
- The first review of a new app can take a few days; internal testing is usually immediate.
- After the link exists, add a "Join the Android beta" button to `welcome/index.html` next to the iPhone one (the opt-in link needs a Google account).

## 6. Status (Nov 19 2026)
Build is ready (see above). Closed test live (Nov 21 2026): opt-in link https://play.google.com/apps/testing/com.tracksidepass.app works for accounts on the "Beta Testers" list; the landing page offers a mailto request for access.
