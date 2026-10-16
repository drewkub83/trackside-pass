# encoding: utf-8
# Builds data/<id>.js for a PERMANENT circuit (road course or oval) from OpenStreetMap.
#   ruby tools/street-circuits/build_permanent.rb tools/street-circuits/permanent/<id>.rb [--replace] [--no-register]
# The config file is a Ruby hash (see permanent/phoenix.rb). The main circuit and pit lane are picked by OSM way id.
# Fan features (grandstands, food, restrooms) are usually NOT in OpenStreetMap: add them afterwards in the app's edit mode
# ("Copy layout" -> bake3.rb) or from the official venue map.
require File.join(__dir__, "lib_track.rb")
require "fileutils"

args = ARGV.dup
replace = !args.delete("--replace").nil?
register = args.delete("--no-register").nil?
cfgfile = args.shift or abort "usage: ruby build_permanent.rb config.rb [--replace] [--no-register]"
C = eval(File.read(cfgfile, encoding: "UTF-8"), binding, cfgfile)
id = C[:id]; root = File.expand_path("../..", __dir__); outfile = File.join(root, "data", "#{id}.js")
abort "data/#{id}.js exists: use --replace (a backup goes to tools/street-circuits/backup/)" if File.exist?(outfile) && !replace
FileUtils.mkdir_p(File.join(__dir__, "backup")); FileUtils.cp(outfile, File.join(__dir__, "backup", "#{id}.#{Time.now.strftime('%Y%m%d-%H%M%S')}.js")) if File.exist?(outfile)
rev = File.exist?(outfile) ? (File.read(outfile, encoding: "UTF-8")[/"rev":(\d+)/, 1] || "1").to_i + 1 : 1

