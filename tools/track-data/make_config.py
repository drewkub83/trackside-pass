# Write tools/street-circuits/permanent/<id>.rb for build_permanent.rb from a short spec. Corner labels come from the
# names OpenStreetMap gives the pieces of the lap, so nothing is invented.
#   python3 tools/track-data/make_config.py   (edit SPECS below)
import json, math, os, re
HERE=os.path.dirname(os.path.abspath(__file__)); PERM=os.path.join(HERE,"..","street-circuits","permanent")+"/"; OSM=os.path.join(HERE,"..","street-circuits","osm")+"/"
ENDURANCE="GT World Challenge Europe Powered by AWS, Endurance Cup"
SPECS=[
 dict(id="spa-francorchamps", name="Circuit de Spa-Francorchamps", short="Spa-Francorchamps", place="Stavelot, Belgium", tz="Europe/Brussels", center=[50.4372,5.9714],
  circuit=[24449918,126807113,175195997,126807111,126807112,1359025268,126807106,1359025267,126807103,126807101,126807109,126807116,175371353,175371365,126807100,176133746,126807114,176133745,178964809,126807105,637268672,613486590,126807099,175178443,175178448,126807110,126835639,126835637,126835638,1430527230],
  pit=323851541, official="7.004 km", length="7.004 km (4.35 mi)", opened=1921, nturns=21, lap="1:47.263 (2009)",
  rename={"Double Gauche":"Pouhon (Double Gauche)","Chicane":"Bus Stop chicane","Kemmel":"Kemmel Straight"},
  blurb="A 7.004 km lap through the forested hills of the Belgian Ardennes, and home of the CrowdStrike 24 Hours of Spa, the biggest GT race in the world. Eau Rouge and Raidillon, the Kemmel Straight and Blanchimont are among its best-known sections.",
  sig="Eau Rouge and Raidillon, the Kemmel Straight, Pouhon, Blanchimont",
  events=[dict(d="2027-06-24",e="CrowdStrike 24 Hours of Spa",s="GT World Challenge Europe Powered by AWS, Endurance Cup (24 hours)",t=4,support=["GT4 European Series","GT3 Revival Series","Mustang Challenge Spa Invitational"])]),
 dict(id="paul-ricard", name="Circuit Paul Ricard", short="Paul Ricard", place="Le Castellet, France", tz="Europe/Paris", center=[43.2506,5.7919],
  circuit=[229454179,1282557464,1282552677,686700676,686700678,686700682,686700685,686700689,686700844,686705495,686705498,686705499,1209342415,790806550,790806552,686705508,686705513,686705515,686705517,1209342418,686705519],
  pit=799477739, official="5.791 km", length="5.791 km (3.60 mi)", opened=1970, nturns=15, lap="1:39.914",
  rename={"Circuit Paul Ricard":None},
  blurb="A 5.791 km circuit at Le Castellet in the south of France, with a long Mistral straight. It opens the 2027 GT World Challenge Europe season with a six-hour race on the Saturday evening.",
  sig="The Mistral straight, Courbe de Signes, the S de la Verrerie",
  events=[dict(d="2027-04-15",e="GT World Challenge Europe: Paul Ricard",s="GT World Challenge Europe Powered by AWS, Endurance Cup (6 hours)",t=4)]),
 dict(id="nurburgring", name="Nürburgring Grand Prix Circuit", short="Nürburgring", place="Nürburg, Germany", tz="Europe/Berlin", center=[50.3356,6.9475],
  circuit=[1079809244,820679447,820679448,820679446,1113009623,820679445,820330155,820330154,1113009624,820330153,820330152,1079809245,1443047845,1443047844,27852990,1149161211,1149161210,1149161208,1443047846,1443047847],
  pit=30815119, official="5.137 km", length="5.137 km (3.19 mi)", opened="1927 (Grand Prix circuit 1984)", nturns=17, lap="1:55.996",
  rename={"Anbindung zur Müllenbachschleife":None,"Anbindung zur Sprintstrecke":None,"Nürburgring Sprintstrecke":None},
  blurb="The Grand Prix circuit at the Nürburgring in Germany's Eifel region, beside the famous Nordschleife. It hosts the Endurance Cup round of the 2027 GT World Challenge Europe season.",
  sig="Ford-Kurve, Goodyear-Kehre, the Michael-Schumacher-S",
  events=[dict(d="2027-08-27",e="GT World Challenge Europe: Nürburgring",s=ENDURANCE,t=3)]),
 dict(id="portimao", name="Autódromo Internacional do Algarve", short="Portimão", place="Portimão, Portugal", tz="Europe/Lisbon", center=[37.2277,-8.6267],
  circuit=[511858150,511858549,363133201,511858548,511858547,363133187,511858546,511859284,363133194,511858536,363133190,511858533,511858543,511858539,511859291,511859290,511859289,363133193,511859287,511859288,511859286,363133197,511859285,511859282,363133196,511859283,363133198,363133195,363133199,511858148,363133200,511858147,363133191,511858146,511858151,511858149],
  pit=157790380, official="4.692 km", length="4.692 km (2.92 mi)", opened=2008, nturns=18, lap="1:31.404 (2009)",
  rename={"Autódromo Internacional do Algarve":None},
  blurb="The Autódromo Internacional do Algarve, a 4.692 km rollercoaster of a circuit in southern Portugal that opened in 2008. It hosts the Endurance Cup finale that closes the 2026 GT World Challenge Europe season.",
  sig="Curva Sagres, Curva Galp, Curva da Torre Vip",
  events=[dict(d="2026-10-15",e="GT World Challenge Europe: Portimão (Endurance Cup finale)",s=ENDURANCE,t=4)]),
 dict(id="brands-hatch", name="Brands Hatch Grand Prix Circuit", short="Brands Hatch", place="Fawkham, Kent, England", tz="Europe/London", center=[51.3569,0.2631],
  circuit=[25804993,25804999,25805047,171570163,25805049,171570165,25805072,171570251,171570252,820329315,25804641,171570166,25805012,25804653,171570161,25804669,171570167,25804846,25804824,25804875,820329314,171570164,25804935,171570162,4906929],
  pit=4906930, official="3.916 km", length="3.916 km (2.43 mi)", opened="1926 (Grand Prix circuit 1960)", nturns=9, lap="1:09.593 (1986)",
  rename={"Dingle Dell Corner":None,"Paddock Hill":"Paddock Hill Bend"},
  blurb="The Grand Prix circuit at Brands Hatch in Kent, England: 3.916 km and 9 turns, from the plunge of Paddock Hill Bend through Druids and Graham Hill Bend and out into the woods to Clearways. It opens the Sprint Cup season on May 1-2, 2027.",
  sig="Paddock Hill Bend, Druids, Graham Hill Bend, Clearways",
  events=[dict(d="2027-05-01",e="GT World Challenge Europe: Brands Hatch (Sprint Cup)",s="GT World Challenge Europe Powered by AWS, Sprint Cup",t=2)]),
 dict(id="imola", name="Autodromo Internazionale Enzo e Dino Ferrari", short="Imola", place="Imola, Italy", tz="Europe/Rome", center=[44.3439,11.7167],
  circuit=[1021771403,1025616645,1025616644,1025616638,1025616639,1021771405,1021771398,1025616640,1021771397,1021771396,1021771395,1025616642,1021771394,1025616643,1025616641,7920430,1021771393,1025616657,1021771400,1025616656,1021771399,1021771402,1025616655,1025616653,1025616654,1021771401,1025616652,1025616651,1025616650,1021771404,1025616648,1025616649],
  pit=196368195, official="4.909 km", length="4.909 km (3.05 mi)", opened=1953, nturns=19, lap=None,
  rename={},
  blurb="The Autodromo Internazionale Enzo e Dino Ferrari at Imola in Italy: 4.909 km and 19 turns, including Tamburello, Tosa, Acque Minerali and Rivazza. GT World plans a three-hour Endurance Cup race here on May 21-23, 2027, its first visit since 2022; the round is subject to final agreement.",
  sig="Tamburello, Tosa, Acque Minerali, Rivazza",
  events=[dict(d="2027-05-21",e="GT World Challenge Europe: Imola (Endurance Cup)",s="GT World Challenge Europe Powered by AWS, Endurance Cup (3 hours)",t=3)]),
 dict(id="barcelona-catalunya", name="Circuit de Barcelona-Catalunya", short="Barcelona", place="Montmeló, Spain", tz="Europe/Madrid", center=[41.5700,2.2611],
  circuit=[831804325,990483278,831804327,1560896065,1560896066,1560896061,1560896063,1560896062,921317983,921317984],
  pit=[33742214,178416729,178416733], official="4.655 km", length="4.655 km (2.89 mi)", opened=1991, nturns=16, lap=None,
  rename={"AZ":None},
  blurb="The Circuit de Barcelona-Catalunya at Montmeló, near Barcelona, drawn here with the final chicane (the 16-turn layout GT World lists). It closes the 2027 GT World Challenge Europe season with an Endurance Cup round.",
  sig=None,
  events=[dict(d="2027-10-22",e="GT World Challenge Europe: Barcelona",s=ENDURANCE,t=3)]),
]
def L(g): return sum(math.hypot((b["lat"]-a["lat"])*110900,(b["lon"]-a["lon"])*111320*math.cos(math.radians(a["lat"]))) for a,b in zip(g,g[1:]))
def rb(v):
    if v is None: return "nil"
    if isinstance(v,bool): return "true" if v else "false"
    if isinstance(v,(int,float)): return str(v)
    if isinstance(v,str): return json.dumps(v,ensure_ascii=False)
    if isinstance(v,list): return "["+", ".join(rb(x) for x in v)+"]"
    if isinstance(v,dict): return "{ "+", ".join(f"{rb(k)} => {rb(x)}" for k,x in v.items())+" }"
