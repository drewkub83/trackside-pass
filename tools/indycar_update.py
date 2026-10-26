#!/usr/bin/env python3
"""Keeps the NTT INDYCAR SERIES data current from INDYCAR's own site, with nobody's computer involved (called by tools/auto_update.py,
which GitHub Actions runs every 30 minutes Thu-Mon; also fine by hand). It reads
  indycar.com/api/results/SeasonDropDown      every event of every season with its session ids
  indycar.com/api/results/EventsSessionDetails the classification and every driver's best lap of one session
  indycar.com/Standings                        the official points table (plain HTML)
For each race that finished in the last 10 days at a venue the app has an event for:
  1. data/results.js   adds (or, on later runs, refreshes) the top ten of the race as an s:"indycar" entry
  2. data/standings.js rewrites the IndyCar driver standings (top 15) when a race was added or changed
  3. data/<track>.js   lowers the venue's lapRecord row if any session of the weekend produced a faster lap (the fastest lap in ANY session,
                       the project's rule; oval qualifying publishes only 4-lap averages, so only practice and race laps count there)
Idempotent. Usage: python3 tools/indycar_update.py [--days 10] [--now 2026-09-07T12:00:00Z] [--since 2026-09-01] [--dry-run]"""
import sys, os, re, json, html, datetime, urllib.request
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import dataio as D
A = sys.argv[1:]; DRY = "--dry-run" in A
def opt(n, d=None): return A[A.index(n) + 1] if n in A else d
now = datetime.datetime.fromisoformat(opt("--now").replace("Z", "+00:00")) if opt("--now") else datetime.datetime.now(datetime.timezone.utc)
days = int(opt("--days", "10")); SINCE = datetime.date.fromisoformat(opt("--since")) if opt("--since") else now.date() - datetime.timedelta(days=days)
MARK = "(automatic update) "   # entries written by this script start their note with this; hand-written entries for the same race/season are never overwritten
SID = "b856a4f1-e85c-4fac-8c36-fd58d962227a"; API = "https://www.indycar.com/api/results/"
# venue -> (event-name regex, first year of the layout the map draws): the same table as tools/indycar_laprecords.py
VENUES = {
 "st-petersburg": (r"St\.? ?Pete", 2012), "long-beach": (r"Long Beach", 2009), "barber": (r"Barber|Alabama", 2010),
 "indianapolis": (r"^GMR Grand Prix$|^Sonsio Grand Prix$|Angie.s List Grand Prix|^INDYCAR Grand Prix$|^Grand Prix Of Indianapolis$|^Gallagher Grand Prix$", 2014),
 "indianapolis-oval": (r"Indianapolis 500|Indy 500", 1996), "detroit": (r"Detroit", 2023), "laguna-seca": (r"Laguna Seca|Monterey", 1996),
 "phoenix": (r"Phoenix|Desert Diamond|Good Ranchers", 2018), "arlington": (r"Arlington", 2026), "mid-ohio": (r"Mid-Ohio", 2010), "road-america": (r"Road America", 2016),
}
def get(path):
    for k in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(path, headers={"User-Agent": "Mozilla/5.0 (Trackside Pass data tools)"}), timeout=40) as r: return r.read().decode("utf-8", "replace")
        except Exception: pass
    return ""
def api(name, **q): t = get(API + name + "?" + "&".join(f"{k}={v}" for k, v in q.items())); return json.loads(t) if t.startswith(("{", "[")) else None
def mdy(s): m, d, y = map(int, s.split("/")); return datetime.date(y, m, d)
def venue_of(name):
    for t, (rx, since) in VENUES.items():
        if re.search(rx, name, re.I) and not re.search(r"nxt|lights|test", name, re.I): return t, since
    return None, None

def main():
    years = api("SeasonDropDown", id=SID)
    if not years: print("INDYCAR site unreadable"); return
    events_app = D.track_events(); changed_results = False; touched = []
    for yr in [y for y in years if y["Year"] in (str(now.year), str(now.year - 1))]:
        evs = yr["Events"]
        for n, ev in enumerate(evs):
            sess = {s["SessionName"]: s["EventsSessionID"] for s in ev["Sessions"]}
            if "Race" not in sess: continue
            race = api("EventsSessionDetails", id=sess["Race"])
            if not race or not race.get("records"): continue
            day = mdy(race["SessionDate"])
            if day < SINCE or day > now.date(): continue
            track, since = venue_of(ev["EventName"])
            if not track: print(f'{ev["EventName"]}: no venue in the app'); continue
            appev = D.app_event(events_app, track, day.isoformat())
            print(f'{ev["EventName"]} ({day}) -> {track}; app event {appev["d"] if appev else "none"}')
            if appev and import_result(track, appev["d"], ev["EventName"], race, day): changed_results = True; touched.append(ev["EventName"])
            if day.year >= since: weekend_records(track, ev, sess, day.year)
            if changed_results and n == 0 and not DRY: pass
        if changed_results: refresh_standings(touched[-1], evs[0], yr["Year"])

