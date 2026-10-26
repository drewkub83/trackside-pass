#!/usr/bin/env python3
"""The "Pick your podium" entry for GT World Challenge America weekends (data/entries.js, classes Pro, Pro-Am and Am), from the series' own pages
(gt-world-challenge-america.com): the entry list (/entry-list/<year>/<round>: car number, three drivers, team, car, class) and the qualifying pages
(/results/<year>/<round>/qualifying-N: position and class of every car). Called by tools/auto_update.py on every run (every 30 minutes Thursday to Monday).

When: from 8 days before a weekend the app has for the series (events whose text matches GT World Challenge America or Texas 8 Hour) until its first race starts.
Win chances (our own estimate, NOT betting odds), softmax inside each class, floored at 0.5%, with the constants backtested on GT World Challenge Europe
(tools/podium_odds.py): this series publishes no per-car race results, so they could not be re-fitted here and the note says so.
  before qualifying   weight = 3.0 * (form - 0.5)
  after qualifying    weight = 0.5 * (form - 0.5) - 0.35 * (class qualifying position - 1)     (the weekend's first qualifying session with results)
  form = the car number's average class qualifying percentile in this season's earlier rounds (1.0 = fastest of its class every time), pulled toward 0.5 as if
         the car had 2 extra average sessions; a car with none counts as 0.5.
Idempotent; only rewrites an entry that this script wrote (note ends with "(automatic update)"). Options: --now, --dry-run, --print,
--event-day YYYY-MM-DD --track <id> (rehearse on one weekend). Stdlib only."""
import sys, os, re, json, math, datetime, html, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
A = sys.argv[1:]; DRY = "--dry-run" in A; PRINT = "--print" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
HOST = "https://www.gt-world-challenge-america.com"; MARK = "(automatic update)"
FORM_C, FORM_C2, GRID_A, FORM_K = 3.0, 0.5, 0.35, 2
CLASSES = ["Pro", "Pro-Am", "Am"]
# track id -> words that identify its round in the site's URLs (the site spells Indianapolis "indianpolis" once)
KEYS = {"barber": ["barber"], "cota": ["americas"], "road-atlanta": ["road-atlanta"], "road-america": ["road-america"], "sonoma": ["sonoma"], "watkins-glen": ["watkins"],
        "indianapolis": ["indianapolis", "indianpolis"], "vir": ["virginia"], "sebring": ["sebring"]}
def get(path):
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(HOST + path, headers={"User-Agent": "Mozilla/5.0 (Trackside Pass data tools)"}), timeout=40) as r: return r.read().decode("utf-8", "replace")
        except Exception: pass
    return ""
