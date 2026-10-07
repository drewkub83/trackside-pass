# List OpenStreetMap race-track / pit-lane ways around a point, with their length, so you can pick the way ids for a
# tools/street-circuits/permanent/<id>.rb config.   python3 tools/track-data/osm_raceways.py <lat> <lon> [radius_deg]
import sys, json, math, time, urllib.request, urllib.parse
EPS=["https://lz4.overpass-api.de/api/interpreter","https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"]
def q(lat,lon,r):
    b=",".join(str(round(v,5)) for v in [lat-r,lon-r*1.4,lat+r,lon+r*1.4])
    return '[out:json][timeout:60];way["highway"="raceway"]('+b+');out geom;'
def run(lat,lon,r=0.02):
    for attempt in range(6):
        ep=EPS[attempt%len(EPS)]
        try:
            req=urllib.request.Request(ep,data=urllib.parse.urlencode({"data":q(lat,lon,r)}).encode(),headers={"User-Agent":"TracksidePass/0.1 (personal race-day app)"})
            return json.load(urllib.request.urlopen(req,timeout=120))["elements"]
        except Exception as e: print("retry",attempt,str(e)[:60],file=sys.stderr); time.sleep(20)
    raise SystemExit("overpass failed")
def length(g):
    return sum(math.hypot((b["lat"]-a["lat"])*110900,(b["lon"]-a["lon"])*111320*math.cos(math.radians(a["lat"]))) for a,b in zip(g,g[1:]))
if __name__=="__main__":
    lat,lon=float(sys.argv[1]),float(sys.argv[2]); r=float(sys.argv[3]) if len(sys.argv)>3 else 0.02
    for e in sorted(run(lat,lon,r),key=lambda e:-length(e.get("geometry",[]))):
        g=e.get("geometry",[]); t=e.get("tags",{})
        print(f'{e["id"]:>11}  {length(g)/1000:6.3f} km  pts={len(g):4}  closed={g[0]==g[-1] if g else False}  {t.get("highway","")}/{t.get("leisure","")}  name="{t.get("name","")}" {("oneway="+t["oneway"]) if "oneway" in t else ""} {("layer="+t["layer"]) if "layer" in t else ""}')
