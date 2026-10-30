# encoding: utf-8
# Builds data/canadian-tire-motorsport-park.js entirely from OpenStreetMap (ct.json): a permanent circuit is already mapped.
require "./lib_track.rb"
els = JSON.parse(File.read("ct.json"))["elements"]
ways = els.select { |e| e["type"] == "way" && e["geometry"] }
ll = ->(e) { e["geometry"].map { |q| [q["lat"], q["lon"]] } }
cen = ->(e) { g = ll.(e); [g.sum { |p| p[0] } / g.size, g.sum { |p| p[1] } / g.size] }

# ---------- the Grand Prix circuit: chain the named/oneway raceway pieces in race direction ----------
main_ids = [1315971777, 1315971778, 1315971779, 1315971780, 1315971781, 37059242, 1315971774, 1315971775, 1315971776]
pieces = main_ids.map { |id| ways.find { |w| w["id"] == id } or abort "missing raceway #{id}" }
chain = ll.(pieces.first); rest = pieces[1..-1].map { |w| ll.(w) }
until rest.empty?
  j = rest.find { |g| dm(g.first, chain.last) < 4 }
  if j.nil? then j = rest.find { |g| dm(g.last, chain.last) < 4 }; abort "chain broke at %.5f,%.5f (%d left)"%[*chain.last, rest.size] unless j; j = j.reverse end
  rest.delete_if { |g| g.equal?(j) || g == j || g == j.reverse }
  chain += j[1..-1]
end
gap = dm(chain.last, chain.first)
ring = chain
lap = poly_len(ring) + gap
puts "circuit: %d points, %.0f m (+%.0f m closing gap) = %.3f mi (official 2.459 mi)"%[ring.size, poly_len(ring), gap, lap / 1609.34]

pit_way = ways.find { |w| w["id"] == 37059263 }; pit_ll = ll.(pit_way)
front = ll.(pieces[1])                                   # the unnamed piece between Whites Corner and Clayton Corner = start/finish straight
sfp = snap_to_poly(cen.(pit_way), front)                 # start/finish opposite the middle of the pit lane

# ---------- points of interest from OSM ----------
pois = []
gate_names = { [44.0532, -78.6887] => "Motomaster Entrance", [44.0543, -78.6817] => "Karting Centre Entrance", [44.0550, -78.6790] => "Main Entrance",
               [44.0548, -78.6776] => "Main straight gate", [44.0557, -78.6751] => "Mastercraft Entrance", [44.0523, -78.6705] => "East Entrance" }
els.select { |e| e["type"] == "node" && e["tags"] && (e["tags"]["barrier"] == "gate" || e["tags"]["entrance"] == "main") }.each do |n|
  p = [n["lat"], n["lon"]]; nm = gate_names.min_by { |k, _| dm(k, p) }
  pois << { "n" => nm[1], "k" => "gate", "d" => "Entrance to the park", "ll" => p }
end
ways.each do |w|
  t = w["tags"] || {}
  if t["tourism"] == "camp_site" then pois << { "n" => "Camping", "k" => "camp", "d" => (t["name"] || "General camping"), "ll" => cen.(w) }
  elsif t["building"] && t["name"].to_s =~ /Concession/ then pois << { "n" => "Concession Stand", "k" => "food", "d" => (t["name"] =~ /Washrooms/ ? "Food and drink, with washrooms" : "Food and drink"), "ll" => cen.(w) }
    pois << { "n" => "Washrooms", "k" => "rest", "d" => "By the concession stand", "ll" => cen.(w).map { |v| v + 0.00006 } } if t["name"] =~ /Washrooms/
  elsif t["amenity"] == "shower" then pois << { "n" => "Showers", "k" => "rest", "d" => "Shower building", "shower" => true, "ll" => cen.(w) }
  elsif t["name"] == "Pit Area" then pois << { "n" => "Pit Area", "k" => "info", "d" => "Team garages", "ll" => cen.(w) }
  elsif t["name"] == "Canadian Tire Motorsport Park" && t["building"] then pois << { "n" => "Main Event Centre", "k" => "info", "d" => "Event headquarters", "ll" => cen.(w) }
  elsif t["name"] =~ /Karting Centre/ then pois << { "n" => "Karting Centre", "k" => "info", "d" => "Karting", "ll" => cen.(w) }
  elsif t["name"] =~ /Driver Development Track HQ/ then pois << { "n" => "Driver Development Track", "k" => "info", "d" => "Driver training track", "ll" => cen.(w) }
  end
end
pois << { "n" => "Chevrolet Grand Prix", "k" => "info", "d" => "IMSA weekend at Mosport", "ll" => [44.0522, -78.6706] } if false
parks = ways.select { |w| (w["tags"] || {})["amenity"] == "parking" && w["geometry"].first == w["geometry"].last }.map { |w| [w, ring_area_m2(ll.(w))] }.select { |_, a| a > 350 }

