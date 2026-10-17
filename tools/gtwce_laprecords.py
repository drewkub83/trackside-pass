"""Fastest lap ever recorded at each GT World Challenge Europe circuit, in ANY session (practice, qualifying, superpole, race),
read from the series' own results pages (gt-world-challenge-europe.com/results/<year>/<round>/<session>), 2014-present.
Official test days are left out. Practice/qualifying pages carry each car's best lap; race pages carry its best race lap.
The pages name the car's drivers, not who set the lap, so the driver is confirmed separately (see --who in the notes it prints).
Usage: python3 tools/gtwce_laprecords.py [track-id ...] [--from 2019] [--top 5]   Results are cached in tools/.gtwce_cache/."""
import re, html, os, sys, json, gtwce_lib as g
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".gtwce_cache"); os.makedirs(CACHE, exist_ok=True)
KEYS = [("brands-hatch", "brands-hatch"), ("paul-ricard", "paul-ricard"), ("misano", "misano"), ("magny-cours", "magny"), ("zandvoort", "zandvoort"),
        ("nurburgring", "rburgring"), ("hungaroring", "hungaroring"), ("hungaroring", "budapest"), ("barcelona-catalunya", "barcelona"), ("imola", "imola"),
        ("portimao", "algarve"), ("portimao", "portimao"), ("spa-francorchamps", "hours-of-spa")]
def track_of(slug):
    s = html.unescape(slug).lower()
    if "test" in s: return None
    for tid, k in KEYS:
        if k in s: return tid
def cached(url):
    f = os.path.join(CACHE, re.sub(r"[^a-z0-9]+", "_", url.lower())[-150:] + ".html")
    if os.path.exists(f): return open(f, encoding="utf8").read()
    h = g.fetch(url)
    if h: open(f, "w", encoding="utf8").write(h)
    return h
def secs(t):
    m = re.fullmatch(r"(\d):(\d\d)\.(\d{1,3})", t.strip())
    return int(m.group(1)) * 60 + int(m.group(2)) + float("0." + m.group(3)) if m else None
def sessions(year, rnd):
    h = cached(f"{g.HOST}/results/{year}/{g.q(rnd)}")
    out = []
    for s in re.findall(r'href="/results/%d/%s/([^"]+)"' % (year, re.escape(html.unescape(rnd)).replace("&", "(?:&|&amp;)")), h, flags=re.I) or re.findall(r'href="/results/\d+/[^"/]+/([^"]+)"', h):
        s = html.unescape(s)
        if "test" in s.lower() or s in out: continue
        out.append(s)
    return out
def collect(tracks, first=2014):
    best = {t: [] for t in tracks}
    for y in range(first, 2027):
        idx = cached(f"{g.HOST}/results/{y}")
        for rnd in dict.fromkeys(html.unescape(m) for m in re.findall(r'href="/results/%d/([^"/]+)"' % y, idx)):
            t = track_of(rnd)
            if t not in tracks: continue
            for s in sessions(y, rnd):
                h = cached(f"{g.HOST}/results/{y}/{g.q(rnd)}/{s}")
                for r in g.table(h):
                    v = secs(r.get("Time", "")) if r.get("Time") else None
                    if v and 55 < v < 400:
                        best[t].append((v, r["Time"], y, rnd, s, r.get("Car #", ""), r.get("Team", ""), r.get("Car", ""), r.get("Drivers", ""), r.get("Class", "")))
    return best
LAYOUT = {"zandvoort": 2020, "nurburgring": 2017, "paul-ricard": 2019}   # first year of the layout the map draws; Barcelona is skipped (the map shows the chicane layout, the series has raced without it since 2023)
def weekend(rnd, track, year, dry=False):
    """Lowers the venue's GT World Challenge Europe lapRecord row if a session of this weekend beat it (used by tools/auto_update.py during a race weekend).
    Driver credit: qualifying N is driven by the N-th listed driver when the crew list is complete (checked against series reports); otherwise the crew."""
    import dataio as D
    year = int(year)
    if track == "barcelona-catalunya" or year < LAYOUT.get(track, 0): return
    best = None
    for s in sessions(year, rnd):
        for r in g.table(cached_fresh(f"{g.HOST}/results/{year}/{g.q(rnd)}/{s}")):
            v = secs(r.get("Time", "")) if r.get("Time") else None
            if v and 55 < v < 400 and (best is None or v < best[0]): best = (v, s, r)
    if not best: return
    v, s, r = best; crew = [x.strip() for x in r.get("Drivers", "").split(",") if x.strip()]
    m = re.fullmatch(r"qualifying-(\d)", s); n = int(m.group(1)) if m else 0
    who = crew[n - 1] if n and n <= len(crew) and len(crew) >= 2 else " / ".join(crew)
    D.set_record(track, "GT World Challenge Europe", D.fmt(v, 3), who, r.get("Car", ""), int(year),
                 f'fastest lap of any session ({s.replace("-", " ")}, #{r.get("Car #", "")} {r.get("Team", "")}); driver credited by qualifying order, check against the series report', dec=3, dry=dry)
def cached_fresh(url):   # a live weekend's pages change: never use the on-disk cache for them
    return g.fetch(url)
if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]; first = int(sys.argv[sys.argv.index("--from") + 1]) if "--from" in sys.argv else 2014
    top = int(sys.argv[sys.argv.index("--top") + 1]) if "--top" in sys.argv else 5
    args = [a for a in args if not a.isdigit()]
    tracks = args or sorted({t for t, _ in KEYS})
    for t, rows in collect(tracks, first).items():
        rows.sort(); print("==", t, f"({len(rows)} timed rows)")
        for r in rows[:top]: print("  ", r[1], r[2], r[3], r[4], "#" + r[5], r[6], "|", r[7], "|", r[8], "|", r[9])
