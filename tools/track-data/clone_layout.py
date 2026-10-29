#!/usr/bin/env python3
"""Makes a second track file for ANOTHER LAYOUT of a venue that already has one (same base map, badges, grid, outline box), e.g. NASCAR's
short layouts at Watkins Glen and Sonoma. The new lap comes from OpenStreetMap pieces (way ids in driving order, a minus = backwards), is
smoothed and resampled like the original, and drawn in the same map units (the file's `geo` box <-> `vb`), so every badge stays where it is.
Raceway pieces that the new lap does not use stay on the map as plain service roads (walkable, no longer a barrier in the walking grid).
    python3 tools/track-data/clone_layout.py <spec.json>
spec: {src, new, osm (tools/street-circuits/osm/<osm>.json), ways:[...], name, short, length, blurb, nturns?, keep_labels:[names]|null,
       drop_poi_ids:[...], facts:{...}, events:[...], lapRecord:[...], eventName, pit_way?:<id>, move_events_from_src:"NASCAR"}
The source file loses the events that move (events whose `s` starts with move_events_from_src). Run the walking grid + checks afterwards."""
import sys, os, re, json, math, copy
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_route as B
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
spec = json.load(open(sys.argv[1], encoding="utf-8"))
T = B.load(spec["src"]); g = T["geo"]; vb = T["vb"]
els = json.load(open(os.path.join(REPO, "tools", "street-circuits", "osm", spec["osm"] + ".json"), encoding="utf-8"))["elements"]
W = {e["id"]: e for e in els if e["type"] == "way" and e.get("geometry")}
def xy(p): return (vb[0] + (p["lon"] - g["w"]) / (g["e"] - g["w"]) * vb[2], vb[1] + (g["n"] - p["lat"]) / (g["n"] - g["s"]) * vb[3])
def way_nodes(wid):
    w = W[abs(wid)]; nn = list(zip(w["nodes"], w["geometry"]))
    return nn[::-1] if wid < 0 else nn
def chain(ids, cut=None):
    """ids in driving order; entries may be [wid, from_node, to_node] to take only a stretch of a way (inclusive)"""
    out = []
    for it in ids:
        it = [it] if not isinstance(it, list) else it; wid, a, b = (it + [None, None])[:3] if len(it) == 1 else it
        nn = way_nodes(wid)
        if a is not None:
            ia = [n for n, _ in nn].index(a); ib = [n for n, _ in nn].index(b); nn = nn[ia:ib + 1]
        if out:
            assert out[-1][0] == nn[0][0], "pieces do not connect: way %s starts at node %s, previous piece ends at %s" % (wid, nn[0][0], out[-1][0])
            nn = nn[1:]
        out += nn
    return out
ring = chain(spec["ways"])
closed = ring[0][0] == ring[-1][0]; pts = [xy(p) for _, p in (ring[:-1] if closed else ring)]
if not closed: print("WARNING: the lap is not closed (first node %s, last %s)" % (ring[0][0], ring[-1][0]))
def chaikin(p, n=1):
    for _ in range(n):
        q = []
        for a, b in zip(p, p[1:] + p[:1]):
            q += [(.75 * a[0] + .25 * b[0], .75 * a[1] + .25 * b[1]), (.25 * a[0] + .75 * b[0], .25 * a[1] + .75 * b[1])]
        p = q
    return p
pts = chaikin(pts, spec.get("smooth", 1))
def resample(p, step):
    P = p + [p[0]]; cum = [0.0]
    for a, b in zip(P, P[1:]): cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    n = max(3, int(round(cum[-1] / step))); out = []; j = 0
    for i in range(n):
        d = cum[-1] * i / n
        while cum[j + 1] < d: j += 1
        t = (d - cum[j]) / ((cum[j + 1] - cum[j]) or 1)
        out.append((P[j][0] + (P[j + 1][0] - P[j][0]) * t, P[j][1] + (P[j + 1][1] - P[j][1]) * t))
    return out
