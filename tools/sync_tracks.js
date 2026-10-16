#!/usr/bin/env node
/* The track list lives in three places: the data/<id>.js files themselves, the <script> tags in index.html and the TRACKS array in sw.js
   (what gets saved for offline). The data folder is the source of truth: this rewrites the other two to match it, keeping the existing
   order and appending new tracks at the end.
   Usage: node tools/sync_tracks.js            rewrite index.html and sw.js
          node tools/sync_tracks.js --check    only report (exit 1 when they differ)
   build.sh runs it before validating, so a track file added without registering it still deploys correctly. */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, ".."), NON_TRACK = ["champs.js", "series.js", "results.js", "standings.js", "watch.js", "entries.js"];
const read = (f) => fs.readFileSync(path.join(ROOT, f), "utf8");
const ids = fs.readdirSync(path.join(ROOT, "data")).filter((f) => f.endsWith(".js") && !NON_TRACK.includes(f)).map((f) => f.slice(0, -3));
const html = read("index.html"), sw = read("sw.js");

const a = html.indexOf("const TRACKS = [], TRACK_MAPS = {};</script>"), start = a < 0 ? -1 : html.indexOf("\n", a) + 1, end = html.indexOf('<script src="data/series.js"></script>');
if (a < 0 || end < start) { console.error("sync_tracks: cannot find the track <script> region in index.html"); process.exit(2); }
const region = html.slice(start, end), current = [...region.matchAll(/<script src="data\/([a-z0-9-]+)\.js"><\/script>/g)].map((m) => m[1]);
const swCur = ((sw.match(/const TRACKS = \[(.*?)\];/s) || [])[1] || "").match(/"([a-z0-9-]+)"/g) || [];
const order = [...current.filter((i) => ids.includes(i)), ...ids.filter((i) => !current.includes(i)).sort()];
const swOrder = [...swCur.map((x) => x.slice(1, -1)).filter((i) => ids.includes(i)), ...ids.filter((i) => !swCur.map((x) => x.slice(1, -1)).includes(i)).sort()];

const newRegion = order.map((i) => `<script src="data/${i}.js"></script>\n`).join("");
const newHtml = html.slice(0, start) + newRegion + html.slice(end);
const newSw = sw.replace(/const TRACKS = \[.*?\];/s, "const TRACKS = [" + swOrder.map((i) => `"${i}"`).join(",") + "];");
const diffs = [];
if (newHtml !== html) diffs.push("index.html track <script> tags");
if (newSw !== sw) diffs.push("sw.js TRACKS");
if (process.argv.includes("--check")) { if (diffs.length) { console.error("sync_tracks: out of sync with data/: " + diffs.join(", ") + " (run: node tools/sync_tracks.js)"); process.exit(1); } console.log("sync_tracks: in sync (" + ids.length + " tracks)"); process.exit(0); }
if (newHtml !== html) fs.writeFileSync(path.join(ROOT, "index.html"), newHtml);
if (newSw !== sw) fs.writeFileSync(path.join(ROOT, "sw.js"), newSw);
console.log(diffs.length ? "sync_tracks: updated " + diffs.join(", ") : "sync_tracks: already in sync (" + ids.length + " tracks)");
