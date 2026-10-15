#!/usr/bin/env python3
"""Runs on a schedule (GitHub Actions: .github/workflows/race-weekend.yml; also fine by hand). For every entry in data/entries.js with
live:{round}, i.e. a series whose results pages we can read (GT World Challenge Europe so far), it does whatever the weekend needs
right now, then bumps sw.js VERSION if any data file changed (the workflow commits and pushes):
  about 8 days before an Endurance Cup weekend the app has an event for:  create its entry in data/entries.js (round name found on the
                                                           series' entry-list page) and fill the cars from the official list
  from the day before the event until the race starts:   refresh the entry list from the official page (withdrawals, swaps)
  once qualifying is published:                           rebuild the win chances from the class grid (tools/podium_odds.py --quali)
  25 minutes after the race is scheduled to end:           add the classification to data/results.js (re-read on later runs, so a post-race
                                                           penalty is picked up), then refresh the standings
Idempotent: running it again changes nothing. Options: --now 2026-10-17T20:00:00Z (pretend), --dry-run (say what would run).
Needs node (reads the data files) and python 3.9+."""
import sys, os, json, re, subprocess, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gtwce_lib as L
from zoneinfo import ZoneInfo
A = sys.argv[1:]; DRY = "--dry-run" in A
now = datetime.datetime.fromisoformat(A[A.index("--now") + 1].replace("Z", "+00:00")) if "--now" in A else datetime.datetime.now(datetime.timezone.utc)
HERE = os.path.dirname(os.path.abspath(__file__))
RACE = {"gtwce": r"^Race.*GT World Challenge Europe"}   # how each series' main race is named in a track's sessions

def node(js):
    return json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, cwd=L.ROOT, check=True).stdout)
entries = node("const fs=require('fs');const E=new Function(fs.readFileSync('data/entries.js','utf8')+';return ENTRIES')();console.log(JSON.stringify(E.map(e=>({t:e.t,d:e.d,s:e.s,live:e.live||null,oddsAsOf:e.oddsAsOf||''}))))")
def track(t):
    return node(f"const fs=require('fs');const TRACKS=[];new Function('TRACKS',fs.readFileSync('data/{t}.js','utf8'))(TRACKS);const t=TRACKS[0];console.log(JSON.stringify({{tz:t.tz,events:t.events,sessions:t.sessions}}))")
def run(*cmd):
    print("  $", " ".join(cmd))
    if DRY: return 0
    return subprocess.run([sys.executable, os.path.join(HERE, cmd[0])] + list(cmd[1:]), cwd=L.ROOT).returncode
def when(d, hm, tz): return datetime.datetime.fromisoformat(f"{d}T{hm}:00").replace(tzinfo=ZoneInfo(tz))

before = {f: L.read(f) for f in ("data/entries.js", "data/results.js", "data/standings.js")}
DISCOVER_SERIES = {"gtwce": (r"GT World Challenge Europe|24 Hours of Spa", r"Endurance|24 Hours of Spa")}   # (event matches, and is the kind we can score)
def create_entries():
    """Create entries/entries for GT World Europe Endurance weekends that start within 8 days, are in the app's track data and have an official entry list."""
    have = {(e["t"], e["d"]) for e in entries}; today = now.date(); made = []
    events = node("""const fs=require('fs');const out=[];const skip=['champs.js','series.js','results.js','entries.js','standings.js','watch.js'];
for(const f of fs.readdirSync('data')){ if(!/^[a-z0-9-]+\\.js$/.test(f)||skip.includes(f)) continue; const TRACKS=[]; try{ new Function('TRACKS',fs.readFileSync('data/'+f,'utf8'))(TRACKS); }catch(e){ continue; }
 const t=TRACKS[0]; if(!t||!t.events) continue; for(const e of t.events) out.push({t:t.id,d:e.d,n:e.t||1,e:e.e||'',s:e.s||''}); } console.log(JSON.stringify(out))""")
    for sid, (m_all, m_kind) in DISCOVER_SERIES.items():
        for ev in events:
            txt = ev["e"] + " " + ev["s"]; d = datetime.date.fromisoformat(ev["d"])
            if not (re.search(m_all, txt, re.I) and re.search(m_kind, txt, re.I)) or (ev["t"], ev["d"]) in have: continue
            if not (d - datetime.timedelta(days=8) <= today <= d + datetime.timedelta(days=ev["n"] + 1)): continue
            row = next((r for r in L.entry_list_rows(str(d.year)) if r["available"] and re.search(m_kind, r["series"], re.I) and r["start"] <= d <= r["end"]), None)
            if not row: print(f'{ev["t"]} {ev["d"]}: no official entry list published yet'); continue
            print(f'{ev["t"]} {ev["d"]}: creating the entry (round "{row["slug"]}")')
            made.append((ev, row["slug"]))
            if DRY: continue
            src = L.read("data/entries.js"); k = src.rindex("];"); head = src[:k].rstrip()
            if head.endswith("}"): head += ","
            skel = (f'  {{ t:"{ev["t"]}", d:"{ev["d"]}", s:"{sid}", live:{{round:{json.dumps(row["slug"], ensure_ascii=False)}}}, oddsAsOf:"",'
                    f' asOf:"Official entry list as published on gt-world-challenge-europe.com. Late changes are possible.",\n    classes:[\n    ],\n'
                    f'    note:"Source: gt-world-challenge-europe.com/entry-list/{d.year}/{L.q(row["slug"])}. Classes are the series\' own Pro, Gold, Silver and Bronze." }}')
            L.write("data/entries.js", head + "\n" + skel + "\n" + src[k:])
            run("gtwce_entries.py", "--round", row["slug"])
    return made

