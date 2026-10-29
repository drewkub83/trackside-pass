#!/usr/bin/env python3
"""The "Pick your podium" entry for MotoGP Sunday Grands Prix (data/entries.js, one class "Race"), built from the series' own results service
(api.pulselive.motogp.com, the one tools/motogp_update.py reads). Called by tools/auto_update.py on every run (every 30 minutes Thursday to Monday).

When: from 8 days before a MotoGP weekend the app has (an event whose `s` starts with "MotoGP") until its Sunday race has been run. The Sprint is not part of the game
(the game scores the Sunday Grand Prix, which tools/motogp_update.py writes into data/results.js as "#NN Rider (Team)").
Who is in the field: the weekend's own practice classification once practice has run, else the riders of the latest Sunday race (the entry list is not in the service
before the weekend; the note says so). Numbers are the official ones.
Win chances (our own estimate, NOT betting odds), softmax over the field, floored at 0.5%:
  before qualifying   weight = C0 * (form - 0.5)
  after qualifying    weight = C1 * (form - 0.5) - A * (grid position - 1)   (grid = Q2 order for the first 12, then Q1 order from 3rd place; penalties not applied)
  form = a rider's average finishing percentile over his last 6 Sunday races (1.0 = won, 0.0 = last; a race he did not finish counts as last), pulled toward 0.5 as if he had 2 extra average races.
  Constants come from `--backtest` on the Sunday races of the 2024-2026 seasons (see CONST).
Idempotent; only rewrites an entry that this script wrote (note ends with "(automatic update)"). Options: --now, --dry-run, --print, --no-quali, --backtest. Stdlib only; needs node."""
import sys, os, re, json, math, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
import motogp_update as M
A = sys.argv[1:]; DRY = "--dry-run" in A; PRINT = "--print" in A
now = M.now; MARK = "(automatic update)"; get = M.get; js = M.js
WINDOW, SHRINK = 6, 2
CONST = dict(c0=8.0, c1=6.0, a=0.5)   # `--backtest` on 59 Sunday races (2024-2026): winner log-loss equal chances -3.08, form only -2.29, form + grid -1.65
CAT = M.CAT_MOTOGP
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

_cache = {}
def classification(sid):
    if sid not in _cache:
        d = get(f"results/session/{sid}/classification?test=false"); _cache[sid] = [x for x in (d or {}).get("classification") or []]
    return _cache[sid]
def season_events(year):
    seasons = get("results/seasons") or []; S = next((x for x in seasons if x.get("year") == year), None)
    if not S: return []
    return [e for e in (get(f"results/events?seasonUuid={S['id']}") or []) if not e.get("test") and e.get("kind") in (None, "GP") and "TEST" not in e["name"].upper()]
def sessions(ev):
    ss = get(f"results/sessions?eventUuid={ev['id']}&categoryUuid={CAT}") or []
    return ss if isinstance(ss, list) else []
def history(years):
    """Finished Sunday races of the given years, oldest first: {date, name, rows:[{name,num,team,fin}], grid:{num:pos}}."""
    out = []
    for y in years:
        for ev in season_events(y):
            ss = sessions(ev); race = next((s for s in ss if s.get("type") == "RAC"), None)
            if not race: continue
            c = [x for x in classification(race["id"])]
            rows = [{"name": x["rider"]["full_name"], "num": str(x["rider"]["number"]), "team": x["team"]["name"], "fin": x["position"] if x.get("position") else None} for x in c]
            if len([r for r in rows if r["fin"]]) < 10: continue
            out.append({"date": ev["date_start"][:10], "name": ev["name"], "rows": rows, "grid": grid_of(ss), "ev": ev})
    out.sort(key=lambda r: r["date"]); return out
