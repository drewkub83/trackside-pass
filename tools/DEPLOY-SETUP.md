# One-time setup: automatic deploys

This makes `tools/deploy.sh` able to publish `dist/` straight to Netlify, with nothing dragged by hand. It needs one thing only you can create: a Netlify **Personal Access Token**.

1. Go to https://app.netlify.com/user/applications and sign in (your existing Netlify account — this doesn't create a new one).
2. Under **Personal access tokens**, click **New access token**. Name it something like "Trackside Pass auto-deploy". Copy the token it shows you (it's only shown once).
3. Paste that token into the chat. It gets saved to `tools/.netlify-token` on this Mac only — never typed into any website, never sent anywhere except Netlify's own deploy API.
4. Tell me which Netlify site this is (the site name shown in your Netlify dashboard, e.g. `trackside-pass`, or the URL it's live at) so deploys land on the right one instead of creating a new site.

After that, every future update — the weekly standings refresh, new tracks, anything — publishes itself. No more dragging `dist/` anywhere.

**To revoke it later:** delete `tools/.netlify-token`, and remove the token from the Netlify page in step 1.
