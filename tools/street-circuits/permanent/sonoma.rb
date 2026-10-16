require "json"
here = File.dirname(__FILE__)
fac = JSON.parse(File.read(File.join(here, "sonoma_facilities.json"), encoding: "UTF-8"))
turns = JSON.parse(File.read(File.join(here, "sonoma_turns.json"), encoding: "UTF-8"))
{
  id: "sonoma", name: "Sonoma Raceway", short: "Sonoma", place: "Sonoma, California", tz: "America/Los_Angeles",
  center: [38.1620, -122.4560], radius: 0.014,
  circuit: [505453048, 1494191149, 1494191150], pit: 230287120, smooth: 1,
corner_labels: turns.map { |n, la, lo| n == "T7" ? [n, 38.166588, -122.462277, true] : n == "T1" ? [n, 38.161872, -122.457858, true] : [n, la, lo, true] },
extra_pois: fac["pois"].map { |n, k, d, la, lo| [n, k, d + " (position from the 2026 event map, approximate)", la, lo, nil, nil] },
extra_lots: fac["lots"],
  official_mi: "2.52", length: "2.52 mi", opened: 1968, nturns: 12,
  blurb: "A 2.52-mile, 12-turn road course in the hills of California's wine country, opened in 1968. The circuit rolls over about 160 feet of elevation change, with a long front straight, blind crests and a mix of fast sweepers and tight corners. A quarter-mile drag strip shares the property.",
  facts: { "Signature sections" => "The Carousel, the Turn 7 hairpin, the long run down to the Turn 11 hairpin, and the pit straight", "Elevation" => "About 160 feet of elevation change", "Camping" => "Hillside camping around the circuit at the Carousel, Turn 7, Turn 8, Cougar Mountain, RV Terrace and 50 Acres", "Also on site" => "A championship drag strip and a karting center" },
  events: [{ "d" => "2027-04-02", "e" => "GT World Challenge America", "s" => "GT World Challenge America Powered by AWS, sprint weekend", "t" => 3 }]
}