# ---------- OpenStreetMap data (downloaded once, cached) ----------
osmdir = File.join(__dir__, "osm"); FileUtils.mkdir_p(osmdir); osmfile = File.join(osmdir, "#{id}.json")
unless File.exist?(osmfile) && File.size(osmfile) > 1000
  la, lo = C[:center]; r = C[:radius] || 0.016
  b = [la - r, lo - r * 1.2, la + r, lo + r * 1.2].map { |v| v.round(5) }.join(",")
  q = "[out:json][timeout:170];( way[\"highway\"](#{b}); way[\"building\"](#{b}); way[\"natural\"~\"water|wood|grassland|scrub\"](#{b}); way[\"waterway\"](#{b}); way[\"leisure\"](#{b}); way[\"amenity\"](#{b}); way[\"landuse\"](#{b}); way[\"tourism\"](#{b}); way[\"sport\"](#{b}); node[\"amenity\"](#{b}); node[\"tourism\"](#{b}); node[\"barrier\"=\"gate\"](#{b}); node[\"entrance\"](#{b}); relation[\"natural\"=\"water\"](#{b}); relation[\"leisure\"](#{b}); ); out geom;"
  File.write(File.join(osmdir, "#{id}.q"), q); puts "downloading OpenStreetMap data for #{id} ..."
  system("curl", "-s", "-f", "-m", "240", "-A", "TracksidePass/0.1 (personal race-day app)", "-H", "Accept: */*", "--data-urlencode", "data@#{File.join(osmdir, "#{id}.q")}", "-o", osmfile, "https://overpass-api.de/api/interpreter")
  abort "download failed" unless File.exist?(osmfile) && File.size(osmfile) > 1000
end
els = JSON.parse(File.read(osmfile, encoding: "UTF-8"))["elements"]
ways = els.select { |e| e["type"] == "way" && e["geometry"] }
ll = ->(e) { e["geometry"].map { |q| [q["lat"], q["lon"]] } }
cen = ->(e) { e["type"] == "node" ? [e["lat"], e["lon"]] : (g = ll.(e); [g.sum { |p| p[0] } / g.size, g.sum { |p| p[1] } / g.size]) }
way = ->(wid) { ways.find { |w| w["id"] == wid } or abort "OpenStreetMap way #{wid} not found" }

# ---------- circuit ----------
ring = if C[:circuit].is_a?(Array)      # a loop made of several OpenStreetMap pieces, in driving order
         C[:circuit].flat_map.with_index { |wid, i| g = ll.(way.(wid)); i.zero? ? g : g[1..-1] }
       else ll.(way.(C[:circuit])) end
ring.pop if ring.size > 2 && ring.first == ring.last
if (n = C[:smooth].to_i) > 0 then ring = chaikin(ring + [ring.first], n)[0..-2] end
lap = poly_len(ring) + dm(ring.last, ring.first)
puts "circuit: %d points, %.0f m = %.3f mi (official %s)"%[ring.size, lap, lap / 1609.34, C[:official_mi]]
pit_ll = if C[:pit].is_a?(Array)        # the pit road can also be several OpenStreetMap pieces, in order (same as circuit above)
           C[:pit].flat_map.with_index { |wid, i| g = ll.(way.(wid)); i.zero? ? g : g[1..-1] }
         else ll.(way.(C[:pit])) end
closed = ring + [ring.first]
# the mapped "Pit Lane" can include access roads that wander away from the circuit: keep the longest stretch that hugs it
near = pit_ll.map { |p| snap_to_poly(p, closed)[3] <= (C[:pit_near_m] || 30) }
runs = []; st = nil
near.each_with_index { |f, i| if f then st ||= i elsif st then runs << (st..i - 1); st = nil end }
runs << (st..near.size - 1) if st
best = runs.max_by { |r| poly_len(pit_ll[r]) }
if C[:pit_slice] then pit_ll = pit_ll[C[:pit_slice][0]..C[:pit_slice][1]]; best = nil; puts "pit lane: using vertices #{C[:pit_slice].inspect} (%.0f m)"%poly_len(pit_ll) end
if best && pit_ll[best].size > 3 then puts "pit lane: kept %d of %d points (%.0f of %.0f m) that run beside the circuit"%[pit_ll[best].size, pit_ll.size, poly_len(pit_ll[best]), poly_len(pit_ll)]; pit_ll = pit_ll[best] end
cum = [0.0]; closed.each_cons(2) { |a, b| cum << cum.last + dm(a, b) }; total = cum.last
arcpos = ->(p) { sn = snap_to_poly(p, closed); cum[sn[1]] + dm(closed[sn[1]], sn[0]) }
d1 = arcpos.(pit_ll.first); d2 = arcpos.(pit_ll.last); span = (d2 - d1) % total
mid = (span <= total / 2 ? d1 + span / 2 : d2 + (total - span) / 2) % total          # middle of the pit lane, measured along the circuit
sfp = snap_to_poly(point_at(closed, mid / total)[0], closed)                            # start/finish there
sfp = snap_to_poly(point_at(pit_ll, C[:sf_frac])[0], closed) if C[:sf_frac]
sfp = snap_to_poly(C[:sf_at], closed) if C[:sf_at]                                     # or exactly where the finish line is                # or a chosen fraction along the pit road
sf_pt = sfp[0]; sf_idx = sfp[1]

# ---------- points of interest from OSM tags (the fan features must be added by hand) ----------
RULES = C[:rules] || [
  [/Race Control/i, "info", "Race control"], [/Trauma|First Aid|Medical|Clinic/i, "med", "First aid and medical"], [/Credential|Will Call|Ticket/i, "gate", nil],
  [/Museum/i, "info", "Museum"], [/Fan Zone/i, "info", "Fan zone"], [/Concession|Grill|Cafe|Food/i, "food", "Food and drink"], [/Grandstand|Seating|Bleacher/i, "stand", "Seating"],
  [/Camp|RV|Tent/i, "camp", "Camping"], [/Tunnel/i, "cross", "Walkway under the road"]
]
pois = []; lot_ways = []
(ways + els.select { |e| e["type"] == "node" && e["tags"] }).each do |e|
  t = e["tags"] || {}; nm = t["name"].to_s
  if e["type"] == "way" && (t["amenity"] == "parking" || nm =~ /\bLot\b|Parking/i) && e["geometry"].first == e["geometry"].last
    a = ring_area_m2(ll.(e)); lot_ways << [e, a] if C[:osm_lots] != false && ((nm != "" && a > 150) || a > (C[:min_lot_m2] || 6000)); next
  end
  next if e["type"] == "way" && t["highway"]
  if t["amenity"] == "toilets" then pois << { "n" => "Restrooms", "k" => "rest", "d" => nm, "ll" => cen.(e) }; next end
  if t["amenity"] == "shower" then pois << { "n" => "Showers", "k" => "rest", "d" => "Shower building", "shower" => true, "ll" => cen.(e) }; next end
  next if nm.empty? || (C[:skip_names] || /Office|Shop|Storage|Work Shop|Garages|Leader Board|Cahaba|River/i) =~ nm
  r = RULES.find { |re, _, _| re =~ nm } or next
  pois << { "n" => nm, "k" => r[1], "d" => (r[2] || nm), "ll" => cen.(e) }
end
(C[:extra_pois] || []).each do |n, k, d, la, lo, snap, sh|
  p = [la, lo]
  if snap then road = ways.select { |w| (w["tags"] || {})["name"].to_s =~ snap }.flat_map { |w| ll.(w) }; p = road.min_by { |q| dm(q, p) } unless road.empty? end
  h = { "n" => n, "k" => k, "d" => d, "ll" => p }; h["shower"] = true if sh
  pois << h
end
lot_ways.uniq! { |w, _| w["id"] }
lot_rename = {}
(C[:lot_names] || []).each do |la, lo, nm|
  w, = lot_ways.select { |x, _| x["tags"]["name"].to_s.empty? && !lot_rename[x["id"]] }.min_by { |x, _| dm(cen.(x), [la, lo]) }
  lot_rename[w["id"]] = nm if w && dm(cen.(w), [la, lo]) < 300
end
kept = []; pois.each { |p| kept << p unless kept.any? { |q| q["n"] == p["n"] && q["k"] == p["k"] && dm(q["ll"], p["ll"]) < 40 } }; pois = kept      # duplicates of one place (two buildings named Race Control) become one badge

# ---------- map frame ----------
all = ring + pois.map { |x| x["ll"] } + lot_ways.flat_map { |w, _| ll.(w) } + (C[:extra_lots] || []).flat_map { |l| l["poly"] }
s0, n0 = all.map { |p| p[0] }.minmax; w0, e0 = all.map { |p| p[1] }.minmax
mg = 110.0; s0 -= mg / MLAT; n0 += mg / MLAT; w0 -= mg / mlon(s0); e0 += mg / mlon(s0)
W = 800; mpu = (e0 - w0) * mlon((s0 + n0) / 2) / W; H = ((n0 - s0) * MLAT / mpu).round
proj = ->(p) { [((p[1] - w0) / (e0 - w0) * W), ((n0 - p[0]) / (n0 - s0) * H)] }
fx = ->(v) { v.round(1) }
pathd = ->(pts, close = false) { "M" + pts.map { |x, y| "#{fx.(x)},#{fx.(y)}" }.join(" L") + (close ? " Z" : "") }
puts "frame: %dx%d units, %.2f m/unit (%.1f x %.1f km)"%[W, H, mpu, W * mpu / 1000, H * mpu / 1000]

# ---------- base map ----------
inb = ->(p) { p[0] >= s0 - 0.0005 && p[0] <= n0 + 0.0005 && p[1] >= w0 - 0.0007 && p[1] <= e0 + 0.0007 }
KIND = { "motorway" => "primary", "motorway_link" => "primary", "trunk" => "primary", "primary" => "primary", "secondary" => "primary", "tertiary" => "primary",
         "residential" => "residential", "unclassified" => "residential", "living_street" => "residential", "service" => "service",
         "footway" => "path", "path" => "path", "cycleway" => "path", "track" => "track", "raceway" => "raceway" }
skip_ids = Array(C[:circuit]) + [C[:pit]] + (C[:skip_ids] || [])
lines = []; polys = []
ways.each do |w|
  t = w["tags"] || {}; g = ll.(w); next unless g.any? { |p| inb.(p) }
  if t["highway"]
    next if skip_ids.include?(w["id"]); k = KIND[t["highway"]] or next
    next if k == "service" && poly_len(g) < 40
    pts = dp(g.map { |p| proj.(p) }, 0.25); next if pts.size < 2
    lines << { "k" => k, "d" => pathd.(pts) }
  elsif g.size > 3 && g.first == g.last
    area = ring_area_m2(g)
    if t["building"] then next if area < 60; kind = "building"
    elsif t["natural"] == "water" then kind = "water"
    elsif t["natural"] =~ /wood/ || t["landuse"] == "forest" then kind = "wood"
    elsif t["amenity"] == "parking" then next if area < 400; kind = "parking"
    elsif t["tourism"] == "camp_site" || t["natural"] =~ /grassland/ || t["leisure"] =~ /park|pitch/ || (t["landuse"] == "grass" && t["name"]) then kind = "grass"
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
order = %w[wood water grass parking building]; polys = polys.sort_by { |p| order.index(p["k"]) }
bl = polys.select { |p| p["k"] == "building" }; polys -= bl.sort_by { |p| p["a"] }.first([bl.size - 300, 0].max) if bl.size > 300
polys.each { |p| p.delete("a") }
puts "base: %d lines, %d polys (%d buildings)"%[lines.size, polys.size, polys.count { |p| p["k"] == "building" }]

labels = []
(C[:street_labels] || []).each do |nm, txt|
  cand = ways.select { |w| (w["tags"] || {})["name"].to_s =~ nm }.map { |w| ll.(w).select { |p| inb.(p) } }.reject { |g| g.size < 3 }
  next if cand.empty?
  g = cand.max_by { |gg| poly_len(gg) }; a = g[[g.size / 2 - 1, 0].max]; b = g[[g.size / 2 + 1, g.size - 1].min]; m = g[g.size / 2]
  p0, p1 = proj.(a), proj.(b); ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math::PI; ang -= 180 if ang > 90; ang += 180 if ang < -90
  x, y = proj.(m); labels << [fx.(x), fx.(y), txt, ang.round]
end

# ---------- oval: name the two ends and the two straights ----------
corner_labels = []
if C[:oval]
  step = 10.0; samples = []; acc = 0.0                       # resample every ~10 m, starting at the start/finish line
  rr = ring[(sf_idx + 1)..-1] + ring[0..sf_idx]; pts = [sf_pt] + rr + [sf_pt]
    total_m = poly_len(pts); n = (total_m / step).round; n.times { |k| samples << point_at(pts, k.to_f / n)[0] }; step = total_m / n     # even spacing along the circuit
  hd = samples.each_index.map { |i| a = samples[(i - 3) % samples.size]; b = samples[(i + 3) % samples.size]; Math.atan2((b[0] - a[0]) * MLAT, (b[1] - a[1]) * mlon(a[0])) * 180 / Math::PI }
  turn = hd.each_index.map { |i| d = (hd[(i + 3) % hd.size] - hd[(i - 3) % hd.size]); d -= 360 while d > 180; d += 360 while d < -180; d.abs / (6 * step) }   # degrees per metre
  on = turn.map { |v| v > 0.12 }; arcs = []; cur = nil
  on.each_with_index { |f, i| if f then (cur ||= [i, i]); cur[1] = i elsif cur then arcs << cur; cur = nil end }
  arcs << cur if cur
  arcs = arcs.select { |a, b| (b - a) * step > 150 }
  puts "oval arcs (m from start/finish): " + arcs.map { |a, b| "#{(a * step).round}-#{(b * step).round}" }.join(", ")
  names = ["Turns 1 & 2", "Turns 3 & 4"]
  if C[:turn_labels]
    arcs.first(2).each_with_index { |(a, b), i| [0.25, 0.75].each_with_index { |f, j| x, y = proj.(samples[(a + (b - a) * f).round]); corner_labels << [x.round, (y - 8).round, "Turn #{i * 2 + j + 1}"] } }
  else
    arcs.first(2).each_with_index { |(a, b), i| x, y = proj.(samples[(a + b) / 2]); corner_labels << [x.round, (y - 8).round, names[i]] }
  end
  if arcs.size >= 2
    m1 = (arcs[0][1] + arcs[1][0]) / 2; x, y = proj.(samples[m1]); corner_labels << [x.round, (y - 8).round, "Backstretch"]
    m2 = ((arcs[1][1] + samples.size + arcs[0][0]) / 2) % samples.size; x, y = proj.(samples[m2]); corner_labels << [x.round, (y - 8).round, "Front stretch"]
  end
end
(C[:corner_labels] || []).each do |txt, la, lo, snap|          # [text, lat, lon] or [text, lat, lon, true] to sit on the circuit
  p = snap ? snap_to_poly([la, lo], ring + [ring.first])[0] : [la, lo]; x, y = proj.(p); corner_labels << [x.round, (y - 8).round, txt]
end

# ---------- assemble ----------
path_units = dp(ring.map { |p| proj.(p) }, 0.2); path_units << path_units.first
pit_units = dp(pit_ll.map { |p| proj.(p) }, 0.2)
sf = proj.(sf_pt); nxt = proj.(sfp[4]); sf_ang = Math.atan2(nxt[1] - sf[1], nxt[0] - sf[0]) * 180 / Math::PI
slug = ->(s) { s.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-|-\z/, "") }
seen = Hash.new(0)
poi_out = pois.map { |q| x, y = proj.(q["ll"]); i = slug.(q["n"]); seen[i] += 1; i += "-#{seen[i]}" if seen[i] > 1
  h = { "k" => q["k"], "n" => q["n"], "x" => x.round, "y" => y.round }; h["d"] = q["d"] unless q["d"].to_s.empty?; h["shower"] = true if q["shower"]; h["id"] = i; h }
