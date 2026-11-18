# Anonymous usage counts (Nov 18 2026)

Why: to see whether people come back, which screens they use, and what is worth charging for (see the pricing plan).

**What is sent** (`js/usage.js`): a random device number kept on the phone (`paddock:usageId`, not linked to an account, name, email or location), the platform (`ios`, `android`, `pwa`, `web`) and an event: `open` (app start, or back after 30 minutes away), `screen` (home, play, account, settings, passport, detail ...), `track` (a track opened), `pick` (a podium pick saved, with the series), `going`, `directions`, `checkin` (a passport stamp). No IP address is stored in the table. Off in Settings > Your data > Share anonymous usage (`K.usageOff`); never sent from localhost or with developer tools on. `privacy.html` says so.

**One-time setup**: run `supabase/schema.sql` again in the Supabase SQL editor (the new section at the end creates `usage_events` and `track_events()`). Nobody can read the table through the API; read it in the SQL editor.

**Questions to ask the data** (paste into the SQL editor; `day` is UTC):
```sql
-- people per day and opens
select day, count(distinct did) as people, count(*) filter (where ev='open') as opens from usage_events group by day order by day desc limit 30;
-- weekly active people, and how many of last week's came back this week
with w as (select did, date_trunc('week', day) as wk from usage_events where ev='open' group by 1,2)
select a.wk, count(*) as people, count(b.did) as came_back_next_week from w a left join w b on b.did=a.did and b.wk=a.wk+interval '7 days' group by a.wk order by a.wk desc;
-- most used screens and tracks, last 30 days
select ev, arg, count(distinct did) as people, count(*) as times from usage_events where day>current_date-30 and ev in ('screen','track') group by 1,2 order by people desc limit 30;
-- picks and check-ins
select ev, arg, count(distinct did) as people, count(*) from usage_events where ev in ('pick','checkin','going','directions') group by 1,2 order by 3 desc;
-- how people use it: phone app, home-screen web app, or browser
select plat, count(distinct did) from usage_events group by 1;
```
To delete old rows: `delete from usage_events where day < current_date - 400;`

## Feedback button (Nov 18 2026)
Settings > Send feedback opens a form (Idea / Problem / Other, a message up to 1,000 characters, an optional email or name for a reply). It calls `send_feedback()` (`supabase/schema.sql`, same one-time re-run), which stores a row in `feedback` with the random device number, the screen, the platform, the screen size and a shortened browser string; at most 5 notes per device per day. Nobody can read the table through the API. Read it in the SQL editor:
```sql
select at, kind, msg, contact, ctx->>'screen' as screen, ctx->>'track' as track, ctx->>'plat' as plat from feedback order by at desc;
```
It is not wired to email or push yet; check the table after a race weekend, or ask for a daily summary.

## Daily feedback email (Nov 19 2026)
`.github/workflows/feedback-digest.yml` runs `tools/feedback_digest.mjs` every day at 13:00 UTC (8 am New York in winter, 9 am in summer). It emails the notes not yet sent (`feedback.digested_at is null`), then marks them sent; with no new notes it sends nothing, except on Mondays, when it sends last week's usage totals (`daily_stats()`). The repository is public, so the script prints counts only: never a note, name or email address.

One-time setup (the first two steps once):
1. Re-run `supabase/schema.sql` in the Supabase SQL editor (adds `digested_at` and `daily_stats()`).
2. Make a free Resend account (resend.com) with the email address you want the digest sent to, and create an API key. The free sandbox sender (`onboarding@resend.dev`) can only send to that same address, which is what we want.
3. GitHub > the repository > Settings > Secrets and variables > Actions: add `RESEND_API_KEY` (the key) and `DIGEST_TO` (your email). `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` already exist for the games sync.
4. Test: Actions tab > Feedback digest > Run workflow. Send a note from the app first; on a Tuesday to Sunday with no notes it correctly says "nothing new".
`node tools/feedback_digest.mjs --dry` prints a sample email locally.
