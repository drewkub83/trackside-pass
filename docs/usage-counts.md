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
