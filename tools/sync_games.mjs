#!/usr/bin/env node
/* Publishes the "Pick your podium" games to Supabase so the server can lock picks, bank the win chance and score from the official result.
   Source of truth stays in this repo: data/entries.js (entry lists + win chances), data/results.js (official results as "#NUMBER" lines)
   and each track's sessions (race start, qualifying window) -- the same inputs js/app.js reads.
     node tools/sync_games.mjs [--dry-run] [--year 2026]
   Needs SUPABASE_URL and SUPABASE_SERVICE_KEY (the service-role key: a GitHub Actions secret, never committed, never in the app). Without them it
   only prints what it would send. Idempotent (upsert by game_key). Never deletes a game: deleting one would delete everybody's picks. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DRY = process.argv.includes("--dry-run");
const YEAR = process.argv.includes("--year") ? process.argv[process.argv.indexOf("--year") + 1] : null;
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const ENTRIES = new Function(read("data/entries.js") + ";return ENTRIES")();
const RESULTS = new Function(read("data/results.js") + ";return RESULTS")();
const SERIES = new Function(read("data/series.js") + ";return SERIES")();
const tracks = {};
for (const f of fs.readdirSync(path.join(ROOT, "data"))) {
  if (!/^[a-z0-9-]+\.js$/.test(f) || ["champs.js", "series.js", "results.js", "entries.js", "standings.js", "watch.js"].includes(f)) continue;
  const T = []; try { new Function("TRACKS", read("data/" + f))(T); } catch (e) { continue; }
  if (T[0]) tracks[T[0].id] = T[0];
}
const seriesFor = (n) => SERIES.find((s) => s.match.test(n)) || null;
const kindOf = (n) => (/qualifying/i.test(n) ? "qualifying" : /practice/i.test(n) ? "practice" : "race");
const addDays = (d, n) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
/* a wall-clock time at a track (its IANA time zone) -> the real instant */
function localToDate(d, hm, tz) {
  const [y, m, dd] = d.split("-").map(Number), [h, mi] = hm.split(":").map(Number);
  const off = (ms) => { const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" }).formatToParts(new Date(ms)).map((x) => [x.type, x.value])); return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms; };
  const guess = Date.UTC(y, m - 1, dd, h, mi); let t = guess - off(guess); t = guess - off(t); return new Date(t);
}
const gameNum = (s) => { const m = /#(\d+)/.exec(s || ""); return m ? m[1] : null; };
function podiumOf(res, cls) {   // the same reading as gamePodium() in js/app.js
  const g = res.groups.find((x) => x.h.toLowerCase() === cls.toLowerCase()); if (!g) return null;
  if (g.order) { const exact = g.order.slice(0, 3).map(gameNum); return { exact, podium: exact.filter(Boolean) }; }
  const w = gameNum(g.winner), rest = (g.podium || []).map(gameNum).filter(Boolean);
  return { exact: [w], podium: [w].concat(rest).filter(Boolean) };
}
const games = [];
for (const g of ENTRIES) {
  if (YEAR && g.d.slice(0, 4) !== YEAR) continue;
  const t = tracks[g.t]; if (!t) { console.log(`skip ${g.t} ${g.d}: no such track`); continue; }
  const ss = (t.sessions || []).map((s) => ({ ...s, start: localToDate(s.d, s.s, t.tz) })).map((s) => ({ ...s, end: s.e ? localToDate(s.d, s.e, t.tz) : new Date(+s.start + 120 * 60000) })).sort((a, b) => a.start - b.start);
  const mine = ss.filter((s) => { const sr = seriesFor(s.n); return sr && sr.id === g.s; });
  const race = mine.find((s) => kindOf(s.n) === "race" && s.d >= g.d);
  if (!race) { console.log(`skip ${g.t} ${g.d} ${g.s}: no race session in the schedule yet`); continue; }
  const qs = mine.filter((s) => kindOf(s.n) === "qualifying" && s.d >= g.d && s.d <= addDays(g.d, 8));
  const entries = {}; for (const c of g.classes) { entries[c.h] = {}; for (const r of c.cars) entries[c.h][r[0]] = typeof r[4] === "number" ? r[4] : 10; }
  const res = RESULTS.filter((x) => x.t === g.t && x.d === g.d && x.s === g.s).pop() || null;
  let result = null;
  if (res) { result = {}; for (const c of g.classes) { const p = podiumOf(res, c.h); if (p) result[c.h] = p; } if (!Object.keys(result).length) result = null; }
  const ser = SERIES.find((s) => s.id === g.s);
  games.push({ game_key: `${g.t}|${g.d}|${g.s}`, track: g.t, series: g.s, event_start: g.d, title: `${t.short} · ${ser ? ser.name || g.s : g.s}`,
    quali_start: qs.length ? new Date(Math.min(...qs.map((s) => +s.start))).toISOString() : null, quali_end: qs.length ? new Date(Math.max(...qs.map((s) => +s.end))).toISOString() : null,
    race_start: race.start.toISOString(), entries, result, updated_at: new Date().toISOString() });
}
if (process.argv.includes("--json")) { console.log(JSON.stringify(games)); process.exit(0); }
console.log(`${games.length} game(s):`, games.map((g) => `${g.game_key}${g.result ? " (scored)" : ""}`).join(", ") || "none");
if (DRY || !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) { if (!DRY) console.log("SUPABASE_URL / SUPABASE_SERVICE_KEY not set: nothing sent"); if (DRY) console.log(JSON.stringify(games.slice(0, 1), null, 1).slice(0, 1500)); process.exit(0); }
const base = process.env.SUPABASE_URL.replace(/\/$/, "");
const r = await fetch(`${base}/rest/v1/games?on_conflict=game_key`, { method: "POST", headers: { apikey: process.env.SUPABASE_SERVICE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(games) });
if (!r.ok) { console.error("Supabase answered", r.status, (await r.text()).slice(0, 300)); process.exit(1); }
console.log("synced", games.length);