def import_result(track, d, name, race, day):
    rows = sorted((r for r in race["records"] if r.get("PositionFinish")), key=lambda r: r["PositionFinish"])
    if len(rows) < 10: print("  race classification not complete yet"); return False
    lines = ",\n".join("        " + json.dumps(f'{r["PositionFinish"]}. #{r["CarNumber"]} {r["DriverName"]} ({r["TeamName"]})', ensure_ascii=False) for r in rows[:10])
    entry = (f'  {{ t:{json.dumps(track)}, d:{json.dumps(d)}, s:"indycar", event:{json.dumps(name, ensure_ascii=False)},\n    groups:[\n      {{ h:"Race", order:[\n{lines}\n      ] }}\n    ],\n'
             f'    note:{json.dumps(MARK + "Source: INDYCAR.com official results (indycar.com/results/ntt-indycar-series), top ten of the race, race day " + day.isoformat() + ".")} }},\n')
    s = D.read("data/results.js")
    pat = r'^  \{ t:%s, d:%s, s:"indycar".*?\n    note:.*?\},\n' % (re.escape(json.dumps(track)), re.escape(json.dumps(d)))
    m = re.search(pat, s, flags=re.S | re.M)
    if m and MARK not in m.group(0): print("  results: a hand-written entry exists, kept"); return False
    if m and m.group(0) == entry: print("  results: already"); return False
    print("  results:", "refreshed" if m else "added")
    if DRY: return True
    if m: s = s[:m.start()] + entry + s[m.end():]
    else: k = s.index("const RESULTS = [") + len("const RESULTS = [\n"); s = s[:k] + entry + s[k:]
    D.write("data/results.js", s); return True

def weekend_records(track, ev, sess, year):
    best = None
    for sname, sid in sess.items():
        det = api("EventsSessionDetails", id=sid)
        for r in (det or {}).get("records") or []:
            v = D.secs(r.get("BestLapTime"))
            if v and v > 8 and (best is None or v < best[0]): best = (v, sname, r)
    if not best: return
    v, sname, r = best; car = "Dallara IR-18" if year >= 2018 else "Dallara DW12"
    D.set_record(track, "IndyCar", D.fmt(v), r["DriverName"], car, year, f'fastest lap of any session ({sname}, {r["TeamName"]})', dry=DRY)

def refresh_standings(last_event, finale, year):
    h = get("https://www.indycar.com/Standings"); i = h.find("<table")
    if i < 0: print("  standings page unreadable"); return
    cl = lambda x: re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip()
    rows = []
    for tr in re.findall(r"<tr[^>]*>(.*?)</tr>", h[i:h.find("</table>", i)], flags=re.S):
        c = [cl(x) for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", tr, flags=re.S)]
        if len(c) >= 9 and c[0].isdigit(): rows.append((int(c[0]), c[2], int(c[5]), int(c[8])))
    if not rows: return
    fin = api("EventsSessionDetails", id=next((s["EventsSessionID"] for s in finale["Sessions"] if s["SessionName"] == "Race"), 0))
    complete = bool(fin and fin.get("records") and finale["EventName"] == last_event)
    asof = f"Current after the {last_event}" + ("; the season is complete." if complete else ".")
    out = ",\n".join("        { pos:%d, who:%s, pts:%d%s }" % (p, json.dumps(n, ensure_ascii=False), pts, (", gap:" + json.dumps(f"{w} win{'s' if w != 1 else ''}")) if w else "") for p, n, pts, w in rows[:15])
    block = ('  { s:"indycar", asOf:%s,\n    classes:[\n      { h:"Drivers", rows:[\n%s\n      ] }\n    ],\n    note:%s }'
             % (json.dumps(asof, ensure_ascii=False), out, json.dumps(MARK + "Source: INDYCAR.com official championship standings, read " + now.date().isoformat() + "; wins are the official wins column.")))
    s = D.read("data/standings.js"); m = re.search(r'^  \{ s:"indycar".*?^(?:  \}|    note:.*? \})(,?)\n', s, flags=re.S | re.M)
    new = block + (m.group(1) if m else ",") + "\n"
    if m and MARK not in m.group(0) and str(year) in re.search(r'asOf:"([^"]*)"', m.group(0)).group(1): print("  standings: a hand-written entry for this season exists, kept"); return
    if m and re.sub(r"read \d{4}-\d\d-\d\d", "", m.group(0)) == re.sub(r"read \d{4}-\d\d-\d\d", "", new): print("  standings: unchanged"); return
    print("  standings: updated")
    if DRY: return
    if m: s = s[:m.start()] + new + s[m.end():]
    else: k = s.rstrip().rfind("];"); s = s[:k].rstrip().rstrip(",") + ",\n" + block + "\n];\n"
    D.write("data/standings.js", s)

if __name__ == "__main__": main()
