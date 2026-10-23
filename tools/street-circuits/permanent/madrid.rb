{
  id: "madrid", name: "Madring", short: "Madrid", place: "Madrid, Spain", tz: "Europe/Madrid",
  center: [40.4655, -3.6150], radius: 0.022,
  # Madring is half purpose-built track, half public streets. OpenStreetMap (Oct 2026) maps only the new parts as raceway,
  # so way 9000002 is stitched into osm/madrid.json: the raceway pieces plus the streets between them, routed to match the
  # official 2026 fan map (5.44 km against the official 5.416 km).
  circuit: [9000002], pit: 1552567031, pit_slice: [0, 10],
  tw: 3, official_mi: "5.416 km", length: "5.416 km (3.365 mi)", opened: 2026, nturns: 22,
  corner_labels: [["La Monumental", 40.48063, -3.6237, true]],
  blurb: "Madring: a 5.416 km, 22-turn hybrid circuit, part purpose-built track and part public streets, around the IFEMA fairgrounds and the Valdebebas district of Madrid, with the steeply banked La Monumental corner. Home of the Spanish Grand Prix from 2026.",
  facts: { "Signature sections" => "La Monumental (banked)", "Venue data" => "Circuit and pit lane from OpenStreetMap; the street sections were joined along the roads shown on the official 2026 fan map. Roads, buildings and lots from OpenStreetMap. Fan facilities are placed from the official 2026 fan map." },
  events: [{ "d" => "2027-09-10", "e" => "Spanish Grand Prix", "s" => "Formula 1", "t" => 3 }]
}
