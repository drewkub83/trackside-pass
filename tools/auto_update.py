#!/usr/bin/env python3
"""Runs on a schedule (GitHub Actions: .github/workflows/race-weekend.yml; also fine by hand). For every entry in data/entries.js with
live:{round}, i.e. a series whose results pages we can read (GT World Challenge Europe so far), it does whatever the weekend needs
right now, then bumps sw.js VERSION if any data file changed (the workflow commits and pushes):
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
for e in entries:
    if not e["live"]: continue
    tk = track(e["t"]); ev = next((x for x in tk["events"] if x["d"] == e["d"]), None)
    start = datetime.date.fromisoformat(e["d"]); end = start + datetime.timedelta(days=(ev.get("t", 1) if ev else 1) - 1)
    today = now.date()
    print(f'{e["t"]} {e["d"]} ({e["s"]}): window {start - datetime.timedelta(days=1)} .. {end + datetime.timedelta(days=2)}, today {today}')
    if not (start - datetime.timedelta(days=1) <= today <= end + datetime.timedelta(days=2)): print("  outside the window"); continue
    races = [s for s in tk["sessions"] if start.isoformat() <= s["d"] <= end.isoformat() and re.search(RACE[e["s"]], s["n"]) and s.get("e")]
    if not races: print("  no race session found, skipping"); continue
    race = max(races, key=lambda s: s["d"] + s["e"]); r_start, r_end = when(race["d"], race["s"], tk["tz"]), when(race["d"], race["e"], tk["tz"])
    rnd = e["live"]["round"]; quali = bool(L.table(L.page("2026", rnd, "qualifying-combined"))) if now >= r_start - datetime.timedelta(days=2) else False
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