# ---------- map frame ----------
all = ring + pois.map { |x| x["ll"] } + parks.flat_map { |w, _| ll.(w) }
s0, n0 = all.map { |p| p[0] }.minmax; w0, e0 = all.map { |p| p[1] }.minmax
mg = 110.0
s0 -= mg / MLAT; n0 += mg / MLAT; w0 -= mg / mlon(s0); e0 += mg / mlon(s0)
W = 800
mpu = (e0 - w0) * mlon((s0 + n0) / 2) / W
H = ((n0 - s0) * MLAT / mpu).round
proj = ->(p) { [((p[1] - w0) / (e0 - w0) * W), ((n0 - p[0]) / (n0 - s0) * H)] }
fx = ->(v) { v.round(1) }
pathd = ->(pts, close = false) { "M" + pts.map { |x, y| "#{fx.(x)},#{fx.(y)}" }.join(" L") + (close ? " Z" : "") }
puts "frame: %dx%d units, %.2f m/unit"%[W, H, mpu]

# ---------- base map ----------
st = Street.new(els)
inb = ->(p) { p[0] >= s0 - 0.0005 && p[0] <= n0 + 0.0005 && p[1] >= w0 - 0.0007 && p[1] <= e0 + 0.0007 }
lines = []; polys = []
KIND = { "motorway" => "primary", "trunk" => "primary", "primary" => "primary", "secondary" => "primary", "tertiary" => "primary",
         "residential" => "residential", "unclassified" => "residential", "living_street" => "residential", "service" => "service",
         "footway" => "path", "path" => "path", "cycleway" => "path", "track" => "track", "raceway" => "raceway" }
skip_ids = main_ids + [37059263]
ways.each do |w|
  t = w["tags"] || {}; g = ll.(w)
  next unless g.any? { |p| inb.(p) }
  if t["highway"]
    next if skip_ids.include?(w["id"])
    k = KIND[t["highway"]] or next
    pts = dp(g.map { |p| proj.(p) }, 0.25); next if pts.size < 2
    lines << { "k" => k, "d" => pathd.(pts) }
  elsif g.size > 3 && g.first == g.last
    area = ring_area_m2(g)
    if t["building"] then next if area < 25; kind = "building"
    elsif t["natural"] == "water" then kind = "water"
    elsif t["natural"] =~ /wood/ || t["landuse"] == "forest" then kind = "wood"
    elsif t["amenity"] == "parking" then next if area < 200; kind = "parking"
    elsif t["tourism"] == "camp_site" || t["natural"] =~ /grassland/ || t["leisure"] =~ /park|pitch/ then kind = "grass"
    else next end
    pts = dp(g.map { |p| proj.(p) }, kind == "wood" ? 1.0 : 0.4); next if pts.size < 4
    polys << { "k" => kind, "d" => pathd.(pts, true), "a" => area }
  end
end
els.each do |r|
  next unless r["type"] == "relation" && r["tags"] && r["tags"]["natural"] == "water"
  (r["members"] || []).each { |m| next unless m["role"] == "outer" && m["geometry"]; g = m["geometry"].map { |q| [q["lat"], q["lon"]] }; next unless g.size > 3 && g.first == g.last
    polys << { "k" => "water", "d" => pathd.(dp(g.map { |p| proj.(p) }, 0.5), true), "a" => ring_area_m2(g) } }
end
order = %w[wood water grass parking building]
polys = polys.sort_by { |p| order.index(p["k"]) }; polys.each { |p| p.delete("a") }
puts "base: %d lines, %d polys (%d buildings, %d woods)"%[lines.size, polys.size, polys.count { |p| p["k"] == "building" }, polys.count { |p| p["k"] == "wood" }]

labels = []
[["Concession Road 10", "Concession Rd 10"], ["Mosport Road", "Mosport Road"]].each do |nm, txt|
  cand = ways.select { |w| (w["tags"] || {})["name"] == nm }.map { |w| [ll.(w).select { |p| inb.(p) }, w] }.reject { |g, _| g.size < 2 }
  next if cand.empty?
  g, = cand.max_by { |gg, _| poly_len(gg) }; a = g[[g.size / 2 - 1, 0].max]; b = g[[g.size / 2 + 1, g.size - 1].min]; m = g[g.size / 2]
  p0, p1 = proj.(a), proj.(b); ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math::PI; ang -= 180 if ang > 90; ang += 180 if ang < -90
  x, y = proj.(m); labels << [fx.(x), fx.(y), txt, ang.round]
