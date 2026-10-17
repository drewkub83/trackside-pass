#!/usr/bin/env python3
"""Keeps the GT World Challenge America data current from the series' own site (gt-world-challenge-america.com), with nobody's computer
involved (called by tools/auto_update.py every 30 minutes Thu-Mon on GitHub Actions; also fine by hand). For each round at a venue the app
has an event for, running now or finished in the last 10 days:
  1. data/results.js   the race winner (the site's round page lists only each session's top car, so only the overall winner is shown)
  2. data/standings.js the Pro / Pro-Am / Am driver standings (top 6 of each) when a result was added or changed
  3. data/<track>.js   lowers the venue's lapRecord row when a practice or qualifying session of the round has a faster lap. The site names a
                       car's crew, not who set the lap: a "qualifying-N" session is credited to the N-th listed driver (confirmed against series
                       reports at Road America, COTA and Watkins Glen), practice and combined sessions to the whole crew. Race laps are not on the site.
Idempotent. Usage: python3 tools/gtwca_update.py [--days 10] [--now 2026-10-12T12:00:00Z] [--dry-run]"""
import sys, os, re, html, json, datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D, gtwce_lib as G, gtwca_laprecords as W
A = sys.argv[1:]; DRY = "--dry-run" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
days = int(opt("--days", "10")); H = W.HOST
SERIES_EVENT = r"GT World Challenge America|Texas 8 Hour|Indianapolis 8 Hour"
MARK = "(automatic update) "   # entries written by this script start their note with this; hand-written entries are never overwritten by it
def cells(tr): return G.cells(tr)

def main():
    events = D.track_events(); today = now.date(); year = today.year
    idx = G.fetch(f"{H}/results/{year}")
    if not idx: print("GT World Challenge America site unreadable"); return
    imported = []
    for rnd in dict.fromkeys(html.unescape(m) for m in re.findall(r'href="/results/%d/([^"/#]+)"' % year, idx)):
        track = W.track_of(rnd)
        if not track: continue
        ev = next((e for e in events.get(track, []) if re.search(SERIES_EVENT, e["e"], re.I)
                   and datetime.date.fromisoformat(e["d"]) - datetime.timedelta(days=1) <= today <= datetime.date.fromisoformat(e["d"]) + datetime.timedelta(days=e["t"] - 1 + days)), None)
        if not ev: continue
        page = G.fetch(f"{H}/results/{year}/{G.q(rnd)}")
        print(f'{rnd} -> {track}, app event {ev["d"]} {ev["e"]}')
        if import_winner(track, ev, page, year, rnd): imported.append(ev)
        round_records(track, rnd, year, page)
    if imported: refresh_standings(imported[-1], events, year)

def import_winner(track, ev, page, year, rnd):
    i = page.find("<table")
    if i < 0: return False
    race = None
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", page[i:page.find("</table>", i)], flags=re.S):
        c = cells(tr)
        if len(c) >= 8 and c[0].strip().lower() == "race" and c[6]: race = c
    if not race: print("  no race result on the page yet"); return False
    _, cls, num, drivers, team, car, t, laps = race[:8]
    entry = (f'  {{ t:{json.dumps(track)}, d:{json.dumps(ev["d"])}, s:"gtwca", event:{json.dumps(ev["e"], ensure_ascii=False)},\n    groups:[\n'
             f'      {{ h:{json.dumps(cls)}, winner:{json.dumps(f"#{num} {team} {car} — {drivers}", ensure_ascii=False)},\n        gap:{json.dumps(f"Won the race ({laps} laps, {t}).")} }}\n    ],\n'
             f'    note:{json.dumps(f"{MARK}Source: gt-world-challenge-america.com race results ({rnd}, {year}). The site lists only each session’s top car, so only the overall winner is shown.", ensure_ascii=False)} }},\n')
    s = D.read("data/results.js")
    pat = r'^  \{ t:%s, d:%s, s:"gtwca".*?\n    note:.*?\},\n' % (re.escape(json.dumps(track)), re.escape(json.dumps(ev["d"])))
    m = re.search(pat, s, flags=re.S | re.M)
    if m and MARK not in m.group(0): print("  results: a hand-written entry exists, kept"); return False
    if m and m.group(0) == entry: print("  results: already"); return False
    print("  results:", "refreshed" if m else "added")
    if DRY: return True
    if m: s = s[:m.start()] + entry + s[m.end():]
    else: k = s.index("const RESULTS = [") + len("const RESULTS = [\n"); s = s[:k] + entry + s[k:]
    D.write("data/results.js", s); return True

