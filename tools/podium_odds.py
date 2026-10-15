#!/usr/bin/env python3
"""Our own win-chance estimate for each car in data/entries.js (shown in "Pick your podium"). NOT betting odds.

GT World Challenge Europe, from the series' own results pages (gt-world-challenge-europe.com/results/<season>/<round>/<session>).
Within each class, chance = softmax(weight) over the class's cars, floored at 0.5%, where

  before qualifying:  weight = FORM_C * (form - 0.5)
  after qualifying:   weight = FORM_C2 * (form - 0.5) - GRID_A * (class qualifying position - 1)

  form = the car number's average class finishing percentile in this season's earlier Endurance Cup races (1.0 = won its
         class every time, 0.0 = last), pulled toward 0.5 (FORM_K) so one lucky race does not make a favourite; a car with no
         earlier race counts as 0.5 (neutral).

The constants come from a backtest on the four 2026 Endurance Cup races already run (17 class-races; tools/podium_backtest_fetch.py then tools/podium_backtest.py reproduce it):
class qualifying position was by far the best predictor (log-loss 1.88 vs 2.32 for equal chances); season points, practice pace
and past finishes added little, so before qualifying the chances are deliberately close to equal. It knows nothing about balance of
performance, weather, tyres, strategy or driver changes. Small sample: treat it as a form guide.

Usage:  python3 tools/podium_odds.py                 # before qualifying
        python3 tools/podium_odds.py --quali          # after qualifying: also reads the finished Qualifying Combined page
        python3 tools/podium_odds.py --quali --test nb  # print a past round's class grid (parser check), writes nothing
        python3 tools/podium_odds.py --quali --grid-round nb  # rehearsal: apply that past round's grid (restore data/entries.js with git afterwards)
Rewrites the cars of the series gtwce in data/entries.js (fields 5-7: win chance %, the basis text and the shrunk form the app uses to
rebuild the chances live from the qualifying grid).
"""
import re, sys, html, json, math, subprocess, os, collections
FORM_C, FORM_C2, GRID_A, FORM_K = 3.0, 0.5, 0.35, 2   # FORM_K: a car's form is pulled toward 0.5 as if it had 2 extra average races
SEASON = "2026"
ROUNDS = ["circuit-paul-ricard", "monza", "crowdstrike-24-hours-of-spa", "n%C3%BCrburgring"]   # the season's Endurance Cup races already run
NOW_ROUND = "portimao"
if "--grid-round" in sys.argv: NOW_ROUND = {"nb": "n%C3%BCrburgring", "mz": "monza", "spa": "crowdstrike-24-hours-of-spa", "rc": "circuit-paul-ricard"}[sys.argv[sys.argv.index("--grid-round") + 1]]   # rehearsal on a past round
CLS = {"Pro Cup": "Pro", "Gold Cup": "Gold", "Silver Cup": "Silver", "Bronze Cup": "Bronze", "Pro-AM Cup": "Pro-Am"}
args = sys.argv[1:]; QUALI = "--quali" in args; TEST = args[args.index("--test") + 1] if "--test" in args else None
TESTMAP = {"nb": "n%C3%BCrburgring", "mz": "monza", "spa": "crowdstrike-24-hours-of-spa", "rc": "circuit-paul-ricard"}

def page(rnd, sess):
    return subprocess.run(["curl", "-sL", "-A", "Mozilla/5.0", f"https://www.gt-world-challenge-europe.com/results/{SEASON}/{rnd}/{sess}"], capture_output=True, text=True).stdout

def table(h):
    i = h.find("<table"); tb = h[i:h.find("</table>", i) + 8]; hdr = None; out = []
    for r in re.findall(r"<tr[^>]*>(.*?)</tr>", tb, flags=re.S):
        c = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip() for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, flags=re.S)]
        if c and c[0] == "Pos": hdr = c; continue
        if hdr and len(c) == len(hdr): out.append(dict(zip(hdr, c)))
    return out

