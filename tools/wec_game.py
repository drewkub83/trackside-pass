#!/usr/bin/env python3
"""The "Pick your podium" entry for FIA World Endurance Championship rounds (data/entries.js, classes Hypercar and LMGT3), from the series' own site (fiawec.com).
Called by tools/auto_update.py on every run (every 30 minutes Thursday to Monday); only does anything from 8 days before a WEC round the app has until its race starts.

Cars: the round's entry list. It is a PDF (race page -> ENTRY LIST -> /en/race/document/download/<id>), read with PyMuPDF (`pip install pymupdf`; the workflow
installs it): car number, team, car, up to three drivers, per class. The list is "provisional" early in the week and is re-read on every run.
Win chances (our own estimate, NOT betting odds), softmax inside each class, floored at 0.5%:
  before qualifying   weight = C0 * (form - 0.5)
  after qualifying    weight = C1 * (form - 0.5) - A * (class grid position - 1)       (grid = the class' Hyperpole order, then the rest of its Qualifying order)
  form = a car number's average class finishing percentile over this season's earlier rounds' races (1.0 = won its class every time), pulled toward 0.5 as if it had 2
         extra average races; read from the season's race summary pages on fiawec.com.
Constants from a backtest on the 2026 season (14 class-races, 9 with a qualifying grid): equal chances log-loss -2.89 (winner), form -2.82 (C0 = 3), form + grid -2.76 at
A = 0.12 per place. The grid counts for little because the races are 6 to 24 hours long and the cars are balanced (Balance of Performance); the sample is small, so treat it as a
rough form guide. It knows nothing about strategy, weather, tyres or driver changes.
Idempotent; only rewrites an entry that this script wrote (note ends with "(automatic update)"). Options: --now, --dry-run, --print, --slug <race slug> --track <id> --day YYYY-MM-DD
(rehearse on one round), --pdf <file> (read this entry list instead). Stdlib + PyMuPDF."""
import sys, os, re, json, math, html, datetime, unicodedata, subprocess, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
A = sys.argv[1:]; DRY = "--dry-run" in A; PRINT = "--print" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
HOST = "https://www.fiawec.com"; MARK = "(automatic update)"; K = 2; C0, C1, GRID_A = 3.0, 3.0, 0.12
def get(path, binary=False):
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(path if path.startswith("http") else HOST + path, headers={"User-Agent": "Mozilla/5.0 (Trackside Pass data tools)"}), timeout=60) as r:
                b = r.read(); return b if binary else b.decode("utf-8", "replace")
        except Exception: pass
    return b"" if binary else ""
def js(v): return json.dumps(v, ensure_ascii=False)
def clean(c): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", c))).strip()
def tables(h):
    out = []
    for m in re.finditer(r"<table[\s\S]*?</table>", h):
        rows = [[clean(c) for c in re.findall(r"<t[dh][\s\S]*?</t[dh]>", tr)] for tr in re.findall(r"<tr[\s\S]*?</tr>", m.group(0))]
        hd = re.findall(r"<h[1-6][^>]*>([\s\S]*?)</h[1-6]>", h[max(0, m.start() - 600):m.start()])
        out.append((clean(hd[-1]) if hd else "", rows))
    return out
def num_rows(rows):
    h = rows[0]; ip, inn = h.index("Pos."), h.index("N°")
    return [r[inn].replace("#", "") for r in rows[1:] if len(r) > inn and r[ip].isdigit()]
def slug(name, year):
    s = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-") + "-" + str(year)
KEEP = {"BMW", "WRT", "TF", "AF", "DK", "ASP", "AMG", "GMR", "USA", "HRT", "M"}
PART = {"DE", "VAN", "DER", "DI", "DA", "DEL", "VON", "TEN"}
SMALL = {"OF", "BY", "THE", "AND"}
def cap(n, person=False):
    out = []
    for i, w in enumerate(re.split(r"(\s+|-)", " ".join((n or "").split()))):
        if not w or w.isspace() or w == "-": out.append(w); continue
        u = w.upper()
        word = "TotalEnergies" if u == "TOTALENERGIES" else (u if u in KEEP and not person else (w.lower() if (person and u in PART and i) or (not person and u in SMALL and i) else (w.capitalize() if w.isupper() or w.islower() else w)))
        if person and re.fullmatch(r"Mc[a-z]{2,}", word): word = "Mc" + word[2].upper() + word[3:]
        out.append(word)
    return "".join(out)
def person(line):
    m = re.match(r"(.+?)\s*\(([A-Z]{3})\)\s*$", line)
    if not m: return None
    parts = m.group(1).split(" ")   # "Harry TINCKNELL": given names in mixed case, family name in capitals
    given = [w for w in parts if not (w.isupper() and len(w) > 1) or w in ("Ryō",)]
    fam = [w for w in parts if w.isupper() and len(w) > 1]
    return cap(" ".join(given + fam), True) if fam else cap(m.group(1), True)
