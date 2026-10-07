import sys, os, re, json, math, urllib.request, urllib.parse
import os
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,'..','..'))
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from elev_lib import ROOT, track, mpu
OSM=os.path.join(REPO,"tools","street-circuits","osm")+"/"
def load(tid):
    t=open(ROOT+tid+".js",encoding="utf-8").read()
    d=re.search(r'"path":"([^"]+)"',t).group(1)
    pit=re.search(r'"pit":"([^"]+)"',t); 
    return t,[(float(a),float(b)) for a,b in re.findall(r'(-?\d+\.?\d*),(-?\d+\.?\d*)',d)], ([(float(a),float(b)) for a,b in re.findall(r'(-?\d+\.?\d*),(-?\d+\.?\d*)',pit.group(1))] if pit else [])
def osm_json(tid,g):
    f=OSM+tid+".json"
    if os.path.exists(f) and os.path.getsize(f)>1000: return json.load(open(f))["elements"]
    la=(g["n"]+g["s"])/2; lo=(g["w"]+g["e"])/2; r=0.016
    b=",".join(str(round(v,5)) for v in [la-r,lo-r*1.2,la+r,lo+r*1.2])
    q='[out:json][timeout:120];(way["highway"]('+b+');way["railway"]('+b+'););out geom;'
    req=urllib.request.Request("https://overpass-api.de/api/interpreter",data=urllib.parse.urlencode({"data":q}).encode(),headers={"User-Agent":"TracksidePass/0.1 (personal race-day app)"})
    data=json.load(urllib.request.urlopen(req,timeout=150)); json.dump(data,open(f,"w")); return data["elements"]
def seg_int(p1,p2,p3,p4):
    d=(p2[0]-p1[0])*(p4[1]-p3[1])-(p2[1]-p1[1])*(p4[0]-p3[0])
    if abs(d)<1e-12: return None
    t=((p3[0]-p1[0])*(p4[1]-p3[1])-(p3[1]-p1[1])*(p4[0]-p3[0]))/d
    u=((p3[0]-p1[0])*(p2[1]-p1[1])-(p3[1]-p1[1])*(p2[0]-p1[0]))/d
    if 0<=t<=1 and 0<=u<=1: return (p1[0]+t*(p2[0]-p1[0]),p1[1]+t*(p2[1]-p1[1]))
WALK={"footway","path","pedestrian","steps","cycleway","service","residential","unclassified","tertiary","track","living_street","secondary","primary"}
def run(tid):
    vb,g=track(tid); t,path,pit=load(tid)
    els=osm_json(tid,g); out=[]
    to=lambda lat,lon:(vb[0]+(lon-g["w"])/(g["e"]-g["w"])*vb[2], vb[1]+(g["n"]-lat)/(g["n"]-g["s"])*vb[3])
    for e in els:
        if e.get("type")!="way" or "geometry" not in e: continue
        tg=e.get("tags",{}); hw=tg.get("highway")
        br=tg.get("bridge") not in (None,"no"); tu=tg.get("tunnel") not in (None,"no") or tg.get("covered")=="yes"
        if hw not in WALK or not (br or tu): continue
        pts=[to(q["lat"],q["lon"]) for q in e["geometry"]]
        for cname,circ in (("circuit",path),("pit",pit)):
            for a,b in zip(pts,pts[1:]):
                for c,d in zip(circ,circ[1:]):
                    x=seg_int(a,b,c,d)
                    if x: out.append({"x":round(x[0],1),"y":round(x[1],1),"kind":"bridge" if br else "tunnel","hw":hw,"name":tg.get("name",""),"foot":tg.get("foot",""),"access":tg.get("access",""),"surface":tg.get("surface",""),"way":e["id"],"over":cname})
    # de-duplicate nearby hits
    ded=[]
    for o in out:
        if not any(math.hypot(o["x"]-q["x"],o["y"]-q["y"])<8/mpu(vb,g) for q in ded): ded.append(o)
    return ded, mpu(vb,g)
if __name__=="__main__":
    for tid in sys.argv[1:]:
        r,m=run(tid)
        print(tid,"mpu=%.2f"%m,len(r),"crossings")
        for o in r: print("   ",o)
