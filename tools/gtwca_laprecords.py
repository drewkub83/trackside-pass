"""Fastest lap ever recorded at each GT World Challenge America (SRO America, ex-Pirelli World Challenge GT) venue, from the series' own
results pages (gt-world-challenge-america.com/results/<year>/<round>/<session>): every practice and qualifying session's best lap per car.
The site has no per-car race page (the Race link has no address), so race laps are not included: GT3 race laps are almost never quicker.
GT4 and touring-car rows are skipped. The pages name a car's drivers, not who set the lap.
Usage: python3 tools/gtwca_laprecords.py [track-id ...] [--top 5]   (cache: tools/.gtwce_cache/)"""
import re, html, sys, gtwce_lib as g, gtwce_laprecords as L
HOST = "https://www.gt-world-challenge-america.com"
KEYS = [("barber", "barber"), ("cota", "americas"), ("road-atlanta", "road-atlanta"), ("road-america", "road-america"), ("sonoma", "sonoma"),
        ("watkins-glen", "watkins"), ("indianapolis", "indianapolis"), ("indianapolis", "indianpolis"), ("vir", "virginia")]
def track_of(slug):
    s = html.unescape(slug).lower()
    if "gala" in s or "sim-racing" in s: return None
    for t, k in KEYS:
        if k in s: return t
def collect(tracks, first=2016):
    best = {t: [] for t in tracks}
    for y in range(first, 2027):
        idx = L.cached(f"{HOST}/results/{y}")
        for rnd in dict.fromkeys(html.unescape(m) for m in re.findall(r'href="/results/%d/([^"/#]+)"' % y, idx)):
            t = track_of(rnd)
            if t not in tracks: continue
            rp = L.cached(f"{HOST}/results/{y}/{rnd}")
            for s in dict.fromkeys(re.findall(r'href="/results/%d/%s/([^"/#]+)"' % (y, re.escape(rnd)), rp, flags=re.I)):
                if "test" in s.lower(): continue
                for r in g.table(L.cached(f"{HOST}/results/{y}/{rnd}/{s}")):
                    if re.search(r"GT4|TC|TCR|GTS", (r.get("Car", "") + " " + r.get("Class", "")), re.I): continue
                    v = L.secs(r.get("Best Lap") or r.get("Time") or "")
                    if v and 55 < v < 400: best[t].append((v, r.get("Best Lap") or r["Time"], y, rnd, s, r.get("Car #", ""), r.get("Team", ""), r.get("Car", ""), r.get("Drivers", ""), r.get("Class", "")))
    return best
if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--") and not a.isdigit()]; top = int(sys.argv[sys.argv.index("--top") + 1]) if "--top" in sys.argv else 5
    for t, rows in collect(args or sorted({t for t, _ in KEYS})).items():
        rows.sort(); print("==", t, f"({len(rows)} timed rows)")
        for r in rows[:top]: print("  ", r[1], r[2], r[3], r[4], "#" + r[5], r[6], "|", r[7], "|", r[8], "|", r[9])
