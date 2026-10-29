#!/usr/bin/env python3
"""MotoGP data from the series' own results service (api.pulselive.motogp.com, the one motogp.com is drawn from), called by tools/auto_update.py every
30 minutes Thursday to Monday (also fine by hand). Four jobs, all idempotent:
  1. calendar   every Grand Prix of this and next season (tests and presentations are left out): a venue that has a track file gets the event in
                data/<id>.js (`s` "MotoGP World Championship", support ["Moto2","Moto3"], weekend = Friday to Sunday as the service lists it); a venue without one
                goes into the `stops` of the motogp entry in data/champs.js ("Map coming soon", gone by itself once the track file exists).
  2. sessions   the weekend's sessions (MotoGP, Moto2, Moto3: practice, qualifying, Sprint, warm-up, races) into the track's `sessions`, in LOCAL time as the
                service prints them, whenever the service has a schedule for the event (cancelled sessions are left out). Names: "Free Practice 1 - MotoGP",
                "Practice - MotoGP", "Qualifying 1 - MotoGP", "Sprint - MotoGP", "Warm-Up Practice - MotoGP", "Race - MotoGP" (the same for Moto2 and Moto3).
  3. results    the top ten of a finished Sunday MotoGP race into data/results.js as `s:"motogp"`, class "Race", "1. #93 Marc Marquez (Ducati Lenovo Team)"
                (note starting "(automatic update)"; a hand-written entry is kept; re-read for 3 days). A cancelled race writes nothing.
  4. standings  the riders' championship (top 15) into data/standings.js.
Nothing here guesses: it copies what the service publishes. Options: --now 2026-10-29T12:00:00Z, --dry-run, --calendar-only. Stdlib only; needs node."""
import sys, os, re, json, datetime, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
import build_route as B
A = sys.argv[1:]; DRY = "--dry-run" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
API = "https://api.pulselive.motogp.com/motogp/v1/"; MARK = "(automatic update)"
SER = "MotoGP World Championship"; SUPPORT = ["Moto2", "Moto3"]
CAT_MOTOGP = "e8c110ad-64aa-4e8e-8a86-f2f152f6a942"
# the service's circuit name -> (app track id, short name, place, kind)
VENUES = [
 (r"Chang International", "buriram", "Buriram", "Buriram, Thailand", "Road course"), (r"Goi[aâ]nia", "goiania", "Goiania", "Goiania, Brazil", "Road course"),
 (r"Circuit Of The Americas", "cota", "COTA", "Austin, Texas", "Road course"), (r"Jerez", "jerez", "Jerez", "Jerez de la Frontera, Spain", "Road course"),
 (r"^Le Mans", "le-mans-bugatti", "Le Mans", "Le Mans, France", "Road course"), (r"Barcelona", "barcelona-catalunya", "Barcelona", "Barcelona, Spain", "Road course"),
 (r"Mugello", "mugello", "Mugello", "Scarperia e San Piero, Italy", "Road course"), (r"Balaton", "balaton-park", "Balaton Park", "Balatonfokajar, Hungary", "Road course"),
 (r"Brno", "brno", "Brno", "Brno, Czechia", "Road course"), (r"Assen", "assen", "Assen", "Assen, Netherlands", "Road course"),
 (r"Sachsenring", "sachsenring", "Sachsenring", "Hohenstein-Ernstthal, Germany", "Road course"), (r"Silverstone", "silverstone", "Silverstone", "Silverstone, England", "Road course"),
 (r"Arag", "aragon", "Aragon", "Alcaniz, Spain", "Road course"), (r"Misano", "misano", "Misano", "Misano Adriatico, Italy", "Road course"),
 (r"Red Bull Ring", "red-bull-ring", "Red Bull Ring", "Spielberg, Austria", "Road course"), (r"Motegi", "motegi", "Motegi", "Motegi, Japan", "Road course"),
 (r"Mandalika", "mandalika", "Mandalika", "Lombok, Indonesia", "Road course"), (r"Phillip Island", "phillip-island", "Phillip Island", "Phillip Island, Australia", "Road course"),
 (r"Sepang", "sepang", "Sepang", "Sepang, Malaysia", "Road course"), (r"Lusail", "lusail", "Lusail", "Lusail, Qatar", "Road course"),
 (r"Algarve", "portimao", "Portimao", "Portimao, Portugal", "Road course"), (r"Ricardo Tormo", "valencia", "Valencia", "Cheste, Spain", "Road course"),
 (r"Oscar y Juan", "buenos-aires", "Buenos Aires", "Buenos Aires, Argentina", "Road course"), (r"Adelaide", "adelaide", "Adelaide", "Adelaide, Australia", "Street circuit"),
]
def venue(name):
    for rx, tid, short, place, kind in VENUES:
        if re.search(rx, name or "", re.I): return tid, short, place, kind
    return None
