# Fit a track's lap to a fan-map drawing by overlapping filled silhouettes (works where fit_map.py's line matching fails: oval maps drawn as a pale band).
# silhouette fit: python fitiou.py <track> <img> <x0,y0,x1,y1> <B,G,R,tol> <out.json> [rot_lo rot_hi]
import sys,re,math,json,numpy as np,cv2
import os; sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import build_route as B
tid,imgf,box,col,out=sys.argv[1:6]; rlo,rhi=(float(sys.argv[6]),float(sys.argv[7])) if len(sys.argv)>7 else (0,360)
x0,y0,x1,y1=[int(v) for v in box.split(",")]; b,g,r,tol=[int(v) for v in col.split(",")]
img=cv2.imread(imgf); H,W=img.shape[:2]
m=((abs(img[...,0].astype(int)-b)<tol)&(abs(img[...,1].astype(int)-g)<tol)&(abs(img[...,2].astype(int)-r)<tol)).astype(np.uint8)
mm=np.zeros_like(m); mm[y0:y1,x0:x1]=m[y0:y1,x0:x1]
mm=cv2.morphologyEx(mm,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
cs,_=cv2.findContours(mm,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE); c=max(cs,key=cv2.contourArea)
S=np.zeros_like(mm); cv2.drawContours(S,[c],-1,1,-1); A=S.sum(); cv2.imwrite(out.replace(".json","_sil.png"),S*255)
T=B.load(tid); P=np.array([(float(a),float(bb)) for a,bb in re.findall(r"(-?\d+\.?\d*),(-?\d+\.?\d*)",T["path"])])
Ap=0.5*abs(np.dot(P[:,0],np.roll(P[:,1],-1))-np.dot(P[:,1],np.roll(P[:,0],-1))); s0=math.sqrt(A/Ap)*0.97
ys,xs=np.nonzero(S); cen=np.array([xs.mean(),ys.mean()]); pc=P.mean(0)
def render(s,an,tx,ty):
    cc,sn=math.cos(an),math.sin(an); q=s*np.stack([P[:,0]*cc-P[:,1]*sn,P[:,0]*sn+P[:,1]*cc],1)+[tx,ty]
    I=np.zeros_like(S); cv2.fillPoly(I,[q.astype(np.int32)],1); return I,q
def iou(s,an,tx,ty):
    I,_=render(s,an,tx,ty); u=(I|S).sum(); return (I&S).sum()/u if u else 0
best=(0,)
for deg in np.arange(rlo,rhi,2.0):
    an=math.radians(deg); cc,sn=math.cos(an),math.sin(an); pcr=s0*np.array([pc[0]*cc-pc[1]*sn,pc[0]*sn+pc[1]*cc])
    v=iou(s0,an,*(cen-pcr))
    if v>best[0]: best=(v,s0,an,*(cen-pcr))
p=list(best[1:]); cur=best[0]; rng=np.random.default_rng(3); step=[s0*.02,math.radians(1.5),6,6]
for it in range(2500):
    cnd=[p[i]+rng.normal(0,step[i]) for i in range(4)]; v=iou(*cnd)
    if v>cur: p,cur=cnd,v
    if it%600==599: step=[x*.5 for x in step]
print("IoU %.3f scale %.3f rot %.1f"%(cur,p[0],math.degrees(p[1])))
s,an,tx,ty=p; json.dump({"s":s,"ang":an,"tx":tx,"ty":ty,"cost":1-cur},open(out,"w"))
_,q=render(*p); o=img.copy(); cv2.polylines(o,[q.astype(np.int32)],True,(0,0,255),6); cv2.imwrite(out.replace(".json",".png"),o)