palette = %w[#EC407A #F28C28 #29B6F6 #66BB6A #AB47BC #8D6E63 #26A69A #F2C300 #7CB342 #5C6BC0 #E2574C #FF7043 #8E7CC3]
lots = []; unnamed = 0
lot_ways.sort_by { |_, a| -a }.each_with_index do |(w, area), i|
  pts = dp(ll.(w).map { |p| proj.(p) }, 0.4); cx = pts.sum { |p| p[0] } / pts.size; cy = pts.sum { |p| p[1] } / pts.size
  nm = (lot_rename[w["id"]] || w["tags"]["name"] || "Parking #{unnamed += 1}"); nm = "#{nm} Parking" if nm =~ /\A(Citrus)\z/; c = palette[i % palette.size]
  poi_out << { "k" => "park", "n" => nm, "x" => cx.round, "y" => cy.round, "d" => "Parking", "c" => c, "id" => slug.(nm) }
  lots << { "n" => nm, "c" => c, "d" => pathd.(pts, true), "x" => cx.round, "y" => cy.round, "r" => 25 }
end
(C[:extra_lots] || []).each do |l|          # lot outlines with real coordinates (from a venue's own map)
  pts = dp(l["poly"].map { |p| proj.(p) }, 0.4); cx = pts.sum { |p| p[0] } / pts.size; cy = pts.sum { |p| p[1] } / pts.size; c = palette[lots.size % palette.size]
  poi_out << { "k" => "park", "n" => l["n"], "x" => cx.round, "y" => cy.round, "d" => (l["pass"] ? "Parking pass required" : (l["n"] =~ /Campground/ ? "RV camping" : "Parking")), "c" => c, "id" => slug.(l["n"]) }
  lots << { "n" => l["n"], "c" => c, "d" => pathd.(pts, true), "x" => cx.round, "y" => cy.round, "r" => 25 }
end
track = { "id" => id, "name" => C[:name], "short" => C[:short], "place" => C[:place], "length" => C[:length], "opened" => C[:opened], "blurb" => C[:blurb], "facts" => C[:facts],
  "vb" => [0, 0, W, H], "geo" => { "n" => n0.round(6), "s" => s0.round(6), "w" => w0.round(6), "e" => e0.round(6) },
  "path" => pathd.(path_units), "labels" => corner_labels, "sf" => [sf[0].round, sf[1].round], "pit" => pathd.(pit_units),
  "pois" => poi_out, "events" => C[:events], "osm" => true, "base" => { "polys" => polys, "lines" => lines, "labels" => labels },
  "sfArrow" => [sf[0].round(1), sf[1].round(1), sf_ang.round], "lots" => lots,
  "tz" => C[:tz], "eventName" => C[:events].first["e"], "nturns" => C[:nturns], "turns" => [], "rev" => rev }
track["tw"] = C[:tw] if C[:tw]
File.write(outfile, "TRACKS.push({\n" + track.map { |k, v| "  #{k.to_json}:#{v.to_json}" }.join(",\n") + "\n});\n")
puts "wrote #{outfile} (%d KB): %d badges, %d lots; badges: %s"%[File.size(outfile) / 1000, poi_out.size, lots.size, poi_out.map { |q| q["k"] }.group_by { |k| k }.map { |k, v| "#{k}=#{v.size}" }.join(", ")]

# ---------- register in the app ----------
if register
  html = File.join(root, "index.html"); h = File.read(html, encoding: "UTF-8"); tag = %(<script src="data/#{id}.js"></script>)
  if h.include?(tag) then puts "index.html: #{id} already listed"
  else h.sub!(%(<script src="data/series.js"></script>), tag + "\n" + %(<script src="data/series.js"></script>)) or abort "no series.js tag"; File.write(html, h); puts "index.html: added #{id}" end
  sw = File.join(root, "sw.js"); s = File.read(sw, encoding: "UTF-8")
  unless s =~ /const TRACKS = \[[^\]]*"#{Regexp.escape(id)}"/
    s.sub!(/(const TRACKS = \[[^\]]*)\]/) { "#{$1},\"#{id}\"]" } or abort "no TRACKS in sw.js"; puts "sw.js: added #{id}" end
  s.sub!(/const VERSION = "v(\d+)"/) { %(const VERSION = "v#{$1.to_i + 1}") }; File.write(sw, s); puts "sw.js: " + s[/const VERSION = "[^"]+"/]
end
