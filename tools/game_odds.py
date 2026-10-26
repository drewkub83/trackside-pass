#!/usr/bin/env python3
"""Win chances for a "Pick your podium" entry that was written by hand (or by the routine) with only the cars: [number, team, drivers, car] per class.
Used for series whose entry list cannot be read by a script (IMSA WeatherTech: GTP, LMP2, GTD PRO, GTD). Rewrites the entry in data/entries.js with the
chances, the basis text and `oddsAsOf`, keeping the cars and the entry's other fields, and marks the note "(automatic update)".

    python3 tools/game_odds.py <track id> <event start day> <series id>        e.g.  python3 tools/game_odds.py daytona 2027-01-28 weathertech

Our own estimate, NOT betting odds. Inside each class: chance = softmax(C * (form - baseline)), floored at 0.5%, with C = 3.0 (the value GT World Challenge
Europe's backtest chose before qualifying: nearly equal chances, tilted a little by recent results) and
  form = the car number's average "podium score" in the series' earlier races of the last 12 months that data/results.js has for this class:
         1st 1.0, 2nd 0.75, 3rd 0.55, 4th 0.4, 5th 0.3, a car the report did not list 0.15 (only when the report listed at least a podium); winner-only reports
         count the winner (1.0) and say nothing about the others. Pulled toward the class average as if the car had 2 extra average races. A car with no
         data counts as average.
Nothing is known about balance of performance, tyres, weather, strategy or driver changes: a form guide. No qualifying grid is read for these series, so the chances are
not rebuilt after qualifying (the early/late pick bonus in the game still applies). Stdlib only; needs node."""
import sys, os, re, json, math, subprocess, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
MARK = "(automatic update)"; C = 3.0; K = 2; SCORE = {1: 1.0, 2: 0.75, 3: 0.55, 4: 0.4, 5: 0.3}; MISS = 0.15
def js(v): return json.dumps(v, ensure_ascii=False)
def node(code): return json.loads(subprocess.run(["node", "-e", code], capture_output=True, text=True, cwd=D.ROOT, check=True).stdout)
def main():
    if len(sys.argv) < 4: sys.exit(__doc__)
    t, d, s = sys.argv[1:4]
    data = node("const fs=require('fs');const E=new Function(fs.readFileSync('data/entries.js','utf8')+';return ENTRIES')();const R=new Function(fs.readFileSync('data/results.js','utf8')+';return RESULTS')();console.log(JSON.stringify({E,R}))")
    ent = next((e for e in data["E"] if e["t"] == t and e["d"] == d and e["s"] == s), None)
    if not ent: sys.exit(f"no entry {t} {d} {s} in data/entries.js")
    day = datetime.date.fromisoformat(d); since = day - datetime.timedelta(days=365)
    races = [r for r in data["R"] if r["s"] == s and since <= datetime.date.fromisoformat(r["d"]) < day and not (r["t"] == t and r["d"] == d)]
    classes = []
    for c in ent["classes"]:
        hist = {}   # car number -> [scores]
        nums = [x[0] for x in c["cars"]]
        for r in races:
            g = next((x for x in r["groups"] if x["h"].lower() == c["h"].lower()), None)
            if not g: continue
            if g.get("order"):
                listed = {}
                for line in g["order"]:
                    m = re.match(r"\s*(\d+)\.\s*#(\d+)", line)
                    if m: listed[m.group(2)] = int(m.group(1))
                for n in nums:
                    if n in listed: hist.setdefault(n, []).append(SCORE.get(listed[n], MISS))
                    elif len(listed) >= 3: hist.setdefault(n, []).append(MISS)
            else:
                m = re.search(r"#(\d+)", g.get("winner", "") or "")
                if m and m.group(1) in nums: hist.setdefault(m.group(1), []).append(1.0)
        allscores = [v for h in hist.values() for v in h]; base = sum(allscores) / len(allscores) if allscores else 0.3
        rows = []
        for x in c["cars"]:
            h = hist.get(x[0], []); form = (sum(h) + base * K) / (len(h) + K)
            rows.append((x, form, len(h)))
        ws = [C * (f - base) for _, f, _ in rows]; m = max(ws); ex = [math.exp(v - m) for v in ws]; z = sum(ex); pr = [max(0.005, e / z) for e in ex]; z2 = sum(pr); pr = [p / z2 for p in pr]
        out = []
        for (x, f, n), p in zip(rows, pr):
            basis = f"scored {round(f * 100)} on a 0-100 podium scale over {n} earlier race{'s' if n != 1 else ''} in this class" if n else "no earlier result in the data: counted as average"
            out.append([x[0], x[1], x[2], x[3], round(p * 100, 1), basis, round(f, 3)])
        out.sort(key=lambda r: -r[4]); classes.append((c["h"], out))
    odds = "Before the race: nearly equal chances inside each class, tilted a little by each car's finishes in the series' recent races (our own data). Not rebuilt from the grid: no qualifying order is read for this series."
    note = f"Entry list from the series' published entry list (read by hand). Win chances are our own estimate, not betting odds. {MARK}"
    body = ",\n".join("      { h:" + js(h) + ", cars:[\n" + ",\n".join("        [" + ", ".join(js(v) for v in r) + "]" for r in rows) + "\n      ] }" for h, rows in classes)
    as_of = ent.get("asOf") or "Entry list as published by the series. Late changes are possible."
    text = f'  {{ t:{js(t)}, d:{js(d)}, s:{js(s)}, oddsAsOf:{js(odds)}, asOf:{js(as_of)},\n    classes:[\n{body}\n    ],\n    note:{js(note)} }}'
    src = D.read("data/entries.js"); starts = [m.start() for m in re.finditer(r"^  \{ ", src, flags=re.M)]; end = src.rindex("];")
    key = f'  {{ t:{js(t)}, d:{js(d)}, s:{js(s)}'
    for i, st in enumerate(starts):
        nxt = starts[i + 1] if i + 1 < len(starts) else end
        if src[st:nxt].startswith(key):
            tail = "," if src[st:nxt].rstrip().endswith(",") or i + 1 < len(starts) else ""
            D.write("data/entries.js", src[:st] + text + tail + "\n" + src[nxt:]); print(f"{t} {d} {s}: chances written ({sum(len(r) for _, r in classes)} cars, {len(classes)} classes)"); return
    sys.exit("entry not found in the file text")
main()
