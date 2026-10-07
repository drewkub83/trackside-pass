# Chain a circuit that OpenStreetMap stores as many small raceway pieces into one closed lap, in driving order, and print
# the way ids for the `circuit:` line of a permanent/<id>.rb config, with the lap length to compare with the official one.
#   python3 tools/track-data/chain_circuit.py <id> [target_km] [exclude_regex]
#   With target_km it picks the closed loop whose length is closest to the official lap (several layouts can share one site).
import sys, os, json, math, re
HERE=os.path.dirname(os.path.abspath(__file__)); OSM=os.path.join(HERE,"..","street-circuits","osm")+"/"
tid=sys.argv[1]; target=float(sys.argv[2])*1000 if len(sys.argv)>2 else None; excl=re.compile(sys.argv[3] if len(sys.argv)>3 else r"pit|kart|moto|support|paddock|driving|school|rallycross|oval|training",re.I)
els=json.load(open(OSM+tid+".json"))["elements"]
ways=[e for e in els if e.get("type")=="way" and e.get("tags",{}).get("highway")=="raceway" and not excl.search(e["tags"].get("name",""))]
def L(g): return sum(math.hypot((b["lat"]-a["lat"])*110900,(b["lon"]-a["lon"])*111320*math.cos(math.radians(a["lat"]))) for a,b in zip(g,g[1:]))
W={w["id"]:w for w in ways}; start={}; LEN={w["id"]:L(w["geometry"]) for w in ways}
for w in ways: start.setdefault(w["nodes"][0],[]).append(w["id"])
best=[]
def dfs(path,visited,first_node):
    global best
    w=W[path[-1]]; end=w["nodes"][-1]
    if end==first_node and len(path)>1:
        tot=sum(LEN[i] for i in path); cur=sum(LEN[i] for i in best)
        if (not best) or (abs(tot-target)<abs(cur-target) if target else tot>cur): best=list(path)
    for nxt in start.get(end,[]):
        if nxt not in visited and len(path)<80 and (not target or sum(LEN[i] for i in path)+LEN[nxt]<=target*1.12):
            visited.add(nxt); path.append(nxt); dfs(path,visited,first_node); path.pop(); visited.discard(nxt)
sys.setrecursionlimit(5000)
for w in ways:
    dfs([w["id"]],{w["id"]},w["nodes"][0])
print("raceway pieces considered:",len(ways))
if not best: 
    print("no closed loop found. Pieces (id, km, name, first->last node):")
    for w in sorted(ways,key=lambda w:-L(w["geometry"])): print(w["id"],round(L(w["geometry"])/1000,3),w["tags"].get("name",""),w["nodes"][0],"->",w["nodes"][-1])
else:
    tot=sum(LEN[i] for i in best)
    print(f"closed loop: {len(best)} pieces, {tot/1000:.3f} km")
    print("circuit:",best)
    print("names:",[W[i]["tags"].get("name","") for i in best])
