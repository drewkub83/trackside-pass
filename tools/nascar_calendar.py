#!/usr/bin/env python3
"""NASCAR Cup Series calendar -> data. One table of races (race day, venue, event name): for a venue that has a track file the event goes into data/<id>.js
(weekend start = race day minus 2, or minus 1 for a Saturday race; t = days), for a venue without one it goes into the `stops` of the nascar entry in
data/champs.js ("Map coming soon", shown until the track file exists). Re-run after editing RACES: it is idempotent.
Sources: NASCAR's 2027 national series schedule release (Aug 26, 2026, reproduced by SPEED SPORT: speedsport.com/nascar/nascar-cup-series/nascar-unveils-3-national-series-schedules/)
and the 2026 Chase calendar (Martinsville Nov 1, Homestead-Miami Nov 8).  python3 tools/nascar_calendar.py [--dry-run]"""
import sys, os, re, datetime, json
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "track-data"))
import build_route as B
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
DRY = "--dry-run" in sys.argv
# id: (short, place, kind)
V = {"daytona-oval": ("Daytona", "Daytona Beach, Florida", "Oval"), "atlanta": ("Atlanta", "Hampton, Georgia", "Oval"), "cota": ("COTA", "Austin, Texas", "Road course"),
     "phoenix": ("Phoenix", "Avondale, Arizona", "Oval"), "las-vegas-motor-speedway": ("Las Vegas", "Las Vegas, Nevada", "Oval"), "darlington": ("Darlington", "Darlington, South Carolina", "Oval"),
     "bristol": ("Bristol", "Bristol, Tennessee", "Oval"), "martinsville": ("Martinsville", "Ridgeway, Virginia", "Oval"), "talladega": ("Talladega", "Talladega, Alabama", "Oval"),
     "texas-motor-speedway": ("Texas", "Fort Worth, Texas", "Oval"), "kansas": ("Kansas", "Kansas City, Kansas", "Oval"), "dover": ("Dover", "Dover, Delaware", "Oval"),
     "north-wilkesboro": ("North Wilkesboro", "North Wilkesboro, North Carolina", "Oval"), "charlotte": ("Charlotte", "Concord, North Carolina", "Oval"),
     "nashville-superspeedway": ("Nashville", "Lebanon, Tennessee", "Oval"), "pocono": ("Pocono", "Long Pond, Pennsylvania", "Oval"), "michigan": ("Michigan", "Brooklyn, Michigan", "Oval"),
     "chicagoland": ("Chicagoland", "Joliet, Illinois", "Oval"), "iowa": ("Iowa", "Newton, Iowa", "Oval"), "sonoma": ("Sonoma", "Sonoma, California", "Road course"),
     "indianapolis-oval": ("Indianapolis", "Speedway, Indiana", "Oval"), "naval-base-coronado": ("San Diego", "Coronado, California", "Street circuit"),
     "wwt-raceway": ("WWT Raceway", "Madison, Illinois", "Oval"), "richmond": ("Richmond", "Richmond, Virginia", "Oval"), "watkins-glen": ("Watkins Glen", "Watkins Glen, New York", "Road course"),
     "new-hampshire": ("New Hampshire", "Loudon, New Hampshire", "Oval"), "homestead-miami": ("Homestead-Miami", "Homestead, Florida", "Oval")}
