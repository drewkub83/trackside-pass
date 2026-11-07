# Make every badge on a track walkable: finds areas of the walking grid that no route can reach (an infield with no marked tunnel, a fenced lot) that hold a badge,
# and writes a straight walkable link from each to the nearest open ground of the main area into the track's "links" (applied by build_route.build), then rebuilds the grid.
#   python3 tools/track-data/connect_islands.py <track-id> [--max-m 400] [--dry]
# Honest limits: a link is a straight 5 m strip over the gap (a tunnel or bridge that is not drawn, or a sliver the grid closed by mistake); links over 150 m are skipped by default, so look at those by hand.
import sys, os, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_route as B
tid=sys.argv[1]; PATCH="--patch" in sys.argv; maxm=float(sys.argv[sys.argv.index("--max-m")+1]) if "--max-m" in sys.argv else 150; dry="--dry" in sys.argv
T=B.load(tid); T["links"]=[]; T["pois"]=[q for q in T["pois"] if not q["n"].startswith("Crossing (position assumed)")]
def grid_of(T):
    if PATCH:
        R=dict(T["route"]); R["rows"]=[B.rle_decode(r) if R.get("rle") else r for r in R["rows"]]; return T,R
    B.save(tid,T); G=B.build(tid,rle=False); R=G["route"]; return G,R
