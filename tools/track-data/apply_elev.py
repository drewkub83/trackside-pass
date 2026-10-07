# Bake a downloaded elevation grid (elev-out/<track>.json) into data/<track>.js as the "elev" field.
#   python3 tools/track-data/apply_elev.py laguna-seca watkins-glen ...
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_route import load, save
from elev_lib import SCR
for tid in sys.argv[1:]:
    e=json.load(open(SCR+tid+".json"))
    miss=sum(v is None for v in e["ft"])
    T=load(tid); T["elev"]=e; save(tid,T)
    print(tid,"elev baked:",e["nx"],"x",e["ny"],"missing",miss)
