# One command for the mechanical steps of adding a circuit once its spec is in make_config.py SPECS and its OpenStreetMap data is downloaded
# (fetch_track_osm.py <id> <lat> <lon> [radius]):  python3 tools/track-data/new_track.py <id>
# config -> build -> split -> crossings -> walking grid -> grandstands, then prints how much of the map a walker can reach.
import sys, os, subprocess
HERE=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(HERE,"..",".."))
def run(*a): 
    r=subprocess.run(list(a),cwd=REPO,capture_output=True,text=True); print("$"," ".join(a[1:])); print((r.stdout+r.stderr).strip()[-900:]); return r.returncode==0
tid=sys.argv[1]; PY=sys.executable
ok=run(PY,"tools/track-data/make_config.py",tid) and run("ruby","tools/street-circuits/build_permanent.rb",f"tools/street-circuits/permanent/{tid}.rb","--replace" if os.path.exists(os.path.join(REPO,"data",tid+".js")) else "--no-register" if False else "--replace") 
if not ok: sys.exit("build failed")
run(PY,"tools/track-data/split_tracks.py",tid); run(PY,"tools/track-data/add_cross.py",tid,"--write")
sys.path.insert(0,HERE); import build_route as B
T=B.build(tid,rle=True); B.save(tid,T); print("walking grid",T["route"]["nx"],"x",T["route"]["ny"])
run(PY,"tools/track-data/osm_stands.py",tid,"--write")
