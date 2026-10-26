#!/usr/bin/env node
/* Lists the "What to watch" updates that are due right now, for every series in the app (the schedule is the only input).
   Run by the recurring cloud routine (see CLAUDE.md "What to watch, every week"); prints JSON and exits 0, with {"due":[]} when nothing is due.
     node tools/due_updates.js [--now 2026-10-23T20:00:00Z] [--hours 48] [--ahead 8] [--text] [--results]
   Without --results it lists preview/after items (the "What to watch" routine); with --results only the "results" items
   (the "Results" routine, see CLAUDE.md).
   A due item is one (track, event, series) with the reason:
     "preview"     the series races at this track within --ahead days and has no entry at all for the event
     "after"       sessions of the series have ended (practice, qualifying, or a race that is not the last of the event) since the
                   newest entry for the event was written; listed in `sessions`
   An entry's age is its `at` stamp (ISO UTC, write it when you add the entry), else its `from` day, else its event start day.
   A session counts as ended 20 minutes after its end (results are published by then) and stays due for --hours hours (default 48).
   `suggestedFrom` (after items) is the `from` day to write: 14 hours before the newest session ended, so the entry shows for every time zone straight away.
   The last race of an event is not "due" for What to watch: results, standings and the podium game come from elsewhere.
     "refresh"     the series' NEXT event already has a preview entry, but the series raced somewhere else after that entry was written (e.g. the
                   Mexico City preview was written before the Austin race) and the race's results are in data/results.js and it ended 6 hours to 7 days
                   ago: the entry still talks about the old standings and stories, so write a NEW preview for the next event (see the routine's prompt)
     "results"     a race of a series WITHOUT automatic results (no `autoResults` in data/series.js: IMSA, Carrera Cup, F1 Academy ...)
                   ended at least 20 minutes ago (up to --hours) and data/results.js has no entry for it yet. An entry covers a race
                   when its `race` is the session's name; an older entry without `race` covers the series' last race of that event.
                   Write it from a published race report (never from live timing), with race:"<session name>". */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const RESULTS_ONLY = process.argv.includes("--results");