def read_entry_list(pdf_bytes):
    import fitz
    txt = "\n".join(p.get_text() for p in fitz.open(stream=pdf_bytes, filetype="pdf")); lines = [l.strip() for l in txt.split("\n") if l.strip()]
    prov = re.search(r"(PROVISIONAL )?ENTRY LIST( v\d+)?", txt); read_entry_list.provisional = bool(prov and prov.group(1)); read_entry_list.version = (prov.group(2) or "").strip() if prov else ""
    cls = None; cars = {}; i = 0
    while i < len(lines):
        l = lines[i]
        m = re.match(r"\d+\s+(HYPERCAR|LMGT3)\s+COMPETITORS", l)
        if m: cls = "Hypercar" if m.group(1) == "HYPERCAR" else "LMGT3"; i += 1; continue
        if cls and re.fullmatch(r"\d{1,3}", l) and i + 3 < len(lines) and re.fullmatch(r"[A-Z]{3}", lines[i + 2]) and re.match(r"[MG] ", lines[i + 3]):
            num, team, car = l, cap(lines[i + 1]), lines[i + 3][2:].strip(); j = i + 4; drivers = []
            while j < len(lines) and not (re.fullmatch(r"\d{1,3}", lines[j]) and j + 2 < len(lines) and re.fullmatch(r"[A-Z]{3}", lines[j + 2])) and not lines[j].startswith(("N°", "TYRES")):
                p = person(lines[j]) if "(" in lines[j] else None
                if p: drivers.append(p)
                j += 1
            cars.setdefault(cls, []).append([num, team, " / ".join(drivers), " ".join(car.split())]); i = j; continue
        i += 1
    return cars
def season_history(year, before_slug):
    """[(class -> finishing order of car numbers)] for the season's earlier rounds, oldest first, from the race summary pages."""
    home = get("/en/"); slugs = []
    for s in dict.fromkeys(re.findall(r"/en/race/([a-z0-9-]+-%d)\b" % year, home)):
        if "prologue" in s or s == before_slug: continue
        slugs.append(s)
    out = []
    for s in slugs:
        m = re.search(r"/en/race/summary/(\d+)", get(f"/en/race/{s}"))
        if not m: continue
        res = {}
        for hd, rows in tables(get(f"/en/race/summary/{m.group(1)}")):
            c = re.match(r"(Hypercar|LMGT3) results", hd)
            if c and rows: res[c.group(1)] = num_rows(rows)
        if res: out.append((s, res))
    return out