G,R=grid_of(T); rows=R["rows"]; nx,ny,cell,x0,y0,mpu=R["nx"],R["ny"],R["cell"],R["x0"],R["y0"],R["mpu"]
free=[[c!="1" for c in r] for r in rows]
def cellof(x,y): return min(nx-1,max(0,int((x-x0)//cell))),min(ny-1,max(0,int((y-y0)//cell)))
def nearest_free(cx,cy):
    if free[cy][cx]: return cx,cy
    for rad in range(1,8):
        for dx in range(-rad,rad+1):
            for dy in range(-rad,rad+1):
                X,Y=cx+dx,cy+dy
                if 0<=X<nx and 0<=Y<ny and free[Y][X]: return X,Y
    return None
comp=[[-1]*nx for _ in range(ny)]; sizes=[]
for y in range(ny):
    for x in range(nx):
        if comp[y][x]!=-1 or not free[y][x]: continue
        k=len(sizes); comp[y][x]=k; q=[(x,y)]; i=0
        while i<len(q):
            cx,cy=q[i]; i+=1
            for dx in(-1,0,1):
                for dy in(-1,0,1):
                    X,Y=cx+dx,cy+dy
                    if (dx or dy) and 0<=X<nx and 0<=Y<ny and comp[Y][X]==-1 and free[Y][X] and not(dx and dy and(not free[cy][X] or not free[Y][cx])):
                        comp[Y][X]=k; q.append((X,Y))
        sizes.append(len(q))
badge_comp={}
for p in T["pois"]:
    c=nearest_free(*cellof(p["x"],p["y"]))
    badge_comp.setdefault(comp[c[1]][c[0]] if c else -2,[]).append(p)
main=max((k for k in badge_comp if k>=0),key=lambda k:len(badge_comp[k]))
print(tid,"components with badges:",{k:len(v) for k,v in badge_comp.items()},"main",main)
cells_by={}
for y in range(ny):
    for x in range(nx):
        if comp[y][x]>=0: cells_by.setdefault(comp[y][x],[]).append((x,y))
links=[]; newcross=[]
import random; random.seed(1)
for k,bl in badge_comp.items():
    if k==main or k<0: continue
    A=cells_by[k]; M=cells_by[main]
    As=A if len(A)<=500 else random.sample(A,500); Ms=M if len(M)<=6000 else random.sample(M,6000)
    best=None
    for ax,ay in As:
        for mx_,my_ in Ms:
            d=(ax-mx_)**2+(ay-my_)**2
            if best is None or d<best[0]: best=(d,ax,ay,mx_,my_)
    d=math.sqrt(best[0])*cell*mpu
    ln=[x0+(best[1]+.5)*cell,y0+(best[2]+.5)*cell,x0+(best[3]+.5)*cell,y0+(best[4]+.5)*cell]
    # does the strip cross the circuit line? The app closes the circuit again at run time (7.5 m each side) and opens it only at a `cross` badge, so a link there would do nothing:
    # put a crossing badge on the circuit line, nearest the middle of the gap, instead.
    def seg_pt_dist(px,py,ax,ay,bx,by):
        dx,dy=bx-ax,by-ay; L=dx*dx+dy*dy; t=0 if L==0 else max(0,min(1,((px-ax)*dx+(py-ay)*dy)/L)); qx,qy=ax+t*dx,ay+t*dy; return math.hypot(px-qx,py-qy),qx,qy
    PP=B.pts(T["path"]); PP=PP+PP[:1]
    cross_hit=None
    for i in range(0,41):
        sx=ln[0]+(ln[2]-ln[0])*i/40; sy=ln[1]+(ln[3]-ln[1])*i/40
        for (ax,ay),(bx,by) in zip(PP,PP[1:]):
            dd,qx,qy=seg_pt_dist(sx,sy,ax,ay,bx,by)
            if dd*mpu<=9 and (cross_hit is None or dd<cross_hit[0]): cross_hit=(dd,qx,qy)
    if cross_hit:
        mxm,mym=(ln[0]+ln[2])/2,(ln[1]+ln[3])/2; bestp=None
        for (ax,ay),(bx,by) in zip(PP,PP[1:]):
            dd,qx,qy=seg_pt_dist(mxm,mym,ax,ay,bx,by)
            if bestp is None or dd<bestp[0]: bestp=(dd,qx,qy)
        if bestp[0]*mpu>60: print("   crossing would be %.0f m from the circuit: skipped"%(bestp[0]*mpu)); continue
        newcross.append({"n":"Crossing (position assumed)","k":"cross","x":round(bestp[1]),"y":round(bestp[2]),"d":"Walking route across the circuit to the area on the other side. Position approximate: the real tunnel or bridge may be a little further along; not marked on our map."})
        print("  island",k,"badges",len(bl),[b["n"][:18] for b in bl[:3]],"-> crossing badge on the circuit near it"); continue
    print("  island",k,"badges",len(bl),[b["n"][:18] for b in bl[:3]],"-> link %.0f m"%d)
    if d<=maxm: links.append([round(v,1) for v in ln])
    else: print("   too far, skipped")
if dry: sys.exit()
T=B.load(tid); T["links"]=links; T["pois"]=[q for q in T["pois"] if not q["n"].startswith("Crossing (position assumed)")]+newcross
if PATCH:
    # carve each strip into the existing grid (a hand-tuned grid is kept as it is); the links stay in the file so a later rebuild keeps them
    R0=T["route"]; rr=[list(B.rle_decode(r) if R0.get("rle") else r) for r in R0["rows"]]; cl=R0["cell"]; mp=R0["mpu"]
    for x1,y1,x2,y2 in links:
        L=math.hypot(x2-x1,y2-y1); n=max(2,math.ceil(L/(cl/2)))
        for k in range(n+1):
            cx_=x1+(x2-x1)*k/n; cy_=y1+(y2-y1)*k/n; rad=max(3/mp,cl*.6)
            for j in range(int((cy_-rad-R0["y0"])//cl),int((cy_+rad-R0["y0"])//cl)+1):
                for i in range(int((cx_-rad-R0["x0"])//cl),int((cx_+rad-R0["x0"])//cl)+1):
                    if 0<=i<R0["nx"] and 0<=j<R0["ny"] and math.hypot(R0["x0"]+(i+.5)*cl-cx_,R0["y0"]+(j+.5)*cl-cy_)<=rad: rr[j][i]="2"
    rows2=["".join(r) for r in rr]
    R0["rows"]=[B.rle_encode(r) for r in rows2] if R0.get("rle") else rows2
    B.save(tid,T); print(tid,"patched: links",len(links),"crossings",len(newcross))
else:
    B.save(tid,T); n=B.build(tid,rle=True); B.save(tid,n); print(tid,"links",len(links))
