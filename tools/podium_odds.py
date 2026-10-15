#!/usr/bin/env python3
"""Our own win-chance estimate for each car in data/entries.js (shown in "Pick your podium"). NOT betting odds.

GT World Challenge Europe, from the series' own results pages (gt-world-challenge-europe.com/results/<season>/<round>/<session>).
Within each class, chance = softmax(weight) over the class's cars, floored at 0.5%, where

  before qualifying:  weight = FORM_C * (form - 0.5)
  after qualifying:   weight = FORM_C2 * (form - 0.5) - GRID_A * (class qualifying position - 1)

  form = the car number's average class finishing percentile in this season's earlier Endurance Cup races (1.0 = won its
         class every time, 0.0 = last), pulled toward 0.5 (FORM_K) so one lucky race does not make a favourite; a car with no
         earlier race counts as 0.5 (neutral). The earlier races are discovered from the series' results index (every other
         round of the season whose Main Race classification exists).

The constants come from a backtest on the four 2026 Endurance Cup races (17 class-races; tools/podium_backtest_fetch.py then
tools/podium_backtest.py reproduce it): class qualifying position was by far the best predictor (log-loss 1.88 vs 2.32 for equal
chances); season points, practice pace and past finishes added little, so before qualifying the chances are deliberately close to
equal. It knows nothing about balance of performance, weather, tyres, strategy or driver changes. Small sample: a form guide.

Usage:  python3 tools/podium_odds.py --round portimao                 # before qualifying
        python3 tools/podium_odds.py --round portimao --quali         # after qualifying (reads the Qualifying Combined page)
        python3 tools/podium_odds.py --round portimao --quali --grid-round n%C3%BCrburgring   # rehearsal with a past round's grid
        python3 tools/podium_odds.py --test monza                     # print a round's class grid, writes nothing
Rewrites the cars (fields 5-7: win chance %, basis text, shrunk form) and `oddsAsOf` of the data/entries.js entry whose live.round is
--round. Options: --season 2026 (default)."""
import sys, json, math, collections, re
sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
import gtwce_lib as L
FORM_C, FORM_C2, GRID_A, FORM_K = 3.0, 0.5, 0.35, 2   # FORM_K: form is pulled toward 0.5 as if the car had 2 extra average races
A = sys.argv[1:]
def opt(name, default=None): return A[A.index(name) + 1] if name in A else default
SEASON, ROUND, QUALI = opt("--season", "2026"), opt("--round"), "--quali" in A

if opt("--test"):
    g = L.class_ranks(L.table(L.page(SEASON, opt("--test"), "qualifying-combined")))
    for c in ["Pro", "Gold", "Silver", "Bronze"]: print(c, [n for n, v in sorted(g.items(), key=lambda kv: kv[1][1]) if v[0] == c])
    sys.exit()
if not ROUND:   # backward compatible: with exactly one live entry, that is the round
    live = [b[2] for b in L.entry_blocks(L.read("data/entries.js").split("\n")) if b[2]]
    if len(live) != 1: sys.exit("--round <slug> is required (there is not exactly one live entry)")
    ROUND = live[0]

hist = collections.defaultdict(list)
for rnd in L.endurance_done(SEASON, exclude=[ROUND]):
    for n, (c, pos, size) in L.class_ranks(L.table(L.page(SEASON, rnd, "main-race"))).items():
        hist[n].append(1 - (pos - 1) / max(1, size - 1))
grid = L.class_ranks(L.table(L.page(SEASON, opt("--grid-round", ROUND), "qualifying-combined"))) if QUALI else {}
if QUALI and not grid: sys.exit("No Qualifying Combined result for this round yet.")

lines = L.read("data/entries.js").split("\n")
blk = [b for b in L.entry_blocks(lines) if b[2] == ROUND]
if not blk: sys.exit(f"No entry with live.round {ROUND} in data/entries.js")
start, end = blk[0][0], blk[0][1]

def suffix(i): return "st" if i == 1 else "nd" if i == 2 else "rd" if i == 3 else "th"
def flush(buf, cls):
    ws = []; info = []
    last = 1 + max([v[1] for v in grid.values() if v[0] == cls] or [0])   # a car with no qualifying time is treated as starting last
    for _, row, m in buf:
        h = hist.get(row[0], []); form = (sum(h) + 0.5 * FORM_K) / (len(h) + FORM_K) if h else 0.5
        g = grid.get(row[0]); g = g if g and g[0] == cls else None
        ws.append((FORM_C2 if QUALI else FORM_C) * (form - 0.5) - (GRID_A * ((g[1] if g else last) - 1) if QUALI else 0))
        info.append((sum(h) / len(h) if h else 0.5, len(h), g, form))
    ex = [math.exp(w) for w in ws]; z = sum(ex); pr = [max(0.005, e / z) for e in ex]; z2 = sum(pr); pr = [p / z2 for p in pr]
    out = []
    for (ln, row, m), p, (raw, nh, g, form) in zip(buf, pr, info):
        bits = []
        if QUALI and not g: bits.append("No qualifying time, so counted as starting last")
        if QUALI and g: bits.append(f"Qualified {g[1]}{suffix(g[1])} of {g[2]} in {cls}")
        bits.append(f"averaged top {round((1 - raw) * 100)}% of class in {nh} Endurance Cup race{'s' if nh != 1 else ''} this year" if nh else "no earlier 2026 Endurance Cup race with this number")
        out.append(f'{m.group(1)}{json.dumps(row[:4] + [round(p * 100, 1), ". ".join(bits), round(form, 3)], ensure_ascii=False)}{m.group(3)}')
    return out

res = lines[:start]; buf = []; cls = None
for ln in lines[start:end + 1]:
    m = re.match(r'\s*\{ h:"(\w[\w-]*)", cars:\[', ln)
    if m: cls = m.group(1); buf = []; res.append(ln); continue
    m = re.match(r'(\s*)(\[".*\])(,?)\s*$', ln)
    if m and cls: buf.append((ln, json.loads(m.group(2)), m)); continue
    if cls and buf: res += flush(buf, cls); buf = []; cls = None
    res.append(ln)
note = ("After qualifying (class grid from the official Qualifying Combined result): grid position now drives the chances, tilted slightly by this season's Endurance Cup finishes."
        if QUALI else "Before qualifying: close to even, tilted slightly by this season's Endurance Cup finishes. They sharpen once qualifying is in.")
res = [re.sub(r'oddsAsOf:"[^"]*"', "oddsAsOf:" + json.dumps(note), l, count=1) for l in res[:end + 1]] + lines[end + 1:]
L.write("data/entries.js", "\n".join(res))
print("done", "(after qualifying)" if QUALI else "(before qualifying)")
