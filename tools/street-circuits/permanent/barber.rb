require "json"
fac = JSON.parse(File.read(File.join(File.dirname(__FILE__), "barber_facilities.json"), encoding: "UTF-8"))
{
  id: "barber", name: "Barber Motorsports Park", short: "Barber", place: "Birmingham, Alabama", tz: "America/Chicago",
  center: [33.5325, -86.6193], circuit: 237456804, pit: 237584789, skip_ids: [590318002],
  official_mi: "2.38", length: "2.38 mi", opened: 2003, nturns: 17,
  corner_labels: fac["turns"].map { |n, la, lo| [n, la, lo, false] },
  extra_pois: fac["pois"].map { |n, k, d, la, lo, sh| [n, k, d, la, lo, nil, sh] },
  extra_lots: fac["lots"],
  blurb: "A 2.38-mile, 17-turn road course laid over the rolling hills outside Birmingham, Alabama, often called the Augusta National of racetracks for its setting and landscaping. It is IndyCar's first natural-terrain road course of the season. The Barber Vintage Motorsports Museum sits on the grounds beside the track.",
  facts: { "Signature sections" => "The rolling, natural-terrain layout, 17 turns with about 80 feet of elevation change", "Museum" => "Barber Vintage Motorsports Museum, on site", "Camping" => "RV camping on the hilltop and in the Upper D area, plus tent camping in Lot C", "Terrain" => "Hilly, so expect some walking uphill and down", "Venue data" => "Turn positions and facilities from the park's public interactive map (its MotoAmerica weekend), so some things may differ on the IndyCar weekend." },
  events: [{ "d" => "2027-04-02", "e" => "Barber Motorsports Park", "s" => "NTT INDYCAR SERIES", "t" => 3 }]
}
