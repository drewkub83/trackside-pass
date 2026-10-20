# Like chain_circuit.py but for circuits whose OpenStreetMap pieces are drawn in mixed directions or do not share node ids:
# joins pieces by END POINTS that lie within <tol> metres, in either direction, and prints SIGNED way ids (a minus sign = drive that piece backwards;
# build_permanent.rb understands them).   python3 tools/track-data/chain_circuit2.py <id> <target_km> [tol_m=4] [exclude_regex]
import sys, os, json, math, re
HERE=os.path.dirname(os.path.abspath(__file__)); OSM=os.path.join(HERE,"..","street-circuits","osm")+"/"
tid=sys.argv[1]; target=float(sys.argv[2])*1000; tol=float(sys.argv[3]) if len(sys.argv)>3 else 4.0
excl=re.compile(sys.argv[4] if len(sys.argv)>4 else r"pit|kart|moto|support|paddock|driving|school|rallycross|oval|trainin|drag|skid|autocross|handling|inner|outer|endurance|national|international|stowe|club|junior|south|north",re.I)
els=json.load(open(OSM+tid+".json"))["elements"]
ways=[e for e in els if e.get("type")=="way" and e.get("tags",{}).get("highway")=="raceway" and not excl.search(e["tags"].get("name",""))]
def d(a,b): return math.hypot((a["lat"]-b["lat"])*110900,(a["lon"]-b["lon"])*111320*math.cos(math.radians(a["lat"])))
def L(g): return sum(d(a,b) for a,b in zip(g,g[1:]))
W={w["id"]:w for w in ways}; LEN={i:L(w["geometry"]) for i,w in W.items()}
ends=[]   # (point, way id, is_start)
for i,w in W.items(): ends.append((w["geometry"][0],i,True)); ends.append((w["geometry"][-1],i,False))
def near(p): return [(i,s) for q,i,s in ends if d(p,q)<=tol]
best=[None,1e9]
sys.setrecursionlimit(10000)
def dfs(path,used,first_pt,total):
    cur=path[-1]; w=W[abs(cur)]; endp=w["geometry"][-1] if cur>0 else w["geometry"][0]
    if len(path)>1 and d(endp,first_pt)<=tol:
        gap=abs(total-target)
        if gap<best[1]: best[0]=list(path); best[1]=gap
    for i,is_start in near(endp):
        if i in used or total+LEN[i]>target*1.15 or len(path)>120: continue
        used.add(i); path.append(i if is_start else -i); dfs(path,used,first_pt,total+LEN[i]); path.pop(); used.discard(i)
for i,w in W.items():
    for sign in (1,-1):
        g=w["geometry"]; first=g[0] if sign>0 else g[-1]
        dfs([i*sign],{i},first,LEN[i])
print("raceway pieces considered:",len(ways))
if not best[0]: print("no closed loop found within tolerance")
else:
    tot=sum(LEN[abs(i)] for i in best[0]); print(f"closed loop: {len(best[0])} pieces, {tot/1000:.3f} km (target {target/1000:.3f})"); print("circuit:",best[0]); print("names:",[W[abs(i)]["tags"].get("name","") for i in best[0]])
