# Place fan-map items on a track and grow its frame to hold them (geo grows with vb, so every existing coordinate stays valid).
#   import place_items; place_items.run(track_id, fit_json_or_function, [(kind, name, (map_x, map_y), description_or_None), ...], "source text")
# generic placement: python gp.py <track> <fit.json|callable-module> <items.py> "<source>" [dedupe json]
import sys, re, json, importlib.util
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_route as B
from map_apply import apply
sl=lambda s: re.sub(r'[^a-z0-9]+','-',s.lower()).strip('-')
def run(track,fit,items,src,dd=None,drop=True,cap=520,margin=30):
    dd=dd or {"rest":10,"food":10,"med":10,"info":8,"gate":12,"stand":8,"camp":16,"park":14,"view":10,"screen":8,"merch":8}
    I=[(k,n,xy,d or n+".", "%s-%s-%d"%(track[:3],sl(n)[:28],i)) for i,(k,n,xy,d) in enumerate(items)]
    a,_,s=apply(track,fit,I,src,rename_r=0,dedupe_r=dd)
    T=B.load(track); vb=list(T["vb"]); g=dict(T["geo"])
    # keep badges that are inside the frame or within `cap` units of it; grow the frame to hold them (geo grows with it, so every existing coordinate stays valid)
    near=lambda p: vb[0]-cap<=p["x"]<=vb[0]+vb[2]+cap and vb[1]-cap<=p["y"]<=vb[1]+vb[3]+cap
    far=[p["n"] for p in T["pois"] if not near(p)]; T["pois"]=[p for p in T["pois"] if near(p)]
    xs=[p["x"] for p in T["pois"]]; ys=[p["y"] for p in T["pois"]]
    L=max(0,vb[0]-(min(xs)-margin)); R=max(0,(max(xs)+margin)-(vb[0]+vb[2])); Tp=max(0,vb[1]-(min(ys)-margin)); Bt=max(0,(max(ys)+margin)-(vb[1]+vb[3]))
    if L or R or Tp or Bt:
        lng=(g["e"]-g["w"])/vb[2]; lat=(g["n"]-g["s"])/vb[3]
        T["vb"]=[round(vb[0]-L,1),round(vb[1]-Tp,1),round(vb[2]+L+R,1),round(vb[3]+Tp+Bt,1)]
        T["geo"]={"n":g["n"]+Tp*lat,"s":g["s"]-Bt*lat,"w":g["w"]-L*lng,"e":g["e"]+R*lng}
        for k in g:
            if k not in T["geo"]: T["geo"][k]=g[k]
    B.save(track,T)
    print(track,"added",len(a),"| deduped",len(s),"| beyond cap dropped",len(far),far[:8],"| frame",T["vb"],"| total",len(T["pois"]))