def grid_of(ss):
    q2 = next((s for s in ss if s.get("type") == "Q" and s.get("number") == 2), None); q1 = next((s for s in ss if s.get("type") == "Q" and s.get("number") == 1), None)
    if not q2: return {}
    g = {}; c2 = [x for x in classification(q2["id"]) if x.get("position")]
    for x in sorted(c2, key=lambda x: x["position"]): g[str(x["rider"]["number"])] = len(g) + 1
    if q1:
        for x in sorted([x for x in classification(q1["id"]) if x.get("position")], key=lambda x: x["position"]):
            n = str(x["rider"]["number"])
            if n not in g: g[n] = len(g) + 1
    return g
def forms(hist, before):
    h = {}
    for r in hist:
        if r["date"] >= before: continue
        n = len(r["rows"])
        for x in r["rows"]:
            fin = x["fin"] or n
            h.setdefault(x["name"], []).append(1 - (fin - 1) / max(1, n - 1))
    return {k: (sum(v[-WINDOW:]) + 0.5 * SHRINK) / (len(v[-WINDOW:]) + SHRINK) for k, v in h.items()}, {k: len(v[-WINDOW:]) for k, v in h.items()}
def weights(rows, qual, P): return [(P["c1"] * (x["f"] - 0.5) - P["a"] * (x["g"] - 1)) if qual else P["c0"] * (x["f"] - 0.5) for x in rows]
def softmax(ws):
    m = max(ws); ex = [math.exp(v - m) for v in ws]; z = sum(ex); pr = [max(0.005, e / z) for e in ex]; z2 = sum(pr); return [p / z2 for p in pr]
def backtest():
    hist = history([now.year - 2, now.year - 1, now.year]); print(len(hist), "Sunday races"); races = []
    for r in hist:
        f, _ = forms(hist, r["date"]); rows = [dict(f=f.get(x["name"], 0.5), g=r["grid"].get(x["num"]) or 99, win=x["fin"] == 1) for x in r["rows"]]
        if not any(x["win"] for x in rows): continue
        top = max([x["g"] for x in rows if x["g"] < 99] or [len(rows)])
        for x in rows:
            if x["g"] == 99: x["g"] = top + 1
        races.append(rows)
    def ll(qual, P): return sum(math.log(next(p for x, p in zip(rows, softmax(weights(rows, qual, P))) if x["win"])) for rows in races) / len(races)
    eq = sum(math.log(1 / len(r)) for r in races) / len(races)
    b0 = max((ll(False, dict(c0=c, c1=0, a=0)), c) for c in (0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 15))
    b1 = max((ll(True, dict(c0=0, c1=c, a=a)), c, a) for c in (0, 1, 2, 3, 4, 6, 8, 10, 12) for a in (0, .03, .06, .1, .15, .2, .3, .4, .5, .7))
    print(f"{len(races)} races: winner log-loss equal {eq:.2f}, form only {b0[0]:.2f} (c0={b0[1]}), form+grid {b1[0]:.2f} (c1={b1[1]}, a={b1[2]})")

def app_events(today):
    import subprocess
    js_txt = """const fs=require('fs');const skip=['champs.js','series.js','results.js','entries.js','standings.js','watch.js'];const out=[];
for(const f of fs.readdirSync('data')){ if(!/^[a-z0-9-]+\\.js$/.test(f)||skip.includes(f)) continue; const T=[]; try{ new Function('TRACKS',fs.readFileSync('data/'+f,'utf8'))(T); }catch(e){ continue } const t=T[0]; if(!t) continue;
 for(const e of t.events||[]) if(/^MotoGP/i.test(e.s||'')) out.push({t:t.id,d:e.d,n:e.t||1,e:e.e||''}); } console.log(JSON.stringify(out))"""
    evs = json.loads(subprocess.run(["node", "-e", js_txt], capture_output=True, text=True, cwd=D.ROOT).stdout or "[]")
    return [e for e in evs if datetime.date.fromisoformat(e["d"]) - datetime.timedelta(days=8) <= today <= datetime.date.fromisoformat(e["d"]) + datetime.timedelta(days=e["n"] - 1)]
