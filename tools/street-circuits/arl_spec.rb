# encoding: utf-8
# Draft spec for the Java House Grand Prix of Arlington: the official 2026 track map (maps/arlington-track-map-2026.jpg, north up) fitted onto real
# coordinates (arl_fit.rb) plus the event's own facility positions (permanent/arlington_facilities.json).
# The 2027 layout may differ; correct it in the Track Builder and rebuild with build_track.rb --replace.
require File.join(__dir__, "arl_fit.rb")

# circuit outline in track-map pixels, in race direction, from the start/finish line
PX = [
  [:s, 1012, 470], [:p, 1014, 390], [:p, 1010, 335], [:p, 995, 303], [:p, 975, 288], [:p, 940, 283], [:p, 915, 275], [:p, 901, 255], [:p, 899, 225], [:p, 897, 192], [:p, 888, 172],
  [:p, 860, 165], [:p, 780, 175], [:p, 630, 197], [:p, 480, 217], [:p, 395, 226], [:p, 365, 240], [:p, 360, 262], [:p, 368, 290], [:p, 372, 335], [:p, 385, 362], [:p, 375, 372],
  [:p, 340, 365], [:p, 305, 335], [:p, 270, 305], [:p, 225, 292], [:p, 190, 300], [:p, 165, 325], [:p, 158, 380], [:p, 170, 430], [:p, 190, 462], [:p, 205, 472],
  [:p, 160, 502], [:p, 110, 508], [:p, 85, 508], [:p, 84, 450], [:p, 85, 350], [:p, 87, 262], [:p, 95, 232],
  [:p, 130, 218], [:p, 240, 207], [:p, 330, 207], [:p, 480, 202], [:p, 630, 187], [:p, 780, 160], [:p, 880, 145], [:p, 955, 134], [:p, 1030, 133], [:p, 1100, 138], [:p, 1200, 152],
  [:p, 1300, 168], [:p, 1400, 178], [:p, 1500, 184], [:p, 1650, 188], [:p, 1740, 189], [:p, 1780, 200], [:p, 1797, 240], [:p, 1797, 320], [:p, 1785, 400], [:p, 1755, 470],
  [:p, 1700, 550], [:p, 1640, 650], [:p, 1600, 720], [:p, 1575, 752], [:p, 1540, 752], [:p, 1490, 725], [:p, 1420, 685], [:p, 1360, 670], [:p, 1300, 665], [:p, 1200, 662],
  [:p, 1100, 660], [:p, 1030, 657], [:p, 1008, 640], [:p, 1013, 600], [:p, 1013, 540],
]
path = PX.map { |_, x, y| px2ll(x, y).map { |v| v.round(6) } }
sf = path[0]
ring = path + [path[0]]
puts "circuit points #{path.size}, lap %.0f m = %.2f mi (official 2.73 mi)" % [poly_len(ring), poly_len(ring) / 1609.34]

# turn badges: the numbered circles of the official map, moved onto the nearest bit of circuit
TURNS = { 1 => [993, 272], 2 => [878, 268], 3 => [903, 157], 4 => [388, 248], 5 => [417, 377], 6 => [197, 325], 7 => [213, 481], 8 => [79, 522], 9 => [80, 230],
          10 => [1790, 185], 11 => [1817, 373], 12 => [1623, 783], 13 => [1372, 690], 14 => [1003, 640] }
turns = TURNS.map { |n, (x, y)| ll = px2ll(x, y); sp = snap_to_poly(ll, ring)[0]; { "n" => n, "lat" => sp[0].round(6), "lon" => sp[1].round(6) } }

# pit lane: the second black line beside the start/finish straight (split pit lane, entry near Turn 14, exit before Turn 1)
pit = [[1000, 640], [978, 630], [975, 560], [975, 470], [975, 380], [977, 330], [962, 296], [935, 286]].map { |x, y| px2ll(x, y).map { |v| v.round(6) } }

