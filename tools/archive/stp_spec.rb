# encoding: utf-8
# Draft spec for the Firestone Grand Prix of St. Petersburg, made from the official 2026 festival map (maps/st-petersburg-festival-map-2026.pdf)
# fitted onto OpenStreetMap streets (see stp_fit.rb). Open the result in the Track Builder to correct anything, then build with build_track.rb.
require File.join(__dir__, "stp_fit.rb")

els = JSON.parse(File.read(File.join(__dir__, "osm/stp-lite.json")))["elements"]
road = els.select { |w| w["type"] == "way" && w["geometry"] && w["tags"] && (w["tags"]["highway"] || w["tags"]["aeroway"] =~ /runway|taxiway/) }
nodes = road.flat_map { |w| next [] if %w[footway steps path pedestrian cycleway].include?(w["tags"]["highway"]); w["geometry"].map { |g| [g["lat"], g["lon"]] } }
runway = els.find { |w| w["type"] == "way" && w["tags"] && w["tags"]["aeroway"] == "runway" && w["tags"]["ref"].to_s =~ /7/ }
rw = runway["geometry"].map { |g| [g["lat"], g["lon"]] }
rw.reverse! if rw.first[1] < rw.last[1]            # NE end first ... SW end last
snap_node = ->(p, r = 25) { q = nodes.min_by { |n| dm(p, n) }; dm(p, q) <= r ? q : p }

# circuit outline in festival-map pixels, in race direction from the start/finish line
PX = [
  [:r, "S/F", 1290, 660], [:r, nil, 1400, 870], [:r, nil, 1490, 1045], [:c, "T1", 1488, 1105],
  [:c, "T2", 1330, 1110], [:p, nil, 1285, 1160], [:p, nil, 1235, 1225], [:c, "T3", 1203, 1280],
  [:c, "T4", 640, 1280], [:c, "T5", 633, 1153], [:c, "T6", 533, 1148], [:c, "T7", 500, 1198], [:c, "T8", 372, 1198], [:c, "T9", 376, 1055],
  [:p, nil, 450, 1062], [:p, nil, 780, 1075], [:p, nil, 900, 1055], [:p, nil, 1000, 1005], [:p, nil, 1075, 935], [:p, nil, 1112, 880], [:c, "T10", 1119, 845],
  [:p, nil, 1095, 800], [:p, nil, 1040, 650], [:p, nil, 1018, 560], [:c, "T11", 1020, 507], [:c, "T12", 1035, 430],
  [:p, nil, 1000, 340], [:p, nil, 958, 280], [:c, "T13", 950, 245], [:p, nil, 975, 195], [:c, "T14", 1035, 205], [:r, nil, 1090, 268],
]
path = []; turns = []
PX.each do |kind, name, x, y|
  ll = px2ll(x, y)
  ll = snap_node.(ll) if kind == :c
  path << ll
  turns << { "n" => name[1..-1].to_i, "lat" => ll[0].round(6), "lon" => ll[1].round(6) } if name =~ /\AT(\d+)\z/
end
# the two runway legs sit on the runway centre line
def to_runway(rw, p) snap_to_poly(p, rw)[0] end
path.map!.with_index { |p, i| PX[i][0] == :r ? to_runway(rw, p) : p }
path = path.map { |p| p.map { |v| v.round(6) } }
sf = path[0]
ring = path + [path[0]]
puts "circuit points #{path.size}, lap %.0f m = %.2f mi (official 1.8 mi)" % [poly_len(ring), poly_len(ring) / 1609.34]
puts "S/F #{sf.inspect}"

# pit lane: alongside the front straight, on the north-west side
pit = [[1128, 470], [1200, 590], [1262, 700], [1325, 810]].map { |x, y| px2ll(x, y).map { |v| v.round(6) } }

