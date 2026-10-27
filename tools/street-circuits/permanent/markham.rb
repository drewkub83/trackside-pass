# Streets of Markham (Unionville, Ontario): the IndyCar street circuit. The lap is the OpenStreetMap "Streets of Markham" way (3.44 km) with its
# bottom-left hook (an out-and-back the way draws beside the pit entry) replaced by the corner traced from the official 2026 circuit map
# (tools/street-circuits/markham-lap.json; the official length is 3.52 km). Turn numbers 1-12 follow the official 2026 event map; the pit lane is the
# west side of the rectangle between turns 12 and 1 (markham-pit.json).
{
  id: "markham", name: "Streets of Markham", short: "Markham", place: "Markham, Ontario", tz: "America/Toronto",
  center: [43.8525, -79.3175], radius: 0.012, circuit_file: "markham-lap.json", pit_file: "markham-pit.json", smooth: 1, keep_within_m: 900,
  official_mi: "3.52 km", length: "3.52 km (2.19 mi)", opened: 2026, nturns: 12,
  corner_labels: [
    ["Turn 1", 43.852059, -79.313201, true],
    ["Turn 2", 43.852313, -79.313042, true],
    ["Turn 3", 43.852808, -79.311347, true],
    ["Turn 4", 43.854489, -79.312145, true],
    ["Turn 5", 43.852365, -79.316991, true],
    ["Turn 6", 43.856011, -79.305307, true],
    ["Turn 7", 43.853524, -79.307464, true],
    ["Turn 8", 43.853397, -79.308841, true],
    ["Turn 9", 43.851083, -79.308871, true],
    ["Turn 10", 43.850321, -79.312399, true],
    ["Turn 11", 43.850324, -79.313006, true],
    ["Turn 12", 43.850353, -79.313937, true]
  ],
  blurb: "The Streets of Markham, a 3.52 km (2.19 mi) temporary street circuit with 12 turns in Markham's Unionville district, north-east of Toronto. NTT INDYCAR SERIES raced here for the first time in August 2026, replacing the Toronto street race; the 2027 round is on Aug 13-15. The lap follows Enterprise Boulevard, Unionville Gate and Kennedy Road before dropping to a pit straight beside the Unionville GO station.",
  facts: { "Signature sections" => "The run along Enterprise Boulevard to the Turn 5 hairpin, Unionville Gate and Kennedy Road (Turns 6 and 7), and the pit straight beside the Unionville GO station",
           "Venue data" => "The lap and roads come from OpenStreetMap and the official 2026 circuit map (the 2027 layout may differ). Parking, gates, grandstands and other facilities are placed from the official 2026 event map, which is not to scale, so their positions are approximate." },
  events: [{ "d" => "2027-08-13", "e" => "NTT INDYCAR SERIES: Streets of Markham", "s" => "NTT INDYCAR SERIES", "t" => 3 }]
}
