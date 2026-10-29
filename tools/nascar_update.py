#!/usr/bin/env python3
"""NASCAR Cup Series race results for data/results.js, read from NASCAR's own race data (cf.nascar.com/cacher, the files nascar.com's race pages use;
the weekend feed of a FINISHED race, never the live feed). Called by tools/auto_update.py on every run (every 30 minutes Thursday to Monday).
For every Cup race of the last 10 days at a venue the app has a NASCAR Cup event for, once the classification is in (40 or so cars with a finishing
position and laps run), the top ten are written as one entry (`s:"nascar"`, class "Race", lines "1. #5 Kyle Larson (Hendrick Motorsports)": the game
scores by the #NN), note starting "(automatic update)". It is re-read on later runs (a post-race penalty can move the order) and only rewritten when it
changed. A hand-written entry for the same race is kept. Options: --now, --dry-run, --print, --race <race_id> --track <id> --day YYYY-MM-DD (rehearse
on any race). Stdlib only; needs node."""
import sys, os, re, json, datetime, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
A = sys.argv[1:]; DRY = "--dry-run" in A; PRINT = "--print" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
MARK = "(automatic update)"
import nascar_game as G   # the NASCAR data helpers (get/feed/calendar/finished); importing it does not run it
def js(v): return json.dumps(v, ensure_ascii=False)
def import_result(track, appday, r, race):
    rows = sorted(G.finished(r, race) or [], key=lambda x: x["finishing_position"])
    if len(rows) < 25: print("  race classification not complete yet"); return False
    lines = ",\n".join("        " + js(f'{x["finishing_position"]}. #{x["car_number"]} {x["driver_fullname"]} ({x["team_name"]})') for x in rows[:10])
    day = r["race_date"][:10]
    entry = (f'  {{ t:{js(track)}, d:{js(appday)}, s:"nascar", event:{js(r["race_name"])},\n    groups:[\n      {{ h:"Race", order:[\n{lines}\n      ] }}\n    ],\n'
             f'    note:{js(MARK + " Source: NASCAR race data (cf.nascar.com, the files nascar.com race pages use), top ten of the race, race day " + day + ".")} }},\n')
    s = D.read("data/results.js")
    pat = r'^  \{ t:%s, d:%s, s:"nascar".*?\n    note:.*?\},\n' % (re.escape(js(track)), re.escape(js(appday)))
    m = re.search(pat, s, flags=re.S | re.M)
    if m and MARK not in m.group(0): print("  results: a hand-written entry exists, kept"); return False
    if m and m.group(0) == entry: print("  results: already"); return False
    print("  results:", "refreshed" if m else "added")
    if DRY or PRINT:
        if PRINT: print(entry)
        return True
    if m: s = s[:m.start()] + entry + s[m.end():]
    else: k = s.index("const RESULTS = [") + len("const RESULTS = [\n"); s = s[:k] + entry + s[k:]
    D.write("data/results.js", s); return True
def main():
    if opt("--race"):
        y = int(opt("--day")[:4]); r = next((x for x in G.calendar(y) if str(x["race_id"]) == opt("--race")), None)
        if not r: print("no such race"); return
        import_result(opt("--track"), opt("--day"), r, G.feed(y, r["race_id"])); return
    today = now.date(); events = D.track_events()
    for r in G.calendar(today.year):
        day = datetime.date.fromisoformat(r["race_date"][:10])
        if day > today or (today - day).days > 10 or not r.get("actual_laps"): continue
        track = G.TRACKS.get(r["track_name"])
        if not track: print(f'{r["race_name"]}: no track in the app'); continue
        appev = D.app_event(events, track, day.isoformat())
        print(f'{r["race_name"]} ({day}) -> {track}; app event {appev["d"] if appev else "none"}')
        if appev: import_result(track, appev["d"], r, G.feed(today.year, r["race_id"]))
if __name__ == "__main__": main()