P = lambda do |n, k, d, x, y| ll = px2ll(x, y); { "n" => n, "k" => k, "d" => d, "lat" => ll[0].round(6), "lon" => ll[1].round(6) } end
pois = [
  P.("Gate 1", "gate", "Main entrance, 1st Ave SE and 1st St SE", 500, 1250),
  P.("Gate 5", "gate", "Entrance at 5th Ave S", 1207, 1405),
  P.("Gate 8", "gate", "Credentials and RV Club wristbands only", 1690, 1170),
  P.("Credential Gate", "gate", "", 1333, 1283),
  P.("Ticket Booth (Gate 1)", "info", "", 570, 1257),
  P.("Ticket Booth and Will Call (Gate 5)", "info", "", 1206, 1478),
  P.("Credential Center", "info", "USF St. Petersburg University Student Center", 1478, 1512),
  P.("First Aid", "med", "", 1057, 543),
  P.("First Aid", "med", "Next to Al Lang Stadium", 742, 1187),
  P.("First Aid", "med", "By the Media Center", 1022, 1055),
  P.("First Aid", "med", "Near the airport terminal", 1355, 1235),
  P.("Video Board", "screen", "", 1272, 568), P.("Video Board", "screen", "", 1057, 727), P.("Video Board", "screen", "", 1078, 817),
  P.("Video Board", "screen", "Turn 10", 1058, 860), P.("Video Board", "screen", "", 1393, 817), P.("Video Board", "screen", "Turn 1", 1500, 1008),
  P.("Video Board", "screen", "Turns 5 to 6", 608, 1173), P.("Video Board", "screen", "Speed Zone", 660, 1087),
  P.("Official Merchandise", "merch", "", 1147, 712), P.("Official Merchandise", "merch", "Festival Plaza", 1092, 915),
  P.("Official Merchandise", "merch", "", 1282, 968), P.("Official Merchandise", "merch", "Beer Garden side", 685, 1217),
  P.("Information", "info", "Information services", 1182, 822), P.("Information", "info", "Pioneer Park", 482, 1148), P.("Information", "info", "Team and corporate hospitality", 1182, 1210),
  P.("Bridge (Turn 6)", "cross", "Firestone pedestrian bridge over the circuit", 521, 1160),
  P.("Bridge (Turn 3)", "cross", "Firestone pedestrian bridge over the circuit", 1207, 1252),
  P.("Bridge (Turn 2)", "cross", "Velo pedestrian bridge over the circuit", 1285, 1158),
  P.("Accessible Crossing (Turn 7)", "cross", "Accessible crossing, times are posted by the event", 535, 1203),
  P.("Accessible Crossing (Turn 2)", "cross", "Accessible crossing, times are posted by the event", 1317, 1160),
  P.("Accessible Crossing (Turn 11)", "cross", "Accessible crossing, times are posted by the event", 1050, 516),
  P.("Grandstand PL 3", "stand", "Pit lane grandstand", 1165, 630), P.("Grandstand PL 4", "stand", "Pit lane grandstand", 1205, 710),
  P.("Grandstand PL 5", "stand", "Pit lane grandstand", 1240, 775), P.("Grandstand PL 6", "stand", "Pit lane grandstand", 1278, 850),
  P.("Grandstand PL 7", "stand", "Pit lane grandstand", 1322, 930),
  P.("Turn 1 Grandstand", "stand", "", 1430, 1143), P.("Turn 10 Grandstand", "stand", "", 1140, 775),
  P.("Beer Garden (Turn 4)", "food", "Beer garden", 692, 1262), P.("Beer Garden and Victory Garden", "food", "Beer garden with general admission viewing", 1358, 985),
  P.("Firestone Fan Experience", "info", "", 1085, 610), P.("Trackside Suites", "info", "Trackside suites along pit lane", 1180, 600),
  P.("Festival Plaza", "info", "", 1080, 960), P.("Dali Museum", "info", "Salvador Dali Museum", 1185, 915),
  P.("Media Center", "info", "St. Pete Clearwater Media Center at the Mahaffey Theater", 990, 1035),
  P.("Victory Circle", "info", "Victory Circle and the Dan Wheldon monument", 1315, 1030),
  P.("Firestone INDYCAR Paddock", "info", "", 1170, 1130), P.("INDYCAR Paddock", "info", "", 1220, 1030),
  P.("Team and Corporate Hospitality", "info", "", 1078, 1215), P.("Pass Redemption and Customer Service", "info", "", 1060, 1110),
  P.("Horse Soldier Waterside Club", "info", "", 1025, 478), P.("Yacht Club Entrance", "gate", "Must have parking pass and event ticket", 355, 1030),
  P.("Water Taxi", "info", "", 870, 880), P.("Airport Terminal", "info", "Albert Whitted Airport terminal", 1370, 1195),
  P.("Speed Zone", "stand", "General admission viewing", 573, 1097), P.("Speed Zone", "stand", "General admission viewing", 680, 1105),
  P.("Pioneer Park", "stand", "General admission viewing", 435, 1140), P.("South Paddock", "info", "", 1440, 850), P.("South Paddock", "info", "", 1580, 1095),
  P.("Al Lang Stadium", "info", "", 848, 1160),
]
lots = [
  { "n" => "Yellow Parking", "c" => "#FBC02D", "d" => "Parking", "poly" => [[1135, 155], [1385, 155], [1390, 455], [1235, 460]].map { |x, y| px2ll(x, y).map { |v| v.round(6) } } },
]

spec = {
  "id" => "st-petersburg", "name" => "Downtown St. Petersburg Street Circuit", "short" => "St. Petersburg", "place" => "St. Petersburg, Florida",
  "tz" => "America/New_York", "length" => "1.8 mi", "opened" => 2003, "officialMiles" => 1.8, "nturns" => 14, "riverSouth" => false,
  "blurb" => "IndyCar's season opener on the downtown waterfront, with the Albert Whitted Airport runway as the front straight.",
  "facts" => { "Race weekend" => "Built on city streets and the airport runway every March", "Front straight" => "Runway 7/25 of Albert Whitted Airport",
               "Signature sections" => "Turn 1 at the end of the runway, the Bayshore Drive run to Turn 10, the Turn 13 and 14 hairpin loop", "Crossings" => "Pedestrian bridges at Turns 2, 3 and 6" },
  "events" => [{ "d" => "2027-03-05", "e" => "Firestone Grand Prix of St. Petersburg", "s" => "NTT INDYCAR SERIES", "t" => 3 }],
  "circuit" => { "closed" => true, "path" => path, "sf" => sf, "turns" => turns.sort_by { |t| t["n"] }, "pit" => pit },
  "pois" => pois, "lots" => lots,
  "_note" => "Draft from the official 2026 festival map, positions approximate (about 20 m). Correct in the Track Builder."
}
File.write(File.join(__dir__, "st-petersburg.spec.json"), JSON.generate(spec))
puts "wrote st-petersburg.spec.json: #{pois.size} badges, #{turns.size} turns"
