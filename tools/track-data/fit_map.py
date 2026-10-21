# Georeference an official fan-map IMAGE onto a track in the app: finds the similarity transform (scale, rotation, shift) that lays the track's lap
# (data/<id>.js "path", in map units) over the circuit line drawn in the image. No guessing: it searches the whole rotation range and keeps the
# transform where the lap and the drawn circuit agree best, then writes an overlay so you can check it by eye.
#   python3 tools/track-data/fit_map.py <track-id> <image> --dark 80 [--box x0,y0,x1,y1] [--out fit.json] [--overlay overlay.png]
#     --dark N      the circuit is drawn in pixels darker than N (0-255) in all channels (default 80); use --color B,G,R,tol for a coloured line
#     --box         only look for the circuit inside this rectangle of the image (leave out legends and titles)
#     --exclude x0,y0,x1,y1[;x0,...]   blank out rectangles (legends, titles) before looking for the circuit
#     --thin R      drop filled blobs (icons, text discs) wider than R px, keep every long thin piece (the drawn asphalt band, even when icons
#                   and zone borders cut it into many pieces); --minlen L = shortest piece kept (default 100 px). Use instead of --keep.
#     --keep K      keep the K largest dark blobs (default 1: the circuit is one connected line)
# Needs OpenCV and numpy (pip install --target <dir> opencv-python-headless numpy; add <dir> to PYTHONPATH). Result: {"s","ang","tx","ty","cost"} so that
#   image_xy = s * rot(ang) * track_xy + (tx, ty);  use inv() below to turn a point read off the image into track units.
import sys, os, json, math, random, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, cv2
import build_route as B
A = sys.argv[1:]; tid, imgf = A[0], A[1]
opt = lambda k, d=None: A[A.index(k) + 1] if k in A else d
DARK = int(opt("--dark", 80)); BOX = [int(v) for v in opt("--box").split(",")] if opt("--box") else None; KEEP = int(opt("--keep", 1))
COLOR = [int(v) for v in opt("--color").split(",")] if opt("--color") else None
img = cv2.imread(imgf); H, W = img.shape[:2]
if COLOR: b, g, r, tol = COLOR; mask = ((abs(img[..., 0].astype(int) - b) < tol) & (abs(img[..., 1].astype(int) - g) < tol) & (abs(img[..., 2].astype(int) - r) < tol)).astype(np.uint8)
else: mask = ((img[..., 0] < DARK) & (img[..., 1] < DARK) & (img[..., 2] < DARK)).astype(np.uint8)
if BOX: m2 = np.zeros_like(mask); x0, y0, x1, y1 = BOX; m2[y0:y1, x0:x1] = mask[y0:y1, x0:x1]; mask = m2
for r in (opt("--exclude") or "").split(";"):
    if r: x0, y0, x1, y1 = [int(v) for v in r.split(",")]; mask[y0:y1, x0:x1] = 0
if opt("--thin"):
    R = int(opt("--thin")); blobs = cv2.dilate(cv2.morphologyEx(mask, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (R, R))), np.ones((5, 5), np.uint8))
    mask = mask & (1 - blobs); n, lab, st, _ = cv2.connectedComponentsWithStats(mask, connectivity=8); ML = int(opt("--minlen", 100))
    keep = [i for i in range(1, n) if max(st[i, cv2.CC_STAT_WIDTH], st[i, cv2.CC_STAT_HEIGHT]) >= ML and st[i, cv2.CC_STAT_AREA] > 300]
    mask = np.isin(lab, keep).astype(np.uint8); KEEP = 0
