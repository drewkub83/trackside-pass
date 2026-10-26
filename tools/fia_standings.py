#!/usr/bin/env python3
"""FIA Formula 2 and Formula 3 driver standings for data/standings.js, read from each series' own standings page
(fiaformula2.com / fiaformula3.com /en/standings/<year>/drivers: the table is in the page's Next.js data as `"standings":[{position, championshipPoints,
driverFirstName, driverLastName ...}]`). Top ten of the drivers' table; the page lists no team per driver, so only the name is written.
Called by tools/auto_update.py on every run (every 30 minutes Thursday to Monday); it only rewrites an entry when the table changed.
Never writes a table that is empty or whose points do not decrease down the list. Options: --dry-run. Stdlib only."""
import sys, os, re, json, datetime, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
DRY = "--dry-run" in sys.argv
SITES = {"f2": "https://www.fiaformula2.com", "f3": "https://www.fiaformula3.com"}
MARK = "(automatic update) "
def get(u):
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (Trackside Pass data tools)"}), timeout=40) as r: return r.read().decode("utf8", "replace")
        except Exception: pass
    return ""
def rsc(h): return "".join(json.loads(m.group(1)) for m in re.finditer(r'self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)', h))
def balanced(t, i, open_c="[", close_c="]"):
    d = 0; st = False; es = False
    for k in range(i, len(t)):
        c = t[k]
        if st:
            if es: es = False
            elif c == "\\": es = True
            elif c == '"': st = False
            continue
        if c == '"': st = True
        elif c == open_c: d += 1
        elif c == close_c:
            d -= 1
            if d == 0: return t[i:k + 1]
    return ""
def table(site, year):
    p = rsc(get(f"{site}/en/standings/{year}/drivers")); i = p.find('"standings":[')
    if i < 0: return None
    try: rows = json.loads(balanced(p, i + len('"standings":')))
    except Exception: return None
    out = [{"pos": int(re.sub(r"\D", "", str(r.get("displayPosition") or r.get("position")))), "who": f'{r["driverFirstName"]} {r["driverLastName"]}'.strip(), "pts": int(r["championshipPoints"])} for r in rows if r.get("driverLastName")]
    return out if out and all(a["pts"] >= b["pts"] for a, b in zip(out, out[1:])) else None
def entry(sid, rows, site, today):
    lines = ",\n".join(f'        {{ pos:{r["pos"]}, who:{json.dumps(r["who"], ensure_ascii=False)}, pts:{r["pts"]} }}' for r in rows[:10])
    host = site.split("//")[1]
    note = MARK + f"Source: {host} drivers' standings, top ten, read {today}. The page lists no team per driver. Check the site for the current round count."
    asof = "Current as of " + today + ", from " + host + " (the series' own standings page)."
    return (f'  {{ s:{json.dumps(sid)}, asOf:{json.dumps(asof)},\n    classes:[\n      {{ h:"Drivers", rows:[\n{lines}\n      ] }}\n    ],\n'
            f'    note:{json.dumps(note, ensure_ascii=False)} }},\n')
def main():
    today = datetime.date.today().isoformat(); year = datetime.date.today().year; changed = []
    for sid, site in SITES.items():
        rows = table(site, year)
        if not rows: print(sid, "no standings table readable"); continue
        s = D.read("data/standings.js"); pat = r'^  \{ s:"%s".*?\n    note:.*?\},\n' % sid; m = re.search(pat, s, flags=re.S | re.M)
        if m and MARK not in m.group(0): print(sid, "a hand-written entry exists, kept"); continue
        # same table as the stored one -> nothing to do (the date in asOf does not count)
        sig = lambda block: re.findall(r"pos:(\d+), who:(\"[^\"]*\"), pts:(\d+)", block)
        new = entry(sid, rows, site, today)
        if m and sig(m.group(0)) == sig(new): print(sid, "unchanged"); continue
        print(sid, "updated" if m else "added", f'({rows[0]["who"]} leads on {rows[0]["pts"]})')
        if DRY: continue
        if m: s = s[:m.start()] + new + s[m.end():]
        else: k = s.index("const STANDINGS = [") + len("const STANDINGS = [\n"); s = s[:k] + new + s[k:]
        D.write("data/standings.js", s); changed.append(sid)
    print("changed:", changed or "nothing")
main()
