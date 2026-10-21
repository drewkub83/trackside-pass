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
    ys_,xs_=np.nonzero(sm & ~bl)
    def snap(p):   # nearest free pixel of the band, whatever the distance (anchors read off an image are rarely exactly on it)
        d=(xs_-p[0]/SC)**2+(ys_-p[1]/SC)**2; k=int(np.argmin(d)); return (int(xs_[k]),int(ys_[k]))
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
        if tr is None: print("trace failed (straight line used)",k); tr=np.array([p0,p1],float)
        # resample trace by arc length
        L=np.r_[0,np.cumsum(np.hypot(*np.diff(tr,axis=0).T))]; m=(i1-i0)%n or n
        for j in range(m):
            f=j/m*L[-1]; x=np.interp(f,L,tr[:,0]); y=np.interp(f,L,tr[:,1]); img.append((x,y)); app.append(D[(i0+j)%n])
        cv2.polylines(blocked,[tr.astype(np.int32)[2:-2]],False,1,9)
    return np.array(img),np.array(app),D
def to_app(img_pts,app_pts,q,R=160.0):
    """image point -> app units: a global affine fitted to all pairs plus a distance-weighted correction from the nearest pairs
    (the correction fades out with distance R in pixels, so points far from the circuit fall back to the global fit)."""
    X=np.c_[img_pts,np.ones(len(img_pts))]; G=np.linalg.lstsq(X,app_pts,rcond=None)[0]
    res=app_pts-X@G; d2=((img_pts-q)**2).sum(1); idx=np.argsort(d2)[:40]; w=1/(d2[idx]+25.0)
    corr=(w[:,None]*res[idx]).sum(0)/(w.sum()+1/R**2*1.0*0+1e-9) * (1/(1+(np.sqrt(d2[idx].min())/R)**2))
    return np.r_[q,1]@G+corr
