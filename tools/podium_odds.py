#!/usr/bin/env python3
"""Our own win-chance estimate for each car in data/entries.js (shown in "Pick your podium"). NOT betting odds.

GT World Challenge Europe Endurance Cup only (the site's own standings pages). For each car:
  rating = best Endurance Cup points among the car's three drivers, in the car's class table, divided by the class's
           best (Pro cars use the overall Endurance Cup table, since the series has no Pro table); no points = 0
  chance = softmax(K * rating) within the class, floored at 0.5%, then rounded.
Team totals are NOT used: a team's points mix several cars and the entry list's team names do not match the standings
tables (the #48 car is run by Winward but entered as Mercedes-AMG Team MANN-FILTER).
It is a form guide from published points: it knows nothing about balance of performance, weather, tyres, pit
strategy or who is new to the track, so the spread is deliberately wide and the favourite is never a lock.
Usage: python3 tools/podium_odds.py [season_id]   (rewrites the cars in data/entries.js for series gtwce)
"""
import re, sys, html, json, math, unicodedata, subprocess, os
K = 1.6
SEASON = sys.argv[1] if len(sys.argv) > 1 else "26"
TYPES = {"Pro": "0", "Gold": "81", "Silver": "82", "Bronze": "80"}   # standings class ids; Pro = overall table

def get(t):
    url = f"https://www.gt-world-challenge-europe.com/standings?filter_season_id={SEASON}&filter_standing_type={t}"
    h = subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", url], capture_output=True, text=True).stdout
    seg = h[h.find("POS"):]; out = []
    for r in re.findall(r"<tr[^>]*>(.*?)</tr>", seg, flags=re.S):
        c = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip() for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, flags=re.S)]
        if len(c) >= 3 and c[0].isdigit(): out.append((c[1], float(c[2])))
    return out

def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z ]", " ", re.sub(r"\s+", " ", s)).strip()

tables = {k: {"d": {norm(n): p for n, p in get(f"42_{v}_drivers")}, "t": {norm(n): p for n, p in get(f"42_{v}_teams")}} for k, v in TYPES.items()}
path = os.path.join(os.path.dirname(__file__), "..", "data", "entries.js")
src = open(path, encoding="utf8").read()
out, cls, rows = [], None, []

def flush(lines):
    """lines: list of (text, cars-row) for one class -> add chance + basis"""
    cars = [r for _, r in lines if r]
    tb = tables[cls]; bd = max(tb["d"].values() or [1]); bt = max(tb["t"].values() or [1])
    rs = []
    for r in cars:
        drivers = [norm(x) for x in r[2].split(" / ")]
        dp = max([tb["d"].get(d, 0) for d in drivers] or [0])
        rs.append((dp / bd, dp, 0))
    ex = [math.exp(K * x[0]) for x in rs]; z = sum(ex)
    pr = [max(0.005, e / z) for e in ex]; z2 = sum(pr); pr = [p / z2 for p in pr]
    new = {}
    for r, p, (_, dp, tp) in zip(cars, pr, rs):
        pct = round(p * 100, 1)
        why = f"Best driver has {dp:g} Endurance Cup points" if dp else "No Endurance Cup points this season"
        new[r[0]] = (pct, why)
    return new

lines = src.split("\n"); res = []; buf = []; cls = None
for ln in lines:
    m = re.match(r'\s*\{ h:"(\w+)", cars:\[', ln)
    if m:
        cls = m.group(1); buf = []; res.append(ln); continue
    m = re.match(r'(\s*)(\[".*\])(,?)\s*$', ln)
    if m and cls:
        row = json.loads(m.group(2)); buf.append((ln, row[:4], m)); continue
    if cls and buf:
        new = flush([(x, y) for x, y, _ in buf])
        for _, row, mm in buf:
            pct, why = new[row[0]]
            res.append(f'{mm.group(1)}{json.dumps(row + [pct, why], ensure_ascii=False)}{mm.group(3)}')
        buf = []; cls = None
    res.append(ln)
open(path, "w", encoding="utf8").write("\n".join(res))
print("done")
