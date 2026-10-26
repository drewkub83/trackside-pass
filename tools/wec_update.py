#!/usr/bin/env python3
"""FIA World Endurance Championship race results and standings for data/results.js and data/standings.js, read from the series' own site (fiawec.com).
Called by tools/auto_update.py on every run (every 30 minutes Thursday to Monday).

Results: for every WEC event the app has (events whose text matches FIA WEC / World Endurance) that started in the last 10 days, the race page
(/en/race/<event name>-<year>) links to its summary page (/en/race/summary/<id>) once the race has a classification; that page has one table per class
("Hypercar results", "LMGT3 results": position, car number, team, laps, gap, best lap). The top ten of each class are written as one entry
(note starting "(automatic update)"); it is re-read on later runs (a post-race penalty can move the order) and only rewritten when it changed.
Standings (/en/page/manufacturers-classification): the Hypercar drivers' table (one row per crew) and the LMGT3 teams' table, top ten of each. Rewritten when the table changed.
Nothing is guessed: a page without the tables writes nothing. Options: --now, --dry-run, --print,
--slug <race slug> --track <id> --day YYYY-MM-DD (rehearse on one race, e.g. --slug 6-hours-of-fuji-2026). Stdlib only; needs node."""
import sys, os, re, json, html, datetime, unicodedata, subprocess, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
A = sys.argv[1:]; DRY = "--dry-run" in A; PRINT = "--print" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
HOST = "https://www.fiawec.com"; MARK = "(automatic update)"
def get(path):
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(HOST + path, headers={"User-Agent": "Mozilla/5.0 (Trackside Pass data tools)"}), timeout=40) as r: return r.read().decode("utf-8", "replace")
        except Exception: pass
    return ""
def js(v): return json.dumps(v, ensure_ascii=False)
def clean(c): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", c))).strip()
def tables(h):
    out = []
    for m in re.finditer(r"<table[\s\S]*?</table>", h):
        rows = [[clean(c) for c in re.findall(r"<t[dh][\s\S]*?</t[dh]>", tr)] for tr in re.findall(r"<tr[\s\S]*?</tr>", m.group(0))]
        hd = re.findall(r"<h[1-6][^>]*>([\s\S]*?)</h[1-6]>", h[max(0, m.start() - 600):m.start()])
        out.append((clean(hd[-1]) if hd else "", rows))
    return out
def slug(name, year):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-") + "-" + str(year)
KEEP = {"BMW", "WRT", "TF", "AF", "DK", "ASP", "AMG", "GMR", "USA", "HRT", "GT3", "LMGT3", "M"}   # capitals the tables print that stay capitals
SPECIAL = {"TOTALENERGIES": "TotalEnergies"}
PART = {"DE", "VAN", "DER", "DI", "DA", "DEL", "VON", "TEN"}                                      # name particles: de Vries, van der Linde
def title(n, person=False):
    """BRENDON HARTLEY -> Brendon Hartley, BMW M TEAM WRT -> BMW M Team WRT (the tables print names in capitals)."""
    out = []
    for i, w in enumerate(re.split(r"(\s+|-)", " ".join((n or "").split()))):
        if not w or w.isspace() or w == "-": out.append(w); continue
        u = w.upper()
        out.append(SPECIAL.get(u) or (u if u in KEEP and not person else (w.lower() if person and u in PART and i else (w.capitalize() if w.isupper() or w.islower() else w))))
    return "".join(out)
def replace_entry(rel, test, text):
    s = D.read(rel); starts = [m.start() for m in re.finditer(r"^  \{ ", s, flags=re.M)]; end = s.rindex("];")
    for i, st in enumerate(starts):
        nxt = starts[i + 1] if i + 1 < len(starts) else end
        if test(s[st:nxt]):
            old = s[st:nxt]
            if MARK not in old: print("  a hand-written entry exists, kept"); return False
            body = text + ("," if old.rstrip().endswith(",") or i + 1 < len(starts) else "") + "\n"
            if old == body: return False
            if not DRY and not PRINT: D.write(rel, s[:st] + body + s[nxt:])
            return True
    k = s.index("[\n", s.index("const ")) + 2
    if not DRY and not PRINT: D.write(rel, s[:k] + text + ",\n" + s[k:])
    return True

def result_entry(track, day, event, tabs, src):
    groups = []
    for hd, rows in tabs:
        m = re.match(r"(Hypercar|LMGT3) results", hd)
        if not m or len(rows) < 6: continue
        h = rows[0]; ix = {k: h.index(k) for k in ("Pos.", "N°", "Team / Drivers") if k in h}
        if len(ix) < 3: continue
        lines = []
        for r in rows[1:11]:
            if len(r) <= max(ix.values()) or not r[ix["Pos."]].isdigit(): continue
            lines.append(f'{r[ix["Pos."]]}. {r[ix["N°"]]} {title(r[ix["Team / Drivers"]])}')
        if len(lines) >= 3: groups.append((m.group(1), lines))
    if len(groups) < 2: return None
    body = ",\n".join("      { h:" + js(h) + ", order:[\n" + ",\n".join("        " + js(x) for x in lines) + "\n      ] }" for h, lines in groups)
    note = f"{MARK} Source: fiawec.com race summary page ({src}), top ten of each class, read {now.date().isoformat()}."
    return f'  {{ t:{js(track)}, d:{js(day)}, s:"wec", event:{js(event)},\n    groups:[\n{body}\n    ],\n    note:{js(note)} }}'
