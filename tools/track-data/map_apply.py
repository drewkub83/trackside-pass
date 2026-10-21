# Place fan-map facilities on a track from an official map IMAGE that fit_map.py has already georeferenced.
#   from map_apply import apply
#   apply("silverstone", "silver_fit.json", items, source="the 2023 British Grand Prix fan map", rename_r=30)
# items: (kind, name, (image_x, image_y), description[, id]) with the pixel position in the image fit_map.py was given.
#   - rename_fmt "{old} ({new})" keeps the OpenStreetMap name and adds the official one (use it when the map only numbers its stands).
#   - kind "stand" items within rename_r map units of an existing grandstand badge RENAME it to the official name (the OpenStreetMap
#     position is kept, it is the better one); other items are added unless the same kind already has a badge within dedupe_r.
#   - every added badge says its position is approximate and where it came from.
# Does not touch the walking grid: afterwards check walkMetresTo() reach (CLAUDE.md) and nudge any badge the grid cannot reach.
import sys, os, re, json, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_route import load, save
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
def tf_from_fit(fit):
    if callable(fit): return fit      # e.g. geo_map.to_app wrapper for stylised maps
    F = json.load(open(fit)) if isinstance(fit, str) else fit; c, sn, s = math.cos(F["ang"]), math.sin(F["ang"]), F["s"]
    if "A" in F:    # affine fit (fit_map.py --affine): invert the 2x2 matrix
        a, b, c2, d = F["A"]; det = a * d - b * c2
        return lambda p: (( d * (p[0] - F["tx"]) - b * (p[1] - F["ty"])) / det, (-c2 * (p[0] - F["tx"]) + a * (p[1] - F["ty"])) / det)
    def tf(p):
        u, v = (p[0] - F["tx"]) / s, (p[1] - F["ty"]) / s
        return (u * c + v * sn, -u * sn + v * c)    # inverse of image = s*R(ang)*track + t
    return tf
def apply(tid, fit, items, source, rename_r=30, dedupe_r=None, facts=None, rename_fmt="{new}"):
    dedupe_r = dedupe_r or {"rest": 12, "info": 10, "med": 12, "park": 14, "camp": 30, "food": 12}
    tf = tf_from_fit(fit); T = load(tid); have = {p.get("id") for p in T["pois"]}; added, renamed, skipped = [], [], []; used = set(); orig = len(T["pois"])
    note = "Position approximate: placed from %s." % source
    for it in items:
        k, n, pg, d = it[:4]; i = it[4] if len(it) > 4 else slug(n); x, y = tf(pg); x, y = round(x), round(y)
        if k == "stand" and rename_r:
            c = [(math.hypot(p["x"] - x, p["y"] - y), j) for j, p in enumerate(T["pois"][:orig]) if p["k"] == "stand" and not p.get("del") and j not in used and math.hypot(p["x"] - x, p["y"] - y) <= rename_r]
            if c:
                j = min(c)[1]; used.add(j); p = T["pois"][j]; old = p["n"]; p["n"] = rename_fmt.format(old=old, new=n); p["d"] = d; p["id"] = i if i not in have else p.get("id"); have.add(i); renamed.append((old, n)); continue
        if i in have: skipped.append((n, "id exists")); continue
        r = dedupe_r.get(k)
        if r and any(p["k"] == k and not p.get("del") and math.hypot(p["x"] - x, p["y"] - y) < r for p in T["pois"]): skipped.append((n, "already within %d" % r)); continue
        T["pois"].append({"k": k, "n": n, "x": x, "y": y, "d": (d + " " if d else "") + note, "id": i}); have.add(i); added.append((k, n, x, y))
    if facts: T["facts"].update(facts)
    save(tid, T); return added, renamed, skipped