# (race day, venue, event name)
RACES = [("2026-11-01","martinsville","NASCAR at Martinsville (Round of 8 finale)"),("2026-11-08","homestead-miami","NASCAR Championship"),
 ("2027-02-13","daytona-oval","Wheatley Vodka Clash"),("2027-02-21","daytona-oval","DAYTONA 500"),("2027-02-28","atlanta","NASCAR at Atlanta"),("2027-03-07","cota","NASCAR at COTA"),
 ("2027-03-14","phoenix","NASCAR at Phoenix"),("2027-03-21","las-vegas-motor-speedway","NASCAR at Las Vegas"),("2027-04-04","darlington","NASCAR at Darlington"),("2027-04-11","bristol","NASCAR at Bristol"),
 ("2027-04-18","martinsville","NASCAR at Martinsville"),("2027-04-25","talladega","NASCAR at Talladega"),("2027-05-02","texas-motor-speedway","NASCAR at Texas"),("2027-05-09","kansas","NASCAR at Kansas"),
 ("2027-05-16","dover","NASCAR at Dover"),("2027-05-23","north-wilkesboro","NASCAR All-Star Race"),("2027-05-30","charlotte","Coca-Cola 600"),("2027-06-06","nashville-superspeedway","NASCAR at Nashville"),
 ("2027-06-13","pocono","NASCAR at Pocono"),("2027-06-20","michigan","NASCAR at Michigan"),("2027-06-27","chicagoland","NASCAR at Chicagoland"),("2027-07-04","iowa","NASCAR at Iowa"),
 ("2027-07-11","sonoma","NASCAR at Sonoma"),("2027-07-18","atlanta","NASCAR at Atlanta"),("2027-07-25","indianapolis-oval","NASCAR at Indianapolis"),("2027-08-01","naval-base-coronado","NASCAR San Diego"),
 ("2027-08-14","bristol","NASCAR at Bristol (night race)"),("2027-08-22","wwt-raceway","NASCAR at WWT Raceway"),("2027-08-28","daytona-oval","NASCAR at Daytona"),("2027-09-05","darlington","NASCAR at Darlington"),
 ("2027-09-11","richmond","NASCAR at Richmond (Chase opener)"),("2027-09-19","watkins-glen","NASCAR at Watkins Glen"),("2027-09-26","new-hampshire","NASCAR at New Hampshire"),
 ("2027-10-03","kansas","NASCAR at Kansas"),("2027-10-10","las-vegas-motor-speedway","NASCAR at Las Vegas"),("2027-10-17","charlotte","NASCAR at Charlotte"),("2027-10-24","phoenix","NASCAR at Phoenix"),
 ("2027-10-31","talladega","NASCAR at Talladega"),("2027-11-07","martinsville","NASCAR at Martinsville"),("2027-11-14","homestead-miami","NASCAR Championship")]
SER = "NASCAR Cup Series"
def wk(day):
    d = datetime.date.fromisoformat(day); sat = d.weekday() == 5
    if day == "2027-02-13": return day, 1                  # the Clash is a single Saturday night
    off = 1 if sat else 2; return (d - datetime.timedelta(days=off)).isoformat(), off + 1
ALIAS = {"daytona-oval": "daytona"}   # until the Daytona oval has its own track file the NASCAR weekends stay on the Daytona map
built = {v for v in V if os.path.exists(os.path.join(ROOT, "data", v + ".js"))}
for a, b in ALIAS.items():
    if a not in built and os.path.exists(os.path.join(ROOT, "data", b + ".js")): built.add(a)
for a, b in ALIAS.items():          # once the real track exists, the NASCAR events on the stand-in file move to it
    if os.path.exists(os.path.join(ROOT, "data", a + ".js")) and os.path.exists(os.path.join(ROOT, "data", b + ".js")):
        T = B.load(b); ev = [e for e in T["events"] if not e.get("s", "").startswith(SER)]
        if ev != T["events"]:
            print("moving NASCAR events off", b)
            if not DRY: T["events"] = ev; B.save(b, T)
today = datetime.date.today().isoformat()
stops = []
for day, vid, name in RACES:
    d, t = wk(day)
    if vid in built:
        vf = vid if os.path.exists(os.path.join(ROOT, "data", vid + ".js")) else ALIAS[vid]; T = B.load(vf); ev = [e for e in T["events"] if not (e.get("s", "").startswith(SER) and (e["d"] == d or e["d"] == day or (e["d"][:7] == d[:7] and abs((datetime.date.fromisoformat(e["d"]) - datetime.date.fromisoformat(d)).days) <= 3 and e.get("s","").startswith(SER))))]
        ev.append({"d": d, "e": name, "s": SER + (", playoff race" if (day >= "2027-09-11" or day.startswith("2026")) else (", exhibition race" if re.search(r"Clash|All-Star", name) else "")), "t": t}); ev.sort(key=lambda e: e["d"])
        if ev != T["events"]:
            print("event", vid, d, name)
            if not DRY: T["events"] = ev; B.save(vf, T)
    else:
        sh, pl, kind = V[vid]; stops.append({"id": vid, "short": sh, "place": pl, "kind": kind, "e": name, "d": d, "t": t})
# stops of the nascar entry in champs.js
f = os.path.join(ROOT, "data", "champs.js"); s = open(f, encoding="utf8").read()
rows = ",\n".join("      { id:%s, short:%s, place:%s, kind:%s, e:%s, d:%s, t:%d }" % tuple(json.dumps(x, ensure_ascii=False) if not isinstance(x, int) else x for x in (st["id"], st["short"], st["place"], st["kind"], st["e"], st["d"], st["t"])) for st in stops)
m = re.search(r'(,\{ id:"nascar".*?stops:\[\n)(.*?)(\n?    \] \})', s, re.S)
if m:
    new = s[:m.start(2)] + rows + s[m.end(2):]
    print("stops", len(stops), "(unchanged)" if new == s else "(updated)")
    if not DRY and new != s: open(f, "w", encoding="utf8").write(new)
else: print("no nascar entry in champs.js yet")
