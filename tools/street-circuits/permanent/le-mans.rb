# Circuit de la Sarthe (Le Mans). Part permanent circuit, part public road (D338 Mulsanne straight, Mulsanne-Arnage road): the lap is a list of coordinates
# (tools/street-circuits/le-mans-lap.json) made from the draft routed along OpenStreetMap roads, with the spurs the router drove into the Mulsanne and
# Arnage roundabouts cut out and the Maison Blanche detour replaced by OpenStreetMap's own Virage Corvette + Chicane Maison Blanche pieces. It measures
# 13.59 km against the official 13.626 km. Corner labels use only the names OpenStreetMap gives the pieces of the lap.
{
  id: "le-mans", name: "Circuit de la Sarthe", short: "Le Mans", place: "Le Mans, France", tz: "Europe/Paris",
  center: [47.9375, 0.2250], radius: 0.0285, circuit_file: "le-mans-lap.json", smooth: 1, keep_within_m: 900,
  skip_names: /Office|Shop|Storage|Work Shop|Garages|Leader Board|Cahaba|River|Conservation|Service technique|Marvingt|Worker Camp|Paddock CIK/i,
  pit: [258179494, 849478718, 354149765, 777192900, 777192901, 257063576],
  official_mi: "13.626 km", length: "13.626 km (8.467 mi)", opened: 1923, nturns: 38,
  corner_labels: [
    ["Dunlop chicane", 47.95696, 0.21093, true], ["Esses", 47.95999, 0.21761, true], ["Tertre Rouge", 47.96187, 0.22143, true],
    ["Hunaudières straight", 47.9525, 0.22895, true], ["Daytona chicane", 47.94432, 0.23291, true], ["Michelin chicane", 47.92801, 0.24221, true],
    ["Mulsanne", 47.91357, 0.24342, true], ["Arnage", 47.92146, 0.21560, true], ["Porsche curves", 47.93311, 0.20909, true],
    ["Corvette", 47.93985, 0.21054, true], ["Ford chicane", 47.94708, 0.20842, true]
  ],
  blurb: "The Circuit de la Sarthe at Le Mans, France: 13.626 km with 38 turns, part permanent circuit and part public roads, home of the 24 Hours of Le Mans (Jun 12-13, 2027) in the FIA World Endurance Championship. The Hunaudières (Mulsanne) straight, Tertre Rouge, Arnage and the Porsche curves are its best-known sections.",
  facts: { "Signature sections" => "The Hunaudières (Mulsanne) straight with its two chicanes, Tertre Rouge, Arnage, the Porsche curves and the Ford chicane before the pit straight",
           "Venue data" => "The lap, pit lane and roads come from OpenStreetMap (the public-road sections follow the road centreline, so the line measures about 13.59 km against the official 13.626 km). Grandstands, gates, food, restrooms, parking and camping are not on the map yet: they need the Automobile Club de l'Ouest's official spectator map." },
  events: [{ "d" => "2027-06-12", "e" => "24 Hours of Le Mans", "s" => "FIA World Endurance Championship", "t" => 2 }]
}
