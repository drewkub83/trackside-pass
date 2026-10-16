"""Backtest for tools/podium_odds.py: how well do qualifying position, practice pace and earlier form predict the class winner? Run podium_backtest_fetch.py first (writes sessions.json in the current folder)."""
import json,math,itertools,collections,re
D=json.load(open("sessions.json"))
ORDER=["RC","Mz","Spa","Nb"]
def secs(t):
    m=re.match(r"(?:(\d+):)?(\d+\.\d+)$",t or "")
    return (int(m.group(1) or 0)*60+float(m.group(2))) if m else None
def cls_rank(rows,key=None):
    """rank within class by table order"""
    cnt=collections.Counter(); out={}
    for r in rows:
        c=r["Class"]; 
        if r["Pos"].isdigit(): cnt[c]+=1; out[r["Car #"]]=(c,cnt[c])
    return out
def percentile(rank,n): return 1-(rank-1)/max(1,n-1)
races=[]   # (round, class, [cars], winner, features)
form_hist=collections.defaultdict(list)   # car -> list of class percentiles from previous rounds
for rk in ORDER:
    d=D[rk]; main=d["main-race"]; q=d["qualifying-combined"]; fp2=d["free-practice-2"]; fp1=d["free-practice-1"]
    if not main: continue
    mr=cls_rank(main); qr=cls_rank(q) if q else {}
    ncls=collections.Counter(c for c,_ in mr.values())
    def best(rows):
        b={}
        for r in rows:
            t=secs(r.get("Time")); 
            if t and (r["Class"] not in b or t<b[r["Class"]]): b[r["Class"]]=t
        return b
    b2=best(fp2); t2={r["Car #"]:secs(r["Time"]) for r in fp2}
    for c in ncls:
        cars=[n for n,(cc,_) in mr.items() if cc==c]
        if len(cars)<5: continue
        win=[n for n in cars if mr[n][1]==1][0]
        feats={}
        qn=collections.Counter(cc for cc,_ in qr.values())
        for n in cars:
            qp=qr[n][1] if n in qr else None
            gap=(t2.get(n)-b2[c]) if (t2.get(n) and c in b2) else None
            hist=form_hist.get(n,[])
            form=sum(hist)/len(hist) if hist else None
            feats[n]=dict(q=qp,qn=qn.get(c,0),gap=gap,form=form)
        races.append((rk,c,cars,win,feats))
    for n,(c,rank) in mr.items(): form_hist[n].append(percentile(rank,ncls[c]))
print(len(races),"class races:",[(r[0],r[1],len(r[2])) for r in races])
def ll(params,sub=None,tr=None):
    a,b,c=params; tot=0;n=0;top=0
    for rk,cl,cars,win,f in (sub or races):
        ws=[]
        for x in cars:
            ft=f[x]; w=0
            if a and ft["q"]: w-=a*(ft["q"]-1)
            elif a: w-=a*(ft["qn"]/2 if ft["qn"] else 5)     # unknown quali: mid-field
            if b: w-=b*min(ft["gap"] if ft["gap"] is not None else 1.5,3)
            if c: w+=c*((ft["form"] if ft["form"] is not None else 0.5)-0.5)
            ws.append(w)
        z=sum(math.exp(w) for w in ws); p=math.exp(ws[cars.index(win)])/z
        tot+=-math.log(max(p,1e-9)); n+=1; top+= (ws.index(max(ws))==cars.index(win))
    return tot/n,top,n
grid_a=[0,0.1,0.2,0.3,0.4,0.5]; grid_b=[0,0.5,1,1.5,2,3]; grid_c=[0,1,2,3,4]
def fit(sub):
    return min((ll((a,b,c),sub)[0],(a,b,c)) for a in grid_a for b in grid_b for c in grid_c)
print("uniform",ll((0,0,0)))
for name,gs in [("quali only",[(a,0,0) for a in grid_a]),("practice only",[(0,b,0) for b in grid_b]),("form only",[(0,0,c) for c in grid_c]),("all",[(a,b,c) for a in grid_a for b in grid_b for c in grid_c])]:
    best=min((ll(g)[0],g) for g in gs); print(f"{name:14} best {best[1]} logloss {best[0]:.3f} (top1 {ll(best[1])[1]}/{len(races)})")
# leave-one-race-out for the full model
cv=0
for i,r in enumerate(races):
    tr=races[:i]+races[i+1:]; _,g=fit(tr); cv+=ll(g,[r])[0]
print("LOO-CV logloss all:",cv/len(races))
cv=0
for i,r in enumerate(races):
    tr=races[:i]+races[i+1:]; g=min((ll((a,0,0),tr)[0],(a,0,0)) for a in grid_a)[1]; cv+=ll(g,[r])[0]
print("LOO-CV logloss quali only:",cv/len(races))
