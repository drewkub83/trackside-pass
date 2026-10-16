# encoding: utf-8
# Shared back half for the street-circuit builders. eval'd inside lb_build.rb / dt_build.rb so it sees their variables:
#   els, st, ring, pois, parks, turn_ll, sf_pt, sf_nxt, pit_ll, META, OUTFILE, DATA_BB, STREET_LABELS, CLOSE_WATER_SOUTH

# ---------- frame: circuit plus generous context, like the permanent-track maps ----------
cs, cn = ring.map { |p| p[0] }.minmax; cw, ce = ring.map { |p| p[1] }.minmax
latc = (cs + cn) / 2; lonc = (cw + ce) / 2
cw_m = (ce - cw) * mlon(latc); ch_m = (cn - cs) * MLAT
width_m = cw_m * 1.5 + 300; need_h = (cw_m * 1.06) / 0.46 * 1.12; height_m = [ch_m * 1.5 + 300, width_m * 1.2, need_h].max
s0 = latc - height_m / 2 / MLAT; n0 = latc + height_m / 2 / MLAT; w0 = lonc - width_m / 2 / mlon(latc); e0 = lonc + width_m / 2 / mlon(latc)
ds, dw, dn, de = DATA_BB
s0 = [s0, ds + 0.0003].max; n0 = [n0, dn - 0.0003].min; w0 = [w0, dw + 0.0003].max; e0 = [e0, de - 0.0003].min
W = 560
mpu = (e0 - w0) * mlon(latc) / W
H = ((n0 - s0) * MLAT / mpu).round
proj = ->(p) { [((p[1] - w0) / (e0 - w0) * W), ((n0 - p[0]) / (n0 - s0) * H)] }
fx = ->(v) { v.round(1) }
pathd = ->(pts, close = false) { "M" + pts.map { |x, y| "#{fx.(x)},#{fx.(y)}" }.join(" L") + (close ? " Z" : "") }
puts "frame: %dx%d units, %.2f m/unit (%.1f x %.1f km)"%[W, H, mpu, W * mpu / 1000, H * mpu / 1000]

# ---------- base map: same restraint as Road Atlanta (roads, larger buildings, water, parks; no dotted footpaths) ----------
inb = ->(p) { p[0] >= s0 - 0.0004 && p[0] <= n0 + 0.0004 && p[1] >= w0 - 0.0006 && p[1] <= e0 + 0.0006 }
KIND2 = { "motorway" => "primary", "motorway_link" => "primary", "trunk" => "primary", "trunk_link" => "primary", "primary" => "primary", "primary_link" => "primary",
          "secondary" => "primary", "secondary_link" => "primary", "tertiary" => "primary", "tertiary_link" => "primary",
          "residential" => "residential", "unclassified" => "residential", "living_street" => "residential", "service" => "service" }
lines = []; polys = []
els.each do |w|
  next unless w["type"] == "way" && w["geometry"]; t = w["tags"] || {}; g = w["geometry"].map { |q| [q["lat"], q["lon"]] }
  next unless g.any? { |p| inb.(p) }
  if t["highway"]
    k = KIND2[t["highway"]] or next
    k = "tunnel" if t["tunnel"] && t["tunnel"] != "no"
    next if k == "service" && poly_len(g) < 60
    pts = dp(g.map { |p| proj.(p) }, 0.3); next if pts.size < 2
    lines << { "k" => k, "d" => pathd.(pts) }
  elsif g.size > 3 && g.first == g.last
    area = ring_area_m2(g)
    if t["building"] then next if area < 500; kind = "building"
    elsif t["natural"] == "water" then next if area < 500; kind = "water"
    elsif t["amenity"] == "parking" then next if area < 1000; kind = "parking"
    elsif t["leisure"] =~ /park|garden/ || t["landuse"] =~ /grass|recreation/ then next if area < 1500; kind = "grass"
    else next end
    pts = dp(g.map { |p| proj.(p) }, kind == "building" ? 0.5 : 0.7); next if pts.size < 4
    polys << { "k" => kind, "d" => pathd.(pts, true), "a" => area }
  end
end
els.each do |r|
  next unless r["type"] == "relation" && r["tags"] && r["tags"]["natural"] == "water"
  (r["members"] || []).each { |m| next unless m["role"] == "outer" && m["geometry"]; g = m["geometry"].map { |q| [q["lat"], q["lon"]] }; next unless g.size > 3 && g.first == g.last && g.any? { |p| inb.(p) }
    polys << { "k" => "water", "d" => pathd.(dp(g.map { |p| proj.(p) }, 0.7), true), "a" => ring_area_m2(g) } }