def class_grids(race_page):
    sess = []
    for m in re.finditer(r"resultats-1\?raceId=(\d+)&amp;sessionId=(\d+)", race_page):
        pre = race_page[max(0, m.start() - 4000):m.start()]; pre = pre[:pre.rfind("<a")]
        lab = re.search(r"((?:Qualifying|Hyperpole) - [A-Z0-9]+)\s+\d{1,2}:\d{2}\s*[AP]M\s*$", clean(pre), re.I)
        if lab: sess.append((lab.group(1).upper(), m.group(1), m.group(2)))
    def grab(label):
        x = [y for y in sess if y[0] == label.upper()]
        if not x: return []
        t = tables(get(f"/en/page/resultats-1?raceId={x[0][1]}&sessionId={x[0][2]}"))
        return num_rows(t[0][1]) if t and t[0][1] else []
    grids = {}
    for cls, tag in (("Hypercar", "HYPERCAR"), ("LMGT3", "LMGT3")):
        hp, q = grab(f"Hyperpole - {tag}"), grab(f"Qualifying - {tag}")
        if hp or q: grids[cls] = hp + [n for n in q if n not in hp]
    return grids
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
def ordinal(n): return f"{n}{'th' if 10 <= n % 100 <= 20 else {1: 'st', 2: 'nd', 3: 'rd'}.get(n % 10, 'th')}"
def build(track, day, sl):
    year = int(sl[-4:]); rp = get(f"/en/race/{sl}")
    pdf = open(opt("--pdf"), "rb").read() if opt("--pdf") else None
    if pdf is None:
        i = rp.find("ENTRY LIST"); j = rp.rfind("<a", 0, i); m = re.search(r'href="([^"]*document/download/\d+)"', rp[j:i]) if i > 0 else None
        if not m: print(f"{sl}: no entry list published yet"); return None
        pdf = get(m.group(1), True)
    try: cars = read_entry_list(pdf)
    except ImportError: print("PyMuPDF is not installed (pip install pymupdf): cannot read the entry list"); return None
    if sum(len(v) for v in cars.values()) < 10: print(f"{sl}: entry list not readable / too short"); return None
    hist = season_history(year, sl); grids = class_grids(rp)
    classes = []; qual_any = False
    for cls in ("Hypercar", "LMGT3"):
        if cls not in cars: continue
        rows = cars[cls]; per = {}
        for _, res in hist:
            order = res.get(cls, [])
            for i, n in enumerate(order): per.setdefault(n, []).append(1 - i / max(1, len(order) - 1))
        grid = grids.get(cls, []); qual = bool(grid) and sum(1 for r in rows if r[0] in grid) >= 0.8 * len(rows); qual_any |= qual
        ws = []; info = []
        for r in rows:
            h = per.get(r[0], []); form = (sum(h) + 0.5 * K) / (len(h) + K); g = grid.index(r[0]) + 1 if r[0] in grid else len(grid) + 1
            ws.append((C1 * (form - 0.5) - GRID_A * (g - 1)) if qual else C0 * (form - 0.5)); info.append((form, len(h), g))
        m_ = max(ws); ex = [math.exp(v - m_) for v in ws]; z = sum(ex); pr = [max(0.005, e / z) for e in ex]; z2 = sum(pr); pr = [p / z2 for p in pr]
        out = []
        for r, p, (form, k, g) in zip(rows, pr, info):
            basis = (f"Qualified {ordinal(g)} of {len(rows)} in {cls}. " if qual else "") + (f"averaged top {round((1 - form) * 100)}% of {cls} over {k} earlier race{'s' if k != 1 else ''} this season" if k else "no earlier race this season: counted as average")
            out.append([r[0], r[1], r[2], r[3], round(p * 100, 1), basis, round(form, 3)])
        out.sort(key=lambda x: -x[4]); classes.append((cls, out))
    odds = ("After qualifying (class grid from the Hyperpole and Qualifying results): grid position now counts a little, tilted by each car's form this season." if qual_any
            else "Before qualifying: nearly equal chances inside each class, tilted a little by each car's finishes this season. Rebuilt from the class grid once qualifying is published.")
    lst = ("provisional entry list" + (" " + read_entry_list.version if read_entry_list.version else "")) if getattr(read_entry_list, "provisional", False) else "entry list"
    as_of = f"{lst[0].upper() + lst[1:]} as published on fiawec.com, read {now.date().isoformat()}. Late changes are possible."
    note = f"Source: fiawec.com entry list, race summary pages and session results, read {now.date().isoformat()}. Win chances are our own estimate, not betting odds; constants from a backtest on the 2026 season (small sample). {MARK}"
    body = ",\n".join("      { h:" + js(c) + ", cars:[\n" + ",\n".join("        [" + ", ".join(js(v) for v in r) + "]" for r in rows) + "\n      ] }" for c, rows in classes)
    return qual_any, sum(len(r) for _, r in classes), f'  {{ t:{js(track)}, d:{js(day)}, s:"wec", oddsAsOf:{js(odds)}, asOf:{js(as_of)},\n    classes:[\n{body}\n    ],\n    note:{js(note)} }}'
def main():
    today = now.date(); todo = []
    if opt("--slug"): todo = [(opt("--track"), opt("--day"), opt("--slug"))]
    else:
        evs = json.loads(subprocess.run(["node", "-e", """const fs=require('fs');const skip=['champs.js','series.js','results.js','entries.js','standings.js','watch.js'];const out=[];
for(const f of fs.readdirSync('data')){ if(!/^[a-z0-9-]+\\\\.js$/.test(f)||skip.includes(f)) continue; const T=[]; try{ new Function('TRACKS',fs.readFileSync('data/'+f,'utf8'))(T); }catch(e){ continue } const t=T[0]; if(!t) continue;
 for(const e of t.events||[]) if(/FIA WEC|World Endurance/i.test(e.s||'')) out.push({t:t.id,d:e.d,n:e.t||1,e:e.e||''}); } console.log(JSON.stringify(out))"""], capture_output=True, text=True, cwd=D.ROOT).stdout or "[]")
        for e in evs:
            d = datetime.date.fromisoformat(e["d"])
            if d - datetime.timedelta(days=8) <= today <= d + datetime.timedelta(days=e["n"] - 1): todo.append((e["t"], e["d"], slug(e["e"], d.year)))
    for track, day, sl in todo:
        if not opt("--slug") and any(r["fin"] for r in []): pass
        res = build(track, day, sl)
        if not res: continue
        qual, n, text = res; print(f"{sl}: {n} cars, {'after' if qual else 'before'} qualifying")
        if PRINT: print(text)
        key = f'  {{ t:{js(track)}, d:{js(day)}, s:"wec"'
        if replace_entry("data/entries.js", lambda t: t.startswith(key), text): print("  entries: written" if not (DRY or PRINT) else "  entries: would write")
main()
