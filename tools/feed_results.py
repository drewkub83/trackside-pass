#!/usr/bin/env python3
"""Official race results for the series that have a results feed (/api/session: netlify/functions/session.mjs) but no results reader of their own:
F1 Academy, Porsche Carrera Cup North America, FIA Formula 2 and Formula 3. Called by tools/auto_update.py on every run (every 30 minutes Thursday to Monday).

Which races are missing: `node tools/due_updates.js --results` lists every finished race (20 minutes to 48 hours old) of a series without `autoResults` that has no entry in
data/results.js yet. For each one of the series above this script asks the feed for that session and, when the feed's answer is good enough, writes the entry (top ten,
note starting with "(automatic update)"). Good enough means:
  F1 Academy, F2, F3   the series' own page marks the result official (`resultOfficial`)
  Carrera Cup          the results page lists the race, at least 5 cars, and the race ended 60 minutes ago or more (the page has no official flag)
If the feed has nothing yet, nothing is written and the next run tries again; the hourly Results routine (reads race reports) stays as the fallback for anything still missing after that.
Idempotent. Options: --now 2026-10-25T20:00:00Z (pretend), --dry-run, --site https://tracksidepass.com (where /api/session lives).
Needs node and python 3.9+ (stdlib only)."""
import sys, os, re, json, subprocess, datetime, urllib.request, urllib.parse
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
A = sys.argv[1:]; DRY = "--dry-run" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
NOW = opt("--now"); SITE = opt("--site", "https://tracksidepass.com")
FEEDS = {"f1academy", "carrera", "f2", "f3"}
MARK = "(automatic update) "

def node_json(*args):
    r = subprocess.run(["node"] + list(args), capture_output=True, text=True, cwd=D.ROOT)
    return json.loads(r.stdout) if r.returncode == 0 and r.stdout.strip().startswith("{") else {}
def feed(s, date, name, track):
    q = urllib.parse.urlencode({"s": s, "date": date, "name": name, "track": track})
    try:
        with urllib.request.urlopen(urllib.request.Request(f"{SITE}/api/session?{q}", headers={"User-Agent": "Trackside Pass data tools"}), timeout=40) as r: return json.loads(r.read().decode("utf8"))
    except Exception as e:
        print("  feed failed:", e); return None
def session_day(track, event_day, n):
    """The calendar day (track time) of the session named `n` in that event, from the track's own data file."""
    js = f"const fs=require('fs');const T=[];new Function('TRACKS',fs.readFileSync('data/{track}.js','utf8'))(T);const t=T[0];const ev=(t.events||[]).find(e=>e.d==={json.dumps(event_day)});" \
         f"const end=new Date(ev.d+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+(ev.t||1)-1);const e=end.toISOString().slice(0,10);" \
         f"const s=(t.sessions||[]).find(x=>x.n==={json.dumps(n)}&&x.d>=ev.d&&x.d<=e);console.log(JSON.stringify({{d:s?s.d:null}}))"
    return node_json("-e", js).get("d")
def entry(item, n, day, data):
    rows = [x for x in data["result"] if str(x.get("pos", "")).isdigit()][:10]
    lines = ",\n".join("        " + json.dumps(f'{x["pos"]}. #{x["num"]} {x["name"]} ({x["team"]})' if x.get("team") else f'{x["pos"]}. #{x["num"]} {x["name"]}', ensure_ascii=False) for x in rows)
    src = {"f1academy": "f1academy.com results page", "carrera": "porschecarreracup.us results page", "f2": "fiaformula2.com race page", "f3": "fiaformula3.com race page"}[item["s"]]
    ev = f'{item["series"]}: {n.split(" - ")[0]} ({item["event"]})'
    note = MARK + "Source: the series' " + src + ", top ten of " + n + ", race day " + day + "."
    return (f'  {{ t:{json.dumps(item["t"])}, d:{json.dumps(item["d"])}, s:{json.dumps(item["s"])}, race:{json.dumps(n, ensure_ascii=False)}, event:{json.dumps(ev, ensure_ascii=False)},\n'
            f'    groups:[\n      {{ h:"Race", order:[\n{lines}\n      ] }}\n    ],\n'
            f'    note:{json.dumps(note, ensure_ascii=False)} }},\n')
def main():
    args = ["tools/due_updates.js", "--results"] + (["--now", NOW] if NOW else [])
    due = node_json(*args).get("due", []); wrote = []
    for item in due:
        if item["s"] not in FEEDS: continue
        for sess in item["sessions"]:
            n = sess["n"]
            if sess.get("kind") != "race": continue
            day = session_day(item["t"], item["d"], n)
            if not day: print(f'{item["t"]} {n}: session day not found'); continue
            data = feed(item["s"], day, n, item["t"])
            if not data or not data.get("result"): print(f'{item["t"]} {n}: the feed has no result yet'); continue
            ended = datetime.datetime.fromisoformat(sess["ended"].replace("Z", "+00:00")); now = datetime.datetime.fromisoformat(NOW.replace("Z", "+00:00")) if NOW else datetime.datetime.now(datetime.timezone.utc)
            ok = bool(data.get("resultOfficial")) if item["s"] != "carrera" else (len(data["result"]) >= 5 and now - ended >= datetime.timedelta(minutes=60))
            if not ok: print(f'{item["t"]} {n}: result seen but not final yet (official={data.get("resultOfficial")})'); continue
            e = entry(item, n, day, data)
            print(f'{item["t"]} {n}: writing the result ({len(data["result"])} cars)')
            if DRY: continue
            s = D.read("data/results.js"); k = s.index("const RESULTS = [") + len("const RESULTS = [\n"); D.write("data/results.js", s[:k] + e + s[k:]); wrote.append((item["t"], n))
    print("wrote:", wrote or "nothing")
main()
