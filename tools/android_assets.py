"""Builds the Android launcher icons, splash screens and the status-bar notification icon from the app's own artwork (icons/).
Run from the repo root after `npx cap add android`:  python3 tools/android_assets.py
Writes into android/app/src/main/res/: adaptive + legacy launcher icons (from icons/icon-maskable-512.png and icon-1024.png),
splash.png in every density (dark, night pin centred, matching the iOS launch colour), and drawable-*/ic_stat_icon.png (a white pin
silhouette: Android draws status-bar icons as a single-colour mask, so the full-colour logo would show as a white square)."""
import os
from PIL import Image, ImageDraw
RES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "android", "app", "src", "main", "res")
ICONS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "icons")
DENS = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
def save(im, *parts):
    p = os.path.join(RES, *parts); os.makedirs(os.path.dirname(p), exist_ok=True); im.save(p)
mask512 = Image.open(os.path.join(ICONS, "icon-maskable-512.png")).convert("RGB")
full = Image.open(os.path.join(ICONS, "icon-1024.png")).convert("RGBA")
night = Image.open(os.path.join(ICONS, "icon-night-1024.png")).convert("RGB")
for d, k in DENS.items():
    save(mask512.resize((int(108 * k),) * 2, Image.LANCZOS), f"mipmap-{d}", "ic_launcher_foreground.png")      # adaptive layer (108 dp, pin inside the safe zone)
    s = int(48 * k); base = full.resize((s, s), Image.LANCZOS)
    sq = Image.new("RGBA", (s, s), (0, 0, 0, 0)); m = Image.new("L", (s, s), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.18), fill=255)
    sq.paste(base, (0, 0), m); save(sq, f"mipmap-{d}", "ic_launcher.png")                                          # legacy launchers: rounded square
    rd = Image.new("RGBA", (s, s), (0, 0, 0, 0)); m = Image.new("L", (s, s), 0); ImageDraw.Draw(m).ellipse([0, 0, s - 1, s - 1], fill=255)
    rd.paste(base, (0, 0), m); save(rd, f"mipmap-{d}", "ic_launcher_round.png")                                    # legacy round
bg = night.getpixel((3, 3))
for root, _, files in os.walk(RES):                                                                              # every splash.png keeps its size, new picture
    for f in files:
        if f == "splash.png":
            p = os.path.join(root, f); w, h = Image.open(p).size; im = Image.new("RGB", (w, h), bg); s = int(min(w, h) * 0.42)
            im.paste(night.resize((s, s), Image.LANCZOS), ((w - s) // 2, (h - s) // 2)); im.save(p)
def pin_points(n=60):                                                                                           # the logo's pin outline (icons/pin.svg, viewBox 24 14 72 98)
    import math
    pts = [(60 + 34 * math.cos(math.radians(a)), 50 - 34 * math.sin(math.radians(a))) for a in range(0, 181, 3)]  # top arc, right to left
    p0, p1, p2, p3 = (26, 50), (26, 78), (60, 110), (60, 110)
    pts += [((1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t ** 3 * p3[0],
             (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t ** 3 * p3[1]) for t in [i / n for i in range(n + 1)]]
    p0, p1, p2, p3 = (60, 110), (60, 110), (94, 78), (94, 50)
    pts += [((1 - t) ** 3 * p0[0] + 3 * (1 - t) ** 2 * t * p1[0] + 3 * (1 - t) * t * t * p2[0] + t ** 3 * p3[0],
             (1 - t) ** 3 * p0[1] + 3 * (1 - t) ** 2 * t * p1[1] + 3 * (1 - t) * t * t * p2[1] + t ** 3 * p3[1]) for t in [i / n for i in range(n + 1)]]
    return pts
for d, k in DENS.items():
    s = int(24 * k); S = s * 8; im = Image.new("L", (S, S), 0); dr = ImageDraw.Draw(im); pad = S * 0.08; box = S - 2 * pad
    f = lambda p: (pad + (p[0] - 24) / 72 * box * 72 / 98 + (box - box * 72 / 98) / 2, pad + (p[1] - 14) / 98 * box)
    dr.polygon([f(p) for p in pin_points()], fill=255); c = f((60, 50)); r = 15 / 98 * box
    dr.ellipse([c[0] - r, c[1] - r, c[0] + r, c[1] + r], fill=0)                                                  # hole where the checkered flag sits
    a = im.resize((s, s), Image.LANCZOS); out = Image.new("RGBA", (s, s), (255, 255, 255, 0)); out.putalpha(a)
    save(out, f"drawable-{d}", "ic_stat_icon.png")
print("android assets written")
