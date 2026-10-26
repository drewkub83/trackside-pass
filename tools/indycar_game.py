#!/usr/bin/env python3
"""The "Pick your podium" entry for NTT INDYCAR SERIES races (data/entries.js, one class "Race"), built from INDYCAR's own results service
(www.indycar.com/api/results, the one tools/indycar_update.py reads). Called by tools/auto_update.py on every run (every 30 minutes Thursday to Monday).

When: from 8 days before an INDYCAR event the app has, until its race has been run.
Who is in the field: the cars of the weekend's own practice sessions once they exist (the real entry), else the cars of the latest race before it
  (the entry list is not published in a form we can read; the note says so). Car numbers are the official ones.
Win chances (our own estimate, NOT betting odds), softmax over the field, floored at 0.5%:
  before qualifying   weight = C0 * (form - 0.5)
  after qualifying    weight = C1 * (form - 0.5) - A * (grid position - 1)           (grid = the weekend's qualifying classification)
  form = a driver's average finishing percentile over his last 6 INDYCAR races (1.0 = won, 0.0 = last), pulled toward 0.5 as if he had 2 extra average races.
  Fitted by a backtest on 86 races, 2022-2026 (winner log-loss: equal chances -3.29, form only -2.54 (road/street) / -2.70 (oval), form + grid -2.08 / -2.43;
  the predicted chances matched the actual win rates in every bucket from 1% to 40%). Road and street courses and ovals have their own constants (OVAL below).
  It knows nothing about strategy, weather, tyres, engines or driver changes: a form guide.
Idempotent; only rewrites an entry that this script wrote (note ends with "(automatic update)"). Options: --now 2026-09-01T12:00:00Z, --dry-run,
--print (print the entry, write nothing), --no-quali (rehearsal: ignore the qualifying results), --event "<INDYCAR event name>" --track <id> --day YYYY-MM-DD (rehearse on any past race). Stdlib only."""
import sys, os, re, json, math, datetime, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
A = sys.argv[1:]; DRY = "--dry-run" in A; PRINT = "--print" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
SID = "b856a4f1-e85c-4fac-8c36-fd58d962227a"; API = "https://www.indycar.com/api/results/"
MARK = "(automatic update)"
WINDOW, SHRINK = 6, 2
ROAD = dict(c0=10.0, c1=8.0, a=0.20); OVAL = dict(c0=8.0, c1=6.0, a=0.15)
# event-name regex -> track id (the same table as tools/indycar_update.py; add a venue when INDYCAR races at a new one)
VENUES = {
 "st-petersburg": r"St\.? ?Pete", "long-beach": r"Long Beach", "barber": r"Barber|Alabama", "indianapolis": r"^GMR Grand Prix$|^Sonsio Grand Prix$|Angie.s List Grand Prix|^INDYCAR Grand Prix$|^Grand Prix Of Indianapolis$|^Gallagher Grand Prix$",
 "indianapolis-oval": r"Indianapolis 500|Indy 500", "detroit": r"Detroit", "laguna-seca": r"Laguna Seca|Monterey", "phoenix": r"Phoenix|Desert Diamond|Good Ranchers", "arlington": r"Arlington",
 "mid-ohio": r"Mid-Ohio", "road-america": r"Road America", "portland": r"Portland", "milwaukee-mile": r"Milwaukee", "wwt-raceway": r"Bommarito|World Wide Technology|Gateway", "barcelona-catalunya": r"Barcelona",
}
def get(path):
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(API + path, headers={"User-Agent": "Mozilla/5.0 (Trackside Pass data tools)"}), timeout=40) as r:
                t = r.read().decode("utf-8", "replace")
                return json.loads(t) if t.startswith(("{", "[")) else None
        except Exception: pass
    return None
def mdy(s): m, d, y = map(int, s.split("/")); return datetime.date(y, m, d)
def venue_of(name):
    if re.search(r"nxt|lights|test", name, re.I): return None
    for t, rx in VENUES.items():
        if re.search(rx, name, re.I): return t
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

def seasons(years):
    """Every INDYCAR race of the given years, oldest first: {date, name, oval, rows:[{name,num,team,fin}], ev, sessions}."""
    out = []
    drop = get(f"SeasonDropDown?id={SID}") or []
    for y in drop:
        if y["Year"] not in years: continue
        for ev in y["Events"]:
            sess = {s["SessionName"]: s["EventsSessionID"] for s in ev["Sessions"]}
            if "Race" not in sess: continue
            d = get(f"EventsSessionDetails?id={sess['Race']}")
            if not d or not d.get("SessionDate"): continue
            recs = [{"name": r["DriverName"], "num": str(r["CarNumber"]), "team": r["TeamName"], "fin": r["PositionFinish"]} for r in (d.get("records") or []) if r.get("PositionFinish")]
            out.append({"date": mdy(d["SessionDate"]), "name": ev["EventName"], "oval": d.get("TrackType") == "O", "rows": recs, "ev": ev, "sess": sess})
    out.sort(key=lambda r: r["date"]); return out

def forms(history, before):
    """driver -> shrunk average finishing percentile over the last WINDOW races before `before`."""
    h = {}
    for r in history:
        if r["date"] >= before or len(r["rows"]) < 10: continue
        n = len(r["rows"])
        for x in r["rows"]: h.setdefault(x["name"], []).append(1 - (x["fin"] - 1) / max(1, n - 1))
    return {k: (sum(v[-WINDOW:]) + 0.5 * SHRINK) / (len(v[-WINDOW:]) + SHRINK) for k, v in h.items()}, {k: len(v[-WINDOW:]) for k, v in h.items()}