old = B.pts(T["path"]); step = spec.get("step") or math.hypot(old[1][0] - old[0][0], old[1][1] - old[0][1])
pts = resample(pts, step)
mpu = (g["n"] - g["s"]) * 111000 / vb[3]
L = sum(math.hypot(a[0] - b[0], a[1] - b[1]) for a, b in zip(pts, pts[1:] + pts[:1])) * mpu
print("new lap: %d points, %.0f m = %.3f mi (official %s)" % (len(pts), L, L / 1609.34, spec.get("length")))
# the start/finish stays where it is if it still lies on the lap, else it is moved onto it
def near_poly(p, poly):
    best = (1e9, 0)
    for i, (a, b) in enumerate(zip(poly, poly[1:] + poly[:1])):
        dx, dy = b[0] - a[0], b[1] - a[1]; ll = dx * dx + dy * dy
        t = 0 if ll == 0 else max(0, min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / ll)); d = math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy)
        if d < best[0]: best = (d, i)
    return best
d_sf = near_poly(T["sf"], pts)[0]
print("start/finish is %.1f units (%.0f m) from the new lap" % (d_sf, d_sf * mpu))
assert d_sf * mpu < 12, "start/finish no longer on the lap"
N = copy.deepcopy(T)
N["id"] = spec["new"]; N["name"] = spec["name"]; N["short"] = spec["short"]; N["length"] = spec["length"]; N["blurb"] = spec["blurb"]
if "nturns" in spec: N["nturns"] = spec["nturns"]
N["path"] = "M" + " L".join("%.1f,%.1f" % p for p in pts) + " Z"
# pit lane (the source may have none): the OpenStreetMap pit piece, the stretch that runs beside the lap
if spec.get("pit_way"):
    pp = [xy(p) for _, p in way_nodes(spec["pit_way"])]
    near = [near_poly(p, pts)[0] * mpu <= 30 for p in pp]; runs = []; st = None
    for i, f in enumerate(near + [False]):
        if f and st is None: st = i
        if not f and st is not None: runs.append((st, i - 1)); st = None
    a, b = max(runs, key=lambda r: sum(math.hypot(pp[i + 1][0] - pp[i][0], pp[i + 1][1] - pp[i][1]) for i in range(r[0], r[1])))
    N["pit"] = "M" + " L".join("%.1f,%.1f" % p for p in pp[a:b + 1])
    print("pit lane: %d points" % (b - a + 1))
# turn labels: keep the named ones that sit on the new lap
if spec.get("keep_labels") is not None:
    N["labels"] = [l for l in T["labels"] if l[2] in spec["keep_labels"]]
N["pois"] = [p for p in T["pois"] if p.get("id") not in spec.get("drop_poi_ids", [])]
if "turns" in spec: N["turns"] = spec["turns"]
if "facts" in spec: N["facts"] = spec["facts"]
N["events"] = spec["events"]; N["sessions"] = spec.get("sessions", []); N["eventName"] = spec["eventName"]
N["lapRecord"] = spec.get("lapRecord", [])
N["rev"] = 1
# raceway pieces the new lap does not use: plain service roads
base = N["base"]; n_un = 0
for l in base["lines"]:
    if l["k"] != "raceway": continue
    q = B.pts(l["d"]); far = sum(1 for p in q if near_poly(p, pts)[0] * mpu > 25)
    if far > .7 * len(q) and not (spec.get("pit_way") and False): l["k"] = "service"; n_un += 1
print("raceway pieces turned into service roads:", n_un)
# part of the source lap the new lap does not use (the base map may not carry it as a raceway line): keep it drawn as a plain road
if spec.get("keep_unused_lap"):
    farp = [near_poly(p, pts)[0] * mpu > 15 for p in old]; run = []; added = 0
    for p, f in zip(old + [old[0]], farp + [False]):
        if f: run.append(p)
        elif run:
            if len(run) > 1: base["lines"].append({"k": "service", "d": "M" + " L".join("%.1f,%.1f" % q for q in run)}); added += 1
            run = []
    print("unused stretches of the old lap kept as service roads:", added)
B.save(spec["new"], N)
if spec.get("move_events_from_src"):
    S = B.load(spec["src"]); pre = spec["move_events_from_src"]
    S["events"] = [e for e in S["events"] if not e.get("s", "").startswith(pre)]; B.save(spec["src"], S)
    print("moved %s events out of %s" % (pre, spec["src"]))
print("saved data/%s.js" % spec["new"], "- now: python3 -c \"import sys;sys.path.insert(0,'tools/track-data');import build_route as B;B.build('%s',rle=True)\"" % spec["new"])
