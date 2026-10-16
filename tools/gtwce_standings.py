#!/usr/bin/env python3
"""Rewrites the GT World Challenge Europe entry (s:"gtwce") of data/standings.js from the series' own standings pages
(Teams and Drivers, overall, Endurance + Sprint): top 20 positions of each, drivers sharing a position listed together.
`asOf` says which round the tables are current through (the last round with any points in its columns) and whether the
season is complete; a "standings remain provisional" notice on the page is copied into the note.
Usage: python3 tools/gtwce_standings.py [--season 2026] [--season-id 26] [--print]     Prints 'unchanged' or 'updated'.
The season defaults to the current year; its id on the series site is looked up from the site's own Change Season list."""
import sys, re, json, html, datetime, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gtwce_lib as L
A = sys.argv[1:]
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
year = opt("--season", str(datetime.date.today().year)); sid = opt("--season-id") or L.season_id(year)
def get(kind):
    return L.fetch(f"{L.HOST}/standings?filter_season_id={sid}&filter_standing_type=0_0_{kind}")
def parse(h):
    i = h.find("<table"); t = h[i:h.find("</table>", i)]; trs = re.findall(r"<tr[^>]*>.*?</tr>", t, flags=re.S)
    rounds = [(int(c), re.sub(r"<[^>]+>", "", x).strip()) for c, x in re.findall(r'<th colspan="(\d+)">(.*?)</th>', trs[0], flags=re.S) if re.match(r"R\d+", re.sub(r"<[^>]+>", "", x).strip())]
    tracks = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<span.*?</span>", "", x, flags=re.S).strip())).strip() for c, x in re.findall(r'<th colspan="(\d+)">(.*?)</th>', trs[1], flags=re.S)][1:]
    rows = []
    for r in trs[3:]:
        c = L.cells(r)
        if len(c) >= 3 and c[0].isdigit(): rows.append((int(c[0]), c[1], float(c[2]), c[3:]))
    return rounds, tracks, rows
dr, dt, drows = parse(get("drivers")); tr_, tt, trows = parse(get("teams"))
if not drows or not trows: print("standings pages unreadable"); sys.exit(3)
# last round with any points in its columns
spans = [c for c, _ in dr]; done = 0; col = 0
for n, span in enumerate(spans, 1):
    if any(v not in ("", "-") for _, _, _, cellsv in drows for v in cellsv[col:col + span]): done = n
    col += span
total = len(spans)
def group(rows, top=20):
    g = {}
    for p, n, pts, _ in rows: g.setdefault(p, {"pts": pts, "who": []})["who"].append(n)
    return [{"pos": p, "who": " / ".join(g[p]["who"]), "pts": int(g[p]["pts"]) if g[p]["pts"] == int(g[p]["pts"]) else g[p]["pts"]} for p in sorted(g)[:top]]
def js(rows): return ",\n".join("        { pos:%d, who:%s, pts:%s }" % (r["pos"], json.dumps(r["who"], ensure_ascii=False), r["pts"]) for r in rows)
prov = re.search(r"Standings remain provisional[^<|]*", html.unescape(get("teams")))
if done >= total: asof = f"Current after the final round of the {year} season ({tt[done-1]}): the season is complete."
elif done: asof = f"Current after round {done} of {total} in the {year} season ({tt[done-1]}). Next: {tt[done]}; no points from it are included yet."
else: asof = f"{year} season: no points yet."
note = (f"Overall GT World Challenge Europe Powered by AWS standings (Endurance and Sprint Cup combined), top 20 positions of each table. Drivers sharing a position are listed together (they share the same points)."
        + (f" The series' own page says: {prov.group(0).strip()}." if prov else "")
        + f" Source: gt-world-challenge-europe.com/standings (Teams and Drivers {year}), read {datetime.date.today().isoformat()}.")
block = ('  { s:"gtwce", asOf:%s,\n    classes:[\n      { h:"Drivers", rows:[\n%s\n      ] },\n      { h:"Teams", rows:[\n%s\n      ] }\n    ],\n    note:%s\n  }'
         % (json.dumps(asof, ensure_ascii=False), js(group(drows)), js(group(trows)), json.dumps(note, ensure_ascii=False)))
if "--print" in A: print(block); sys.exit()
src = L.read("data/standings.js"); m = re.search(r'^  \{ s:"gtwce".*?^  \}(,?)\n', src, flags=re.S | re.M)
new = block + (m.group(1) if m else ",") + "\n"
if m:
    if re.sub(r"read \d{4}-\d\d-\d\d", "", m.group(0)) == re.sub(r"read \d{4}-\d\d-\d\d", "", new): print("unchanged"); sys.exit()
    src = src[:m.start()] + new + src[m.end():]
else:
    k = src.rstrip().rfind("];"); src = src[:k].rstrip().rstrip(",") + ",\n" + block + "\n];\n"
L.write("data/standings.js", src); print("updated")
