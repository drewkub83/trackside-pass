#!/usr/bin/env python3
"""Adds a finished GT World Challenge Europe race to data/results.js from the series' own Main Race page
(gt-world-challenge-europe.com/results/<season>/<round>/main-race): the top 5 of each class, with car numbers as "#NN"
(the Pick your podium game scores by car number, so class names must be Pro / Gold / Silver / Bronze).
Usage: python3 tools/gtwce_result.py <round-slug> <track-id> <event-start-day> ["event name"] [--print]
  e.g.  python3 tools/gtwce_result.py portimao portimao 2026-10-15 --print     (preview)
        python3 tools/gtwce_result.py portimao portimao 2026-10-15              (write; skips if the weekend is already there)
Check the page says the classification is final before writing (provisional results can change after protests)."""
import re, sys, json, os, html, subprocess, collections
args = [a for a in sys.argv[1:] if not a.startswith("--")]; PRINT = "--print" in sys.argv
rnd, track, day = args[:3]; name = args[3] if len(args) > 3 else "GT World Challenge Europe"
CLS = {"Pro Cup": "Pro", "Gold Cup": "Gold", "Silver Cup": "Silver", "Bronze Cup": "Bronze", "Pro-AM Cup": "Pro-Am"}
url = f"https://www.gt-world-challenge-europe.com/results/2026/{rnd}/main-race"
h = subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", url], capture_output=True, text=True).stdout
i = h.find("<table"); tb = h[i:h.find("</table>", i) + 8]; hdr = None; rows = []
for r in re.findall(r"<tr[^>]*>(.*?)</tr>", tb, flags=re.S):
    c = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip() for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, flags=re.S)]
    if c and c[0] == "Pos": hdr = c; continue
    if hdr and len(c) == len(hdr): rows.append(dict(zip(hdr, c)))
if not rows: sys.exit("No Main Race classification on the page yet.")
groups = collections.OrderedDict()
for r in rows:
    if not r["Pos"].isdigit() or r["Class"] not in CLS: continue
    g = groups.setdefault(CLS[r["Class"]], [])
    if len(g) < 5: g.append(f'{len(g)+1}. #{r["Car #"]} {r["Team"]} {r["Car"]} — {r["Drivers"]}')
order = [c for c in ["Pro", "Gold", "Silver", "Bronze", "Pro-Am"] if c in groups]
entry = f'  {{ t:{json.dumps(track)}, d:{json.dumps(day)}, s:"gtwce", event:{json.dumps(name, ensure_ascii=False)},\n    groups:[\n' + ",\n".join(
    f'      {{ h:{json.dumps(c)}, order:[\n' + ",\n".join("        " + json.dumps(x, ensure_ascii=False) for x in groups[c]) + "\n      ] }" for c in order) + \
    f'\n    ],\n    note:"Source: the series\' official Main Race classification, {url} (top five per class)." }},\n'
if PRINT: print(entry); sys.exit()
path = os.path.join(os.path.dirname(__file__), "..", "data", "results.js"); s = open(path, encoding="utf8").read()
if f'd:"{day}", s:"gtwce"' in s and f't:"{track}"' in s: sys.exit("Already in results.js")
k = s.index("const RESULTS = [") + len("const RESULTS = [\n"); open(path, "w", encoding="utf8").write(s[:k] + entry + s[k:]); print("added", track, day)
