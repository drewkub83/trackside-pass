# Routine alerts

Cloud routines add an entry here when they cannot do their job (a tool crashes, a push fails, a source changed shape), and they also send the owner one short phone notification. **At the start of every session in this repo, read this file and fix every OPEN entry** (find the cause, fix it, run `node tools/validate.js`, push), then move the entry to RESOLVED with a line saying what was done. Routines never edit tool files themselves; they only append here.

Entry format (newest first, under OPEN):
`- 2026-11-27T12:23Z | <routine name> | <command or step that failed> | <the exact error line> | <what it did instead>`

## OPEN

## RESOLVED

- 2026-11-27T12:23Z | What to watch dispatcher | `node tools/due_updates.js` | `TypeError: Cannot read properties of undefined (reading 'events')` | Fixed the same day: the new `data/news.js` was being read as a track file; `news.js` added to every tool's list of non-track files (commit dad947f).