for S in SPECS:
    els=json.load(open(OSM+S["id"]+".json"))["elements"]; W={e["id"]:e for e in els if e.get("type")=="way"}
    labels=[]; seen=set()
    for wid in S["circuit"]:
        nm=W[wid].get("tags",{}).get("name","").strip()
        if not nm or nm in seen: continue
        seen.add(nm); 
        txt=S["rename"].get(nm,nm)
        if txt is None: continue
        g=W[wid]["geometry"]; m=g[len(g)//2]; labels.append([txt,round(m["lat"],6),round(m["lon"],6),True])
    cfg=f'''{{
  id: {rb(S["id"])}, name: {rb(S["name"])}, short: {rb(S["short"])}, place: {rb(S["place"])}, tz: {rb(S["tz"])},
  center: {rb(S["center"])}, circuit: {rb(S["circuit"])}, pit: {rb(S["pit"])},
  official_mi: {rb(S["official"])}, length: {rb(S["length"])}, opened: {rb(S["opened"])}, nturns: {S["nturns"]},
  corner_labels: {rb(labels)},
  blurb: {rb(S["blurb"])},
  facts: {{ "Signature sections" => {rb(S["sig"])}, "Venue data" => "Circuit, pit lane, roads, buildings and lots from OpenStreetMap. Fan facilities (grandstands, food, restrooms) are not on the map yet: they need the circuit's official fan map." }},
  events: {rb(S["events"])}
}}
'''
    open(PERM+S["id"]+".rb","w",encoding="utf-8").write(cfg); print("wrote",S["id"],len(labels),"labels:",[l[0] for l in labels])