def records(session_id):
    d = get(f"EventsSessionDetails?id={session_id}"); return (d or {}).get("records") or []

def build(race, history, track):
    ev, day = race["ev"], race["date"]
    prior = [r for r in history if r["date"] < day and len(r["rows"]) >= 10]
    # the field: the weekend's practice cars when practice has run, else the latest earlier race
    pr_ids = [i for n, i in race["sess"].items() if re.search(r"practice", n, re.I)]
    cars = {}
    for i in pr_ids:
        for r in records(i):
            if r.get("CarNumber") is not None: cars[str(r["CarNumber"])] = (r["DriverName"], r["TeamName"])
    src = "practice sessions of this weekend" if len(cars) >= 15 else None
    if not src:
        cars = {x["num"]: (x["name"], x["team"]) for x in (prior[-1]["rows"] if prior else [])}
        src = f'the field of the latest race, the {prior[-1]["name"]} ({prior[-1]["date"].isoformat()}), until this weekend\'s practice is published' if prior else None
    if not cars or not src: return None
    # qualifying grid
    qs = [(n, i) for n, i in race["sess"].items() if re.search(r"qualif", n, re.I)] if "--no-quali" not in A else []
    qrec = []
    for n, i in qs:
        rec = [r for r in records(i) if r.get("PositionFinish")]
        if n == "Combined Qualifying" and rec: qrec = rec; break
        if len(rec) > len(qrec): qrec = rec
    grid = {str(r["CarNumber"]): int(r["PositionFinish"]) for r in qrec}
    qual = bool(grid) and sum(1 for n in cars if n in grid) >= 0.9 * len(cars)
    f, nraces = forms(history, day); P = OVAL if race["oval"] else ROAD
    rows = []
    for num, (name, team) in cars.items():
        rows.append(dict(num=num, name=name, team=team, f=f.get(name, 0.5), k=nraces.get(name, 0), g=grid.get(num)))
    top = max([x["g"] for x in rows if x["g"]] or [len(rows)])
    for x in rows:
        if qual and not x["g"]: x["g"] = top + 1
    ws = [(P["c1"] * (x["f"] - 0.5) - P["a"] * (x["g"] - 1)) if qual else P["c0"] * (x["f"] - 0.5) for x in rows]
    m = max(ws); ex = [math.exp(v - m) for v in ws]; z = sum(ex); pr = [max(0.005, e / z) for e in ex]; z2 = sum(pr); pr = [p / z2 for p in pr]
    out = []
    for x, p in sorted(zip(rows, pr), key=lambda t: -t[1]):
        basis = (f"Qualified {ordinal(x['g'])} of {len(rows)}. " if qual else "") + (f"averaged top {round((1 - x['f']) * 100)}% of the field over his last {x['k']} INDYCAR race{'s' if x['k'] != 1 else ''}" if x["k"] else "no INDYCAR race in the data yet: counted as average")
        out.append([x["num"], x["name"], x["team"], "", round(p * 100, 1), basis, round(x["f"], 3)])
    odds = ("After qualifying (grid from the weekend's qualifying classification): grid position now drives the chances, tilted by recent form." if qual
            else "Before qualifying: recent form only (each driver's average finishing position over his last 6 INDYCAR races). The chances are rebuilt from the grid once qualifying is published.")
    as_of = f"Cars from the {src}, with their official car numbers (INDYCAR results service). Late changes are possible."
    note = f"Source: indycar.com results service, read {now.date().isoformat()}. Win chances are our own estimate, not betting odds. {MARK}"
    cars_txt = ",\n".join("        [" + ", ".join(js(v) for v in r) + "]" for r in out)
    return qual, len(out), (f'  {{ t:{js(track)}, d:{js(race["_appday"])}, s:"indycar", oddsAsOf:{js(odds)}, asOf:{js(as_of)},\n    classes:[\n      {{ h:"Race", cars:[\n{cars_txt}\n      ] }}\n    ],\n    note:{js(note)} }}')

def main():
    today = now.date(); events = D.track_events()
    history = seasons({str(today.year), str(today.year - 1), str(today.year - 2)})
    if not history: print("INDYCAR results service unreadable"); return
    forced = opt("--event")
    for race in history:
        track = opt("--track") if forced and race["name"] == forced else (venue_of(race["name"]) if not forced else None)
        if not track: continue
        if forced and (race["name"] != forced): continue
        day = race["date"]
        if forced:
            race["_appday"] = opt("--day", day.isoformat())
        else:
            appev = D.app_event(events, track, day.isoformat())
            if not appev: continue
            race["_appday"] = appev["d"]; evs = datetime.date.fromisoformat(appev["d"])
            if not (evs - datetime.timedelta(days=8) <= today <= day): continue
            if any(x["fin"] for x in race["rows"]): continue          # the race has been run: nothing left to pick
        res = build(race, history, track)
        if not res: print(f'{race["name"]}: no field to build from yet'); continue
        qual, n, text = res
        print(f'{race["name"]} ({day}) -> {track}: {n} cars, {"after" if qual else "before"} qualifying')
        if PRINT: print(text)
        key = f'  {{ t:{js(track)}, d:{js(race["_appday"])}, s:"indycar"'
        if replace_entry("data/entries.js", lambda t: t.startswith(key), text): print("  entries: written" if not (DRY or PRINT) else "  entries: would write")
main()