def build(e, hist):
    d0 = e["d"]; f, nr = forms(hist, d0)
    ev = next((x for x in season_events(int(d0[:4])) if x["date_start"][:10] == d0), None); ss = sessions(ev) if ev else []
    race = next((s for s in ss if s.get("type") == "RAC"), None)
    if race and len([x for x in classification(race["id"]) if x.get("position")]) >= 10: return "done"
    cars = {}; src = None
    for s in ss:
        if s.get("type") in ("FP", "PR"):
            for x in classification(s["id"]):
                if x.get("rider"): cars[str(x["rider"]["number"])] = (x["rider"]["full_name"], x["team"]["name"])
    if len(cars) >= 18: src = "practice sessions of this weekend"
    else:
        last = hist[-1] if hist else None
        if not last: return None
        cars = {x["num"]: (x["name"], x["team"]) for x in last["rows"] if x["fin"] or True}; src = f'the field of the latest Sunday race, the {M.pretty_event(last["name"])} ({last["date"]}), until this weekend\'s practice is published'
    grid = {} if "--no-quali" in A else grid_of(ss)
    qual = bool(grid) and sum(1 for n in cars if n in grid) >= 0.9 * len(cars)
    rows = [dict(num=n, name=nm, team=tm, f=f.get(nm, 0.5), k=nr.get(nm, 0), g=grid.get(n)) for n, (nm, tm) in cars.items()]
    top = max([x["g"] for x in rows if x["g"]] or [len(rows)])
    for x in rows:
        if qual and not x["g"]: x["g"] = top + 1
    pr = softmax(weights(rows, qual, CONST)); out = []
    for x, p in sorted(zip(rows, pr), key=lambda t: -t[1]):
        basis = (f"Qualified {ordinal(x['g'])} of {len(rows)}. " if qual else "") + (f"averaged top {round((1 - x['f']) * 100)}% of the field over his last {x['k']} Sunday race{'s' if x['k'] != 1 else ''}" if x["k"] else "no Sunday race in the data yet: counted as an average rider")
        out.append([x["num"], x["name"], x["team"], "", round(p * 100, 1), basis, round(x["f"], 3)])
    odds = ("After qualifying (grid from Q2, then Q1): grid position now drives the chances, tilted by recent form. Penalties are not applied." if qual
            else "Before qualifying: recent form only (each rider's average finishing position over his last 6 Sunday races). The chances are rebuilt from the grid once qualifying is published.")
    as_of = f"Riders from the {src}, with their official numbers (MotoGP results service). Late changes are possible. Picks lock when the first race of the weekend, the Saturday Sprint, starts; the game scores the Sunday Grand Prix."
    note = f"Source: the MotoGP results service (api.pulselive.motogp.com, the data motogp.com uses), read {now.date().isoformat()}. Win chances are our own estimate, not betting odds. {MARK}"
    cars_txt = ",\n".join("        [" + ", ".join(js(v) for v in row) + "]" for row in out)
    return qual, len(out), (f'  {{ t:{js(e["t"])}, d:{js(d0)}, s:"motogp", oddsAsOf:{js(odds)}, asOf:{js(as_of)},\n    classes:[\n      {{ h:"Race", cars:[\n{cars_txt}\n      ] }}\n    ],\n    note:{js(note)} }}')
def main():
    if "--backtest" in A: return backtest()
    cands = app_events(now.date())
    if not cands: print("no MotoGP weekend within 8 days"); return
    hist = history([now.year - 1, now.year])
    for e in cands:
        res = build(e, hist)
        if res == "done": print(f'{e["e"]}: Sunday race already run'); continue
        if not res: print(f'{e["e"]}: no field to build from yet'); continue
        qual, n, text = res; print(f'{e["e"]} -> {e["t"]}: {n} riders, {"after" if qual else "before"} qualifying')
        if PRINT: print(text)
        key = f'  {{ t:{js(e["t"])}, d:{js(e["d"])}, s:"motogp"'
        if replace_entry("data/entries.js", lambda t: t.startswith(key), text): print("  entries: written" if not (DRY or PRINT) else "  entries: would write")
if __name__ == "__main__": main()
