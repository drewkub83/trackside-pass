require "json"
here = File.dirname(__FILE__)
fac = JSON.parse(File.read(File.join(here, "cota_facilities.json"), encoding: "UTF-8"))
osm = JSON.parse(File.read(File.join(here, "..", "osm", "raceway-cota.json"), encoding: "UTF-8"))["elements"]
# every mapped piece of the circuit is named "Turn N": put the turn label in the middle of its piece
turn_labels = osm.select { |w| w["type"] == "way" && w["geometry"] && w["tags"] && w["tags"]["name"].to_s =~ /\ATurn (\d+)\z/ }.map do |w|
  g = w["geometry"]; m = g[g.size / 2]; ["T" + w["tags"]["name"][/\d+/], m["lat"], m["lon"], true]
end.sort_by { |t| t[0][1..-1].to_i }
{
  id: "cota", name: "Circuit of the Americas", short: "COTA", place: "Austin, Texas", tz: "America/Chicago",
  center: [30.1335, -97.6345], radius: 0.026,
  circuit: [118258940, 118258942, 118258947, 118258943, 118258961, 118258928, 514836010, 118258933, 118258937, 118258952, 514836011, 118256423, 118258957, 118258959,
            118258939, 118258950, 118258954, 118258956, 514758200, 514820043, 514820041, 118258930, 118258958, 118258962, 118258931, 118258929, 118258946, 118258935, 118258951],
  pit: 514836373, smooth: 1, rules: [], osm_lots: false,
  skip_ids: [514820045, 514845765, 1434351310, 1482931764, 741114682, 1382286273],
  official_mi: "3.426", length: "3.426 mi", opened: 2012, nturns: 20,
  corner_labels: turn_labels,
  extra_pois: fac["pois"].map { |n, k, d, la, lo, sh| [n, k, d, la, lo, nil, sh] },
  extra_lots: fac["lots"],
  blurb: "A 3.426-mile, 20-turn road course outside Austin, Texas, opened in 2012 and best known for Formula 1 and MotoGP. The circuit climbs steeply to a blind Turn 1, then flows through a fast esses section before a long back straight into the Turn 12 hairpin. In 2027 it hosts the first Texas 8 Hour.",
  facts: { "Signature sections" => "The climb to Turn 1, the Turn 3 to 6 esses, the long back straight into Turn 12, and the Turn 16 to 18 sequence", "Elevation" => "About 133 feet of elevation change, with a steep climb up to Turn 1", "Landmark" => "The Tower Observation Deck, with views over the circuit", "Campus" => "A large Grand Plaza, Fan Field and the Germania Insurance Amphitheater" },
  events: [{ "d" => "2027-05-07", "e" => "Texas 8 Hour", "s" => "GT World Challenge America Powered by AWS, 8 hours", "t" => 3 }]
}