const NOW = new Date(arg("--now", new Date().toISOString())), HOURS = +arg("--hours", 48), AHEAD = +arg("--ahead", 8);
const load = (f, name, pre = "") => new Function(pre + fs.readFileSync(path.join(ROOT, f), "utf8") + `;return ${name}`)();
const SERIES = load("data/series.js", "SERIES"), WATCH = load("data/watch.js", "WATCH"), RESULTS = load("data/results.js", "RESULTS");
const NON = ["champs.js", "series.js", "results.js", "standings.js", "watch.js", "entries.js"];
const tracks = fs.readdirSync(path.join(ROOT, "data")).filter(f => f.endsWith(".js") && !NON.includes(f)).map(f => { const T = []; new Function("TRACKS", fs.readFileSync(path.join(ROOT, "data", f), "utf8"))(T); return T[0]; });
const kindOf = n => /qualifying/i.test(n) ? "qualifying" : /practice/i.test(n) ? "practice" : "race";
const seriesFor = n => SERIES.find(s => s.match.test(n)) || null;
const addDays = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
/* a wall-clock time in a time zone -> the UTC instant */
function at(d, hm, tz) {
  const [y, m, dd] = d.split("-").map(Number), [h, mi] = hm.split(":").map(Number), guess = Date.UTC(y, m - 1, dd, h, mi);
  const off = z => { const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(new Date(z)).map(x => [x.type, +x.value])); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - z; };
  let t = guess - off(guess); t = guess - off(t); return new Date(t);
}
const stamp = w => w.at ? new Date(w.at) : w.from ? new Date(w.from + "T00:00:00Z") : new Date(w.d + "T00:00:00Z");
/* the series' most recent finished event: its last race and when it ended (for "refresh") */
const REFRESH_WAIT_H = 6, REFRESH_DAYS = 7, prevEvent = {};
for (const t of tracks) for (const ev of t.events || []) {
  const end = addDays(ev.d, (ev.t || 1) - 1), races = {};
  for (const s of (t.sessions || []).filter(x => x.d >= ev.d && x.d <= end)) { const sr = seriesFor(s.n); if (!sr || kindOf(s.n) !== "race") continue; const st = at(s.d, s.s, t.tz), en = s.e ? at(s.d, s.e, t.tz) : new Date(st.getTime() + 3600e3); if (!races[sr.id] || en > races[sr.id].end) races[sr.id] = { end: en, t: t.id, d: ev.d, event: ev.e }; }
  for (const [id, r] of Object.entries(races)) if (r.end < NOW && (!prevEvent[id] || r.end > prevEvent[id].end)) prevEvent[id] = r;
}
const due = [];
for (const t of tracks) {
  for (const ev of t.events || []) {
    const end = addDays(ev.d, (ev.t || 1) - 1), sess = (t.sessions || []).filter(s => s.d >= ev.d && s.d <= end);
    const bySeries = {};
    for (const s of sess) { const sr = seriesFor(s.n); if (!sr) continue; const st = at(s.d, s.s, t.tz); (bySeries[sr.id] = bySeries[sr.id] || { sr, list: [] }).list.push({ n: s.n, kind: kindOf(s.n), start: st, end: s.e ? at(s.d, s.e, t.tz) : new Date(st.getTime() + 3600e3) }); if (s.e && s.e <= s.s) bySeries[sr.id].list.at(-1).end = new Date(bySeries[sr.id].list.at(-1).end.getTime() + 86400e3); }
    for (const { sr, list } of Object.values(bySeries)) {
      list.sort((a, b) => a.start - b.start);
      if (!sr.autoResults) {          // races whose result nobody has written yet
        const res = RESULTS.filter(r => r.t === t.id && r.d === ev.d && r.s === sr.id), races = list.filter(x => x.kind === "race");
        const missing = races.filter((x, i) => NOW - x.end >= 20 * 60e3 && NOW - x.end <= HOURS * 3600e3 &&
          !res.some(r => r.race ? r.race === x.n : i === races.length - 1));
        if (missing.length) due.push({ t: t.id, d: ev.d, event: ev.e, s: sr.id, series: sr.name, why: "results", sessions: missing.map(x => ({ n: x.n, kind: x.kind, ended: x.end.toISOString() })) });
      }
      const entries = WATCH.filter(w => w.t === t.id && w.d === ev.d && w.s === sr.id), newest = entries.map(stamp).sort((a, b) => b - a)[0] || null;
      const daysTo = (new Date(ev.d + "T00:00:00Z") - NOW) / 864e5;
      if (!entries.length && daysTo <= AHEAD && NOW <= new Date(end + "T23:59:59Z")) { due.push({ t: t.id, d: ev.d, event: ev.e, s: sr.id, series: sr.name, why: "preview", sessions: list.map(x => ({ n: x.n, start: x.start.toISOString() })) }); continue; }
      if (!entries.length) continue;       // an older event of a series nobody wrote a preview for: not worth a late entry
      const pv = prevEvent[sr.id];
      if (pv && (pv.t !== t.id || pv.d !== ev.d) && list[0].start > NOW && pv.end > newest && NOW - pv.end >= REFRESH_WAIT_H * 3600e3 && NOW - pv.end <= REFRESH_DAYS * 864e5 && RESULTS.some(r => r.s === sr.id && r.t === pv.t && r.d === pv.d)) {
        due.push({ t: t.id, d: ev.d, event: ev.e, s: sr.id, series: sr.name, why: "refresh", previous: { t: pv.t, d: pv.d, event: pv.event, ended: pv.end.toISOString() }, lastEntry: { from: entries.at(-1).from || null, at: entries.at(-1).at || null, asOf: String(entries.at(-1).asOf).slice(0, 90) }, suggestedFrom: NOW.toISOString().slice(0, 10), sessions: list.map(x => ({ n: x.n, start: x.start.toISOString() })) });
        continue;
      }
      const lastRaceIdx = list.map(x => x.kind).lastIndexOf("race");
      const done = list.filter((x, i) => NOW - x.end >= 20 * 60e3 && NOW - x.end <= HOURS * 3600e3 && x.end > newest && !(x.kind === "race" && i === lastRaceIdx));
      if (done.length) due.push({ t: t.id, d: ev.d, event: ev.e, s: sr.id, series: sr.name, why: "after", lastEntry: { from: entries.at(-1).from || null, at: entries.at(-1).at || null, asOf: String(entries.at(-1).asOf).slice(0, 90) }, suggestedFrom: new Date(Math.max(...done.map(x => +x.end)) - 14 * 3600e3).toISOString().slice(0, 10), sessions: done.map(x => ({ n: x.n, kind: x.kind, ended: x.end.toISOString() })) });
    }
  }
}
{ const keep = due.filter(x => (x.why === "results") === RESULTS_ONLY); due.length = 0; due.push(...keep); }
due.sort((a, b) => a.d.localeCompare(b.d) || a.s.localeCompare(b.s));
if (process.argv.includes("--text")) { console.log(`now ${NOW.toISOString()}: ${due.length} due`); for (const x of due) console.log(`- ${x.t} ${x.d} ${x.s} (${x.why}): ${x.sessions.map(s => s.n).join("; ")}`); }
else console.log(JSON.stringify({ now: NOW.toISOString(), due }, null, 1));