end
if CLOSE_WATER_SOUTH        # a big river stored as open pieces: chain the ones in frame into the shoreline and close it below the map
  rel = els.select { |r| r["type"] == "relation" && r["tags"] && r["tags"]["natural"] == "water" }.max_by { |r| (r["members"] || []).size }
  if rel
    segs = (rel["members"] || []).select { |m| m["role"] == "outer" && m["geometry"] }.map { |m| m["geometry"].map { |q| [q["lat"], q["lon"]] } }.select { |g| g.any? { |p| inb.(p) } }
    chain = segs.max_by(&:size); rest = segs - [chain]
    loop do
      j = rest.find { |g| dm(g.first, chain.last) < 2 || dm(g.last, chain.last) < 2 || dm(g.first, chain.first) < 2 || dm(g.last, chain.first) < 2 }
      break unless j
      rest -= [j]
      if dm(j.first, chain.last) < 2 then chain += j[1..-1]
      elsif dm(j.last, chain.last) < 2 then chain += j.reverse[1..-1]
      elsif dm(j.last, chain.first) < 2 then chain = j[0..-2] + chain
      else chain = j.reverse[0..-2] + chain end
    end
    bank = segs.flatten(1).select { |p| p[0] >= cs - 350.0 / MLAT && inb.(p) }.uniq.sort_by { |p| p[1] }      # north bank only (the far shore would fold the shape)
    polys << { "k" => "water", "d" => pathd.(dp((bank + [[s0 - 0.02, bank.last[1] + 0.02], [s0 - 0.02, bank.first[1] - 0.02]]).map { |p| proj.(p) }, 0.7), true), "a" => 1e9 }
  end
end
# open sea / bay: OpenStreetMap stores the shore as natural=coastline lines with the water on their right-hand side.
# Chain them, keep the part inside the frame, and close it around the frame edge on the water side.
coast = els.select { |w| w["type"] == "way" && w["tags"] && w["tags"]["natural"] == "coastline" && w["geometry"] && w["nodes"].first != w["nodes"].last }.map { |w| w["geometry"].map { |q| [q["lat"], q["lon"]] } }
if !CLOSE_WATER_SOUTH && coast.any? { |g| g.any? { |p| inb.(p) } }
  chain = coast.shift
  loop do
    j = coast.find { |g| dm(g.first, chain.last) < 2 || dm(g.last, chain.first) < 2 }
    break unless j
    coast -= [j]
    chain = dm(j.first, chain.last) < 2 ? chain + j[1..-1] : j[0..-2] + chain
  end
  runs = []; cur = []
  chain.each { |p| if inb.(p) then cur << p else runs << cur unless cur.empty?; cur = [] end }
  runs << cur unless cur.empty?
  run = runs.max_by(&:size)
  if run && run.size > 3
    m = 0.02; pad = ->(p) { [p[0].clamp(s0 - m, n0 + m), p[1].clamp(w0 - m, e0 + m)] }
    a = run.first; b = run.last
    # perimeter position, clockwise from the south-west corner (west edge up, north edge east, east edge down, south edge west)
    per = ->(p) { la = p[0]; lo = p[1]; dsw = [la - s0, n0 - la, lo - w0, e0 - lo].each_with_index.min
      case dsw[1] when 2 then (la - s0) / (n0 - s0) when 1 then 1 + (lo - w0) / (e0 - w0) when 3 then 2 + (n0 - la) / (n0 - s0) else 3 + (e0 - lo) / (e0 - w0) end }
    corners = [[0.0, [s0 - m, w0 - m]], [1.0, [n0 + m, w0 - m]], [2.0, [n0 + m, e0 + m]], [3.0, [s0 - m, e0 + m]]]
    pa = per.(a); pb = per.(b)
    close = []; t = pb; 
    ext_b = [pad.(b)]; ext_a = [pad.(a)]
    steps = corners.map { |c| c[0] } + corners.map { |c| c[0] + 4 }
    tt = pb; tt += 4 if pa < pb
    (corners + corners.map { |c| [c[0] + 4, c[1]] }).each { |pos, pt| close << pt if pos > pb && pos < pa + (pa < pb ? 4 : 0) }
    ring_pts = run + ext_b + close + ext_a
    polys << { "k" => "water", "d" => pathd.(dp(ring_pts.map { |p| proj.(p) }, 0.7), true), "a" => 1e9 }
    puts "coastline: %d shore points drawn, water closed around the frame edge"%[run.size]
  end
end
order = %w[water grass parking building]
polys = polys.sort_by { |p| order.index(p["k"]) }
bl = polys.select { |p| p["k"] == "building" }
polys -= bl.sort_by { |p| p["a"] }.first([bl.size - 350, 0].max) if bl.size > 350
polys.each { |p| p.delete("a") }
puts "base: %d lines, %d polys (%d buildings)"%[lines.size, polys.size, polys.count { |p| p["k"] == "building" }]

labels = []
STREET_LABELS.each do |re, txt|
  cand = st.ways.select { |w| w["tags"]["name"].to_s =~ re }.map { |w| g = w["geometry"].map { |q| [q["lat"], q["lon"]] }; g.select { |p| inb.(p) } }.reject { |g| g.size < 3 }
  next if cand.empty?
  g = cand.max_by { |gg| poly_len(gg) }; m = g[g.size / 2]; a = g[g.size / 2 - 1]; b = g[g.size / 2 + 1]
  p0, p1 = proj.(a), proj.(b); ang = Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180 / Math::PI; ang -= 180 if ang > 90; ang += 180 if ang < -90
  x, y = proj.(m); labels << [fx.(x), fx.(y), txt, ang.round]
