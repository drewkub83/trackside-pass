#!/usr/bin/env python3
"""Adds fan-relevant amenities that OpenStreetMap already has near a circuit as badges: toilets, showers, drinking water, restaurants, fast food, pubs,
bars and cafes, information points, the police station and museums, caravan sites. Complements osm_stands.py (grandstands). Useful where the
OSM mapping is dense (Nurburgring); at other circuits it finds little and the official fan map is still the source.
  python3 tools/track-data/osm_amenities.py <track-id> [--radius 110] [--write]
Reads tools/street-circuits/osm/<id>.json (download with fetch_track_osm.py), keeps objects within --radius map units of the circuit path
(default 110, about 600 m at the Nurburgring's scale), skips what the track already has (same kind within 5 units, or the same name within 12),
names badges from OSM (an unnamed one gets its type), and writes them with the source in the description. Check reachability afterwards."""
import sys, os, re, json, math, unicodedata
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_route as B
A = sys.argv[1:]; tid = A[0]; WRITE = "--write" in A
RADIUS = float(A[A.index("--radius") + 1]) if "--radius" in A else 110.0
T = B.load(tid); g = T["geo"]; vb = T["vb"]
els = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "street-circuits", "osm", tid + ".json")))["elements"]
pts = [(float(x), float(y)) for x, y in re.findall(r"([-\d.]+),([-\d.]+)", T["path"])]
def ctr(e):
    if e["type"] == "node": return e["lat"], e["lon"]
    gm = e.get("geometry") or []
    if gm: return sum(p["lat"] for p in gm) / len(gm), sum(p["lon"] for p in gm) / len(gm)
    b = e.get("bounds"); return ((b["minlat"] + b["maxlat"]) / 2, (b["minlon"] + b["maxlon"]) / 2) if b else None
XY = lambda la, lo: ((lo - g["w"]) / (g["e"] - g["w"]) * vb[2] + vb[0], (g["n"] - la) / (g["n"] - g["s"]) * vb[3] + vb[1])
def dpath(x, y): return min(math.hypot(x - px, y - py) for px, py in pts)
# (OSM key=value) -> (badge kind, generic name)
KINDS = {"amenity=toilets": ("rest", "Toilets"), "amenity=shower": ("rest", "Showers"), "amenity=drinking_water": ("rest", "Drinking water"),
         "amenity=restaurant": ("food", "Restaurant"), "amenity=fast_food": ("food", "Fast food"), "amenity=pub": ("food", "Pub"),
         "amenity=bar": ("food", "Bar"), "amenity=cafe": ("food", "Cafe"), "tourism=information": ("info", "Information"),
         "amenity=police": ("info", "Police"), "tourism=museum": ("info", "Museum"), "tourism=caravan_site": ("camp", "Caravan site")}
def slug(s): return re.sub(r"[^a-z0-9]+", "-", unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()).strip("-")
ids = {p["id"] for p in T["pois"]}; new = []; skipped = 0
for e in els:
    t = e.get("tags", {})
    key = next((f"{k}={t[k]}" for k in ("amenity", "tourism") if f"{k}={t.get(k)}" in KINDS), None)
    if not key: continue
    if key == "tourism=information" and t.get("information") in ("board", "guidepost", "map"): continue
    c = ctr(e)
    if not c: continue
    x, y = XY(*c)
    if not (vb[0] <= x <= vb[0] + vb[2] and vb[1] <= y <= vb[1] + vb[3]) or dpath(x, y) > RADIUS: continue
    kind, generic = KINDS[key]; name = t.get("name") or generic
    if any((p["k"] == kind and math.hypot(p["x"] - x, p["y"] - y) < 5) or (t.get("name") and p["n"] == name and math.hypot(p["x"] - x, p["y"] - y) < 12) for p in T["pois"] + new):
        skipped += 1; continue
    base = slug(name); i = base; n = 2
    while i in ids: i = f"{base}-{n}"; n += 1
    ids.add(i)
    o = {"k": kind, "n": name, "x": round(x), "y": round(y), "d": f"{generic} (OpenStreetMap, {key}).", "id": i}
    if kind == "camp": o["c"] = "#6B8E4E"
    new.append(o)
from collections import Counter
print(f"{len(new)} to add, {skipped} already there:", dict(Counter(o["k"] for o in new)))
for o in sorted(new, key=lambda o: (o["k"], o["n"])): print(f'  {o["k"]:5} {o["n"][:44]:44} ({o["x"]},{o["y"]})')
if WRITE:
    T["pois"] += new; B.save(tid, T); print("written")
