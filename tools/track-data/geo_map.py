# See mtl_geo usage in CLAUDE.md "Fan maps": for STYLISED maps (Montreal, Lime Rock) where no single stretch fits the drawing.
# Georeference a STYLISED map: pair anchors (app lap index <-> image point) around the lap, trace the drawn circuit between anchors along the
# black band (shortest path inside the mask), and map every image point through its nearest traced piece (local frame, arc-length matched).
import sys,re,json,math,heapq,cv2,numpy as np
import os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_route as B
def lap(tid):
    T=B.load(tid); P=np.array([(float(x),float(y)) for x,y in re.findall(r"(-?\d+\.?\d*),(-?\d+\.?\d*)",T["path"])])
    D=[]
    for a,b in zip(P,np.r_[P[1:],P[:1]]):
        k=max(1,int(np.hypot(*(b-a))/2)); D+= [a+(b-a)*i/k for i in range(k)]
    return T,np.array(D)
def trace(mask,a,b,blocked,SC=2):
    h,w=mask.shape; hs,ws=h//SC,w//SC
    sm=cv2.resize(mask,(ws,hs),interpolation=cv2.INTER_AREA)>0
    dt=cv2.distanceTransform(sm.astype(np.uint8),cv2.DIST_L2,3)
    bl=cv2.resize(blocked,(ws,hs),interpolation=cv2.INTER_NEAREST)>0
    def snap(p):
        x,y=int(p[0]/SC),int(p[1]/SC); best=None
        for dy in range(-8,9):
            for dx in range(-8,9):
                xx,yy=x+dx,y+dy
                if 0<=xx<ws and 0<=yy<hs and sm[yy,xx] and not bl[yy,xx]:
                    d=dx*dx+dy*dy
                    if best is None or d<best[0]: best=(d,xx,yy)
        return (best[1],best[2])
    s,t=snap(a),snap(b); dist={s:0}; prev={}; pq=[(0,s)]
    while pq:
        d,u=heapq.heappop(pq)
        if u==t: break
        if d>dist.get(u,1e18): continue
        for dx in (-1,0,1):
            for dy in (-1,0,1):
                if dx==0 and dy==0: continue
                v=(u[0]+dx,u[1]+dy)
                if not(0<=v[0]<ws and 0<=v[1]<hs) or not sm[v[1],v[0]] or bl[v[1],v[0]]: continue
                c=math.hypot(dx,dy)*(1+6/(1+dt[v[1],v[0]]))
                nd=d+c
                if nd<dist.get(v,1e18): dist[v]=nd; prev[v]=u; heapq.heappush(pq,(nd,v))
    if t not in prev and s!=t: return None
    path=[t]
    while path[-1]!=s: path.append(prev[path[-1]])
    return np.array(path[::-1],float)*SC+SC/2
def build(tid,mask,anchors,order_idx=None):
    """anchors: list of (app_index_in_D, (ix,iy)) in lap order (cyclic). Returns correspondence arrays img_pts[], app_pts[]"""
    T,D=lap(tid); n=len(D); img=[];app=[]; blocked=np.zeros(mask.shape,np.uint8)
    for k in range(len(anchors)):
        (i0,p0),(i1,p1)=anchors[k],anchors[(k+1)%len(anchors)]
        tr=trace(mask,p0,p1,blocked)
        if tr is None: print("trace failed",k); continue
        # resample trace by arc length
        L=np.r_[0,np.cumsum(np.hypot(*np.diff(tr,axis=0).T))]; m=(i1-i0)%n or n
        for j in range(m):
            f=j/m*L[-1]; x=np.interp(f,L,tr[:,0]); y=np.interp(f,L,tr[:,1]); img.append((x,y)); app.append(D[(i0+j)%n])
        cv2.polylines(blocked,[tr.astype(np.int32)[2:-2]],False,1,9)
    return np.array(img),np.array(app),D
def to_app(img_pts,app_pts,q,K=10):
    """map one image point via moving least squares affine over the K nearest corresponding pairs"""
    d=np.hypot(*(img_pts-q).T); idx=np.argsort(d)[:K]; w=1/(1+d[idx]/10)
    X=np.c_[img_pts[idx],np.ones(K)]*w[:,None]; Y=app_pts[idx]*w[:,None]
    sol=np.linalg.lstsq(X,Y,rcond=None)[0]; return np.r_[q,1]@sol
