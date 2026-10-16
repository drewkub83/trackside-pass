require "json"
fac = JSON.parse(File.read(File.join(File.dirname(__FILE__), "phoenix_facilities.json"), encoding: "UTF-8"))
mk = fac["marks"]
{
  id: "phoenix", name: "Phoenix Raceway", short: "Phoenix", place: "Avondale, Arizona", tz: "America/Phoenix",
  center: [33.3747, -112.3105], circuit: 29333335, pit: 116681635, pit_slice: [30, 42], skip_ids: [1177494773, 1177494774],
  sf_at: mk["finish"], smooth: 2, min_lot_m2: 10**9, skip_names: /Office|Shop|Storage|Work Shop|Garages|Leader Board|Cahaba|River|Hillside/i,
  official_mi: "1.022", length: "1.022 mi", opened: 1964, nturns: 4,
  corner_labels: [["Turn 1", *mk["Turn 1"], true], ["Turn 2", *mk["Turn 2"], true], ["Turn 3", *mk["Turn 3"], true], ["Turn 4", *mk["Turn 4"], true],
                  ["Front stretch", 33.3727, -112.3105, true], ["Backstretch", 33.3767, -112.3105, true]],
  extra_pois: fac["pois"].map { |n, k, d, la, lo, sh| [n, k, d, la, lo, nil, sh] },
  extra_lots: fac["lots"],
  blurb: "A 1.022-mile oval in the desert west of Phoenix, opened in 1964. The low-banked corners and a distinctive dogleg make it one of the most unusual ovals on the schedule, and the desert setting means big open views of the mountains. IndyCar comes here for the second race of the 2027 season.",
  facts: { "Signature sections" => "The dogleg, Turns 1 and 2 beside the hillside, Turns 3 and 4 in front of the grandstand", "Layout" => "Oval, run counterclockwise. The grandstand, pit road and start/finish line are on the south side.", "Camping" => "RV and tent camping in the Flats and Trails areas west and south of the track", "Venue data" => "Positions from the track's public interactive map for its NASCAR weekend, so some amenities may differ on the IndyCar weekend. Check the event's own map." },
  events: [{ "d" => "2027-03-12", "e" => "Phoenix Raceway", "s" => "NTT INDYCAR SERIES", "t" => 2 }]
}
