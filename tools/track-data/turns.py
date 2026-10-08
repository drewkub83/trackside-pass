import sys,math,json
sys.path.insert(0,"/Users/andrew/Desktop/Claude Code/tools/track-data")
from build_route import load,pts
def resample(P,step):
    P=P+[P[0]]; out=[P[0]]; carry=0
    for (a,b),(c,d) in zip(P[:-1],P[1:]):
        L=math.hypot(c-a,d-b); t=step-carry
        while t<=L: out.append((a+(c-a)*t/L,b+(d-b)*t/L)); t+=step
        carry=L-(t-step)
    return out[:-1] if math.hypot(out[-1][0]-out[0][0],out[-1][1]-out[0][1])<step*0.5 else out
def turns(tid,step=4,win=10,thr=22,merge=45):
    T=load(tid); P=resample(pts(T["path"]),step); n=len(P)
    # start the lap at the sample nearest the start/finish line
    sf=T["sf"]; s0=min(range(n),key=lambda i:math.hypot(P[i][0]-sf[0],P[i][1]-sf[1])); P=P[s0:]+P[:s0]
    # direction of travel: the sfArrow angle tells which way cars run; flip if the first samples go against it
    ar=T.get("sfArrow")
    if ar:
        a=math.radians(ar[2]); fx,fy=math.cos(a),math.sin(a); dx,dy=P[5][0]-P[0][0],P[5][1]-P[0][1]
        if dx*fx+dy*fy<0: P=[P[0]]+P[:0:-1]
    def ang(i):
        a=P[(i-win)%n]; b=P[i]; c=P[(i+win)%n]
        h1=math.atan2(b[1]-a[1],b[0]-a[0]); h2=math.atan2(c[1]-b[1],c[0]-b[0]); d=math.degrees(h2-h1); return (d+180)%360-180
    A=[ang(i) for i in range(n)]
    cand=[i for i in range(n) if abs(A[i])>=thr and abs(A[i])>=abs(A[(i-1)%n]) and abs(A[i])>=abs(A[(i+1)%n])]
    groups=[]
    for i in cand:
        if groups and (i-groups[-1][-1])*step<merge: groups[-1].append(i)
        else: groups.append([i])
    res=[]
    for g in groups:
        i=max(g,key=lambda k:abs(A[k])); res.append((len(res)+1,round(P[i][0]),round(P[i][1]),round(A[i]),round(i*step)))
    return res,T
if __name__=="__main__":
    tid=sys.argv[1]; thr=float(sys.argv[2]) if len(sys.argv)>2 else 22
    res,T=turns(tid,thr=thr)
    print(tid,"turns found",len(res)); 
    for r in res: print(r)
    print("labels",T.get("labels"))