def class_ranks(rows):
    """{car number: (class, position within class, class size)}"""
    cnt = collections.Counter(); out = {}
    for r in rows:
        if r["Pos"].isdigit() and r["Class"] in CLS: c = CLS[r["Class"]]; cnt[c] += 1; out[r["Car #"]] = [c, cnt[c]]
    for n, v in out.items(): v.append(cnt[v[0]])
    return out

if TEST:
    g = class_ranks(table(page(TESTMAP[TEST], "qualifying-combined")))
    for c in ["Pro", "Gold", "Silver", "Bronze"]:
        print(c, [n for n, v in sorted(g.items(), key=lambda kv: kv[1][1]) if v[0] == c])
    sys.exit()

hist = collections.defaultdict(list)
for rnd in ROUNDS:
    for n, (c, pos, size) in class_ranks(table(page(rnd, "main-race"))).items():
        hist[n].append(1 - (pos - 1) / max(1, size - 1))
grid = class_ranks(table(page(NOW_ROUND, "qualifying-combined"))) if QUALI else {}
if QUALI and not grid: sys.exit("No Qualifying Combined result for the current round yet.")

path = os.path.join(os.path.dirname(__file__), "..", "data", "entries.js")
lines = open(path, encoding="utf8").read().split("\n"); res = []; buf = []; cls = None

def flush():
    ws = []; info = []
    for _, row, m in buf:
        n = row[0]; h = hist.get(n, []); form = (sum(h) + 0.5 * FORM_K) / (len(h) + FORM_K) if h else 0.5
        g = grid.get(n)
        last = 1 + max([v[1] for v in grid.values() if v[0] == cls] or [0])   # a car with no qualifying time is treated as starting last
        w = (FORM_C2 if QUALI else FORM_C) * (form - 0.5) - (GRID_A * ((g[1] if g and g[0] == cls else last) - 1) if QUALI else 0)
        ws.append(w); info.append((sum(h) / len(h) if h else 0.5, len(h), g if g and g[0] == cls else None, form))
    ex = [math.exp(w) for w in ws]; z = sum(ex); pr = [max(0.005, e / z) for e in ex]; z2 = sum(pr); pr = [p / z2 for p in pr]
    for (ln, row, m), p, (form, nh, g, fshr) in zip(buf, pr, info):
        bits = []
        if QUALI and not g: bits.append("No qualifying time, so counted as starting last")
        if QUALI and g: bits.append(f"Qualified {g[1]}{'st' if g[1]==1 else 'nd' if g[1]==2 else 'rd' if g[1]==3 else 'th'} of {g[2]} in {cls}")
        bits.append(f"averaged top {round((1-form)*100)}% of class in {nh} Endurance Cup race{'s' if nh!=1 else ''} this year" if nh else "no earlier 2026 Endurance Cup race with this number")
        res.append(f'{m.group(1)}{json.dumps(row[:4] + [round(p*100, 1), ". ".join(bits), round(fshr, 3)], ensure_ascii=False)}{m.group(3)}')

for ln in lines:
    m = re.match(r'\s*\{ h:"(\w+)", cars:\[', ln)
    if m: cls = m.group(1); buf = []; res.append(ln); continue
    m = re.match(r'(\s*)(\[".*\])(,?)\s*$', ln)
    if m and cls: buf.append((ln, json.loads(m.group(2)), m)); continue
    if cls and buf: flush(); buf = []; cls = None
    res.append(ln)
out = "\n".join(res)
note = ("After qualifying (class grid from the official Qualifying Combined result): grid position now drives the chances, tilted slightly by this season's Endurance Cup finishes."
        if QUALI else "Before qualifying: close to even, tilted slightly by this season's Endurance Cup finishes. They sharpen once qualifying is in.")
out = re.sub(r'oddsAsOf:"[^"]*"', 'oddsAsOf:' + json.dumps(note), out, count=1)
open(path, "w", encoding="utf8").write(out)
print("done", "(after qualifying)" if QUALI else "(before qualifying)")
