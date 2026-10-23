# Fill in the streets around a track: downloads every OpenStreetMap road and footpath in the area the map lets you pan
# (the venue = circuit + badges, plus a margin) and adds the ones the base map does not already draw. Nothing that is
# there is removed or moved, so hand edits survive. New streets also open their cells in the walking grid (only cells
# that are open ground; never a blocked cell such as the circuit), so Directions can use them.
#   python3 tools/track-data/refresh_streets.py <id> [<id> ...] [--margin 0.35] [--dry]
# Uses the Overpass mirrors below (overpass.kumi.systems answered when the main one reset connections, Oct 2026).
import sys, os, re, json, math, time, subprocess
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_route import load, save, pts, rle_encode, rle_decode, WIDTH

EPS = ["https://overpass.kumi.systems/api/interpreter", "https://overpass-api.de/api/interpreter", "https://lz4.overpass-api.de/api/interpreter"]
# same classes as tools/street-circuits/build_permanent.rb, plus pedestrian streets (old-town lanes such as Baku's)
KIND = {"motorway": "primary", "motorway_link": "primary", "trunk": "primary", "trunk_link": "primary", "primary": "primary", "primary_link": "primary",
        "secondary": "primary", "secondary_link": "primary", "tertiary": "primary", "tertiary_link": "primary",
        "residential": "residential", "unclassified": "residential", "living_street": "residential", "pedestrian": "residential", "road": "residential",
        "service": "service", "footway": "path", "path": "path", "cycleway": "path", "steps": "path", "bridleway": "path", "track": "track"}
RANK = {"path": 0, "track": 1, "service": 2, "residential": 3, "primary": 4}   # draw order: small streets under big roads

def overpass(q):
    for attempt in range(6):
        ep = EPS[attempt % len(EPS)]
        try:
            out = subprocess.run(["curl", "-sS", "-m", "200", "-A", "TracksidePass/0.1 (personal race-day app)", "--data-urlencode", "data=" + q, ep], capture_output=True, text=True)
            return json.loads(out.stdout)
        except Exception as e:
            print("  retry", attempt, ep, str(e)[:60], file=sys.stderr); time.sleep(10)
    raise SystemExit("Overpass did not answer")

def dp(p, eps):   # Douglas-Peucker, like the builder
    if len(p) < 3: return p
    a, b = p[0], p[-1]; L = math.hypot(b[0] - a[0], b[1] - a[1]) or 1e-9; dmax, idx = 0, 0
    for i in range(1, len(p) - 1):
        d = abs((b[0] - a[0]) * (a[1] - p[i][1]) - (a[0] - p[i][0]) * (b[1] - a[1])) / L
        if d > dmax: dmax, idx = d, i
    return dp(p[:idx + 1], eps)[:-1] + dp(p[idx:], eps) if dmax > eps else [a, b]

