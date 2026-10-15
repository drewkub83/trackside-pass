"""Shared helpers for the GT World Challenge Europe tools (podium odds, entry lists, results, standings, auto_update).
Everything reads the series' own public pages (gt-world-challenge-europe.com) with the standard library only, so it runs
unchanged on a laptop or in a GitHub Actions job."""
import re, html, json, os, urllib.request, urllib.parse, time, collections
HOST = "https://www.gt-world-challenge-europe.com"
CLS = {"Pro Cup": "Pro", "Gold Cup": "Gold", "Silver Cup": "Silver", "Bronze Cup": "Bronze", "Pro-AM Cup": "Pro-Am"}
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
UA = "Mozilla/5.0 (Trackside Pass data tools)"

def fetch(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30) as r:
                return r.read().decode("utf-8", "replace")
        except Exception:
            time.sleep(2 * (i + 1))
    return ""

def q(slug): return urllib.parse.quote(html.unescape(slug), safe="-")
def page(season, rnd, sess=""): return fetch(f"{HOST}/results/{season}/{q(rnd)}" + (f"/{sess}" if sess else ""))
def cells(tr): return [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip() for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, flags=re.S)]

def table(h):
    """A results page's table as a list of dicts keyed by its header row (rows with a Pos column)."""
    i = h.find("<table")
    if i < 0: return []
    tb = h[i:h.find("</table>", i) + 8]; hdr = None; out = []
    for r in re.findall(r"<tr[^>]*>(.*?)</tr>", tb, flags=re.S):
        c = cells(r)
        if c and c[0] == "Pos": hdr = c; continue
        if hdr and len(c) == len(hdr): out.append(dict(zip(hdr, c)))
    return out

def class_ranks(rows):
    """{car number: [class, position within class, class size]} in page order (overall order)."""
    cnt = collections.Counter(); out = {}
    for r in rows:
        if r["Pos"].isdigit() and r["Class"] in CLS: c = CLS[r["Class"]]; cnt[c] += 1; out[r["Car #"]] = [c, cnt[c]]
    for n, v in out.items(): v.append(cnt[v[0]])
    return out

def rounds(season):
    """Round slugs listed on the season's results page."""
    h = fetch(f"{HOST}/results/{season}")
    out = []
    for m in re.findall(r'href="/results/%s/([^"/]+)"' % season, h):
        m = html.unescape(m)
        if "test" in m or m in out: continue
        out.append(m)
    return out

def endurance_done(season, exclude=()):
    """Rounds of this season whose Main Race classification exists (the Endurance Cup rounds already run), minus `exclude`."""
    ex = {html.unescape(e) for e in exclude}
    return [r for r in rounds(season) if r not in ex and table(page(season, r, "main-race"))]

# ---- data/entries.js: one block per entry; blocks are located by their header line and their `note:` closing line
def read(rel): return open(os.path.join(ROOT, rel), encoding="utf8").read()
def write(rel, s): open(os.path.join(ROOT, rel), "w", encoding="utf8").write(s)

def entry_blocks(lines):
    """[(start, end, round, d, t)] for every entry in data/entries.js (inclusive line indexes)."""
    out = []; i = 0
    while i < len(lines):
        m = re.match(r'\s*\{ t:"([^"]+)", d:"([^"]+)", s:"[^"]+",(?: live:\{round:"([^"]+)"\},)?', lines[i])
        if m:
            j = i
            while j < len(lines) and not re.match(r"\s*note:", lines[j]): j += 1
            out.append((i, j, m.group(3), m.group(2), m.group(1))); i = j
        i += 1
    return out

def bump_sw():
    s = read("sw.js"); m = re.search(r'const VERSION = "v(\d+)"', s)
    write("sw.js", s.replace(m.group(0), f'const VERSION = "v{int(m.group(1)) + 1}"', 1))

# ---- season ids and the official entry-list index (used to create entries for new weekends automatically)
MONTHS = {m: i for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"], 1)}
def season_id(year, h=None):
    """The series site's internal id for a season year (the Change Season dropdown); falls back to year-2000."""
    h = h or fetch(f"{HOST}/entry-lists")
    m = re.search(r'<option value="(\d+)"[^>]*>\s*%s\s*</option>' % year, h)
    return m.group(1) if m else str(int(year) - 2000)

def parse_range(txt):
    """'14 - 18 October 2026' / '30 July 2026 - 2 August 2026' -> (date, date) or None."""
    import datetime
    parts = [p.strip() for p in txt.split(" - ")]
    def one(p, month=None, year=None):
        m = re.match(r"(\d{1,2})(?:\s+([A-Za-z]+))?(?:\s+(\d{4}))?$", p)
        if not m: return None
        mon = MONTHS.get((m.group(2) or month or "").lower()); yr = m.group(3) or year
        return (int(yr), mon, int(m.group(1))) if mon and yr else None
    if len(parts) != 2: return None
    mm = re.match(r"\d{1,2}\s+([A-Za-z]+)(?:\s+(\d{4}))?$", parts[1])
    if not mm: return None
    end = one(parts[1]); start = one(parts[0], mm.group(1), mm.group(2) or (str(end[0]) if end else None))
    if not start or not end: return None
    return datetime.date(*start), datetime.date(*end)

def entry_list_rows(year):
    """[{slug, series, start, end, available}] from the entry-list index for a season year (all rows, Test Days included)."""
    h = fetch(f"{HOST}/entry-lists?filter_season_id={season_id(year)}")
    i = h.find("<table"); out = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", h[i:h.find("</table>", i)] if i >= 0 else "", flags=re.S)[1:]:
        c = cells(tr); m = re.search(r'href="/entry-list/%s/([^"]+)"' % year, tr); rng = parse_range(c[2]) if len(c) > 2 else None
        if rng: out.append({"slug": html.unescape(m.group(1)) if m else None, "series": c[1], "start": rng[0], "end": rng[1], "available": bool(m)})
    return out
