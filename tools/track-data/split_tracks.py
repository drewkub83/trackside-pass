# Split whole track files (data/<id>.js holding everything) into the light file + data/maps/<id>.js.
# Needed after a builder that writes whole files (tools/street-circuits/build_permanent.rb), and safe to re-run.
#   python3 tools/track-data/split_tracks.py            # every track
#   python3 tools/track-data/split_tracks.py imola ...  # just these
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_route import load, save, ROOT
NOT_TRACKS={"series","champs","watch","results","standings"}
ids=sys.argv[1:] or sorted(f[:-3] for f in os.listdir(ROOT) if f.endswith(".js") and f[:-3] not in NOT_TRACKS)
for tid in ids:
    save(tid, load(tid)); print(tid, "split", os.path.getsize(ROOT+tid+".js")//1024, "KB light")