def get(path):
    for _ in range(3):
        try:
            with urllib.request.urlopen(urllib.request.Request(API + path, headers={"User-Agent": "TracksidePass/1.0 (personal race-day app)"}), timeout=40) as r: return json.loads(r.read().decode("utf-8", "replace"))
        except Exception: pass
    return None
def js(v): return json.dumps(v, ensure_ascii=False)
SMALL = {"of", "the", "and", "de", "la"}
def pretty_event(n):
    n = re.sub(r"[®™]", "", n or "").strip()
    return " ".join(w.lower() if w.lower() in SMALL else w.capitalize() for w in n.split())
def events(year):
    d = get(f"events?seasonYear={year}") or []
    return [e for e in d if e.get("kind") == "GP"]
def local_date(s): return s[:10]
def local_hm(s): return s[11:16]

def kind_name(b):
    sn = b.get("shortname"); cat = (b.get("category") or {}).get("name", "")
    cls = "MotoGP" if cat.startswith("MotoGP") else "Moto2" if cat.startswith("Moto2") else "Moto3" if cat.startswith("Moto3") else None
    if not cls: return None
    names = {"FP1": "Free Practice 1", "FP2": "Free Practice 2", "PR": "Practice", "Q1": "Qualifying 1", "Q2": "Qualifying 2", "SPR": "Sprint", "WUP": "Warm-Up Practice", "RAC": "Race"}
    if sn not in names: return None
    return f"{names[sn]} - {cls}"
def sessions_of(ev):
    out = []
    for b in ev.get("broadcasts") or []:
        if b.get("type") != "SESSION" or "CANCEL" in (b.get("status") or "") or "cancel" in (b.get("name") or "").lower(): continue
        n = kind_name(b)
        if not n: continue
        s = {"d": local_date(b["date_start"]), "s": local_hm(b["date_start"])}
        e = local_hm(b["date_end"]) if b.get("date_end") and local_date(b["date_end"]) == s["d"] and local_hm(b["date_end"]) > s["s"] else None
        if e: s["e"] = e
        s["n"] = n; out.append(s)
    return sorted(out, key=lambda x: (x["d"], x["s"], x["n"]))

def calendar():
    today = now.date().isoformat(); stops = []; changed = False
    for y in (now.year, now.year + 1):
        for ev in events(y):
            d0 = local_date(ev["date_start"]); d1 = local_date(ev["date_end"])
            if d1 < today: continue
            v = venue((ev.get("circuit") or {}).get("name"))
            if not v: print("  no venue mapping for", (ev.get("circuit") or {}).get("name")); continue
            tid, short, place, kind = v; days = (datetime.date.fromisoformat(d1) - datetime.date.fromisoformat(d0)).days + 1
            name = pretty_event(ev["name"])
            if not os.path.exists(os.path.join(D.ROOT, "data", tid + ".js")):
                stops.append({"id": tid, "short": short, "place": place, "kind": kind, "e": name, "d": d0, "t": days}); continue
            T = B.load(tid)
            evs = [e for e in T["events"] if not (e.get("s", "").startswith("MotoGP") and abs((datetime.date.fromisoformat(e["d"]) - datetime.date.fromisoformat(d0)).days) <= 4)]
            evs.append({"d": d0, "e": name, "s": SER, "t": days, "support": SUPPORT}); evs.sort(key=lambda e: e["d"])
            new = dict(T)
            if evs != T["events"]: new["events"] = evs; print("event", tid, d0, name)
            ss = sessions_of(ev)
            if ss:
                keep = [s for s in (T.get("sessions") or []) if not (d0 <= s["d"] <= d1 and re.search(r" - (MotoGP|Moto2|Moto3)$", s["n"]))]
                allss = sorted(keep + ss, key=lambda x: (x["d"], x["s"], x["n"]))
                if allss != (T.get("sessions") or []): new["sessions"] = allss; print("  sessions", tid, d0, len(ss))
            if new != T:
                changed = True
                if not DRY:
                    # keep the key order of the light file: sessions right after events
                    if "sessions" in new and "sessions" not in T:
                        o = {}
                        for k, v in new.items():
                            if k == "sessions": continue
                            o[k] = v
                            if k == "events": o["sessions"] = new["sessions"]
                        new = o
                    B.save(tid, new)
    f = os.path.join(D.ROOT, "data", "champs.js"); s = open(f, encoding="utf8").read()
    rows = ",\n".join("      { id:%s, short:%s, place:%s, kind:%s, e:%s, d:%s, t:%d }" % tuple(js(x) if not isinstance(x, int) else x for x in (st["id"], st["short"], st["place"], st["kind"], st["e"], st["d"], st["t"])) for st in stops)
    m = re.search(r'(,\{ id:"motogp".*?stops:\[\n)(.*?)(\n?    \] \})', s, re.S)
    if m and s[m.start(2):m.end(2)] != rows:
        print("stops", len(stops), "(updated)")
        if not DRY: open(f, "w", encoding="utf8").write(s[:m.start(2)] + rows + s[m.end(2):])
    return changed

