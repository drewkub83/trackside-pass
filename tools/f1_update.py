#!/usr/bin/env python3
"""Keeps the Formula 1 data current with nobody's computer involved (called by tools/auto_update.py every 30 minutes Thu-Mon on GitHub
Actions; also fine by hand). Source: the Jolpica F1 API (api.jolpi.ca), the community-run Ergast-compatible mirror of the official FIA
classifications, because formula1.com refuses server requests (HTTP 475). Cross-check a result against formula1.com when it matters.
For each Grand Prix at a venue the app has an F1 event for:
  1. data/entries.js    "Pick your podium" entry for the weekend (from 8 days before until the race starts): the drivers of the last race, with
                        our win chances. Before qualifying the chances come from recent form only; once qualifying is published they are
                        rebuilt from the grid too.
  2. data/results.js    the top ten of the race, each as "#NUMBER Driver (Team)" (the game matches the number), from race end +30 minutes; re-read
                        for 2 days after, a post-race penalty can move the order
  3. data/standings.js  the drivers' and constructors' tables after each race
Win-chance model (backtested on the 65 Grands Prix of 2024-2026, winner log-loss: equal chances 3.02, form only 1.97, grid + form 1.23):
  before qualifying  p ~ exp(5.5 * form)               form = average points of the driver's last 6 races / 25
  after qualifying   p ~ exp(-1.8 * ln(grid) + 2.5 * form)
Idempotent. Usage: python3 tools/f1_update.py [--now 2026-10-24T12:00:00Z] [--dry-run]"""
import sys, os, re, json, math, time, datetime, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
A = sys.argv[1:]; DRY = "--dry-run" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
API = "https://api.jolpi.ca/ergast/f1/"
MARK = "(automatic update) "
# Jolpica circuitId -> the app's track id
TRACKS = {"americas": "cota", "rodriguez": "mexico-city", "interlagos": "interlagos", "vegas": "las-vegas", "losail": "lusail", "yas_marina": "yas-marina",
          "spa": "spa-francorchamps", "hungaroring": "hungaroring", "portimao": "portimao"}
A_FORM, B_FORM_Q, A_GRID, B_FORM_G = 5.5, 5.5, 1.8, 2.5

def get(path):
    for k in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(API + path, headers={"User-Agent": "TracksidePass/1.0 (personal race-day app)"}), timeout=40) as r: return json.load(r)["MRData"]
        except Exception: time.sleep(1.5 + k * 1.5)
    return None
def season_rows(y):
    rows, off = [], 0
    while True:
        d = get(f"{y}/results.json?limit=100&offset={off}")
        if not d: return rows
        for r in d["RaceTable"]["Races"]:
            for x in r["Results"]: rows.append((int(r["round"]), x["Driver"]["driverId"], float(x["points"])))
        off += 100
        if off >= int(d["total"]): return rows
        time.sleep(0.3)
def forms(year, before_round):
    """driverId -> average points of the last 6 races before `before_round` (earlier races of this year, then last year's)."""
    hist = {}
    for y in (year - 1, year):
        for rnd, drv, pts in season_rows(y):
            if y == year and rnd >= before_round: continue
            hist.setdefault(drv, []).append(pts)
    return {d: sum(h[-6:]) / len(h[-6:]) / 25 for d, h in hist.items()}
TEAMS = {"Red Bull": "Red Bull Racing", "RB F1 Team": "Racing Bulls", "Alpine F1 Team": "Alpine", "Haas F1 Team": "Haas", "Cadillac F1 Team": "Cadillac", "Aston Martin": "Aston Martin"}   # Jolpica's constructor names -> the ones formula1.com (and our standings) use
NAMES = {"Andrea Kimi Antonelli": "Kimi Antonelli"}   # the short names formula1.com uses
def team(n): return TEAMS.get(n, n)
def who(g, f): n = f"{g} {f}"; return NAMES.get(n, n)
def ordinal(n): return f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"

def js(v): return json.dumps(v, ensure_ascii=False)
def replace_entry(rel, test, text, anchor):
    """Replace (or insert) one top-level entry of a data file: entries start at column 2 with '  { ' and run to the next one or the closing '];'."""
    s = D.read(rel); starts = [m.start() for m in re.finditer(r"^  \{ ", s, flags=re.M)]; end = s.rindex("];")
    for i, st in enumerate(starts):
        nxt = starts[i + 1] if i + 1 < len(starts) else end
        if test(s[st:nxt]):
            old = s[st:nxt]; tail = "\n" if old.endswith("\n") else ""
            body = text + ("," if old.rstrip().endswith(",") or i + 1 < len(starts) else "") + "\n"
            if old == body: return False
            if not DRY: D.write(rel, s[:st] + body + s[nxt:])
            return True
    head = s[:end].rstrip()
    if head.endswith("}"): head += ","
    if not DRY: D.write(rel, head + "\n" + text + "\n" + s[end:] if anchor else head + "\n" + text + "\n" + s[end:])
    return True

