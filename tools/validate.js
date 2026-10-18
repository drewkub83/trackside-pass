#!/usr/bin/env node
/* Checks the app's files for the mistakes that would break it on a phone: syntax errors, data that does not load or points at
   something that does not exist, tracks missing from the service worker or index.html, sessions outside their event.
   Run by build.sh on every Netlify deploy (a failure stops the deploy, so the site keeps serving the last good version) and by
   the GitHub jobs before they push. Errors exit 1; warnings only print.
   Usage: node tools/validate.js        Skip in an emergency with SKIP_VALIDATE=1 (build.sh honours it). */
const fs = require("fs"), path = require("path"), vm = require("vm"), cp = require("child_process");
const ROOT = path.join(__dirname, "..");
const errors = [], warns = [];
const err = (m) => errors.push(m), warn = (m) => warns.push(m);
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const exists = (f) => fs.existsSync(path.join(ROOT, f));

/* 1. syntax of every script the app runs */
for (const f of ["js/app.js", "js/passport.js", "js/native.js", "sw.js"]) {
  try { new vm.Script(read(f), { filename: f }); } catch (e) { err(`${f}: syntax error: ${e.message}`); }
}
for (const f of ["gtwce", "ytlive"]) { try { cp.execFileSync(process.execPath, ["--check", path.join(ROOT, `netlify/functions/${f}.mjs`)], { stdio: "pipe" }); } catch (e) { err(`netlify/functions/${f}.mjs: syntax error`); } }

/* 2. data files load */
const NON_TRACK = ["champs.js", "series.js", "results.js", "standings.js", "watch.js", "entries.js"];
const loadGlobal = (file, name, prelude = "") => {
  try { return new Function(prelude + read(file) + `;return typeof ${name}!=="undefined"?${name}:undefined`)(); }
  catch (e) { err(`${file}: does not load: ${e.message}`); return undefined; }
};
const SERIES = loadGlobal("data/series.js", "SERIES") || [];
const CHAMPS = loadGlobal("data/champs.js", "CHAMPS") || [];
const WATCH = loadGlobal("data/watch.js", "WATCH") || [];
const RESULTS = loadGlobal("data/results.js", "RESULTS", "const SERIES=[];") || [];
const STANDINGS = loadGlobal("data/standings.js", "STANDINGS") || [];
const ENTRIES = loadGlobal("data/entries.js", "ENTRIES") || [];
const trackFiles = fs.readdirSync(path.join(ROOT, "data")).filter((f) => f.endsWith(".js") && !NON_TRACK.includes(f));
const tracks = {};
for (const f of trackFiles) {
  const T = []; try { new Function("TRACKS", read("data/" + f))(T); } catch (e) { err(`data/${f}: does not load: ${e.message}`); continue; }
  const t = T[0]; if (!t) { err(`data/${f}: defines no track`); continue; }
  if (t.id !== f.slice(0, -3)) err(`data/${f}: track id "${t.id}" does not match the file name`);
  for (const k of ["id", "short", "path", "tz"]) if (!t[k]) err(`${t.id}: missing "${k}"`);
  if (!Array.isArray(t.events) || !t.events.length) err(`${t.id}: no events`);
  tracks[t.id] = t;
}

/* 3. tracks: maps exist, events and sessions are consistent, lap records complete */
const endDay = (e) => { const d = new Date(e.d + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + (e.t || 1) - 1); return d.toISOString().slice(0, 10); };
for (const t of Object.values(tracks)) {
  if (!exists(`data/maps/${t.id}.js`)) err(`${t.id}: data/maps/${t.id}.js is missing`);
  for (const e of t.events || []) if (!/^\d{4}-\d\d-\d\d$/.test(e.d || "") || !e.e) err(`${t.id}: bad event ${JSON.stringify(e).slice(0, 80)}`);
  for (const s of t.sessions || []) {
    if (!/^\d{4}-\d\d-\d\d$/.test(s.d || "") || !/^\d\d:\d\d$/.test(s.s || "") || !s.n) { err(`${t.id}: bad session ${JSON.stringify(s).slice(0, 80)}`); continue; }
    if (!(t.events || []).some((e) => s.d >= e.d && s.d <= endDay(e))) err(`${t.id}: session "${s.n}" on ${s.d} is outside every event`);
    if (s.e && s.e <= s.s && s.e !== "00:00") warn(`${t.id}: session "${s.n}" ends before it starts (${s.s}-${s.e})`);
  }
  for (const r of t.lapRecord || []) if (!r.series || !r.time || !r.who) err(`${t.id}: incomplete lapRecord ${JSON.stringify(r).slice(0, 80)}`);
}

