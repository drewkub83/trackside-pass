import math,itertools,sys
sys.path.insert(0,".")
import turns as t
def fit(A,B,allow_flip=False):
    n=len(A); ax=sum(a for a,b in A)/n; ay=sum(b for a,b in A)/n; bx=sum(a for a,b in B)/n; by=sum(b for a,b in B)/n
    num=den=nrm=0
    for (a,b),(c,e) in zip(A,B):
        a-=ax;b-=ay;c-=bx;e-=by; num+=a*e-b*c; den+=a*c+b*e; nrm+=a*a+b*b
    ang=math.atan2(num,den); s=math.hypot(num,den)/nrm
    tx=bx-s*(ax*math.cos(ang)-ay*math.sin(ang)); ty=by-s*(ax*math.sin(ang)+ay*math.cos(ang)); return s,ang,tx,ty
def resid(T,A,B):
    s,a,tx,ty=T; c,sn=math.cos(a),math.sin(a)
    return math.sqrt(sum((s*(x*c-y*sn)+tx-u)**2+(s*(x*sn+y*c)+ty-v)**2 for (x,y),(u,v) in zip(A,B))/len(A))
def best(page,cands,order=None,topn=3):
    """page: dict turn->(x,y) in lap order; cands: detected (x,y) list in lap order. try cyclic monotone assignments."""
    keys=order or list(page); k=len(keys); M=len(cands); out=[]
    for sub in itertools.combinations(range(M),k):
        for shift in range(k):
            idx=[sub[(i+shift)%k] for i in range(k)]
            A=[page[key] for key in keys]; B=[cands[i] for i in idx]
            T=fit(A,B); out.append((resid(T,A,B),idx,T))
    out.sort(key=lambda r:r[0]); return out[:topn]