def entry_text(t, d, rows, as_of, odds_as_of, note):
    cars = ",\n".join("        [" + ", ".join(js(x) for x in r) + "]" for r in rows)
    return (f'  {{ t:{js(t)}, d:{js(d)}, s:"f1", oddsAsOf:{js(odds_as_of)}, asOf:{js(as_of)},\n    classes:[\n      {{ h:"Race", cars:[\n{cars}\n      ] }}\n    ],\n    note:{js(note)} }}')

def main():
    sched = get(f"{now.year}.json?limit=40")
    if not sched: print("Jolpica unreadable"); return
    events = D.track_events(); today = now.date()
    for race in sched["RaceTable"]["Races"]:
        track = TRACKS.get(race["Circuit"]["circuitId"]); rnd = int(race["round"])
        if not track: continue
        rd = datetime.date.fromisoformat(race["date"]); rstart = datetime.datetime.fromisoformat(f'{race["date"]}T{race.get("time","12:00:00Z")}'.replace("Z", "+00:00"))
        ev = D.app_event(events, track, race["date"]) or D.app_event(events, track, (rd - datetime.timedelta(days=1)).isoformat())
        if not ev or not ev["e"]: continue
        evs = datetime.date.fromisoformat(ev["d"])
        if not (evs - datetime.timedelta(days=8) <= today <= rd + datetime.timedelta(days=2)): continue
        print(f'round {rnd} {race["raceName"]} -> {track}, app event {ev["d"]}')
        if now < rstart: entries_for(race, rnd, track, ev["d"])
        if now >= rstart + datetime.timedelta(minutes=150): result_for(race, rnd, track, ev["d"])

def entries_for(race, rnd, track, d):
    last = get(f"{now.year}/{rnd - 1}/results.json") if rnd > 1 else None
    prev = get(f"{now.year - 1}/last/results.json") if not last or not last["RaceTable"]["Races"] else None
    src = (last or prev)["RaceTable"]["Races"][0]
    f = forms(now.year, rnd); q = get(f"{now.year}/{rnd}/qualifying.json")
    qrows = (q["RaceTable"]["Races"][0]["QualifyingResults"] if q and q["RaceTable"]["Races"] else [])
    grid = {x["Driver"]["driverId"]: int(x["position"]) for x in qrows if str(x["position"]).isdigit()}
    cars = []
    for x in src["Results"]:
        dr = x["Driver"]; fm = f.get(dr["driverId"], 0.2)
        cars.append(dict(num=str(dr.get("permanentNumber") or x["number"]), id=dr["driverId"], name=who(dr["givenName"], dr["familyName"]), team=team(x["Constructor"]["name"]), f=fm))
    qual = bool(grid) and all(c["id"] in grid for c in cars)
    ws = [math.exp(-A_GRID * math.log(grid[c["id"]]) + B_FORM_G * c["f"]) if qual else math.exp(A_FORM * c["f"]) for c in cars]
    z = sum(ws); pr = [max(0.005, w / z) for w in ws]; z2 = sum(pr); pr = [p / z2 for p in pr]
    rows = []
    for c, p in sorted(zip(cars, pr), key=lambda t: -t[1]):
        avg = round(c["f"] * 25, 1)
        basis = (f'Qualified {ordinal(grid[c["id"]])} of {len(cars)}. ' if qual else "") + f"averaged {avg} points a race over the last 6 Grands Prix"
        rows.append([c["num"], c["name"], c["team"], "", round(p * 100, 1), basis, round(c["f"], 3)])
    odds = ("After qualifying (the grid from the official qualifying classification): grid position now drives the chances, tilted by recent form." if qual
            else "Before qualifying: recent form only (average points over each driver's last 6 races). The chances are rebuilt from the grid once qualifying is published.")
    as_of = (f'Drivers who started the {src["raceName"]}, with their official race numbers (Jolpica F1 API, a mirror of the FIA classification). Late changes are possible.')
    note = f'Source: api.jolpi.ca (Ergast-compatible mirror of the official FIA results), read {now.date().isoformat()}. Win chances are our own estimate, not betting odds. {MARK.strip()}'
    text = entry_text(track, d, rows, as_of, odds, note)
    key = f'  {{ t:{js(track)}, d:{js(d)}, s:"f1"'
    if replace_entry("data/entries.js", lambda t: t.startswith(key), text, True): print("  entries:", "after qualifying" if qual else "before qualifying", f"({len(rows)} drivers)")