n, lab, st, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
if KEEP: order = np.argsort(-st[1:, cv2.CC_STAT_AREA])[:KEEP] + 1; mask = np.isin(lab, order).astype(np.uint8)
cv2.imwrite(opt("--mask", "mask.png"), mask * 255)
SC = 4; small = cv2.resize(mask, (W // SC, H // SC), interpolation=cv2.INTER_AREA); small = (small > 0).astype(np.uint8); hs, ws = small.shape
dtm = cv2.distanceTransform(1 - small, cv2.DIST_L2, 3); ys, xs = np.nonzero(small); M = np.stack([xs, ys], 1).astype(float)
T = B.load(tid); P = [(float(x), float(y)) for x, y in re.findall(r"(-?\d+\.?\d*),(-?\d+\.?\d*)", T["path"])]
D = []
for (a, c), (d, e) in zip(P, P[1:] + P[:1]):
    k = max(1, int(math.hypot(d - a, e - c) / 2))
    for i in range(k): D.append((a + (d - a) * i / k, c + (e - c) * i / k))
D = np.array(D); cx, cy = D.mean(0)
def project(s, ang, tx, ty, pts=D):
    c, sn = math.cos(ang), math.sin(ang); return np.stack([(s * (pts[:, 0] * c - pts[:, 1] * sn) + tx) / SC, (s * (pts[:, 0] * sn + pts[:, 1] * c) + ty) / SC], 1)
def cost(s, ang, tx, ty):
    q = project(s, ang, tx, ty); u, v = q[:, 0], q[:, 1]
    ok = (u >= 0) & (u < ws - 1) & (v >= 0) & (v < hs - 1)
    if ok.sum() < len(D) * 0.97: return 1e9
    a = float(np.mean(dtm[v[ok].astype(int), u[ok].astype(int)]))
    canvas = np.zeros((hs, ws), np.uint8); cv2.polylines(canvas, [q.astype(np.int32)], True, 1, 1); dm = cv2.distanceTransform(1 - canvas, cv2.DIST_L2, 3)
    return a + float(np.mean(dm[M[::3, 1].astype(int), M[::3, 0].astype(int)]))
mx0, my0 = M.mean(0) * SC; diag_m = math.hypot(*(M.max(0) - M.min(0))) * SC; diag_d = math.hypot(*(D.max(0) - D.min(0)))
s0 = diag_m / diag_d; random.seed(7); cands = []
for deg in range(0, 360, 6):
    ang = math.radians(deg)
    for sf in (0.85, 0.95, 1.05, 1.15):
        s = s0 * sf; tx = mx0 - s * (cx * math.cos(ang) - cy * math.sin(ang)); ty = my0 - s * (cx * math.sin(ang) + cy * math.cos(ang)); cands.append((cost(s, ang, tx, ty), s, ang, tx, ty))
cands.sort(); best = None
for c0, s, a, tx, ty in cands[:12]:
    cur = c0; step = [s * 0.04, 0.05, 14, 14]
    for it in range(260):
        cand = [s + random.gauss(0, step[0]), a + random.gauss(0, step[1]), tx + random.gauss(0, step[2]), ty + random.gauss(0, step[3])]
        c2 = cost(*cand)
        if c2 < cur: s, a, tx, ty = cand; cur = c2
        if it % 70 == 69: step = [x * 0.55 for x in step]
    if best is None or cur < best[0]: best = (cur, s, a, tx, ty)
cur, s, a, tx, ty = best; step = [s * 0.01, 0.01, 4, 4]
for it in range(900):
    cand = [s + random.gauss(0, step[0]), a + random.gauss(0, step[1]), tx + random.gauss(0, step[2]), ty + random.gauss(0, step[3])]
    c2 = cost(*cand)
    if c2 < cur: s, a, tx, ty = cand; cur = c2
    if it % 300 == 299: step = [x * 0.5 for x in step]
out = dict(s=s, ang=a, tx=tx, ty=ty, cost=cur, W=W, H=H); json.dump(out, open(opt("--out", "fit.json"), "w"))
print("fit cost %.2f (px at 1/%d scale, lower is better)  scale %.4f  rotation %.1f deg" % (cur, SC, s, math.degrees(a)))
over = img.copy(); q = (project(s, a, tx, ty) * SC).astype(np.int32); cv2.polylines(over, [q], True, (0, 0, 255), 3); cv2.imwrite(opt("--overlay", "overlay.png"), over)