if create_entries() and not DRY:
    entries = node("const fs=require('fs');const E=new Function(fs.readFileSync('data/entries.js','utf8')+';return ENTRIES')();console.log(JSON.stringify(E.map(e=>({t:e.t,d:e.d,s:e.s,live:e.live||null,oddsAsOf:e.oddsAsOf||''}))))")
for e in entries:
    if not e["live"]: continue
    tk = track(e["t"]); ev = next((x for x in tk["events"] if x["d"] == e["d"]), None)
    start = datetime.date.fromisoformat(e["d"]); end = start + datetime.timedelta(days=(ev.get("t", 1) if ev else 1) - 1)
    today = now.date()
    print(f'{e["t"]} {e["d"]} ({e["s"]}): window {start - datetime.timedelta(days=1)} .. {end + datetime.timedelta(days=2)}, today {today}')
    if not (start - datetime.timedelta(days=1) <= today <= end + datetime.timedelta(days=2)): print("  outside the window"); continue
    races = [s for s in tk["sessions"] if start.isoformat() <= s["d"] <= end.isoformat() and re.search(RACE[e["s"]], s["n"]) and s.get("e")]
    if races: race = max(races, key=lambda s: s["d"] + s["e"]); r_start, r_end = when(race["d"], race["s"], tk["tz"]), when(race["d"], race["e"], tk["tz"])
    else:   # the app has no session times for this weekend yet: treat the last event day as race day
        print("  no race session in the app's schedule; assuming the last day of the event"); r_start, r_end = when(end.isoformat(), "00:00", tk["tz"]), when(end.isoformat(), "23:00", tk["tz"])
    rnd = e["live"]["round"]; quali = bool(L.table(L.page(e["d"][:4], rnd, "qualifying-combined"))) if now >= r_start - datetime.timedelta(days=2) else False
    if now < r_start:
        if not e["oddsAsOf"].startswith("After qualifying") and quali: run("podium_odds.py", "--round", rnd, "--quali")
        else: run("gtwce_entries.py", "--round", rnd, *(["--quali"] if e["oddsAsOf"].startswith("After qualifying") else []))
    if now >= r_end + datetime.timedelta(minutes=25):
        name = (ev or {}).get("e", "GT World Challenge Europe")   # --refresh: keep re-reading for 2 days, post-race penalties can move the order
        if run("gtwce_result.py", rnd, e["t"], e["d"], name, "--refresh") == 0 and not DRY and L.read("data/results.js") != before["data/results.js"]: run("gtwce_standings.py")
    else: print(f"  race ends {r_end.isoformat()}; nothing to import yet")
changed = [f for f in before if before[f] != L.read(f)]
if changed and not DRY: L.bump_sw(); print("changed:", ", ".join(changed), "+ sw.js")
else: print("changed:", ", ".join(changed) or "nothing")
