# Draw the water a track's map is missing: the sea (OpenStreetMap keeps it as coastline lines, never as areas, so the
# original builds drew every harbour and shore as grass) and lakes/rivers stored as multipolygon relations whose outer
# ring is split into several ways (the builder only took outer rings that were already one closed way).
# Nothing already drawn is removed; a water area that existing water already covers is skipped.
#   python3 tools/track-data/add_water.py <id> [<id> ...] [--dry]
# OpenStreetMap coastline rule: walking along a coastline way, land is on the LEFT and water on the RIGHT.
import sys, os, re, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_route import load, save, pts
from refresh_streets import overpass, dp

def chains(ways):
    """Join ways that share end nodes (same direction) into longer lines; returns lists of (lon, lat)."""
    segs = [[(n, (c["lon"], c["lat"])) for n, c in zip(w["nodes"], w["geometry"])] for w in ways if w.get("geometry") and w.get("nodes")]
    out = []
    while segs:
        cur = segs.pop(); grown = True
        while grown:
            grown = False
            for i, s in enumerate(segs):
                if s[0][0] == cur[-1][0]: cur += s[1:]; segs.pop(i); grown = True; break
                if s[-1][0] == cur[0][0]: cur = s[:-1] + cur; segs.pop(i); grown = True; break
        out.append(cur)
    return [[p for _, p in c] for c in out], [c[0][0] == c[-1][0] for c in out]

def rings_any_direction(ways):
    """Outer/inner rings of a multipolygon: member ways joined end to end in either direction; closed rings only."""
    segs = [[(c["lon"], c["lat"]) for c in w["geometry"]] for w in ways if w.get("geometry")]
    out = []
    while segs:
        cur = segs.pop(); grown = True
        while grown and cur[0] != cur[-1]:
            grown = False
            for i, s in enumerate(segs):
                if s[0] == cur[-1]: cur += s[1:]
                elif s[-1] == cur[-1]: cur += s[::-1][1:]
                elif s[-1] == cur[0]: cur = s[:-1] + cur
                elif s[0] == cur[0]: cur = s[::-1][:-1] + cur
                else: continue
                segs.pop(i); grown = True; break
        if cur[0] == cur[-1] and len(cur) > 3: out.append(cur)
    return out

def clip_pieces(line, box):
    """Split a polyline into the pieces inside box. Each piece: (points, enters_on_boundary, leaves_on_boundary)."""
    x0, y0, x1, y1 = box
    ins = lambda p: x0 <= p[0] <= x1 and y0 <= p[1] <= y1
    def cross(a, b):   # Liang-Barsky: parameters where a->b enters/leaves the box
        t0, t1, dx, dy = 0.0, 1.0, b[0] - a[0], b[1] - a[1]
        for p, q in ((-dx, a[0] - x0), (dx, x1 - a[0]), (-dy, a[1] - y0), (dy, y1 - a[1])):
            if p == 0:
                if q < 0: return None
            else:
                r = q / p
                if p < 0: t0 = max(t0, r)
                else: t1 = min(t1, r)
        return (t0, t1) if t0 <= t1 else None
    pieces, cur, entered = [], None, False
    for a, b in zip(line, line[1:]):
        c = cross(a, b)
        if not c: continue
        t0, t1 = c; pa = (a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0); pb = (a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1)
        if cur is None: cur = [pa]; entered = t0 > 0
        cur.append(pb)
        if t1 < 1: pieces.append((cur, entered, True)); cur = None
    if cur is not None: pieces.append((cur, entered, False))
    return pieces

def sea_rings(coast_ways, box):
    """Water polygons (lon/lat) inside box from coastline ways, plus island rings (to cut out with even-odd fill)."""
    x0, y0, x1, y1 = box; W, H = x1 - x0, y1 - y0; P = 2 * (W + H)
    def t_of(p):   # position along the box edge, clockwise from the top-left corner (y up: north)
        x, y = p; e = 1e-9 * max(W, H)
        if abs(y - y1) < e: return x - x0
        if abs(x - x1) < e: return W + (y1 - y)
        if abs(y - y0) < e: return W + H + (x1 - x)
        return 2 * W + H + (y - y0)
    corners = [(W, (x1, y1)), (W + H, (x1, y0)), (2 * W + H, (x0, y0)), (P, (x0, y1))]
    lines, closed = chains(coast_ways)
    islands, opens = [], []
    for ln, cl in zip(lines, closed):
        if cl and all(x0 <= p[0] <= x1 and y0 <= p[1] <= y1 for p in ln): islands.append(ln); continue
        for pc, en, lv in clip_pieces(ln, box):
            if en and lv and len(pc) >= 2: opens.append(pc)
    rings = []; used = [False] * len(opens)
    starts = [t_of(pc[0]) for pc in opens]
    for k in range(len(opens)):
        if used[k]: continue
        ring = []; i = k
        while True:
            used[i] = True; ring += opens[i]; te = t_of(opens[i][-1])
            # walk the edge clockwise (water stays on the right) to the next piece that comes onto the box
            j = min(range(len(opens)), key=lambda m: (starts[m] - te) % P if (starts[m] - te) % P > 1e-12 else P)
            dt = (starts[j] - te) % P or P
            for ct, cp in sorted(corners, key=lambda c: (c[0] - te) % P):
                if 0 < (ct - te) % P < dt: ring.append(cp)
            if j == k or used[j]: break
            i = j
        ring.append(ring[0]); rings.append(ring)
    return rings, islands

