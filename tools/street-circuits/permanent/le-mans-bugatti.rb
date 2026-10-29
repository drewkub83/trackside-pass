# Circuit Bugatti (Le Mans), the 4.185 km circuit MotoGP uses: the lap is the OpenStreetMap pieces (Courbe Dunlop ... Garage Bleu S) chained in driving order
# (tools/street-circuits/le-mans-bugatti-lap.json); the closing stretch to the start is left to the builder.
{
  id: "le-mans-bugatti", name: "Circuit Bugatti", short: "Le Mans (Bugatti)", place: "Le Mans, France", tz: "Europe/Paris",
  center: [47.9559, 0.2127], radius: 0.0075, circuit_file: "le-mans-bugatti-lap.json", smooth: 1,
  pit: [354149765, 777192900, 777192901],
  official_mi: "4.185 km", length: "4.185 km (2.600 mi)", opened: 1966, nturns: 14,
  corner_labels: [],
  blurb: "The Circuit Bugatti at Le Mans, France: 4.185 km with 14 turns, the permanent circuit beside the 24 Hours circuit that hosts the MotoGP French Grand Prix (May 14-16, 2027).",
  facts: { "Venue data" => "The lap and pit lane come from OpenStreetMap; no fan facilities have been added yet." },
  events: [{ "d" => "2027-05-14", "e" => "Grand Prix of France", "s" => "MotoGP World Championship", "t" => 3, "support" => ["Moto2", "Moto3"] }]
}
