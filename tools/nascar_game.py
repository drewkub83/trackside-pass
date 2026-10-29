#!/usr/bin/env python3
"""The "Pick your podium" entry for NASCAR Cup Series races (data/entries.js, one class "Race"), built from NASCAR's own race data
(cf.nascar.com/cacher: the same JSON files nascar.com's race pages are drawn from; only published entry lists, grids and FINISHED results are read,
never the live feed). Called by tools/auto_update.py on every run (every 30 minutes Thursday to Monday).

When: from 8 days before a Cup weekend the app has (an event whose `s` starts with "NASCAR Cup Series" in a data/<track>.js) until its race has been run.
Who is in the field: the weekend's own entry list (`weekend-feed.json` of the race: one row per entered car, with the car number, driver, team and make).
Win chances (our own estimate, NOT betting odds), softmax over the field, floored at 0.5%:
  before qualifying   weight = C0 * (form - 0.5)
  after qualifying    weight = C1 * (form - 0.5) - A * (grid position - 1)
  form = a driver's average finishing percentile over his last 6 Cup points races (1.0 = won, 0.0 = last), pulled toward 0.5 as if he had 2 extra average races.
  Constants per kind of track (road courses, ovals, superspeedways = Daytona and Talladega) come from `--backtest` on the 106 races of 2024-2026 (winner log-loss: equal chances -3.62 / -3.64 / -3.69 for ovals / road / superspeedways, form only -3.27 / -3.54 / -3.44, form + grid -2.89 / -2.58 / -3.33).
  It knows nothing about strategy, weather, damage or driver changes: a form guide.
Idempotent; only rewrites an entry that this script wrote (note ends with "(automatic update)"). Options: --now 2026-10-29T12:00:00Z, --dry-run, --print,
--no-quali, --race <race_id> --track <id> --day YYYY-MM-DD (rehearse on any race), --backtest. Stdlib only."""
import sys, os, re, json, math, datetime, urllib.request, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
A = sys.argv[1:]; DRY = "--dry-run" in A; PRINT = "--print" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
HOST = "https://cf.nascar.com/cacher"; MARK = "(automatic update)"
WINDOW, SHRINK = 6, 2
CONST = {"road": dict(c0=4.0, c1=2.0, a=0.30), "oval": dict(c0=8.0, c1=3.0, a=0.15), "super": dict(c0=5.0, c1=6.0, a=0.06)}   # from --backtest on 106 races (2024-2026): road (13 races) is pulled toward form because its best fit, grid only, rests on few races
# NASCAR's track name -> the app's track id for NASCAR weekends (tools/nascar_calendar.py has the same ids)
TRACKS = {"Martinsville Speedway": "martinsville", "Homestead-Miami Speedway": "homestead-miami", "Daytona International Speedway": "daytona-oval", "Atlanta Motor Speedway": "atlanta",
          "Las Vegas Motor Speedway": "las-vegas-motor-speedway", "Darlington Raceway": "darlington", "Bristol Motor Speedway": "bristol", "Talladega Superspeedway": "talladega",
          "Texas Motor Speedway": "texas-motor-speedway", "Kansas Speedway": "kansas", "Dover Motor Speedway": "dover", "North Wilkesboro Speedway": "north-wilkesboro",
          "Charlotte Motor Speedway": "charlotte", "Nashville Superspeedway": "nashville-superspeedway", "Pocono Raceway": "pocono", "Michigan International Speedway": "michigan",
          "Chicagoland Speedway": "chicagoland", "Iowa Speedway": "iowa", "Sonoma Raceway": "sonoma-nascar", "Watkins Glen International": "watkins-glen-nascar",
          "Circuit of The Americas": "cota-nascar", "Phoenix Raceway": "phoenix", "Indianapolis Motor Speedway": "indianapolis-oval", "World Wide Technology Raceway": "wwt-raceway",
          "Richmond Raceway": "richmond", "New Hampshire Motor Speedway": "new-hampshire"}
ROAD = {"sonoma-nascar", "watkins-glen-nascar", "cota-nascar"}; SUPER = {"daytona-oval", "talladega"}
def kind(track_name):
    t = TRACKS.get(track_name, "")
    return "road" if t in ROAD or re.search(r"Naval Base|Roval|Road Course|Chicago Street", track_name or "") else "super" if t in SUPER else "oval"
def get(path):
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(HOST + path, headers={"User-Agent": "TracksidePass/1.0 (personal race-day app)"}), timeout=40) as r: return json.loads(r.read().decode("utf-8", "replace"))
        except Exception: pass
    return None
def js(v): return json.dumps(v, ensure_ascii=False)
def ordinal(n): return f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"
def replace_entry(rel, test, text):
    s = D.read(rel); starts = [m.start() for m in re.finditer(r"^  \{ ", s, flags=re.M)]; end = s.rindex("];")
    for i, st in enumerate(starts):
        nxt = starts[i + 1] if i + 1 < len(starts) else end
        if test(s[st:nxt]):
            old = s[st:nxt]
            if MARK not in old: print("  entries: a hand-written entry exists, kept"); return False
            body = text + ("," if old.rstrip().endswith(",") or i + 1 < len(starts) else "") + "\n"
            if old == body: return False
            if not DRY and not PRINT: D.write(rel, s[:st] + body + s[nxt:])
            return True
    head = s[:end].rstrip()
    if head.endswith("}"): head += ","
    if not DRY and not PRINT: D.write(rel, head + "\n" + text + "\n" + s[end:])
    return True

