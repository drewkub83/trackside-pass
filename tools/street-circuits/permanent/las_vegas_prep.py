"""Las Vegas has no complete circuit in OpenStreetMap (only some raceway pieces and the pit lane). This adds the lap as a synthetic way (id 9000001)
to tools/street-circuits/osm/las-vegas.json, from permanent/las-vegas-circuit.geojson: the 2023 Las Vegas Strip Circuit outline from
github.com/bacinger/f1-circuits (MIT licence, 100 points, 6.21 km; 93% of the points lie within 8 m of an OpenStreetMap road). Run once before
`ruby tools/street-circuits/build_permanent.rb tools/street-circuits/permanent/las-vegas.rb` (python3 tools/track-data/fetch_track_osm.py las-vegas 36.1147 -115.1700 0.02 first)."""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
co = json.load(open(os.path.join(H, "las-vegas-circuit.geojson")))
co = (co["features"][0] if "features" in co else co)["geometry"]["coordinates"]
if co[0] == co[-1]: co = co[:-1]
p = os.path.join(H, "..", "osm", "las-vegas.json"); d = json.load(open(p))
d["elements"] = [e for e in d["elements"] if e.get("id") != 9000001] + [{"type": "way", "id": 9000001, "tags": {"highway": "raceway", "name": "Las Vegas Strip Circuit (bacinger/f1-circuits outline)"}, "geometry": [{"lat": la, "lon": lo} for lo, la in co]}]
json.dump(d, open(p, "w")); print("added way 9000001 with", len(co), "points")