def results_and_standings():
    S = next((x for x in (get("results/seasons") or []) if x.get("year") == now.year), None)
    if not S: print("seasons unreadable"); return
    evs = get(f"results/events?seasonUuid={S['id']}&isFinished=true") or []
    app = D.track_events(); rs = D.read("data/results.js"); changed = False; last = None
    for ev in sorted(evs, key=lambda e: e.get("date_start", "")):
        if ev.get("kind") not in (None, "GP") or not ev.get("date_end"): continue
        end = datetime.date.fromisoformat(local_date(ev["date_end"]))
        if end > now.date() or (now.date() - end).days > 3: continue
        v = venue((ev.get("circuit") or {}).get("name") or ev.get("circuit_name") or ""); tid = v[0] if v else None
        ss = get(f"results/sessions?eventUuid={ev['id']}&categoryUuid={CAT_MOTOGP}") or []
        race = next((x for x in ss if x.get("type") == "RAC"), None)
        if not race: print(f"  {ev['name']}: no Sunday race in the results service (cancelled or not run)"); continue
        c = (get(f"results/session/{race['id']}/classification?test=false") or {}).get("classification") or []
        rows = sorted((x for x in c if x.get("position")), key=lambda x: x["position"])
        if len(rows) < 10: print(f"  {ev['name']}: classification not complete yet"); continue
        last = ev
        if not tid: continue
        appev = D.app_event(app, tid, local_date(ev["date_start"]))
        if not appev: print(f"  {ev['name']}: no app event at {tid}"); continue
        lines = ",\n".join("        " + js(f'{x["position"]}. #{x["rider"]["number"]} {x["rider"]["full_name"]} ({x["team"]["name"]})') for x in rows[:10])
        entry = (f'  {{ t:{js(tid)}, d:{js(appev["d"])}, s:"motogp", event:{js(pretty_event(ev["name"]))},\n    groups:[\n      {{ h:"Race", order:[\n{lines}\n      ] }}\n    ],\n'
                 f'    note:{js(MARK + " Source: the MotoGP results service (api.pulselive.motogp.com, the data motogp.com is drawn from), top ten of the Sunday Grand Prix, race day " + local_date(race["date"]) + ".")} }},\n')
        pat = r'^  \{ t:%s, d:%s, s:"motogp".*?\n    note:.*?\},\n' % (re.escape(js(tid)), re.escape(js(appev["d"])))
        m = re.search(pat, rs, flags=re.S | re.M)
        if m and MARK not in m.group(0): print("  results: a hand-written entry exists, kept"); continue
        if m and m.group(0) == entry: continue
        print("  results:", ev["name"], "refreshed" if m else "added"); changed = True
        if m: rs = rs[:m.start()] + entry + rs[m.end():]
        else: k = rs.index("const RESULTS = [") + len("const RESULTS = [\n"); rs = rs[:k] + entry + rs[k:]
    if changed and not DRY: D.write("data/results.js", rs)
    # standings
    st = get(f"results/standings?seasonUuid={S['id']}&categoryUuid={CAT_MOTOGP}")
    cl = [x for x in (st or {}).get("classification") or [] if x.get("position")]
    if len(cl) < 10: return
    cl.sort(key=lambda x: x["position"])
    done = [e for e in events(now.year) if e.get("status") == "FINISHED"]   # the calendar's own status (the results list also holds the weekend under way)
    lastev = sorted(done, key=lambda e: e.get("date_start", ""))[-1] if done else None
    asof = f"Current after the {pretty_event(lastev['name'])} ({local_date(lastev['date_end'])})." if lastev else "Current standings."
    rows = ",\n".join("        { pos:%d, who:%s, pts:%d }" % (x["position"], js(f'{x["rider"]["full_name"]} ({x["team"]["name"]})'), x["points"]) for x in cl[:15])
    block = ('  { s:"motogp", asOf:%s,\n    classes:[\n      { h:"Riders", rows:[\n%s\n      ] }\n    ],\n    note:%s }'
             % (js(asof), rows, js(MARK + " Source: the MotoGP results service (api.pulselive.motogp.com), the riders' championship, top 15; Sprint and Grand Prix points both count. A cancelled race scores nothing.")))
    s = D.read("data/standings.js"); m = re.search(r'^  \{ s:"motogp".*?^(?:  \}|    note:.*? \})(,?)\n', s, flags=re.S | re.M)
    new = block + (m.group(1) if m else ",") + "\n"
    if m and MARK not in m.group(0): print("  standings: a hand-written entry exists, kept"); return
    if m and m.group(0) == new: return
    print("  standings:", "updated" if m else "added")
    if DRY: return
    if m: s = s[:m.start()] + new + s[m.end():]
    else: k = s.index("const STANDINGS = [\n") + len("const STANDINGS = [\n"); s = s[:k] + block + ",\n" + s[k:]
    D.write("data/standings.js", s)

def main():
    calendar()
    if "--calendar-only" not in A: results_and_standings()
if __name__ == "__main__": main()