_feeds = {}
def feed(year, rid):
    k = (year, rid)
    if k not in _feeds:
        d = get(f"/{year}/1/{rid}/weekend-feed.json"); _feeds[k] = (d or {}).get("weekend_race", [None])[0] if d else None
    return _feeds[k]
def calendar(year):
    d = get(f"/{year}/race_list_basic.json") or {}
    return sorted((d.get("series_1") or []), key=lambda r: r["race_date"])
def finished(r, race):
    rows = [x for x in (race or {}).get("results") or [] if x.get("finishing_position")]
    return rows if len(rows) >= 25 and r.get("actual_laps") else None
def history(years):
    """Every finished Cup points race of the given years, oldest first: {date, track, kind, rows:[{name,num,fin,start}]}."""
    out = []
    for y in years:
        for r in calendar(y):
            if r.get("race_type_id") not in (1, None) and r.get("number_of_cars_in_field", 0) < 30: continue
            if re.search(r"Clash|All-Star|Duel", r["race_name"], re.I): continue
            race = feed(y, r["race_id"]); rows = finished(r, race)
            if not rows: continue
            out.append({"date": r["race_date"][:10], "id": r["race_id"], "name": r["race_name"], "track": r["track_name"], "kind": kind(r["track_name"]),
                        "rows": [{"name": x["driver_fullname"], "num": str(x["car_number"]), "fin": x["finishing_position"], "start": x.get("starting_position") or x.get("qualifying_position") or 0} for x in rows]})
    out.sort(key=lambda r: r["date"]); return out
def forms(hist, before):
    h = {}
    for r in hist:
        if r["date"] >= before: continue
        n = len(r["rows"])
        for x in r["rows"]: h.setdefault(x["name"], []).append(1 - (x["fin"] - 1) / max(1, n - 1))
    return {k: (sum(v[-WINDOW:]) + 0.5 * SHRINK) / (len(v[-WINDOW:]) + SHRINK) for k, v in h.items()}, {k: len(v[-WINDOW:]) for k, v in h.items()}
def weights(rows, qual, P):
    return [(P["c1"] * (x["f"] - 0.5) - P["a"] * (x["g"] - 1)) if qual else P["c0"] * (x["f"] - 0.5) for x in rows]
def softmax(ws):
    m = max(ws); ex = [math.exp(v - m) for v in ws]; z = sum(ex); pr = [max(0.005, e / z) for e in ex]; z2 = sum(pr); return [p / z2 for p in pr]

def backtest():
    """Fits the constants on the history: winner log-loss for equal chances, form only and form + grid, per kind of track."""
    hist = history([now.year - 2, now.year - 1, now.year]); print(len(hist), "races")
    data = {"road": [], "oval": [], "super": []}
    for r in hist:
        f, _ = forms(hist, r["date"]); rows = [dict(f=f.get(x["name"], 0.5), g=x["start"] or 99, win=x["fin"] == 1) for x in r["rows"]]
        if not any(x["win"] for x in rows): continue
        top = max(x["g"] for x in rows if x["g"] < 99) if any(x["g"] < 99 for x in rows) else len(rows)
        for x in rows:
            if x["g"] == 99: x["g"] = top + 1
        data[r["kind"]].append(rows)
    def ll(races, qual, P):
        s = 0
        for rows in races:
            pr = softmax(weights(rows, qual, P)); s += math.log(next(p for x, p in zip(rows, pr) if x["win"]))
        return s / len(races)
    for k, races in data.items():
        if not races: continue
        eq = sum(math.log(1 / len(r)) for r in races) / len(races)
        best0 = max(((ll(races, False, dict(c0=c, c1=0, a=0)), c) for c in (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15)))
        best1 = max(((ll(races, True, dict(c0=0, c1=c, a=a)), c, a) for c in (0, 1, 2, 3, 4, 6, 8, 10, 12) for a in (0, .03, .06, .1, .15, .2, .3, .4, .5, .7)))
        print(f"{k}: {len(races)} races; winner log-loss equal {eq:.2f}, form only {best0[0]:.2f} (c0={best0[1]}), form+grid {best1[0]:.2f} (c1={best1[1]}, a={best1[2]})")

def app_events(today):
    js_txt = """const fs=require('fs');const skip=['champs.js','series.js','results.js','entries.js','standings.js','watch.js'];const out=[];
for(const f of fs.readdirSync('data')){ if(!/^[a-z0-9-]+\\.js$/.test(f)||skip.includes(f)) continue; const T=[]; try{ new Function('TRACKS',fs.readFileSync('data/'+f,'utf8'))(T); }catch(e){ continue } const t=T[0]; if(!t) continue;
 for(const e of t.events||[]) if(/^NASCAR Cup Series/i.test(e.s||'')) out.push({t:t.id,d:e.d,n:e.t||1,e:e.e||''}); } console.log(JSON.stringify(out))"""
    evs = json.loads(subprocess.run(["node", "-e", js_txt], capture_output=True, text=True, cwd=D.ROOT).stdout or "[]")
    return [e for e in evs if datetime.date.fromisoformat(e["d"]) - datetime.timedelta(days=8) <= today <= datetime.date.fromisoformat(e["d"]) + datetime.timedelta(days=e["n"] - 1)]