end

# ---------- circuit ----------
ring_u = ring.map { |p| proj.(p) }
path_units = dp(ring_u, 0.15); path_units << path_units.first
sf = proj.(sf_pt); nxt = proj.(sf_nxt); sf_ang = Math.atan2(nxt[1] - sf[1], nxt[0] - sf[0]) * 180 / Math::PI
pit_units = pit_ll ? dp(pit_ll.map { |p| proj.(p) }, 0.15) : nil
TW = (defined?(STYLE_TW) ? STYLE_TW : 5.5)
minx, maxx = path_units.map { |p| p[0] }.minmax; miny, maxy = path_units.map { |p| p[1] }.minmax
hw = (maxx - minx) * 1.5 * 1.22; hh = [hw / 0.46, H].min; hy = [[(miny + maxy) / 2 - hh / 2, 0].max, H - hh].min; home = [((minx + maxx) / 2 - hw / 2).round, hy.round, hw.round, hh.round]

# ---------- badges and lots ----------
slug = ->(s) { s.downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-|-\z/, "") }
seen = Hash.new(0)
poi_out = pois.map { |q| x, y = proj.(q["ll"]); id = slug.(q["n"]); seen[id] += 1; id += "-#{seen[id]}" if seen[id] > 1
  h = { "k" => q["k"], "n" => q["n"], "x" => x.round, "y" => y.round }; h["d"] = q["d"] unless q["d"].to_s.empty?; h["shower"] = true if q["shower"]; h["id"] = id; h }
lots = []
parks.each do |q|
  pts = q["poly"].map { |p| proj.(p) }; cx = pts.sum { |p| p[0] } / pts.size; cy = pts.sum { |p| p[1] } / pts.size
  poi_out << { "k" => "park", "n" => q["n"], "x" => cx.round, "y" => cy.round, "d" => q["d"], "c" => q["c"], "id" => slug.(q["n"]) }
  lots << { "n" => q["n"], "c" => q["c"], "d" => pathd.(pts, true), "x" => cx.round, "y" => cy.round, "r" => 30 }
end
turns = turn_ll.map { |n, ll| x, y = proj.(ll); [x.round, y.round, n.sub("T", "")] }
tlabels = turn_ll.map { |n, ll| x, y = proj.(ll); [x.round, (y - 8).round, n] }

# ---------- walking grid: blocked by buildings, water and the circuit; crosses the circuit only at the pedestrian bridges ----------
cell = 10.0 / mpu
grid = WalkGrid.new(W, H, cell)
polys.each { |p| grid.fill(parse_d(p["d"]), "1") if %w[building water].include?(p["k"]) }
lines.each { |l| next if l["k"] == "tunnel"; wm = { "primary" => 12.0, "residential" => 8.0, "service" => 5.0 }[l["k"]] || 5.0; grid.stroke(parse_d(l["d"]), wm / mpu, "2", ["0"]) }
grid.stroke(path_units, 15.0 / mpu, "1")
grid.stroke(pit_units, 9.0 / mpu, "1") if pit_units
cross_n = 0
poi_out.select { |q| q["k"] == "cross" }.each { |q| grid.disc(q["x"], q["y"], 14.0 / mpu, "2", %w[1 0]); cross_n += 1 }
route = { "cell" => cell.round(4), "nx" => grid.nx, "ny" => grid.ny, "x0" => 0, "y0" => 0, "mpu" => mpu.round(4), "rows" => grid.rows }
puts "walking grid: %dx%d cells, %d crossings carved"%[grid.nx, grid.ny, cross_n]

track = META.merge(
  "vb" => [0, 0, W, H], "home" => home, "tw" => TW, "mvb" => [(minx - 40).round, (miny - 40).round, (maxx - minx + 80).round, (maxy - miny + 80).round], "geo" => { "n" => n0.round(6), "s" => s0.round(6), "w" => w0.round(6), "e" => e0.round(6) },
  "path" => pathd.(path_units), "labels" => tlabels, "sf" => [sf[0].round, sf[1].round], "pit" => (pit_units ? pathd.(pit_units) : nil),
  "pois" => poi_out, "osm" => true, "base" => { "polys" => polys, "lines" => lines, "labels" => labels },
  "route" => route, "sfArrow" => [sf[0].round(1), sf[1].round(1), sf_ang.round], "lots" => lots, "turns" => turns, "rev" => (defined?(REV) ? REV : 2)
).reject { |_, v| v.nil? }
File.write(OUTFILE, "TRACKS.push({\n" + track.map { |k, v| "  #{k.to_json}:#{v.to_json}" }.join(",\n") + "\n});\n")
puts "wrote #{OUTFILE} (%d KB): %d badges, %d lots, home view %s"%[File.size(OUTFILE) / 1000, poi_out.size, lots.size, home.inspect]