fac = JSON.parse(File.read(File.join(__dir__, "permanent/arlington_facilities.json"), encoding: "UTF-8"))
KEEP = %w[gate stand food rest med merch info cross screen]
pois = fac["pois"].map { |n, k, d, la, lo| { "n" => n, "k" => k, "d" => d.to_s == n ? "" : d.to_s, "lat" => la, "lon" => lo } }.select { |p| KEEP.include?(p["k"]) }

# parking lots: use the mapped car park outline near each published lot position, otherwise a small square
lots = []
osmf = File.join(__dir__, "osm/arlington.json")
parks = File.exist?(osmf) && File.size(osmf) > 1000 ? JSON.parse(File.read(osmf))["elements"].select { |w| w["type"] == "way" && w["tags"] && w["tags"]["amenity"] == "parking" && w["geometry"] && w["geometry"].size > 3 } : []
def inside?(p, poly) c = false; j = poly.size - 1
  poly.each_with_index { |q, i| pj = poly[j]; c = !c if ((q[0] > p[0]) != (pj[0] > p[0])) && (p[1] < (pj[1] - q[1]) * (p[0] - q[0]) / (pj[0] - q[0]) + q[1]); j = i }; c end
COLS = %w[#EC407A #AB47BC #5C6BC0 #29B6F6 #26A69A #9CCC65 #FFA726 #8D6E63]
fac["lots"].each_with_index do |(n, la, lo), i|
  polys = parks.map { |w| w["geometry"].map { |q| [q["lat"], q["lon"]] } }
  hit = polys.find { |g| inside?([la, lo], g) } || polys.select { |g| dm([la, lo], g.min_by { |q| dm([la, lo], q) }) < 45 }.min_by { |g| dm([la, lo], g.min_by { |q| dm([la, lo], q) }) }
  poly = if hit then hit.map { |p| p.map { |v| v.round(6) } }
         else h = 35.0; [[la + h / MLAT, lo - h / mlon(la)], [la + h / MLAT, lo + h / mlon(la)], [la - h / MLAT, lo + h / mlon(la)], [la - h / MLAT, lo - h / mlon(la)]].map { |p| p.map { |v| v.round(6) } } end
  lots << { "n" => n, "c" => COLS[i % COLS.size], "d" => hit ? "Parking" : "Parking (position from the event map)", "poly" => poly }
end
puts "lots: #{lots.size} (#{lots.count { |l| l["d"] == "Parking" }} outlined from OpenStreetMap)"

spec = {
  "id" => "arlington", "name" => "Arlington Street Circuit", "short" => "Arlington", "place" => "Arlington, Texas",
  "tz" => "America/Chicago", "length" => "2.73 mi", "opened" => 2026, "officialMiles" => 2.73, "nturns" => 14, "riverSouth" => false,
  "blurb" => "A street circuit through the Arlington entertainment district, around AT&T Stadium and Globe Life Field, with a 0.95-mile Randol Mill Road back straight.",
  "facts" => { "Race weekend" => "Built on city streets around the stadiums every March", "Signature sections" => "The Randol Mill Road back straight, the Horseshoe beside AT&T Stadium, split pit lane",
               "Designer" => "Tony Cottman", "Crossings" => "Pedestrian bridges plus street-level crossings that open when the track is cold" },
  "events" => [{ "d" => "2027-03-19", "e" => "Java House Grand Prix of Arlington", "s" => "NTT INDYCAR SERIES", "t" => 3 }],
  "circuit" => { "closed" => true, "path" => path, "sf" => sf, "turns" => turns, "pit" => pit },
  "pois" => pois, "lots" => lots,
  "_note" => "Draft from the official 2026 track map and the event's facility positions. The 2027 layout may differ."
}
File.write(File.join(__dir__, "arlington.spec.json"), JSON.generate(spec))
puts "wrote arlington.spec.json: #{pois.size} badges, #{turns.size} turns"
