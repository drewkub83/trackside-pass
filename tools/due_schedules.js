#!/usr/bin/env node
/* Lists the race weekends whose session times are missing, 21 days before they start (and every day after, until they are in).
   Run by the recurring cloud routine "Trackside Pass: Schedule check" (see CLAUDE.md "Session schedules"); prints JSON and exits 0,
   with {"due":[]} when nothing is missing.
     node tools/due_schedules.js [--now 2026-10-28T14:00:00Z] [--ahead 21] [--text]
   A due item is one (track, event) of a main series (a CHAMPS entry that is not viaSupport) that starts within --ahead days (or is on
   now) and has no session in data/<track>.js (`sessions`) whose name matches that series' `match`. `support` lists the support series
   named in the event's `support` list that have no session either (written together with the main series, from the same timetable).
   `late` is true from 3 days before the start: the routine then says so in its answer so the owner can look.
   Venues that are only a `stops` entry in data/champs.js ("Map coming soon") have no track file, so they are not listed here. */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : d; };
const NOW = new Date(arg("--now", new Date().toISOString())), AHEAD = +arg("--ahead", 21);
const CHAMPS = new Function(fs.readFileSync(path.join(ROOT, "data/champs.js"), "utf8") + ";return CHAMPS")();
const NON = ["champs.js", "series.js", "results.js", "standings.js", "watch.js", "entries.js"];
const tracks = fs.readdirSync(path.join(ROOT, "data")).filter(f => f.endsWith(".js") && !NON.includes(f)).map(f => { const T = []; new Function("TRACKS", fs.readFileSync(path.join(ROOT, "data", f), "utf8"))(T); return T[0]; });
const addDays = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const inChamp = (c, e) => { const hay = c.viaSupport ? (e.support || []).join(" | ") : (e.s || ""); return c.match.test(hay) && !(c.skip && c.skip.test(hay)); };
const due = [], today = NOW.toISOString().slice(0, 10);
for (const t of tracks) for (const ev of t.events || []) {
  const end = addDays(ev.d, (ev.t || 1) - 1), daysTo = Math.round((new Date(ev.d + "T00:00:00Z") - new Date(today + "T00:00:00Z")) / 864e5);
  if (daysTo > AHEAD || end < today) continue;
  const sess = (t.sessions || []).filter(s => s.d >= ev.d && s.d <= end);
  const has = c => sess.some(s => c.match.test(s.n));
  const main = CHAMPS.filter(c => !c.viaSupport && inChamp(c, ev)), sup = CHAMPS.filter(c => c.viaSupport && inChamp(c, ev));
  const missMain = main.filter(c => !has(c)); if (!missMain.length) continue;
  due.push({ t: t.id, tz: t.tz, d: ev.d, end, event: ev.e, days: daysTo, series: missMain.map(c => ({ id: c.id, name: c.name, full: c.full })),
    support: sup.filter(c => !has(c)).map(c => ({ id: c.id, name: c.name, full: c.full })), haveSessions: sess.length, late: daysTo <= 3 });
}
due.sort((a, b) => a.d.localeCompare(b.d) || a.t.localeCompare(b.t));
if (process.argv.includes("--text")) { console.log(`now ${NOW.toISOString()}: ${due.length} due`); for (const x of due) console.log(`- ${x.t} ${x.d} (${x.days}d${x.late ? ", LATE" : ""}) ${x.event}: ${x.series.map(s => s.name).join(", ")}${x.support.length ? " + " + x.support.map(s => s.name).join(", ") : ""}`); }
else console.log(JSON.stringify({ now: NOW.toISOString(), due }, null, 1));
