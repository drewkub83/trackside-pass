import sys, os, re, json, math
import os
HERE=os.path.dirname(os.path.abspath(__file__))
REPO=os.path.abspath(os.path.join(HERE,'..','..'))
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
ROOT=os.path.join(REPO,"data")+"/"
def load(tid):
    t=open(ROOT+tid+".js",encoding="utf-8").read()
    m=re.match(r'\s*TRACKS\.push\((\{.*\})\);\s*$',t,re.S)
    return json.loads(m.group(1))
def save(tid,obj):
    body=",\n".join("  "+json.dumps(k)+":"+json.dumps(v,separators=(",",":"),ensure_ascii=False) for k,v in obj.items())
    open(ROOT+tid+".js","w",encoding="utf-8").write("TRACKS.push({\n"+body+"\n});\n")
def pts(d): return [(float(a),float(b)) for a,b in re.findall(r'(-?\d+\.?\d*),(-?\d+\.?\d*)',d)]
class Grid:
    def __init__(s,W,H,cell,x0,y0):
        s.cell=cell; s.x0=x0; s.y0=y0; s.nx=math.ceil(W/cell); s.ny=math.ceil(H/cell); s.a=[bytearray(b"0"*s.nx) for _ in range(s.ny)]
    def set(s,cx,cy,v,only=None):
        if 0<=cx<s.nx and 0<=cy<s.ny and (only is None or chr(s.a[cy][cx]) in only): s.a[cy][cx]=ord(v)
    def fill(s,p,v,only=None):
        p=[(x-s.x0,y-s.y0) for x,y in p]
        if len(p)<3: return
        ys=[q[1] for q in p]; y0=max(int(min(ys)//s.cell),0); y1=min(int(max(ys)//s.cell),s.ny-1)
        for cy in range(y0,y1+1):
            yc=(cy+.5)*s.cell; xs=[]
            for a,b in zip(p,p[1:]+p[:1]):
                if (a[1]<=yc)==(b[1]<=yc): continue
                xs.append(a[0]+(yc-a[1])*(b[0]-a[0])/(b[1]-a[1]))
            xs.sort()
            for i in range(0,len(xs)-1,2):
                for cx in range(math.ceil(xs[i]/s.cell-.5),math.floor(xs[i+1]/s.cell-.5)+1): s.set(cx,cy,v,only)
    def stroke(s,p,w,v,only=None):
        r=w/2; p=[(x-s.x0,y-s.y0) for x,y in p]
        for a,b in zip(p,p[1:]):
            L=math.hypot(b[0]-a[0],b[1]-a[1]); n=max(math.ceil(L/(s.cell*.5)),1)
            for i in range(n+1):
                x=a[0]+(b[0]-a[0])*i/n; y=a[1]+(b[1]-a[1])*i/n
                for cy in range(int((y-r)//s.cell),int((y+r)//s.cell)+1):
                    for cx in range(int((x-r)//s.cell),int((x+r)//s.cell)+1):
                        if math.hypot((cx+.5)*s.cell-x,(cy+.5)*s.cell-y)<=r+s.cell*.35: s.set(cx,cy,v,only)
    def disc(s,x,y,r,v,only=None):
        x-=s.x0; y-=s.y0
        for cy in range(int((y-r)//s.cell),int((y+r)//s.cell)+1):
            for cx in range(int((x-r)//s.cell),int((x+r)//s.cell)+1):
                if math.hypot((cx+.5)*s.cell-x,(cy+.5)*s.cell-y)<=r: s.set(cx,cy,v,only)
    def rows(s): return [r.decode() for r in s.a]
WIDTH={"primary":12,"residential":8,"service":5,"path":3,"track":4,"bridge":5,"footway":3,"unclassified":6,"tertiary":8}
def build(tid):
    T=load(tid); vb=T["vb"]; g=T["geo"]; mpu=(g["n"]-g["s"])*111000/vb[3]; cell=10.0/mpu
    G=Grid(vb[2],vb[3],cell,vb[0],vb[1]); base=T.get("base",{})
    def inside(poly,x,y):
        c=False
        for a,b in zip(poly,poly[1:]+poly[:1]):
            if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]: c=not c
        return c
    pois_xy=[(q["x"],q["y"]) for q in T["pois"] if q["k"]!="cross"]
    for p in base.get("polys",[]):
        if p["k"]=="water": G.fill(pts(p["d"]),"1")
        elif p["k"]=="building":
            poly=pts(p["d"])
            if any(inside(poly,x,y) for x,y in pois_xy): continue      # a stand / stall with a badge inside is somewhere you can walk into
            G.fill(poly,"1")
    for l in base.get("lines",[]):
        k=l["k"]
        if k in ("tunnel","stream","raceway"): continue
        G.stroke(pts(l["d"]),WIDTH.get(k,5)/mpu,"2",["0"])
    for l in base.get("lines",[]):
        if l["k"]=="raceway": G.stroke(pts(l["d"]),12/mpu,"1")
    G.stroke(pts(T["path"]),15/mpu,"1")
    # pit lane is NOT baked as a barrier on permanent tracks: crossings pass under/over both it and the circuit, and the app only reopens the circuit strip.
    # A crossing (bridge/tunnel) passes over/under the circuit, the pit road, grandstands and any raceway strip there. So each
    # crossing is cut as a straight corridor, square to the nearest circuit segment, from the crossing out through all of that
    # blocked ground to open ground on each far side (never more than 80 m either way).
    orig=[bytearray(r) for r in G.a]
    # size of the open region each free cell belongs to, so the corridor skips tiny walled pockets and only stops on big open ground
    compsize=[[0]*G.nx for _ in range(G.ny)]; seenc=[[False]*G.nx for _ in range(G.ny)]
    for y0 in range(G.ny):
        for x0 in range(G.nx):
            if seenc[y0][x0] or orig[y0][x0]==ord("1"): continue
            comp=[(x0,y0)]; seenc[y0][x0]=True; i=0
            while i<len(comp):
                x,y=comp[i]; i+=1
                for dx in(-1,0,1):
                    for dy in(-1,0,1):
                        X,Y=x+dx,y+dy
                        if (dx or dy) and 0<=X<G.nx and 0<=Y<G.ny and not seenc[Y][X] and orig[Y][X]!=ord("1") and not(dx and dy and(orig[y][X]==ord("1") or orig[Y][x]==ord("1"))):
                            seenc[Y][X]=True; comp.append((X,Y))
            for x,y in comp: compsize[y][x]=len(comp)
    def ocell(x,y):
        cx=int((x-G.x0)//G.cell); cy=int((y-G.y0)//G.cell)
        return chr(orig[cy][cx]) if 0<=cx<G.nx and 0<=cy<G.ny else "0"
    def big_open(x,y):
        cx=int((x-G.x0)//G.cell); cy=int((y-G.y0)//G.cell)
        return 0<=cx<G.nx and 0<=cy<G.ny and orig[cy][cx]!=ord("1") and compsize[cy][cx]>=400
    C=pts(T["path"])
    for q in T["pois"]:
        if q["k"]!="cross": continue
        qx,qy=q["x"],q["y"]; G.disc(qx,qy,14/mpu,"2",["1","0"])
        best=None
        for a,b in zip(C,C[1:]):
            dx,dy=b[0]-a[0],b[1]-a[1]; L2=dx*dx+dy*dy
            t=0 if L2==0 else max(0,min(1,((qx-a[0])*dx+(qy-a[1])*dy)/L2)); px,py=a[0]+t*dx,a[1]+t*dy; d=math.hypot(px-qx,py-qy)
            if best is None or d<best[0]: best=(d,px,py,dx,dy)
        if not best or best[0]*mpu>60: continue
        d,px,py,dx,dy=best; L=math.hypot(dx,dy) or 1; nxv,nyv=-dy/L,dx/L
        G.disc(px,py,14/mpu,"2",["1","0"])
        n=max(2,math.ceil(d/(cell/2)))
        for k in range(1,n): G.disc(qx+(px-qx)*k/n,qy+(py-qy)*k/n,6/mpu,"2",["1","0"])
        for sgn in (1,-1):
            seen_block=False; free_run=0; step=cell/2; s_=0.0
            while s_*mpu<=110:
                x=px+sgn*nxv*s_; y=py+sgn*nyv*s_; G.disc(x,y,6/mpu,"2",["1","0"])
                if ocell(x,y)=="1": seen_block=True; free_run=0
                elif big_open(x,y):
                    free_run+=1
                    if seen_block and free_run>=3: break
                    if not seen_block and s_*mpu>=25: break
                else: free_run=0
                s_+=step
    T["route"]={"cell":round(cell,4),"nx":G.nx,"ny":G.ny,"x0":vb[0],"y0":vb[1],"mpu":round(mpu,4),"rows":G.rows()}
    return T
if __name__=="__main__":
    for tid in sys.argv[1:]:
        T=build(tid); r=T["route"]; import collections
        c=collections.Counter("".join(r["rows"]))
        print(tid,r["nx"],"x",r["ny"],dict(c))