def inside(p, ring):
    x, y = p; c = False
    for (ax, ay), (bx, by) in zip(ring, ring[1:]):
        if (ay > y) != (by > y) and x < ax + (y - ay) * (bx - ax) / (by - ay): c = not c
    return c

def run(tid, dry=False):
    T = load(tid); g, vb, base = T["geo"], T["vb"], T["base"]
    lng = lambda x: g["w"] + (x - vb[0]) / vb[2] * (g["e"] - g["w"]); lat = lambda y: g["n"] - (y - vb[1]) / vb[3] * (g["n"] - g["s"])
    X = lambda lo: vb[0] + (lo - g["w"]) / (g["e"] - g["w"]) * vb[2]; Y = lambda la: vb[1] + (g["n"] - la) / (g["n"] - g["s"]) * vb[3]
    mx, my = vb[2] * .03, vb[3] * .03          # a little past the drawn rectangle so the sea has no seam at the edge
    box = (lng(vb[0] - mx), lat(vb[1] + vb[3] + my), lng(vb[0] + vb[2] + mx), lat(vb[1] - my))   # lon0, lat0, lon1, lat1
    bb = f"{box[1]:.6f},{box[0]:.6f},{box[3]:.6f},{box[2]:.6f}"
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "street-circuits", "osm", tid + "-water.json")
    if os.path.exists(cache) and json.load(open(cache)).get("bb") == bb: data = json.load(open(cache))
    else:
        q = (f'[out:json][timeout:60][maxsize:134217728];(way["natural"="coastline"]({bb});way["natural"="water"]({bb});relation["natural"="water"]({bb});'
             f'way["waterway"="riverbank"]({bb});relation["waterway"="riverbank"]({bb});way["landuse"~"^(reservoir|basin)$"]({bb}););out geom;')
        data = overpass(q); data["bb"] = bb; os.makedirs(os.path.dirname(cache), exist_ok=True); json.dump(data, open(cache, "w"))
    els = data.get("elements", [])
    proj = lambda ring: [(X(lo), Y(la)) for lo, la in ring]
    old = [pts(p["d"]) for p in base["polys"] if p["k"] == "water"]
    def covered(ring):   # share of sample points of a new area already inside drawn water
        xs = [p[0] for p in ring]; ys = [p[1] for p in ring]; hit = tot = 0
        for i in range(12):
            for j in range(12):
                q = (min(xs) + (max(xs) - min(xs)) * (i + .5) / 12, min(ys) + (max(ys) - min(ys)) * (j + .5) / 12)
                if inside(q, ring): tot += 1; hit += any(inside(q, o + o[:1]) for o in old)
        return hit / tot if tot else 1
    fmt = lambda r: "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in dp(r, .5)) + " Z"
    new = []
    # 1) the sea, from coastlines
    coast = [e for e in els if e["type"] == "way" and e.get("tags", {}).get("natural") == "coastline"]
    if coast:
        rings, islands = sea_rings(coast, box)
        if rings:
            d = " ".join(fmt(proj(r)) for r in rings + islands)
            new.append({"k": "water", "d": d, "_sea": True})
    # 2) lakes and rivers: closed ways and stitched multipolygons not already drawn
    for e in els:
        t = e.get("tags", {})
        if t.get("natural") == "coastline": continue
        if e["type"] == "way":
            geo = [(c["lon"], c["lat"]) for c in e.get("geometry", [])]
            if len(geo) < 4 or geo[0] != geo[-1]: continue
            outer, inner = [geo], []
        else:
            outer = rings_any_direction([m for m in e.get("members", []) if m.get("role") == "outer"])
            inner = rings_any_direction([m for m in e.get("members", []) if m.get("role") == "inner"])
        for o in outer:
            r = proj(o)
            if covered(r) >= .8: continue
            hole = [proj(i) for i in inner if inside(i[0], o)]
            new.append({"k": "water", "d": " ".join(fmt(x) for x in [r] + hole)})
    print(f"{tid}: {len(coast)} coastline ways, {len(els) - len(coast)} water areas in OSM; adding "
          f"{'the sea + ' if any(n.get('_sea') for n in new) else ''}{sum(1 for n in new if not n.get('_sea'))} lake/river areas")
    if dry or not new: return
    for n in new: n.pop("_sea", None)
    base["polys"] = new + base["polys"]          # under everything else: piers, beaches, parks and buildings draw on top
    save(tid, T)

if __name__ == "__main__":
    a = sys.argv[1:]; dry = "--dry" in a
    for tid in [x for x in a if not x.startswith("--")]:
        try: run(tid, dry)
        except SystemExit as e: print(f"{tid}: skipped ({e})")
