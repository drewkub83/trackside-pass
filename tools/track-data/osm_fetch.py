import sys, os, json, time, urllib.request, urllib.parse
import os
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,'..','..'))
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from elev_lib import track
OSM=os.path.join(REPO,"tools","street-circuits","osm")+"/"
EPS=["https://lz4.overpass-api.de/api/interpreter","https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"]
for tid in sys.argv[1:]:
    f=OSM+tid+".json"
    if os.path.exists(f) and os.path.getsize(f)>1000: print(tid,"have"); continue
    vb,g=track(tid); b=",".join(str(round(v,5)) for v in [g["s"]-0.002,g["w"]-0.002,g["n"]+0.002,g["e"]+0.002])
    q='[out:json][timeout:100];(way["highway"]('+b+');way["railway"]('+b+'););out geom;'
    done=False
    for attempt in range(6):
        ep=EPS[attempt%len(EPS)]
        try:
            req=urllib.request.Request(ep,data=urllib.parse.urlencode({"data":q}).encode(),headers={"User-Agent":"TracksidePass/0.1 (personal race-day app)"})
            data=json.load(urllib.request.urlopen(req,timeout=120)); json.dump(data,open(f,"w")); print(tid,"ok",len(data["elements"]),"ways via",ep,flush=True); done=True; break
        except Exception as e: print(tid,"retry",attempt,str(e)[:60],flush=True); time.sleep(15)
    if not done: print(tid,"FAILED")
