# Download the OpenStreetMap data build_permanent.rb needs for a track, via a working Overpass mirror, into
# tools/street-circuits/osm/<id>.json (the builder then skips its own, flakier, download).
#   python3 tools/track-data/fetch_track_osm.py <id> <lat> <lon> [radius_deg=0.016]
import sys, os, json, time, urllib.request, urllib.parse
EPS=["https://lz4.overpass-api.de/api/interpreter","https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"]
HERE=os.path.dirname(os.path.abspath(__file__)); OSM=os.path.join(HERE,"..","street-circuits","osm")+"/"
tid=sys.argv[1]; la=float(sys.argv[2]); lo=float(sys.argv[3]); r=float(sys.argv[4]) if len(sys.argv)>4 else 0.016
b=",".join(str(round(v,5)) for v in [la-r,lo-r*1.2,la+r,lo+r*1.2])
q='[out:json][timeout:170];( '+" ".join(f'{k}({b});' for k in ['way["highway"]','way["building"]','way["natural"~"water|wood|grassland|scrub"]','way["waterway"]','way["leisure"]','way["amenity"]','way["landuse"]','way["tourism"]','way["sport"]','node["amenity"]','node["tourism"]','node["barrier"="gate"]','node["entrance"]','relation["natural"="water"]','relation["leisure"]'])+' ); out geom;'
os.makedirs(OSM,exist_ok=True); open(OSM+tid+".q","w").write(q)
for attempt in range(8):
    ep=EPS[attempt%len(EPS)]
    try:
        req=urllib.request.Request(ep,data=urllib.parse.urlencode({"data":q}).encode(),headers={"User-Agent":"TracksidePass/0.1 (personal race-day app)"})
        data=json.load(urllib.request.urlopen(req,timeout=200)); json.dump(data,open(OSM+tid+".json","w")); print(tid,"ok",len(data["elements"]),"elements via",ep); break
    except Exception as e: print("retry",attempt,str(e)[:70],file=sys.stderr); time.sleep(15)
else: raise SystemExit("failed")