def build(r, race, hist, track, appday):
    rows0 = race.get("results") or []
    if len(rows0) < 15: return None
    day = r["race_date"][:10]; f, nr = forms(hist, day); P = CONST[kind(r["track_name"])]
    grid = {}
    if "--no-quali" not in A:
        for x in rows0:
            g = x.get("starting_position") or x.get("qualifying_position")
            if g: grid[str(x["car_number"])] = int(g)
    qual = sum(1 for x in rows0 if str(x["car_number"]) in grid) >= 0.9 * len(rows0)
    rows = [dict(num=str(x["car_number"]), name=x["driver_fullname"], team=x["team_name"], car=f'{x["car_make"]} {x["car_model"]}'.strip(), f=f.get(x["driver_fullname"], 0.5), k=nr.get(x["driver_fullname"], 0), g=grid.get(str(x["car_number"]))) for x in rows0]
    top = max([x["g"] for x in rows if x["g"]] or [len(rows)])
    for x in rows:
        if qual and not x["g"]: x["g"] = top + 1
    pr = softmax(weights(rows, qual, P)); out = []
    for x, p in sorted(zip(rows, pr), key=lambda t: -t[1]):
        basis = (f"Qualified {ordinal(x['g'])} of {len(rows)}. " if qual else "") + (f"averaged top {round((1 - x['f']) * 100)}% of the field over his last {x['k']} Cup race{'s' if x['k'] != 1 else ''}" if x["k"] else "no Cup race in the data yet: counted as an average driver")
        out.append([x["num"], x["name"], x["team"], x["car"], round(p * 100, 1), basis, round(x["f"], 3)])
    odds = ("After qualifying (starting grid from NASCAR's race data): grid position now drives the chances, tilted by recent form." if qual
            else "Before qualifying: recent form only (each driver's average finishing position over his last 6 Cup races). The chances are rebuilt from the starting grid once qualifying is published.")
    as_of = "Entry list from NASCAR's race data (nascar.com), with the official car numbers. Late changes are possible."
    note = f"Source: NASCAR race data (cf.nascar.com, the files nascar.com's race pages use), read {now.date().isoformat()}. Win chances are our own estimate, not betting odds. {MARK}"
    cars_txt = ",\n".join("        [" + ", ".join(js(v) for v in row) + "]" for row in out)
    return qual, len(out), (f'  {{ t:{js(track)}, d:{js(appday)}, s:"nascar", oddsAsOf:{js(odds)}, asOf:{js(as_of)},\n    classes:[\n      {{ h:"Race", cars:[\n{cars_txt}\n      ] }}\n    ],\n    note:{js(note)} }}')

def main():
    if "--backtest" in A: return backtest()
    today = now.date(); forced = opt("--race")
    cands = [] if forced else app_events(today)
    if not forced and not cands: print("no NASCAR Cup weekend within 8 days"); return
    years = [today.year - 1, today.year]; hist = history(years)
    if not hist: print("NASCAR race data unreadable"); return
    todo = []
    if forced:
        y = int(opt("--day", str(today))[:4]); r = next((x for x in calendar(y) if str(x["race_id"]) == forced), None)
        if not r: print("no such race"); return
        todo = [(r, opt("--track"), opt("--day"))]
    else:
        for e in cands:
            d0 = datetime.date.fromisoformat(e["d"]); end = d0 + datetime.timedelta(days=e["n"] - 1)
            r = next((x for x in calendar(d0.year) if TRACKS.get(x["track_name"]) == e["t"] and d0 <= datetime.date.fromisoformat(x["race_date"][:10]) <= end + datetime.timedelta(days=1)), None)
            if not r: print(f'{e["t"]} {e["d"]}: no race in the NASCAR calendar yet'); continue
            todo.append((r, e["t"], e["d"]))
    for r, track, appday in todo:
        race = feed(int(r["race_date"][:4]), r["race_id"])
        if finished(r, race) and not forced: print(f'{r["race_name"]}: already run'); continue
        res = build(r, race or {}, hist, track, appday)
        if not res: print(f'{r["race_name"]}: no entry list published yet'); continue
        qual, n, text = res
        print(f'{r["race_name"]} ({r["race_date"][:10]}) -> {track}: {n} cars, {"after" if qual else "before"} qualifying')
        if PRINT: print(text)
        key = f'  {{ t:{js(track)}, d:{js(appday)}, s:"nascar"'
        if replace_entry("data/entries.js", lambda t: t.startswith(key), text): print("  entries: written" if not (DRY or PRINT) else "  entries: would write")
if __name__ == "__main__": main()
