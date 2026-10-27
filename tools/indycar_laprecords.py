"""Fastest lap ever recorded at each NTT INDYCAR SERIES venue, in ANY session (practice, qualifying, race), from INDYCAR's own results
API (indycar.com/api/results/EventsSessionDetails?id=N, every session since 1996, one best lap per driver per session).
Step 1 (slow, run once): python3 tools/indycar_laprecords.py scan   -> tools/.indycar_cache/sessions.json (top 3 laps of every session)
Step 2: python3 tools/indycar_laprecords.py best [--top 5] [track-id ...]   -> the fastest laps per venue, from the cache.
Events are matched to venues by name keywords in VENUES (edit when a new event name appears); only the layouts in `since` count."""
import json, os, re, sys, urllib.request, concurrent.futures as cf
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".indycar_cache"); os.makedirs(CACHE, exist_ok=True)
F = os.path.join(CACHE, "sessions.json")
API = "https://www.indycar.com/api/results/EventsSessionDetails?id="
def secs(s):
    m = re.fullmatch(r"(\d+):(\d\d)\.(\d+)", (s or "").strip()); return int(m.group(1)) * 60 + int(m.group(2)) + float("0." + m.group(3)) if m else None
def one(i):
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(API + str(i), headers={"User-Agent": "Mozilla/5.0"}), timeout=40) as r: t = r.read().decode("utf-8", "replace")
            if not t.startswith("{"): return None
            j = json.loads(t)
            top = sorted(({"s": secs(r.get("BestLapTime")), "t": r.get("BestLapTime"), "n": r.get("DriverName") or ((r.get("FirstName") or "") + " " + (r.get("LastName") or "")).strip(),
                           "c": r.get("CarNumber"), "tm": r.get("TeamName"), "mph": r.get("BestSpeed")} for r in j.get("records") or [] if secs(r.get("BestLapTime"))), key=lambda r: r["s"])[:3]
            return {"id": i, "e": j.get("EventName"), "s": j.get("SessionName"), "d": j.get("SessionDate"), "ty": j.get("SessionType"), "tt": j.get("TrackType"), "top": top}
        except Exception: pass
    return {"id": i, "err": 1}
def scan(lo=1, hi=7200):
    have = {r["id"]: r for r in json.load(open(F)) if not r.get("err")} if os.path.exists(F) else {}
    todo = [i for i in range(lo, hi + 1) if i not in have]
    with cf.ThreadPoolExecutor(12) as ex:
        for n, r in enumerate(ex.map(one, todo)):
            if r: have[r["id"]] = r
            if n % 200 == 0: json.dump(list(have.values()), open(F, "w")); print(n, len(todo), flush=True)
    json.dump(list(have.values()), open(F, "w"))
# venue -> (event-name regex, first year of the layout the app draws, last year or None)
VENUES = {
 "st-petersburg": (r"St\.? ?Pete|Firestone Grand Prix of St", 2012),
 "long-beach": (r"Long Beach", 2009),
 "barber": (r"Barber|Alabama|Honda Indy Grand Prix of Alabama", 2010),
 "indianapolis": (r"GMR Grand Prix$|^Sonsio Grand Prix$|Angie.s List Grand Prix|^INDYCAR Grand Prix$|^Grand Prix Of Indianapolis$|Allied Building Products Grand Prix of Indianapolis Race 1", 2014),
 "indianapolis-oval": (r"Indianapolis 500|Indy 500", 1996),
 "detroit": (r"Detroit", 2023),
 "laguna-seca": (r"Laguna Seca|Monterey", 1996),
 "phoenix": (r"Phoenix|Desert Diamond|Good Ranchers", 2018),
 "arlington": (r"Arlington", 2026),
 "mid-ohio": (r"Mid-Ohio", 2010),
 "road-america": (r"Road America", 2016),
 "wwt-raceway": (r"Bommarito|World Wide Technology|Gateway", 2010),
 "portland": (r"Portland", 2018),
 "milwaukee-mile": (r"Milwaukee", 2010),
 "markham": (r"Markham", 2026),
}
def best(tracks, top=5):
    rows = [r for r in json.load(open(F)) if r.get("top")]
    for t in tracks:
        rx, since = VENUES[t][0], VENUES[t][1]; out = []
        for r in rows:
            if not re.search(rx, r["e"] or "", re.I) or re.search(r"nxt|lights|test|usf|mazda|pro 2000|f2000", r["e"] or "", re.I): continue
            y = int(r["d"].split("/")[-1])
            if y < since: continue
            for x in r["top"][:1]: out.append((x["s"], x["t"], y, r["e"], r["s"], r["ty"], x["n"], x["c"], x["tm"], x["mph"]))
        out.sort(); print("==", t, f"({len(out)} sessions)")
        for o in out[:top]: print("  ", o[1], o[2], o[3], "|", o[4], f"({o[5]})", "|", o[6], "#" + str(o[7]), o[8], o[9])
if __name__ == "__main__":
    if sys.argv[1] == "scan": scan()
    else:
        a = [x for x in sys.argv[2:] if not x.startswith("--") and not x.isdigit()]
        best(a or list(VENUES), int(sys.argv[sys.argv.index("--top") + 1]) if "--top" in sys.argv else 5)
