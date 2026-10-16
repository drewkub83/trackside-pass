# Turn the grandstands OpenStreetMap already has (leisure=bleachers, building=grandstand, amenity=grandstand) into `stand` badges for a track.
# Named stands keep their OSM name; unnamed ones are clustered (80 m) and named after the nearest corner label. Stands within 12 map
# units of an existing `stand` badge, or outside the map frame, are skipped. OSM does not say which ticket opens a stand, so the
# description says so. Usage: python3 osm_stands.py <id> [--write]      (reads ../street-circuits/osm/<id>.json)
import sys, os, json, math, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_route as b
HERE=os.path.dirname(os.path.abspath(__file__)); OSM=os.path.join(HERE,"..","street-circuits","osm")+"/"
tid=sys.argv[1]; write="--write" in sys.argv
T=b.load(tid); g=T["geo"]; vb=T["vb"]
def xy(lat,lon): return vb[0]+(lon-g["w"])/(g["e"]-g["w"])*vb[2], vb[1]+(g["n"]-lat)/(g["n"]-g["s"])*vb[3]
els=json.load(open(OSM+tid+".json"))["elements"]
def is_stand(t): return t.get("leisure")=="bleachers" or t.get("building") in ("grandstand","stadium") or t.get("amenity")=="grandstand"
items=[]
for e in els:
    t=e.get("tags",{})
    if e.get("type")!="way" or not is_stand(t) or not e.get("geometry"): continue
    pts=[xy(p["lat"],p["lon"]) for p in e["geometry"]]; cx=sum(p[0] for p in pts)/len(pts); cy=sum(p[1] for p in pts)/len(pts)
    items.append({"name":(t.get("name") or "").strip(),"x":cx,"y":cy,"id":e["id"]})
mpu=T.get("route",{}).get("mpu") or 2.9
def cluster(its,r):
    out=[]; used=[False]*len(its)
    for i,a in enumerate(its):
        if used[i]: continue
        grp=[a]; used[i]=True; changed=True
        while changed:
            changed=False
            for j,c in enumerate(its):
                if not used[j] and any(math.hypot(c["x"]-m["x"],c["y"]-m["y"])*mpu<=r for m in grp): grp.append(c); used[j]=True; changed=True
        out.append(grp)
    return out
named={}; unnamed=[]
for it in items: (named.setdefault(it["name"],[]) if it["name"] else unnamed).append(it)
groups=[]
for nm,its in named.items():
    for grp in cluster(its,120): groups.append((nm,grp))
for grp in cluster(unnamed,80): groups.append(("",grp))
labels=T.get("labels") or []
def nearest_label(x,y):
    best=None
    for l in labels:
        d=math.hypot(l[0]-x,l[1]-y)*mpu
        if d<=260 and (best is None or d<best[0]): best=(d,l[2])
    return best[1] if best else None
existing=[p for p in T["pois"] if p["k"]=="stand"]; ids={p["id"] for p in T["pois"]}
import unicodedata
def slug(s): return re.sub(r"[^a-z0-9]+","-",unicodedata.normalize("NFKD",s).encode("ascii","ignore").decode().lower()).strip("-")
new=[]
for nm,grp in groups:
    x=sum(m["x"] for m in grp)/len(grp); y=sum(m["y"] for m in grp)/len(grp)
    if not (vb[0]<=x<=vb[0]+vb[2] and vb[1]<=y<=vb[1]+vb[3]): continue
    if any(math.hypot(p["x"]-x,p["y"]-y)<12 for p in existing+new): continue
    if nm:
        label=nm if re.search(r"trib|grand|stand|gradin|hoofd|principal|bleacher",nm,re.I) else f"Stand {nm}"
    else:
        nl=nearest_label(x,y); label=f"Grandstand near {nl}" if nl else "Grandstand"
    base=slug(label) if slug(label).startswith("stand") else "stand-"+slug(label); i=base; k=2
    while i in ids: i=f"{base}-{k}"; k+=1
    ids.add(i); n=len(grp)
    new.append({"k":"stand","n":label,"x":round(x),"y":round(y),"d":f"Grandstand from OpenStreetMap{f' ({n} sections)' if n>1 else ''}. OpenStreetMap does not say which ticket opens it, whether it is covered or how many seats it has: check your ticket.","id":i})
print(tid,"stand groups from OSM:",len(groups),"-> new badges:",len(new))
for p in new: print("  ",p["id"],p["x"],p["y"])
if write and new:
    T["pois"]+=new; b.save(tid,T); print("saved")