end
corner_labels = pieces.reject { |w| (w["tags"] || {})["name"].nil? || (w["tags"] || {})["name"] =~ /Straight/ }.map { |w| g = ll.(w); x, y = proj.(g[g.size / 2]); [x.round, (y - 8).round, w["tags"]["name"].sub(" Corner", "")] }
corner_labels << (lambda { |w| g = ll.(w); x, y = proj.(g[g.size / 2]); [x.round, (y - 8).round, "Mario Andretti Straight"] }).call(pieces.find { |w| w["tags"]["name"] =~ /Straight/ })

# ---------- assemble ----------
path_units = dp(ring.map { |p| proj.(p) }, 0.2); path_units << path_units.first
pit_units = dp(pit_ll.map { |p| proj.(p) }, 0.2)
sf = proj.(sfp[0]); nxt = proj.(sfp[4]); sf_ang = Math.atan2(nxt[1] - sf[1], nxt[0] - sf[0]) * 180 / Math::PI
slug = ->(s) { s.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-|-\z/, "") }
seen = Hash.new(0)
poi_out = pois.map { |q| x, y = proj.(q["ll"]); id = slug.(q["n"]); seen[id] += 1; id += "-#{seen[id]}" if seen[id] > 1
  h = { "k" => q["k"], "n" => q["n"], "x" => x.round, "y" => y.round }; h["d"] = q["d"] unless q["d"].to_s.empty?; h["shower"] = true if q["shower"]; h["id"] = id; h }
palette = %w[#EC407A #F28C28 #29B6F6 #66BB6A #AB47BC #8D6E63 #26A69A #F2C300 #7CB342 #5C6BC0 #E2574C #FF7043 #8E7CC3]
lots = []
parks.sort_by { |_, a| -a }.each_with_index do |(w, area), i|
  pts = dp(ll.(w).map { |p| proj.(p) }, 0.4); cx = pts.sum { |p| p[0] } / pts.size; cy = pts.sum { |p| p[1] } / pts.size
  nm = (w["tags"]["name"] || "Parking #{(65 + i).chr}"); c = palette[i % palette.size]
  poi_out << { "k" => "park", "n" => nm, "x" => cx.round, "y" => cy.round, "d" => "Parking", "c" => c, "id" => slug.(nm) }
  lots << { "n" => nm, "c" => c, "d" => pathd.(pts, true), "x" => cx.round, "y" => cy.round, "r" => 25 }
end
sfxy = [sf[0].round, sf[1].round]
track = {
  "id" => "canadian-tire-motorsport-park", "name" => "Canadian Tire Motorsport Park", "short" => "Mosport", "place" => "Bowmanville, Ontario",
  "length" => "2.46 mi (3.96 km)", "opened" => 1961,
  "blurb" => "A permanent 2.459-mile, 10-turn road course in the countryside north of Bowmanville, Ontario, opened in 1961 and run clockwise. It is IMSA's only stop in Canada. The long Mario Andretti Straight leads into the Esses, and Moss Corner and Clayton Corner are the other big landmarks.",
  "facts" => { "Signature sections" => "Mario Andretti Straight, the Esses, Moss Corner, Clayton Corner", "Camping" => "Trackside camping, including reserved sites", "Country" => "Canada. Distances on site are usually posted in kilometres." },
  "vb" => [0, 0, W, H], "geo" => { "n" => n0.round(6), "s" => s0.round(6), "w" => w0.round(6), "e" => e0.round(6) },
  "path" => pathd.(path_units), "labels" => corner_labels, "sf" => sfxy, "pit" => pathd.(pit_units),
  "pois" => poi_out, "events" => [{ "d" => "2027-07-09", "e" => "IMSA at Canadian Tire Motorsport Park", "s" => "IMSA WeatherTech (event name to be announced)", "t" => 3 }],
  "osm" => true, "base" => { "polys" => polys, "lines" => lines, "labels" => labels },
  "sfArrow" => [sf[0].round(1), sf[1].round(1), sf_ang.round], "lots" => lots,
  "tz" => "America/Toronto", "eventName" => "IMSA at Canadian Tire Motorsport Park", "nturns" => 10, "turns" => [], "rev" => 1
}
File.write("canadian-tire-motorsport-park.js", "TRACKS.push({\n" + track.map { |k, v| "  #{k.to_json}:#{v.to_json}" }.join(",\n") + "\n});\n")
puts "wrote canadian-tire-motorsport-park.js (%d KB): %d badges, %d lots"%[File.size("canadian-tire-motorsport-park.js") / 1000, poi_out.size, lots.size]
puts "badges: " + poi_out.map { |q| q["k"] }.group_by { |k| k }.map { |k, v| "#{k}=#{v.size}" }.join(", ")