def round_records(track, rnd, year, page):
    best = None
    for s in dict.fromkeys(re.findall(r'href="/results/%d/%s/([^"/#]+)"' % (year, re.escape(rnd)), page, flags=re.I)):
        if not re.search(r"practice|^fp$|free|qualif|pole|super", s, re.I) or "test" in s.lower(): continue
        for r in G.table(G.fetch(f"{H}/results/{year}/{G.q(rnd)}/{s}")):
            if re.search(r"GT4|TC|TCR|GTS", r.get("Car", "") + " " + r.get("Class", ""), re.I): continue
            v = D.secs(r.get("Best Lap") or r.get("Time") or "")
            if v and 55 < v < 400 and (best is None or v < best[0]): best = (v, s, r)
    if not best: return
    v, s, r = best; crew = [x.strip() for x in r.get("Drivers", "").split(",") if x.strip()]
    m = re.fullmatch(r"qualifying-(\d)", s); n = int(m.group(1)) if m else 0
    who = crew[n - 1] if n and n <= len(crew) else " / ".join(crew)
    kind = "qualifying " + str(n) if n else s.replace("-", " ")
    D.set_record(track, "GT World Challenge America", D.fmt(v, 3), who, r.get("Car", ""), year,
                 f'fastest lap of any practice or qualifying session ({kind}, #{r.get("Car #", "")} {r.get("Team", "")}); the series lists the crew, not who set the lap: qualifying sessions are credited to the matching listed driver, practice to the crew; it publishes no per-car race laps', dec=3, dry=DRY)

def refresh_standings(ev, events, year):
    page = G.fetch(f"{H}/standings")
    sid = re.search(r'<option[^>]*value="(\d+)"[^>]*>\s*%d\s*</option>' % year, page)
    kinds = re.findall(r'<option[^>]*value="(\d+_\d+)_teams"[^>]*>([^<]*)</option>', page)
    if not sid or not kinds: print("  standings: could not read the series' season/class lists"); return
    classes = []
    for val, label in kinds:
        cls = "Pro-Am" if "Pro-Am" in label else "Am" if re.search(r"\bAm\b", label) else "Pro"
        rows = G.table(G.fetch(f"{H}/standings?filter_season_id={sid.group(1)}&filter_standing_type={val}_drivers"))
        g = {}
        for r in rows:
            if r["Pos"].isdigit() and r.get("Total", "").replace(".", "").isdigit(): g.setdefault(int(r["Pos"]), {"pts": r["Total"], "who": []})["who"].append(r["Driver"])
        classes.append((cls, [(p, ", ".join(g[p]["who"]), g[p]["pts"]) for p in sorted(g)[:6]]))
    if not any(c[1] for c in classes): print("  standings: tables empty"); return
    order = {"Pro": 0, "Pro-Am": 1, "Am": 2}; classes.sort(key=lambda c: order[c[0]])
    later = any(re.search(SERIES_EVENT, e["e"], re.I) and e["d"] > ev["d"] and e["d"][:4] == ev["d"][:4] for t in events.values() for e in t)
    asof = f'Current after the {ev["e"]}' + ("" if later else f"; the {year} season is complete") + "."
    body = ",\n".join('      { h:%s, rows:[\n%s\n      ] }' % (json.dumps(c), ",\n".join("        { pos:%d, who:%s, pts:%s }" % (p, json.dumps(w, ensure_ascii=False), pt) for p, w, pt in rows)) for c, rows in classes)
    block = ('  { s:"gtwca", asOf:%s,\n    classes:[\n%s\n    ],\n    note:%s }' % (json.dumps(asof, ensure_ascii=False), body,
             json.dumps(MARK + "Driver standings by class, top 6 positions of each table; drivers who share a position share the same points (listed together). Source: gt-world-challenge-america.com standings (Drivers " + str(year) + "), read " + now.date().isoformat() + ".")))
    s = D.read("data/standings.js"); m = re.search(r'^  \{ s:"gtwca".*?^(?:  \}|    note:.*? \})(,?)\n', s, flags=re.S | re.M)
    new = block + (m.group(1) if m else ",") + "\n"
    if m and MARK not in m.group(0) and str(year) in re.search(r'asOf:"([^"]*)"', m.group(0)).group(1): print("  standings: a hand-written entry for this season exists, kept"); return
    if m and re.sub(r"read \d{4}-\d\d-\d\d", "", m.group(0)) == re.sub(r"read \d{4}-\d\d-\d\d", "", new): print("  standings: unchanged"); return
    print("  standings: updated")
    if DRY: return
    if m: s = s[:m.start()] + new + s[m.end():]
    else: k = s.rstrip().rfind("];"); s = s[:k].rstrip().rstrip(",") + ",\n" + block + "\n];\n"
    D.write("data/standings.js", s)

if __name__ == "__main__": main()