def js(v): return json.dumps(v, ensure_ascii=False)
def table(h):
    i = h.find("<table")
    if i < 0: return []
    out = []
    for tr in re.findall(r"<tr[\s\S]*?</tr>", h[i:h.find("</table>", i)]):
        out.append([re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", c))).strip() for c in re.findall(r"<t[dh][\s\S]*?</t[dh]>", tr)])
    return out
def round_slug(year, track):
    idx = get(f"/entry-list/{year}")
    for s in dict.fromkeys(re.findall(r'href="/entry-list/%s/([^"/#]+)"' % year, idx)):
        if any(k in s.lower() for k in KEYS.get(track, [])): return s
def entry_list(year, slug):
    t = table(get(f"/entry-list/{year}/{slug}")); cars = {}
    if not t or "Car #" not in t[0]: return {}
    for r in t[1:]:
        if len(r) < 7 or r[-1] not in CLASSES: continue
        drivers = " / ".join(re.sub(r"\*+$", "", d).strip() for d in r[1:4] if d)
        cars.setdefault(r[-1], []).append([r[0], r[4], drivers, r[5]])
    for k in cars: cars[k].sort(key=lambda x: int(x[0]) if x[0].isdigit() else 9999)
    return cars
def class_ranks(year, slug, sess):
    """{car number: (class, rank in class, size of class)} from one qualifying page."""
    t = table(get(f"/results/{year}/{slug}/{sess}"))
    if not t or "Pos" not in t[0] or "Class" not in t[0]: return {}
    ix = {k: t[0].index(k) for k in ("Pos", "Car #", "Class")}; per = {}; out = {}
    for r in t[1:]:
        if len(r) <= max(ix.values()) or not r[ix["Pos"]].isdigit(): continue
        per.setdefault(r[ix["Class"]], []).append(r[ix["Car #"]])
    for c, nums in per.items():
        for i, n in enumerate(nums): out[n] = (c, i + 1, len(nums))
    return out
def sessions(year, slug): return ["qualifying-1", "qualifying-2", "qualifying-3"]   # the round pages do not always link their sessions; an empty page simply gives no table
def forms(year, skip_slug):
    idx = get(f"/results/{year}"); per = {}
    for slug in dict.fromkeys(re.findall(r'href="/results/%s/([^"/#]+)"' % year, idx)):
        if slug == skip_slug or "gala" in slug or "sim-racing" in slug: continue
        for s in sessions(year, slug):
            for n, (c, rk, size) in class_ranks(year, slug, s).items():
                per.setdefault((c, n), []).append(1 - (rk - 1) / max(1, size - 1))
    return {k: ((sum(v) + 0.5 * FORM_K) / (len(v) + FORM_K), len(v)) for k, v in per.items()}
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
def build(track, day):
    year = day[:4]; slug = round_slug(year, track)
    if not slug: print(f"{track} {day}: no round on the series' entry-list page yet"); return None
    cars = entry_list(year, slug)
    if not cars: print(f"{track} {day}: no entry list published yet ({slug})"); return None
    qs = sessions(year, slug); grid = {}
    for s in qs:
        grid = class_ranks(year, slug, s)
        if grid: break
    qual = bool(grid) and sum(1 for c in cars.values() for r in c if r[0] in grid) >= 0.8 * sum(len(c) for c in cars.values())
    f = forms(year, slug); classes = []
    for cls in CLASSES:
        if cls not in cars: continue
        rows = cars[cls]; ws = []
        for r in rows:
            fm, k = f.get((cls, r[0]), (0.5, 0))
            ws.append((FORM_C2 * (fm - 0.5) - GRID_A * (grid[r[0]][1] - 1)) if qual and r[0] in grid else FORM_C * (fm - 0.5))
        m = max(ws); ex = [math.exp(v - m) for v in ws]; z = sum(ex); pr = [max(0.005, e / z) for e in ex]; z2 = sum(pr); pr = [p / z2 for p in pr]
        out = []
        for r, p in zip(rows, pr):
            fm, k = f.get((cls, r[0]), (0.5, 0))
            basis = (f"Qualified {ordinal(grid[r[0]][1])} of {grid[r[0]][2]} in {cls}. " if qual and r[0] in grid else "") + (f"averaged top {round((1 - fm) * 100)}% of class in qualifying over {k} earlier session{'s' if k != 1 else ''} this year" if k else "no earlier qualifying this year: counted as average")
            out.append([r[0], r[1], r[2], r[3], round(p * 100, 1), basis, round(fm, 3)])
        classes.append((cls, out))
    odds = ("After qualifying (class grid from the weekend's first qualifying session): grid position now drives the chances." if qual
            else "Before qualifying: nearly equal chances inside each class, tilted slightly by each car's earlier qualifying results this season. Rebuilt from the grid once qualifying is published. Constants from GT World Challenge Europe's backtest (this series publishes no per-car race results).")
    as_of = "Official entry list as published on gt-world-challenge-america.com. Late changes are possible."
    note = f"Source: gt-world-challenge-america.com/entry-list/{year}/{slug} and its qualifying pages, read {now.date().isoformat()}. Win chances are our own estimate, not betting odds. {MARK}"
    body = ",\n".join("      { h:" + js(c) + ", cars:[\n" + ",\n".join("        [" + ", ".join(js(v) for v in r) + "]" for r in rows) + "\n      ] }" for c, rows in classes)
    return qual, sum(len(r) for _, r in classes), f'  {{ t:{js(track)}, d:{js(day)}, s:"gtwca", oddsAsOf:{js(odds)}, asOf:{js(as_of)},\n    classes:[\n{body}\n    ],\n    note:{js(note)} }}'
def main():
    today = now.date(); events = D.track_events(); names = D.read("data/champs.js")
    forced = opt("--event-day")
    cands = []
    if forced: cands = [(opt("--track"), forced)]
    else:
        js_txt = """const fs=require('fs');const skip=['champs.js','series.js','results.js','entries.js','standings.js','watch.js'];const out=[];
for(const f of fs.readdirSync('data')){ if(!/^[a-z0-9-]+\\.js$/.test(f)||skip.includes(f)) continue; const T=[]; try{ new Function('TRACKS',fs.readFileSync('data/'+f,'utf8'))(T); }catch(e){ continue } const t=T[0]; if(!t) continue;
 for(const e of t.events||[]) if(/GT World Challenge America|Texas 8 Hour/i.test((e.s||'')+' '+(e.e||''))) out.push({t:t.id,d:e.d}); } console.log(JSON.stringify(out))"""
        import subprocess
        for e in json.loads(subprocess.run(["node", "-e", js_txt], capture_output=True, text=True, cwd=D.ROOT).stdout):
            d = datetime.date.fromisoformat(e["d"])
            if d - datetime.timedelta(days=8) <= today <= d + datetime.timedelta(days=2): cands.append((e["t"], e["d"]))
    for track, day in cands:
        res = build(track, day)
        if not res: continue
        qual, n, text = res; print(f"{track} {day}: {n} cars, {'after' if qual else 'before'} qualifying")
        if PRINT: print(text)
        key = f'  {{ t:{js(track)}, d:{js(day)}, s:"gtwca"'
        if replace_entry("data/entries.js", lambda t: t.startswith(key), text): print("  entries: written" if not (DRY or PRINT) else "  entries: would write")
main()