def result_for(race, rnd, track, d):
    r = get(f"{now.year}/{rnd}/results.json")
    if not r or not r["RaceTable"]["Races"]: print("  no classification yet"); return
    rows = r["RaceTable"]["Races"][0]["Results"]
    if len(rows) < 10: print("  classification incomplete"); return
    lines = ",\n".join("        " + js(f'{x["position"]}. #{x["Driver"].get("permanentNumber") or x["number"]} {who(x["Driver"]["givenName"], x["Driver"]["familyName"])} ({team(x["Constructor"]["name"])})') for x in rows[:10])
    ev = race["raceName"]
    entry = (f'  {{ t:{js(track)}, d:{js(d)}, s:"f1", event:{js(ev)},\n    groups:[\n      {{ h:"Race", order:[\n{lines}\n      ] }}\n    ],\n'
             f'    note:{js(MARK + "Source: api.jolpi.ca (Ergast-compatible mirror of the official FIA race classification), top ten of the Grand Prix on " + race["date"] + ". Sprint results are not included.")} }}')
    key = f'  {{ t:{js(track)}, d:{js(d)}, s:"f1"'
    s = D.read("data/results.js"); m = re.search(r"^" + re.escape(key) + r".*?\n    note:.*? \},?\n", s, flags=re.S | re.M)
    if m and MARK not in m.group(0): print("  results: a hand-written entry exists, kept"); return
    k = s.index("const RESULTS = [") + len("const RESULTS = [\n")
    if m:
        old = m.group(0); body = entry + ("," if old.rstrip().endswith(",") else "") + "\n"
        if old == body: print("  results: already"); return
        print("  results: refreshed")
        if not DRY: D.write("data/results.js", s[:m.start()] + body + s[m.end():])
    else:
        print("  results: added")
        if not DRY: D.write("data/results.js", s[:k] + entry + ",\n" + s[k:])
    standings(race, rnd, {x["Driver"]["driverId"]: team(x["Constructor"]["name"]) for x in rows})

def standings(race, rnd, teams):
    dr = get(f"{now.year}/{rnd}/driverStandings.json"); co = get(f"{now.year}/{rnd}/constructorStandings.json")
    if not dr or not co or not dr["StandingsTable"]["StandingsLists"] or not co["StandingsTable"]["StandingsLists"]: print("  standings unreadable"); return
    dl = dr["StandingsTable"]["StandingsLists"][0]["DriverStandings"]; cl = co["StandingsTable"]["StandingsLists"][0]["ConstructorStandings"]
    nrace = len(get(f"{now.year}.json?limit=40")["RaceTable"]["Races"]); left = nrace - rnd
    asof = f'Current after the {race["raceName"]} ({datetime.date.fromisoformat(race["date"]).strftime("%b %-d, %Y")}): {rnd} races are done and {left} remain.' if left else f'Final {now.year} standings after the {race["raceName"]}; the season is complete.'
    drows = ",\n".join("        { pos:%d, who:%s, pts:%s }" % (int(x["position"]), js(f'{who(x["Driver"]["givenName"], x["Driver"]["familyName"])} ({teams.get(x["Driver"]["driverId"]) or team(x["Constructors"][0]["name"])})'), x["points"].rstrip("0").rstrip(".") if "." in x["points"] else x["points"]) for x in dl)
    crows = ",\n".join("        { pos:%d, who:%s, pts:%s }" % (int(x["position"]), js(team(x["Constructor"]["name"])), x["points"].rstrip("0").rstrip(".") if "." in x["points"] else x["points"]) for x in cl)
    text = (f'  {{ s:"f1", asOf:{js(asof)},\n    classes:[\n      {{ h:"Drivers", rows:[\n{drows}\n      ] }},\n      {{ h:"Constructors", rows:[\n{crows}\n      ] }}\n    ],\n'
            f'    note:{js(MARK + "Source: api.jolpi.ca (Ergast-compatible mirror of the official FIA championship tables), read " + now.date().isoformat() + ". Drivers on the same points share a position only if the table shows it.")} }}')
    s = D.read("data/standings.js"); m = re.search(r'^  \{ s:"f1".*?\n    note:.*? \}(,?)\n', s, flags=re.S | re.M)
    if m:
        cur = re.search(r'asOf:"([^"]*)"', m.group(0)).group(1)
        if race["raceName"] in cur and MARK not in m.group(0): print("  standings: hand-written entry for this race kept"); return
        body = text + m.group(1) + "\n"
        if re.sub(r"read \d{4}-\d\d-\d\d", "", m.group(0)) == re.sub(r"read \d{4}-\d\d-\d\d", "", body): print("  standings: unchanged"); return
        print("  standings: updated")
        if not DRY: D.write("data/standings.js", s[:m.start()] + body + s[m.end():])
    else:
        print("  standings: added")
        if not DRY: k = s.rindex("];"); D.write("data/standings.js", s[:k].rstrip().rstrip(",") + ",\n" + text + "\n];\n")

if __name__ == "__main__": main()
