# List the raceway pieces of a downloaded circuit that are NOT in the chosen lap, to find the pit lane way id.
#   python3 tools/track-data/list_pits.py <id> <way,way,...>
import sys, json, math, os
HERE=os.path.dirname(os.path.abspath(__file__)); OSM=os.path.join(HERE,"..","street-circuits","osm")+"/"
tid=sys.argv[1]; circ={int(x) for x in sys.argv[2].split(",")}
def L(g): return sum(math.hypot((b["lat"]-a["lat"])*110900,(b["lon"]-a["lon"])*111320*math.cos(math.radians(a["lat"]))) for a,b in zip(g,g[1:]))
for e in json.load(open(OSM+tid+".json"))["elements"]:
    t=e.get("tags",{})
    if e["type"]=="way" and t.get("highway")=="raceway" and e["id"] not in circ: print(e["id"],round(L(e["geometry"])),"m",t.get("name",""),"|",t.get("service",""),t.get("access",""))
