import sys, re, math, json
import os
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,'..','..'))
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from build_route import load, save, build
import find_cross as fc
FOOT={"footway","path","pedestrian","steps","cycleway"}
def keep(o):
    if o["over"]!="circuit": return False
    if o["access"] in("private","no") or o["foot"]=="no": return False
    return o["hw"] in FOOT or o["name"]!="" or o["access"] in("permissive","yes","designated")
def slug(s): return re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def plan(tid):
    T=load(tid); cands,mpu=fc.run(tid)
    have=[(p["x"],p["y"]) for p in T["pois"] if p["k"]=="cross"]
    chosen=[o for o in cands if keep(o)]
    out=[]
    # order along the lap so numbering is stable
    sf=T["sf"]; chosen.sort(key=lambda o:(math.atan2(o["y"]-sf[1],o["x"]-sf[0])))
    new=[]
    for o in chosen:
        if any(math.hypot(o["x"]-x,o["y"]-y)*mpu<80 for x,y in have): continue
        if any(math.hypot(o["x"]-q["x"],o["y"]-q["y"])*mpu<6 for q in new): continue
        new.append(o)
    return T,new,mpu
def apply(tid,write=False):
    T,new,mpu=plan(tid); labels=T.get("labels") or []; ids={p.get("id") for p in T["pois"]}
    kinds={}
    for o in new: kinds[o["kind"]]=kinds.get(o["kind"],0)+1
    seen={}; added=[]
    for o in new:
        near=None
        if labels:
            lab=min(labels,key=lambda l:math.hypot(l[0]-o["x"],l[1]-o["y"]))
            if math.hypot(lab[0]-o["x"],lab[1]-o["y"])*mpu<110: near=lab[2]
        if o["name"]: nm=o["name"].replace("Wallkway","Walkway")
        else:
            base="Pedestrian bridge" if o["kind"]=="bridge" else "Tunnel under the track"
            seen[base]=seen.get(base,0)+1
            nm=base+(f" near {near}" if near else "") 
            if sum(1 for q in new if not q["name"] and q["kind"]==o["kind"])>1 and not near: nm+=f" {seen[base]}"
        d=("Foot bridge over the circuit" if o["kind"]=="bridge" else "Walkway under the circuit" if o["hw"] in FOOT else "Tunnel under the track")+". Position from OpenStreetMap."
        pid_=slug(nm); k=2
        while pid_ in ids: pid_=slug(nm)+"-"+str(k); k+=1
        ids.add(pid_)
        p={"k":"cross","n":nm,"x":round(o["x"]),"y":round(o["y"]),"d":d,"id":pid_}; added.append(p)
    print(tid,"adding",len(added),"crossing badges:")
    for p in added: print("   ",p["n"],(p["x"],p["y"]))
    if write and added:
        T["pois"]=T["pois"]+added; save(tid,T)
if __name__=="__main__":
    w="--write" in sys.argv
    for tid in [a for a in sys.argv[1:] if not a.startswith("--")]: apply(tid,w)
