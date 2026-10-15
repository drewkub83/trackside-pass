#!/usr/bin/env python3
"""Adds a finished GT World Challenge Europe race to data/results.js from the series' own Main Race page
(gt-world-challenge-europe.com/results/<season>/<round>/main-race): top 5 of each class, car numbers as "#NN"
(the Pick your podium game scores by car number; classes must be Pro / Gold / Silver / Bronze).
Usage: python3 tools/gtwce_result.py <round-slug> <track-id> <event-start-day> ["event name"] [--print] [--season 2026]
  e.g.  python3 tools/gtwce_result.py portimao portimao 2026-10-15 "GT World Challenge Europe: Portimão" --print   (preview)
Skips (exit code 0, prints 'already') when the weekend is already in results.js; with --refresh it instead replaces that entry if the
page's classification has changed since (post-race penalties). Prints 'added' / 'refreshed' / 'already'. Exit code 3 = no classification on the page yet."""
import sys, json, collections, re
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import gtwce_lib as L
args = [a for a in sys.argv[1:] if not a.startswith("--")]; PRINT = "--print" in sys.argv
season = sys.argv[sys.argv.index("--season") + 1] if "--season" in sys.argv else "2026"
if "--season" in sys.argv: args = [a for a in args if a != season]
rnd, track, day = args[:3]; name = args[3] if len(args) > 3 else "GT World Challenge Europe"
rows = L.table(L.page(season, rnd, "main-race"))
if not rows: print("No Main Race classification on the page yet."); sys.exit(3)
groups = collections.OrderedDict()
for r in rows:
    if not r["Pos"].isdigit() or r["Class"] not in L.CLS: continue
    g = groups.setdefault(L.CLS[r["Class"]], [])
    if len(g) < 5: g.append(f'{len(g)+1}. #{r["Car #"]} {r["Team"]} {r["Car"]} — {r["Drivers"]}')
order = [c for c in ["Pro", "Gold", "Silver", "Bronze", "Pro-Am"] if c in groups]
url = f"{L.HOST}/results/{season}/{L.q(rnd)}/main-race"
entry = f'  {{ t:{json.dumps(track)}, d:{json.dumps(day)}, s:"gtwce", event:{json.dumps(name, ensure_ascii=False)},\n    groups:[\n' + ",\n".join(
    f'      {{ h:{json.dumps(c)}, order:[\n' + ",\n".join("        " + json.dumps(x, ensure_ascii=False) for x in groups[c]) + "\n      ] }" for c in order) + \
    f'\n    ],\n    note:"Source: the series\' official Main Race classification, {url} (top five per class)." }},\n'
if PRINT: print(entry); sys.exit()
s = L.read("data/results.js")
if f't:{json.dumps(track)}, d:{json.dumps(day)}, s:"gtwce"' in s:
    if "--refresh" not in sys.argv: print("already"); sys.exit()
    m = re.search(r'^  \{ t:%s, d:%s, s:"gtwce".*?\n    note:.*?\},\n' % (re.escape(json.dumps(track)), re.escape(json.dumps(day))), s, flags=re.S | re.M)
    if not m: print("already (could not locate the entry to refresh)"); sys.exit()
    if m.group(0) == entry: print("already"); sys.exit()
    L.write("data/results.js", s[:m.start()] + entry + s[m.end():]); print("refreshed", track, day); sys.exit()
k = s.index("const RESULTS = [") + len("const RESULTS = [\n"); L.write("data/results.js", s[:k] + entry + s[k:]); print("added", track, day)
