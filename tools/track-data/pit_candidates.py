# Rank the other raceway pieces by how closely they hug the chosen lap, to find an unnamed pit lane.
#   python3 tools/track-data/pit_candidates.py <id> <way,way,...>   (signed ids ok)
import sys, json, math, os
HERE=os.path.dirname(os.path.abspath(__file__)); OSM=os.path.join(HERE,"..","street-circuits","osm")+"/"
tid=sys.argv[1]; circ=[abs(int(x)) for x in sys.argv[2].split(",")]
els=json.load(open(OSM+tid+".json"))["elements"]; W={e["id"]:e for e in els if e["type"]=="way" and "geometry" in e}
def d(a,b): return math.hypot((a["lat"]-b["lat"])*110900,(a["lon"]-b["lon"])*111320*math.cos(math.radians(a["lat"])))
def L(g): return sum(d(a,b) for a,b in zip(g,g[1:]))
ring=[p for i in circ for p in W[i]["geometry"]]
def near(p): return min(d(p,q) for q in ring[::2])
rows=[]
for e in W.values():
    t=e.get("tags",{})
    if t.get("highway")!="raceway" or e["id"] in circ: continue
    g=e["geometry"]; fr=sum(1 for p in g if near(p)<=30)/len(g); rows.append((fr,L(g),e["id"],t.get("name","")))
for fr,l,i,n in sorted(rows,reverse=True)[:8]: print(f"{i} {l:.0f} m  {fr:.0%} within 30 m of the lap  {n}")
