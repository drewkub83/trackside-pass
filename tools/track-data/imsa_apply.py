import sys,json,math,re
sys.path.insert(0,"/Users/andrew/Desktop/Claude Code/tools/track-data")
from build_route import load,save,build
slug=lambda s:re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def apply(tid,tf,items,facts=None,dedupe_kinds=("rest",),dedupe_r=28,rebuild=True):
    """items: (kind, name, (page_x,page_y), description[, id]) -> placed with tf(page)->data."""
    T=load(tid); have={p.get("id") for p in T["pois"]}; added=[]; skipped=[]
    for it in items:
        k,n,pg,d=it[:4]; i=it[4] if len(it)>4 else slug(n)
        x,y=tf(pg); x,y=round(x),round(y)
        if i in have: skipped.append((n,"id exists")); continue
        if k in dedupe_kinds and any(p["k"]==k and not p.get("del") and math.hypot(p["x"]-x,p["y"]-y)<dedupe_r for p in T["pois"]): skipped.append((n,"already within %d"%dedupe_r)); continue
        P={"k":k,"n":n,"x":x,"y":y,"d":d+(" " if d else "")+"Position approximate: placed from IMSA's fan guide map.","id":i}
        T["pois"].append(P); have.add(i); added.append((k,n,x,y))
    if facts: T["facts"].update(facts)
    save(tid,T)
    if rebuild: T=build(tid,rle=True); save(tid,T)
    return added,skipped