/* 4. cross references between data files */
const seriesIds = new Set(SERIES.map((s) => s.id));
for (const w of WATCH) { if (!tracks[w.t]) err(`watch: unknown track "${w.t}"`); if (!seriesIds.has(w.s)) err(`watch: unknown series "${w.s}" (${w.t} ${w.d})`); if (!w.asOf || !w.groups || !w.groups.length) err(`watch: incomplete entry ${w.t} ${w.d} ${w.s}`); }
for (const r of RESULTS) { if (!tracks[r.t]) err(`results: unknown track "${r.t}"`); if (!seriesIds.has(r.s)) err(`results: unknown series "${r.s}" (${r.t} ${r.d})`); if (!r.groups || !r.groups.length) err(`results: empty entry ${r.t} ${r.d} ${r.s}`); }
for (const s of STANDINGS) { if (!seriesIds.has(s.s)) err(`standings: unknown series "${s.s}"`); if (!s.asOf || !s.classes || !s.classes.length) err(`standings: incomplete entry for ${s.s}`); }
for (const e of ENTRIES) {
  if (!tracks[e.t]) err(`entries: unknown track "${e.t}"`); if (!seriesIds.has(e.s)) err(`entries: unknown series "${e.s}"`);
  const nums = new Set();
  for (const c of e.classes || []) for (const r of c.cars || []) {
    if (!Array.isArray(r) || r.length < 4) { err(`entries: bad car row in ${e.t} ${c.h}`); continue; }
    if (nums.has(r[0])) err(`entries: car #${r[0]} appears twice in ${e.t} ${e.d}`); nums.add(r[0]);
  }
  if (!nums.size) warn(`entries: ${e.t} ${e.d} has no cars yet`);
}
for (const c of CHAMPS) if (c.guide && !seriesIds.has(c.guide)) err(`champs: "${c.id}" points at unknown series guide "${c.guide}"`);

/* 5. service worker and index.html agree with the data folder */
const sw = read("sw.js"), html = read("index.html");
const swTracks = ((sw.match(/const TRACKS = \[(.*?)\];/s) || [])[1] || "").match(/"([a-z0-9-]+)"/g) || [];
const swSet = new Set(swTracks.map((x) => x.slice(1, -1)));
for (const id of Object.keys(tracks)) {
  if (!swSet.has(id)) err(`sw.js: TRACKS does not list "${id}", so it will not work offline (run: node tools/sync_tracks.js)`);
  if (!html.includes(`data/${id}.js`)) err(`index.html: no <script> for data/${id}.js (run: node tools/sync_tracks.js)`);
}
for (const id of swSet) if (!tracks[id]) err(`sw.js: TRACKS lists "${id}" but data/${id}.js does not exist (run: node tools/sync_tracks.js)`);
const shell = ((sw.match(/const SHELL = \[(.*?)\n\];/s) || [])[1] || "").match(/"([^"]+\.[a-z0-9]+)"/g) || [];
for (const q of shell) { const f = q.slice(1, -1); if (!f.startsWith("data/\" +") && !exists(f)) err(`sw.js: SHELL lists "${f}" which does not exist`); }
for (const m of html.matchAll(/<script src="([^"]+)"/g)) if (!exists(m[1])) err(`index.html: <script src="${m[1]}"> does not exist`);
for (const m of ["data/entries.js", "data/standings.js", "data/results.js", "data/watch.js"]) if (!sw.includes(`"${m}"`)) err(`sw.js: SHELL does not cache ${m}`);
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]); const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
if (dup.length) err(`index.html: duplicate ids ${[...new Set(dup)].join(", ")}`);
const fontLink = ((html.match(/href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"/) || [])[1] || "").replace(/&amp;/g, "&");
if (!fontLink || !sw.includes(fontLink)) err("fonts: the <link> in index.html and FONT_CSS in sw.js differ, so fonts will not work offline");

/* 6. every localStorage key lives in the K table at the top of js/app.js (index.html's tiny pre-paint script is the one allowed exception) */
{
  const appSrc = read("js/app.js"), kBlock = (appSrc.match(/const K=\{[\s\S]*?\n\};/) || [""])[0];
  if (!kBlock) err("js/app.js: the K storage-key table is missing");
  const rest = { "js/app.js": appSrc.replace(kBlock, "").replace(/const K_RETIRED=\[.*?\];/, ""), "js/passport.js": read("js/passport.js"), "js/native.js": read("js/native.js") };
  for (const [f, src] of Object.entries(rest)) {
    const hits = src.match(/["'`]paddock:[^"'`]*["'`]/g);
    if (hits) err(`${f}: storage key literal(s) ${[...new Set(hits)].join(", ")} outside the K table: add the key to K in js/app.js and use K.name`);
  }
}

for (const w of warns) console.log("warning: " + w);
if (errors.length) { console.error(`\nvalidate: ${errors.length} problem(s)`); errors.forEach((e) => console.error("  x " + e)); process.exit(1); }
console.log(`validate: ok (${Object.keys(tracks).length} tracks, ${WATCH.length} watch, ${RESULTS.length} results, ${STANDINGS.length} standings, ${ENTRIES.length} entries${warns.length ? ", " + warns.length + " warning(s)" : ""})`);