def do_results():
    evs = json.loads(subprocess.run(["node", "-e", """const fs=require('fs');const skip=['champs.js','series.js','results.js','entries.js','standings.js','watch.js'];const out=[];
for(const f of fs.readdirSync('data')){ if(!/^[a-z0-9-]+\\\\.js$/.test(f)||skip.includes(f)) continue; const T=[]; try{ new Function('TRACKS',fs.readFileSync('data/'+f,'utf8'))(T); }catch(e){ continue } const t=T[0]; if(!t) continue;
 for(const e of t.events||[]) if(/FIA WEC|World Endurance/i.test(e.s||'')) out.push({t:t.id,d:e.d,n:e.t||1,e:e.e||''}); } console.log(JSON.stringify(out))"""], capture_output=True, text=True, cwd=D.ROOT).stdout or "[]")
    todo = []
    if opt("--slug"): todo = [(opt("--track"), opt("--day"), opt("--slug"), opt("--slug"))]
    else:
        for e in evs:
            d = datetime.date.fromisoformat(e["d"])
            if d <= now.date() <= d + datetime.timedelta(days=e["n"] + 9): todo.append((e["t"], e["d"], slug(e["e"], d.year), e["e"]))
    for track, day, sl, name in todo:
        page = get(f"/en/race/{sl}"); m = re.search(r"/en/race/summary/(\d+)", page)
        if not m: print(f"{sl}: no summary page yet"); continue
        tabs = tables(get(f"/en/race/summary/{m.group(1)}")); text = result_entry(track, day, name, tabs, f"race/summary/{m.group(1)}")
        if not text: print(f"{sl}: the summary page has no class tables yet"); continue
        key = f'  {{ t:{js(track)}, d:{js(day)}, s:"wec"'
        print(f"{sl}: results", "(print)" if PRINT else "")
        if PRINT: print(text)
        if replace_entry("data/results.js", lambda t: t.startswith(key), text): print("  results written" if not (DRY or PRINT) else "  would write")

def do_standings():
    tabs = tables(get("/en/page/manufacturers-classification")); hyper = lt = None
    for hd, rows in tabs:
        if not rows: continue
        h = rows[0]
        if "Drivers" in h and "Man." in h and hyper is None and len(rows) > 15 and not any("Competitors" in x for x in h): hyper = rows
        if any("Competitors" in x for x in h) and "Team" in h and lt is None: lt = rows
    def part(rows, who_col, label):
        h = rows[0]; ip, inn, iw, ipts = h.index("Pos."), h.index("N°"), h.index(who_col), len(h) - 1
        out = []
        for r in rows[1:11]:
            if len(r) <= ipts or not r[ip].isdigit() or not r[ipts].isdigit(): continue
            out.append({"pos": int(r[ip]), "who": f'{r[inn]} {", ".join(title(x.strip(), who_col == "Drivers") for x in r[iw].split(" , "))}'.strip(), "pts": int(r[ipts])})
        return out if len(out) >= 3 and all(a["pts"] >= b["pts"] for a, b in zip(out, out[1:])) else None
    hy = part(hyper, "Drivers", "Hypercar") if hyper else None; gt = part(lt, "Team", "LMGT3") if lt else None
    if not hy or not gt: print("standings: tables not readable"); return
    rows = lambda rs: ",\n".join(f'        {{ pos:{r["pos"]}, who:{js(r["who"])}, pts:{r["pts"]} }}' for r in rs)
    asof = f"Current as of {now.date().isoformat()}, from fiawec.com (the series' own standings page)."
    note = f"{MARK} Source: fiawec.com standings page, top ten of each table. Hypercar: crews (all drivers of a car share its points); LMGT3: teams, listed by car number. Check the site for the round count."
    text = (f'  {{ s:"wec", asOf:{js(asof)},\n    classes:[\n      {{ h:"Hypercar", rows:[\n{rows(hy)}\n      ] }},\n      {{ h:"LMGT3", rows:[\n{rows(gt)}\n      ] }}\n    ],\n    note:{js(note)} }}')
    s = D.read("data/standings.js"); m = re.search(r'^  \{ s:"wec".*?\n    note:.*?\},?\n', s, flags=re.S | re.M)
    sig = lambda b: re.findall(r"pos:(\d+), who:(\"[^\"]*\"), pts:(\d+)", b)
    if m and sig(m.group(0)) == sig(text): print("standings: unchanged"); return
    print("standings: updated" if m else "standings: added", f'(Hypercar leader {hy[0]["who"]} {hy[0]["pts"]})')
    if PRINT: print(text)
    if DRY or PRINT: return
    if m and MARK not in m.group(0): print("  a hand-written entry exists, kept"); return
    if m: s = s[:m.start()] + text + ("," if m.group(0).rstrip().endswith(",") else "") + "\n" + s[m.end():]
    else: k = s.index("const STANDINGS = [\n") + len("const STANDINGS = [\n"); s = s[:k] + text + ",\n" + s[k:]
    D.write("data/standings.js", s)
do_results(); do_standings()
