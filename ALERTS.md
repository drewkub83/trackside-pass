# Routine alerts

Cloud routines add an entry here when they cannot do their job (a tool crashes, a push fails, a source changed shape), and they also send the owner one short phone notification. **At the start of every session in this repo, read this file and fix every OPEN entry** (find the cause, fix it, run `node tools/validate.js`, push), then move the entry to RESOLVED with a line saying what was done. Routines never edit tool files themselves; they only append here.

Entry format (newest first, under OPEN):
`- 2026-11-27T12:23Z | <routine name> | <command or step that failed> | <the exact error line> | <what it did instead>`

## OPEN

- 2026-11-28T17:22Z | What to watch dispatcher | `node tools/due_updates.js` still flags sebring 2026-12-02 s:"nascar" why:"preview" (same cause, still unfixed, >24h since the 2026-11-27T14:30Z entry below) | not an error line -- same root cause: the NASCAR Cup Series match regex `/NASCAR/i` in data/series.js (id:"nascar") matches the HSR session names "Qualifying 1/2 - HSR NASCAR Classic" etc. at the HSR Sebring Classic 12 Hour (vintage/historic HSR weekend, data/sebring.js events d:"2026-12-02"), not a real NASCAR Cup Series race. | Again did not write a preview (no real Cup Series race exists to preview). Will keep re-surfacing hourly and re-alerting about once a day until the regex or session names are fixed; see the 2026-11-27T14:30Z entry for the suggested fix.
- 2026-11-27T14:30Z | What to watch dispatcher | `node tools/due_updates.js` flags sebring 2026-12-02 s:"nascar" why:"preview" | not an error line -- the NASCAR Cup Series match regex `/NASCAR/i` in data/series.js (id:"nascar") matches the session name "Qualifying 1/2 - HSR NASCAR Classic" etc. at the HSR Sebring Classic 12 Hour (a vintage/historic HSR weekend, noWatch, data/sebring.js events d:"2026-12-02"), a class of classic stock cars inside an HSR meeting, not a real NASCAR Cup Series race. | Did not write a What to watch preview for it (there is no real Cup Series race to preview, and inventing one would be false); this will re-surface as "due" every hour until fixed. Likely fix: rename the HSR session(s) to avoid the literal word "NASCAR" (the same way the O'Reilly/Craftsman Trucks support series already do, per CLAUDE.md), or exclude HSR-prefixed session names from the nascar match in data/series.js/tools/due_updates.js.

## RESOLVED

- 2026-11-27T12:23Z | What to watch dispatcher | `node tools/due_updates.js` | `TypeError: Cannot read properties of undefined (reading 'events')` | Fixed the same day: the new `data/news.js` was being read as a track file; `news.js` added to every tool's list of non-track files (commit dad947f).
