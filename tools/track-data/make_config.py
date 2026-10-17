# Write tools/street-circuits/permanent/<id>.rb for build_permanent.rb from a short spec. Corner labels come from the
# names OpenStreetMap gives the pieces of the lap, so nothing is invented.
#   python3 tools/track-data/make_config.py   (edit SPECS below)
import json, math, os, re, sys
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

 dict(id="misano", name="Misano World Circuit Marco Simoncelli", short="Misano", place="Misano Adriatico, Italy", tz="Europe/Rome", center=[43.9614,12.6838],
  circuit=[1784572,624263852,624263860,624263859,624263858,624263845,624263847,624263844,624263857,624263846,624263856,624263851,624263855,624263850,624263854,624263849,624263853,624263848],
  pit=[624348305,624348303], official="4.226 km", length="4.226 km (2.63 mi)", opened=1972, nturns=16, lap="1:33.138 (2011)",
  rename={},
  blurb="The Misano World Circuit Marco Simoncelli on Italy's Adriatic coast: 4.226 km and 16 turns, with the fast Curvone and the stop-and-go Variante del Parco. It hosts the Sprint Cup round of the 2027 GT World Challenge Europe season on July 16-18.",
  sig="Curvone, Curva del Carro, Variante del Parco, Variante Arena",
  events=[dict(d="2027-07-16",e="GT World Challenge Europe: Misano (Sprint Cup)",s="GT World Challenge Europe Powered by AWS, Sprint Cup",t=3)]),
 dict(id="magny-cours", name="Circuit de Nevers Magny-Cours (Grand Prix circuit)", short="Magny-Cours", place="Magny-Cours, France", tz="Europe/Paris", center=[46.8642,3.1633],
  circuit=[63951656],
  pit=195975305, official="4.411 km", length="4.411 km (2.74 mi)", opened=1960, nturns=17, lap=None,
  rename={"Circuit de Nevers Magny-Cours":None},
  blurb="The Grand Prix circuit at Magny-Cours in central France: 4.411 km and 17 turns, home of the French Grand Prix from 1991 to 2008. It hosts the Sprint Cup round of the 2027 GT World Challenge Europe season on July 30 to August 1.",
  sig=None,
  events=[dict(d="2027-07-30",e="GT World Challenge Europe: Magny-Cours (Sprint Cup)",s="GT World Challenge Europe Powered by AWS, Sprint Cup",t=3)]),
 dict(id="zandvoort", name="Circuit Zandvoort", short="Zandvoort", place="Zandvoort, Netherlands", tz="Europe/Amsterdam", center=[52.3888,4.5409],
  circuit=[1311566937,1313671991,1311566939,1313671992,1311566940,1311710253,24626850,1311765615,1311802779,1311822339,1311822340,1311822341,1311879069,1311522211,1311522212,1313671989,1311522213,1313671990,1311522214,1311522215,1311522216,1311522217,1311522218,1311566938],
  pit=38144527, official="4.307 km", length="4.307 km (2.68 mi)", opened=1948, nturns=14, lap=None,
  rename={"CM.com Circuit Zandvoort":None},
  blurb="Circuit Zandvoort in the dunes of the Dutch North Sea coast: 4.307 km and 14 turns, from Tarzanbocht at the end of the pit straight to the banked Hugenholtzbocht and Arie Luyendykbocht. It hosts the Sprint Cup round of the 2027 GT World Challenge Europe season on September 17-19.",
  sig="Tarzanbocht, Hugenholtzbocht, Arie Luyendykbocht, Scheivlak",
  events=[dict(d="2027-09-17",e="GT World Challenge Europe: Zandvoort (Sprint Cup)",s="GT World Challenge Europe Powered by AWS, Sprint Cup",t=3)]),
 dict(id="hungaroring", name="Hungaroring", short="Hungaroring", place="Mogyor\u00f3d, near Budapest, Hungary", tz="Europe/Budapest", center=[47.5789,19.2486],
  circuit=[231328650,1333262244],
  pit=231417580, official="4.381 km", length="4.381 km (2.72 mi)", opened=1986, nturns=14, lap=None,
  rename={"Hungaroring":None},
  blurb="The Hungaroring near Budapest: 4.381 km and 14 turns in a natural bowl, a tight, twisty lap that has hosted the Hungarian Grand Prix since 1986. It hosts the Sprint Cup round of the 2027 GT World Challenge Europe season on October 1-3.",
  sig=None,
  events=[dict(d="2027-10-01",e="GT World Challenge Europe: Budapest (Sprint Cup)",s="GT World Challenge Europe Powered by AWS, Sprint Cup",t=3)]),

 dict(id="mexico-city", name="Aut\u00f3dromo Hermanos Rodr\u00edguez", short="Mexico City", place="Mexico City, Mexico", tz="America/Mexico_City", center=[19.4042,-99.0907],
  circuit=[772754608,1128592398,1128592396,772755824,823823141,823823140,772755821,1313598528,772754605],
  pit=[638504647,772763791], official="4.304 km", length="4.304 km (2.67 mi)", opened=1959, nturns=17, lap=None,
  rename={"Aut\u00f3dromo Hermanos Rodr\u00edguez":None},
  blurb="The Aut\u00f3dromo Hermanos Rodr\u00edguez in Mexico City: 4.304 km and 17 turns in the Magdalena Mixhuca city park, about 2,240 m above sea level, where the thin air changes how the cars behave. The lap runs through the Foro Sol baseball stadium. It hosts the Mexico City Grand Prix on Oct 30 to Nov 1, 2026.",
  sig=None,
  events=[dict(d="2026-10-30",e="Mexico City Grand Prix",s="Formula 1",t=3),dict(d="2027-10-29",e="Mexico City Grand Prix",s="Formula 1",t=3)]),
 dict(id="interlagos", name="Aut\u00f3dromo Jos\u00e9 Carlos Pace (Interlagos)", short="Interlagos", place="S\u00e3o Paulo, Brazil", tz="America/Sao_Paulo", center=[-23.7036,-46.6997],
  circuit=[138566996,807691486,138567000,138566997,138566994,138567002,190164735,138566998,138566993,190164734,138566999,138567236,189535472,190164736,138567242,190164737,138567239,138567234,190164733,138567241,131439569,189535473,807691487,138566995,138567001],
  pit=33779109, official="4.309 km", length="4.309 km (2.68 mi)", opened=1940, nturns=15, lap=None,
  rename={"Pinherinho":"Pinheirinho","Arquibancadas":None,"S do Senna":"Senna S","Reta Oposta":"Reta Oposta (back straight)"},
  blurb="Aut\u00f3dromo Jos\u00e9 Carlos Pace, known as Interlagos, in S\u00e3o Paulo: 4.309 km and 15 turns run anticlockwise over rolling ground, from the Senna S just after the start down to the Descida do Lago and the long climb back to the pit straight. It hosts the S\u00e3o Paulo Grand Prix on Nov 6-8, 2026.",
  sig="Senna S, Descida do Lago, Ferradura, Pinheirinho, Bico de Pato, Jun\u00e7\u00e3o, Reta Oposta",
  events=[dict(d="2026-11-06",e="S\u00e3o Paulo Grand Prix",s="Formula 1",t=3),dict(d="2027-11-05",e="S\u00e3o Paulo Grand Prix",s="Formula 1",t=3)]),
 dict(id="lusail", name="Lusail International Circuit", short="Lusail", place="Lusail, Qatar", tz="Asia/Qatar", center=[25.4900,51.4542],
  circuit=[152483595,1553605580],
  pit=[1299064755,1037707300], official="5.419 km", length="5.419 km (3.37 mi)", opened=2004, nturns=16, lap=None,
  rename={},
  blurb="Lusail International Circuit north of Doha: 5.419 km and 16 turns of fast, flowing corners, built for MotoGP in 2004 and used by Formula 1 since 2021. It hosts the Qatar Grand Prix on Nov 27-29, 2026, with the race starting in the evening under floodlights.",
  sig=None,
  events=[dict(d="2026-11-27",e="Qatar Grand Prix",s="Formula 1",t=3),dict(d="2027-12-03",e="Qatar Grand Prix",s="Formula 1",t=3)]),
 dict(id="yas-marina", name="Yas Marina Circuit", short="Abu Dhabi", place="Yas Island, Abu Dhabi, UAE", tz="Asia/Dubai", center=[24.4672,54.6031],
  circuit=[168477013,1469184731,1469184732,188337196,1255169703,1255169704],
  pit=[188471238], official="5.281 km", length="5.281 km (3.28 mi)", opened=2009, nturns=16, lap=None,
  rename={"Yas Marina Circuit":None,"YAS Marina Circuit":None},
  blurb="Yas Marina Circuit on Yas Island, Abu Dhabi: 5.281 km and 16 turns, with the pit lane exit running through a tunnel under the track. It hosts the season-ending Abu Dhabi Grand Prix on Dec 4-6, 2026, with the race starting at 17:00 local time and finishing under floodlights.",
  sig=None,
  events=[dict(d="2026-12-04",e="Abu Dhabi Grand Prix",s="Formula 1",t=3),dict(d="2027-12-10",e="Abu Dhabi Grand Prix",s="Formula 1",t=3)]),
 dict(id="las-vegas", name="Las Vegas Strip Circuit", short="Las Vegas", place="Las Vegas, Nevada", tz="America/Los_Angeles", center=[36.1147,-115.1700],
  circuit=[9000001], pit=[1223479152], official="6.201 km", length="6.201 km (3.853 mi)", opened=2023, nturns=17, lap=None,
  rename={"Las Vegas Strip Circuit (bacinger/f1-circuits outline)":None},
  blurb="The Las Vegas Strip Circuit: 6.201 km and 17 turns on public roads, down Las Vegas Boulevard past the Bellagio, Caesars Palace and the Sphere. A night race for the Las Vegas Grand Prix on Nov 19-21, 2026, with the race starting at 20:00 local time on Saturday.",
  sig=None,
  events=[dict(d="2026-11-19",e="Las Vegas Grand Prix",s="Formula 1",t=3),dict(d="2027-11-18",e="Las Vegas Grand Prix",s="Formula 1",t=3)]),
]
def L(g): return sum(math.hypot((b["lat"]-a["lat"])*110900,(b["lon"]-a["lon"])*111320*math.cos(math.radians(a["lat"]))) for a,b in zip(g,g[1:]))
def rb(v):
    if v is None: return "nil"
    if isinstance(v,bool): return "true" if v else "false"
    if isinstance(v,(int,float)): return str(v)
    if isinstance(v,str): return json.dumps(v,ensure_ascii=False)
    if isinstance(v,list): return "["+", ".join(rb(x) for x in v)+"]"
    if isinstance(v,dict): return "{ "+", ".join(f"{rb(k)} => {rb(x)}" for k,x in v.items())+" }"
ONLY=set(a for a in sys.argv[1:] if not a.startswith('-'))   # python3 make_config.py misano zandvoort  -> write only those (never overwrite a hand-edited config)
for S in SPECS:
    if ONLY and S['id'] not in ONLY: continue
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
