import math,sys
sys.path.insert(0,".")
import turns as t
def two_pt(p1,p2,d1,d2):
    ax,ay=p2[0]-p1[0],p2[1]-p1[1]; bx,by=d2[0]-d1[0],d2[1]-d1[1]
    L=ax*ax+ay*ay
    if L<1: return None
    s=math.hypot(bx,by)/math.hypot(ax,ay); ang=math.atan2(by,bx)-math.atan2(ay,ax)
    c,sn=math.cos(ang),math.sin(ang); tx=d1[0]-s*(p1[0]*c-p1[1]*sn); ty=d1[1]-s*(p1[0]*sn+p1[1]*c)
    return s,ang,tx,ty
def ap(T,p): s,a,tx,ty=T; c,sn=math.cos(a),math.sin(a); return (s*(p[0]*c-p[1]*sn)+tx, s*(p[0]*sn+p[1]*c)+ty)
def search(page,cands,rot_deg=None,rot_tol=20,tol=14,scale_rng=None):
    keys=list(page); best=[]
    for i in keys:
        for j in keys:
            if i>=j and keys.index(i)>=keys.index(j): continue
            for a in range(len(cands)):
                for b in range(len(cands)):
                    if a==b: continue
                    T=two_pt(page[i],page[j],cands[a],cands[b])
                    if not T: continue
                    if rot_deg is not None:
                        d=(math.degrees(T[1])-rot_deg+180)%360-180
                        if abs(d)>rot_tol: continue
                    if scale_rng and not(scale_rng[0]<=T[0]<=scale_rng[1]): continue
                    hits=0; err=0; used=set()
                    for k in keys:
                        q=ap(T,page[k]); dd,ci=min((math.hypot(q[0]-c[0],q[1]-c[1]),ci) for ci,c in enumerate(cands))
                        if dd<=tol and ci not in used: hits+=1; err+=dd; used.add(ci)
                    best.append((hits,-err,T))
    best.sort(key=lambda r:(-r[0],-r[1])); return best[:3]
