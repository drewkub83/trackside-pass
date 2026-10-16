#!/usr/bin/env python3
"""Refreshes the cars of an entry in data/entries.js from the series' official entry list
(gt-world-challenge-europe.com/entry-list/<season>/<round>), keeping the entry's other fields, then re-runs tools/podium_odds.py for
the new field. Use when the list changes (withdrawals, driver swaps) or to create the cars for a new entry skeleton.
Usage: python3 tools/gtwce_entries.py --round portimao [--season 2026] [--quali]      Prints 'unchanged' or 'updated'."""
import sys, re, json, subprocess, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gtwce_lib as L
A = sys.argv[1:]
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
rnd = opt("--round")
lines = L.read("data/entries.js").split("\n"); blk = [b for b in L.entry_blocks(lines) if b[2] == rnd]
if not blk: sys.exit("no entry with that live.round")
season = opt("--season", blk[0][3][:4])
h = L.fetch(f"{L.HOST}/entry-list/{season}/{L.q(rnd)}"); i = h.find("<table")
if i < 0: print("no entry list on the page"); sys.exit(3)
def nm(s): return " ".join("-".join(x.capitalize() if x.isupper() and len(x) > 1 else x for x in w.split("-")) if w.isupper() else w for w in s.split(" "))
cls = {}
for r in re.findall(r"<tr[^>]*>(.*?)</tr>", h[i:h.find("</table>", i)], flags=re.S)[1:]:
    c = L.cells(r)
    if len(c) < 7: continue
    num, team, d1, d2, d3, car, k = c[:7]
    cls.setdefault(k.title(), []).append([num, team, " / ".join(nm(d) for d in (d1, d2, d3) if d), car])
if not cls: print("empty entry list"); sys.exit(3)
for k in cls: cls[k].sort(key=lambda x: int(x[0]) if x[0].isdigit() else 9999)
order = [c for c in ["Pro", "Gold", "Silver", "Bronze", "Pro-Am"] if c in cls]
start, end = blk[0][0], blk[0][1]
# the old cars (numbers + names) vs the new ones: only rewrite when something real changed
old = [json.loads(re.match(r'\s*(\[".*\])', l).group(1))[:4] for l in lines[start:end + 1] if re.match(r'\s*\[".*\],?\s*$', l)]
new = [r for k in order for r in cls[k]]
if old == new: print("unchanged"); sys.exit()
ci = next(j for j in range(start, end + 1) if re.match(r"\s*classes:\[", lines[j])); ce = next(j for j in range(end, ci, -1) if re.match(r"\s*\],?\s*$", lines[j]))
body = ",\n".join('      { h:%s, cars:[\n%s\n      ] }' % (json.dumps(k), ",\n".join("        " + json.dumps(r, ensure_ascii=False) for r in cls[k])) for k in order)
L.write("data/entries.js", "\n".join(lines[:ci + 1] + [body] + lines[ce:]))
subprocess.run([sys.executable, os.path.join(os.path.dirname(os.path.abspath(__file__)), "podium_odds.py"), "--round", rnd, "--season", season] + (["--quali"] if "--quali" in A else []), check=True)
print("updated")