def run(tid, margin=0.35, dry=False):
    T = load(tid); g, vb, base = T["geo"], T["vb"], T["base"]; mpu = T["route"]["mpu"]
    n = [float(v) for v in re.findall(r'-?\d+\.?\d*', T["path"])]
    xs, ys = n[0::2], n[1::2]; x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
    for p in T.get("pois", []): x0, x1, y0, y1 = min(x0, p["x"]), max(x1, p["x"]), min(y0, p["y"]), max(y1, p["y"])
    w, h = x1 - x0, y1 - y0; m = max(w, h) * margin
    x0, y0, x1, y1 = max(vb[0], x0 - m), max(vb[1], y0 - m), min(vb[0] + vb[2], x1 + m), min(vb[1] + vb[3], y1 + m)
    lng = lambda x: g["w"] + (x - vb[0]) / vb[2] * (g["e"] - g["w"]); lat = lambda y: g["n"] - (y - vb[1]) / vb[3] * (g["n"] - g["s"])
    X = lambda lo: vb[0] + (lo - g["w"]) / (g["e"] - g["w"]) * vb[2]; Y = lambda la: vb[1] + (g["n"] - la) / (g["n"] - g["s"]) * vb[3]
    bb = f"{lat(y1):.6f},{lng(x0):.6f},{lat(y0):.6f},{lng(x1):.6f}"
    cache = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "street-circuits", "osm", tid + "-streets.json")
    if os.path.exists(cache) and json.load(open(cache)).get("bb") == bb: data = json.load(open(cache))
    else:
        data = overpass(f'[out:json][timeout:180];way["highway"]({bb});out geom;'); data["bb"] = bb
        os.makedirs(os.path.dirname(cache), exist_ok=True); json.dump(data, open(cache, "w"))
    # existing drawing, sampled every ~2 m into a hash of 4 m cells, to recognise streets already drawn
    cs = 4 / mpu; have = set()
    for l in base["lines"]:
        q = pts(l["d"])
        for a, b in zip(q, q[1:]):
            k = max(1, math.ceil(math.hypot(b[0] - a[0], b[1] - a[1]) / (cs / 2)))
            for i in range(k + 1): have.add((int((a[0] + (b[0] - a[0]) * i / k) // cs), int((a[1] + (b[1] - a[1]) * i / k) // cs)))
    near = lambda x, y: any((int(x // cs) + dx, int(y // cs) + dy) in have for dx in (-1, 0, 1) for dy in (-1, 0, 1))
    inside = lambda x, y: x0 <= x <= x1 and y0 <= y <= y1
    new = []; skipped = 0
    for el in data.get("elements", []):
        t = el.get("tags", {}); k = KIND.get(t.get("highway"))
        if not k or "geometry" not in el or t.get("area") == "yes": continue
        if t.get("access") in ("private", "no") and k in ("service", "path", "track"): continue
        # clutter a normal street map leaves out: sidewalks and crossings drawn beside/over every street, parking aisles, driveways
        if t.get("footway") in ("sidewalk", "crossing", "access_aisle", "traffic_island") or t.get("path") == "sidewalk": continue
        if t.get("service") in ("parking_aisle", "driveway", "drive-through", "emergency_access"): continue
        p = [(X(c["lon"]), Y(c["lat"])) for c in el["geometry"]]
        if not any(inside(x, y) for x, y in p): continue
        L = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(p, p[1:])) * mpu
        if k == "service" and L < 40: continue
        samp = []
        for a, b in zip(p, p[1:]):
            kk = max(1, math.ceil(math.hypot(b[0] - a[0], b[1] - a[1]) / (cs / 2)))
            samp += [(a[0] + (b[0] - a[0]) * i / kk, a[1] + (b[1] - a[1]) * i / kk) for i in range(kk)]
        if samp and sum(near(x, y) for x, y in samp) / len(samp) >= .6: skipped += 1; continue
        p = dp(p, .25)
        if len(p) < 2: continue
        new.append({"k": k, "d": "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in p), "_p": p})
    counts = {}
    for l in new: counts[l["k"]] = counts.get(l["k"], 0) + 1
    print(f"{tid}: {len(data.get('elements', []))} OSM ways in the area, {skipped} already drawn, {len(new)} added {counts}")
    if dry or not new: return
    # walking grid: open ground under a new street becomes path ('2'); blocked cells ('1') stay blocked
    r = T["route"]; rows = [list(rle_decode(s) if r.get("rle") else s) for s in r["rows"]]; cell = r["cell"]; opened = 0
    for l in new:
        rad = WIDTH.get(l["k"], 4) / 2 / mpu
        for a, b in zip(l["_p"], l["_p"][1:]):
            k = max(1, math.ceil(math.hypot(b[0] - a[0], b[1] - a[1]) / (cell / 2)))
            for i in range(k + 1):
                x = a[0] + (b[0] - a[0]) * i / k; y = a[1] + (b[1] - a[1]) * i / k
                for cy in range(int((y - rad - r["y0"]) // cell), int((y + rad - r["y0"]) // cell) + 1):
                    for cx in range(int((x - rad - r["x0"]) // cell), int((x + rad - r["x0"]) // cell) + 1):
                        if 0 <= cy < r["ny"] and 0 <= cx < r["nx"] and rows[cy][cx] == "0" and math.hypot(r["x0"] + (cx + .5) * cell - x, r["y0"] + (cy + .5) * cell - y) <= rad + cell * .35:
                            rows[cy][cx] = "2"; opened += 1
    r["rows"] = [rle_encode("".join(s)) if r.get("rle") else "".join(s) for s in rows]
    for l in new: del l["_p"]
    lines = base["lines"] + new
    base["lines"] = sorted(lines, key=lambda l: RANK.get(l["k"], 9))   # stable: existing order kept within a kind; bridges, tunnels, raceway stay on top
    save(tid, T); print(f"  walking grid: {opened} cells opened")

if __name__ == "__main__":
    a = sys.argv[1:]; dry = "--dry" in a; mg = 0.35
    if "--margin" in a: mg = float(a[a.index("--margin") + 1]); a = [x for i, x in enumerate(a) if x != "--margin" and (i == 0 or a[i - 1] != "--margin")]
    for tid in [x for x in a if not x.startswith("--")]: run(tid, mg, dry)
