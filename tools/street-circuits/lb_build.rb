# encoding: utf-8
# Builds data/long-beach.js from OpenStreetMap (lb.json) + the official 2027 circuit map (read visually in zoom views).
require "./lib_track.rb"

K = 800.0 / 735
VIEW = { "A" => [0, 780, 0.72], "B" => [950, 640, 0.72], "C" => [2000, 640, 0.72] }
def px(v, sx, sy)
  return [sx / 0.2637, (sy - 191.5) / 0.2637] if v == "O"      # overview screenshot
  x0, y0, s = VIEW[v]; [x0 + sx / (s * K), y0 + sy / (s * K)]
end

els = JSON.parse(File.read("lb.json"))["elements"]
st = Street.new(els)
shore = ->(m) { m[:name] == "Shoreline Drive" }

# ---------- circuit from real streets ----------
inf = st.ways.find { |w| w["tags"]["name"].to_s =~ /Infield Section/ }
infield = inf["geometry"].map { |g| [g["lat"], g["lon"]] }
n1 = st.nearest_node(infield.last)
a1 = st.nearest_node([33.76388, -118.19449], st.on_name(/^Shoreline Drive$/))
front = st.route(n1, a1, shore) or abort "no front straight"
nj = st.nearest_node([33.76481, -118.19671])
nt6 = st.nearest_node([33.76297, -118.19272], st.on_name(/Pine/))
east = st.route(nj, nt6, shore) or abort "no eastbound"
nt8 = st.nearest_node([33.76584, -118.19236], st.on_name(/Seaside/))
pine = st.route(nt6, nt8, ->(m) { m[:name] =~ /Pine Avenue/ }) or abort "no pine"
nt9 = st.nearest_node(infield.first)
seaside = st.route(nt8, nt9, ->(m) { m[:name] =~ /Seaside Way/ }) or abort "no seaside"
puts "legs (m): front=%.0f east=%.0f pine=%.0f seaside=%.0f infield=%.0f"%[poly_len(front), poly_len(east), poly_len(pine), poly_len(seaside), poly_len(infield)]

# ---------- pixel trace of the front straight (travel order N1 -> T1) ----------
front_px = [["C",485,318],["C",440,345],["C",350,392],["C",260,445],["C",170,500],["C",80,560],["C",0,612],
            ["B",800,650],["B",700,690],["B",600,712],["B",500,722],["B",420,718],["B",330,700],["B",250,668],["B",170,625],["B",100,580],["B",40,540],["B",0,505],
            ["A",799,438],["A",720,395],["A",640,350],["A",575,315],["A",545,300]].map { |v, x, y| px(v, x, y) }
plen = front_px.each_cons(2).map { |a, b| Math.hypot(a[0] - b[0], a[1] - b[1]) }
ptotal = plen.sum
def pt_frac(pts, lens, total, f)
  t = total * f; acc = 0.0
  pts.each_cons(2).with_index { |(a, b), i| l = lens[i]; if acc + l >= t then u = (t - acc) / l; return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u] end; acc += l }
  pts.last
end

anchors = [
  [px("C", 290, 32), infield.first],
  [px("C", 470, 318), infield.last],
  [px("A", 545, 300), st.pos[a1]],
  [px("A", 275, 103), st.pos[nj]],
  [px("B", 60, 472), st.pos[nt6]],
  [px("B", 103, 22), st.pos[nt8]],
]
[0.25, 0.5, 0.75].each { |f| anchors << [pt_frac(front_px, plen, ptotal, f), point_at(front, f)[0]] }
warp = Warp.new(anchors)
puts "warp residuals (m) at anchors: " + warp.residuals.map { |_, r| r }.inspect

# ---------- west loop (T1..T5) traced on the map, warped, then pinned to the real road ends ----------
loop_px = [[545,300],[512,284],[488,308],[462,350],[430,390],[395,416],[365,433],[335,452],[300,456],[282,436],[288,400],[298,372],[258,345],[215,318],[190,290],[180,245],[190,185],[208,138],[240,108],[275,102]].map { |x, y| px("A", x, y) }
loop_ll = loop_px.map { |p| warp.call(p) }
off_a = [st.pos[a1][0] - loop_ll.first[0], st.pos[a1][1] - loop_ll.first[1]]
off_j = [st.pos[nj][0] - loop_ll.last[0], st.pos[nj][1] - loop_ll.last[1]]
loop_ll = loop_ll.each_with_index.map { |p, i| f = i.to_f / (loop_ll.size - 1); [p[0] + off_a[0] * (1 - f) + off_j[0] * f, p[1] + off_a[1] * (1 - f) + off_j[1] * f] }
loop_ll = chaikin(loop_ll, 2)
puts "west loop length %.0f m"%poly_len(loop_ll)

ring = front + loop_ll[1..-2] + east + pine[1..-1] + seaside[1..-1] + infield[1..-1]
ring = ring.each_with_index.select { |p, i| i == 0 || dm(p, ring[i - 1]) > 0.5 }.map(&:first)
lap_m = poly_len(ring) + dm(ring.last, ring.first)
puts "lap length %.0f m = %.3f mi (official 1.968 mi)"%[lap_m, lap_m / 1609.34]

# ---------- manual trace from geojson.io replaces the auto-built circuit (GJ=path/to/file.json) ----------
if ENV["GJ"]
  feats = JSON.parse(File.read(ENV["GJ"]))["features"]
  lns = feats.select { |f| f["geometry"]["type"] == "LineString" }.map { |f| f["geometry"]["coordinates"].map { |lo, la| [la, lo] } }
  uv = lns.shift
  until lns.empty?
    j = lns.min_by { |g| [dm(uv.last, g.first), dm(uv.last, g.last)].min }
    j = j.reverse if dm(uv.last, j.last) < dm(uv.last, j.first)
    uv += j; lns.delete(j)
  end
  uv = uv.each_with_index.select { |p, i| i == 0 || dm(p, uv[i - 1]) > 1.0 }.map(&:first)
  pt = feats.find { |f| f["geometry"]["type"] == "Point" }
  SF_POINT = pt ? [pt["geometry"]["coordinates"][1], pt["geometry"]["coordinates"][0]] : nil
  und = Hash.new { |h, k| h[k] = [] }
  st.adj.each { |u, es| es.each { |v, len, _| und[u] << [v, len]; und[v] << [u, len] } }
  near_node = ->(p) { id, q = st.pos.min_by { |_, qq| dm(p, qq) }; [id, dm(p, q)] }
  dense = [uv.first]; snapped = 0
  uv.each_cons(2) do |a, b|
    d = dm(a, b); ia, da = near_node.(a); ib, db = near_node.(b); path = nil
    if da < 30 && db < 30 && ia != ib
      dist = { ia => 0.0 }; prev = {}; q = [[0.0, ia]]; done = {}
      until q.empty?
        dd, u = q.min_by(&:first); q.delete([dd, u]); next if done[u]; done[u] = true; break if u == ib || dd > d * 1.5 + 40
        und[u].each { |v, len| nd = dd + len; if !dist[v] || nd < dist[v] then dist[v] = nd; prev[v] = u; q << [nd, v] end }
      end
      if dist[ib] && dist[ib] <= d * 1.07 + 6 then path = [ib]; path.unshift(prev[path[0]]) while prev[path[0]]; path = path.map { |id| st.pos[id] } end
    end
    if path then dense.concat(path[1..-1]); snapped += 1 else dense << b end
  end
  dense = uv.dup if ENV["RAW"]                     # dense trace: use the clicks as they are
  ring = dense.each_with_index.select { |p, i| i == 0 || dm(p, dense[i - 1]) > 0.8 }.map(&:first)
  ring.pop if dm(ring.last, ring.first) < 4
  i0 = ring.each_index.min_by { |i| dm(ring[i], infield.last) }
  ring = ring[i0..-1] + ring[0...i0]
  idx = []; from = 0
  [st.pos[a1], st.pos[nj], st.pos[nt6], st.pos[nt8], st.pos[nt9]].each { |p| i = (from...ring.size).min_by { |k| dm(ring[k], p) }; idx << i; from = i }
  front = ring[0..idx[0]]; loop_ll = ring[idx[0]..idx[1]]; east = ring[idx[1]..idx[2]]; pine = ring[idx[2]..idx[3]]; seaside = ring[idx[3]..idx[4]]; infield = ring[idx[4]..-1] + [ring[0]]
  loop_ll = chaikin(loop_ll, 2)                      # round the hand-clicked corners of the T1-T5 loop
  east = taper_offset(east, 15.0)                       # the return leg is a separate road beside the front straight: draw it clearly apart
  ring = front[0..-2] + loop_ll[0..-2] + east[0..-2] + pine[0..-2] + seaside[0..-2] + infield[0..-2]
  pick = ->(i) { uv[i] }
  TURN_IDX = { "T1" => 4, "T2" => 8, "T3" => 9, "T4" => 10, "T5" => 12, "T6" => 13, "T7" => 14, "T8" => 15, "T9" => 17, "T10" => 21, "T11" => 23 }
  if ENV["TURN_REF"]      # turn positions from an earlier, coarser trace of the same circuit -> nearest vertex on this one
    rf = JSON.parse(File.read(ENV["TURN_REF"]))["features"].select { |f| f["geometry"]["type"] == "LineString" }.flat_map { |f| f["geometry"]["coordinates"].map { |lo, la| [la, lo] } }
    UV_TURNS = TURN_IDX.map { |n, i| [n, ring.min_by { |p| dm(p, rf[i]) }] }.to_h
  else
    UV_TURNS = TURN_IDX.map { |n, i| [n, uv[i]] }.to_h
  end
  lap_m = poly_len(ring) + dm(ring.last, ring.first)
  puts "MANUAL TRACE: %d clicks -> %d points (%d segments followed real streets); lap %.0f m = %.3f mi (official 1.968 mi)"%[uv.size, ring.size, snapped, lap_m, lap_m / 1609.34]
end

# ---------- start/finish ----------
sf_ll = (defined?(SF_POINT) && SF_POINT) ? SF_POINT : warp.call(px("C", 55, 600))
sfs = snap_to_poly(sf_ll, front)
puts "S/F snapped %.0f m from its map position"%sfs[3]

# ---------- place things relative to the circuit (distance along the track + sideways offset) ----------
east_px    = [[275,102],[330,138],[400,178],[470,215],[560,262],[650,308],[740,355],[783,378]].map { |x, y| px("A", x, y) }
pine_px    = [["B",60,472],["B",75,440],["B",92,395],["B",97,345],["B",98,290],["B",102,200],["B",106,100],["B",108,25]].map { |v, x, y| px(v, x, y) }
seaside_px = [["B",108,20],["B",300,15],["B",500,13],["B",700,14],["B",800,15],["C",0,42],["C",120,40],["C",240,38],["C",290,33]].map { |v, x, y| px(v, x, y) }
infield_px = [[290,33],[288,120],[283,200],[288,245],[315,282],[360,297],[410,292],[455,275],[490,250],[503,240],[505,262],[495,292],[478,318]].map { |x, y| px("C", x, y) }
secs = [[front_px, front], [loop_px, loop_ll], [east_px, east], [pine_px, pine], [seaside_px, seaside], [infield_px, infield]]
place = lambda do |p|
  best = nil
  secs.each do |pp, rr|
    total = pp.each_cons(2).sum { |a, b| Math.hypot(b[0] - a[0], b[1] - a[1]) }; acc = 0.0
    pp.each_cons(2) do |a, b|
      dx, dy = b[0] - a[0], b[1] - a[1]; l = Math.hypot(dx, dy); next if l.zero?
      t = [[((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (l * l), 0].max, 1].min
      q = [a[0] + dx * t, a[1] + dy * t]; d = Math.hypot(p[0] - q[0], p[1] - q[1])
      best = [d, acc + l * t, total, rr, q, [dx / l, dy / l]] if best.nil? || d < best[0]
      acc += l
    end
  end
  d, s, total, rr, q, tp = best
  next warp.call(p) if d > 260
  base, nxt = point_at(rr, s / total)
  te = (nxt[1] - base[1]) * mlon(base[0]); tn = (nxt[0] - base[0]) * MLAT; tl = Math.hypot(te, tn)
  next warp.call(p) if tl.zero?
  te /= tl; tn /= tl
  ve, vn = p[0] - q[0], -(p[1] - q[1])                       # pixel offset in (east, north)
  side = (tp[0] * vn + tp[1] * ve) >= 0 ? 1.0 : -1.0   # left of travel = +1
  mpp = poly_len(rr) / total; dist = d * mpp
  east_m = -tn * side * dist; north_m = te * side * dist
  [base[0] + north_m / MLAT, base[1] + east_m / mlon(base[0])]
end

# ---------- points of interest (name, kind, description, view, x, y) ----------
P = [
  ["Yellow Ticket Entry", "gate", "Ticket entry on Pine Ave", "O", 298, 316],
  ["Green Ticket Entry", "gate", "Ticket entry on Long Beach Blvd", "O", 438, 316],
  ["Red Ticket Entry", "gate", "Ticket entry by Cedar Ave and Bay St", "A", 562, 162],
  ["Blue Ticket Entry", "gate", "Ticket entry at the east end of Shoreline Drive", "C", 690, 232],
  ["Ticket Office", "info", "Purchase tickets and Will Call, 300 E. Ocean Blvd", "O", 500, 296],
  ["Grandstand 5", "stand", "Grandstand seating", "A", 600, 245], ["Grandstand 6", "stand", "Grandstand seating", "A", 668, 290],
  ["Grandstand 7", "stand", "Grandstand seating, wheelchair accessible", "A", 752, 318],
  ["Grandstand 40", "stand", "Grandstand seating", "A", 578, 368], ["Grandstand 36", "stand", "Grandstand seating", "A", 650, 405],
  ["Grandstand 16", "stand", "Grandstand seating, wheelchair accessible", "C", 262, 257], ["Grandstand 18", "stand", "Grandstand seating", "C", 293, 322],
  ["Grandstand 24", "stand", "Grandstand seating", "C", 530, 318], ["Grandstand 25", "stand", "Grandstand seating", "C", 470, 370],
  ["Grandstand 26", "stand", "Grandstand seating, wheelchair accessible", "C", 373, 451], ["Grandstand 27", "stand", "Grandstand seating", "C", 280, 533],
  ["Grandstand 29", "stand", "Grandstand seating", "C", 130, 650], ["Grandstand 30", "stand", "Grandstand seating", "O", 533, 603],
  ["Grandstand 31", "stand", "Grandstand seating, wheelchair accessible", "O", 487, 623],
  ["Big screen", "screen", "Vision board big-screen viewing location", "A", 515, 190], ["Big screen", "screen", "Vision board big-screen viewing location", "B", 48, 588],
  ["Big screen", "screen", "Vision board big-screen viewing location", "B", 438, 752], ["Big screen", "screen", "Vision board big-screen viewing location", "C", 348, 258],
  ["Big screen", "screen", "Vision board big-screen viewing location", "C", 418, 241], ["Big screen", "screen", "Vision board big-screen viewing location", "C", 298, 371],
  ["Big screen", "screen", "Vision board big-screen viewing location", "C", 75, 530],
  ["First Aid Station", "med", "", "A", 692, 518], ["First Aid Station", "med", "", "C", 8, 313], ["First Aid Station", "med", "", "C", 340, 660],
  ["Pedestrian bridge (Pike)", "cross", "Crosses the circuit near Turn 5", "A", 450, 215], ["O'Reilly Auto Parts bridge", "cross", "Pedestrian bridge at Turn 2", "A", 420, 395],
  ["Pedestrian bridge (Pine Ave)", "cross", "Pedestrian bridge at Turn 8", "B", 165, 15], ["King Taco bridge", "cross", "Pedestrian bridge over Shoreline Drive", "B", 172, 590],
  ["Acura bridge", "cross", "Pedestrian bridge over the front straight", "C", 165, 555], ["Firestone bridge", "cross", "Pedestrian bridge by the Turn 9 straight", "C", 295, 197],
  ["Port of Long Beach bridge", "cross", "Pedestrian bridge by Turns 10 and 11", "C", 400, 375],
  ["Merchandise", "merch", "Official Grand Prix merchandise", "B", 430, 150], ["Merchandise", "merch", "Official Grand Prix merchandise", "B", 160, 295],
  ["Merchandise", "merch", "Official Grand Prix merchandise", "C", 30, 175], ["Merchandise", "merch", "Official Grand Prix merchandise", "C", 190, 682],
  ["Concert Stage", "info", "Concerts at the Long Beach Convention Center", "O", 445, 350], ["Lifestyle Expo", "info", "Sponsor and lifestyle exhibits", "B", 350, 245],
  ["Porsche Carrera Cup Paddock", "info", "Team paddock", "B", 268, 88], ["Historic Race Paddock", "info", "Team paddock", "B", 325, 335],
  ["Dan Gurney Media Center", "info", "Media center", "B", 557, 95], ["Stadium Super Trucks Paddock", "info", "Team paddock", "B", 523, 357],
  ["Family Fun Zone", "info", "Activities for families", "B", 670, 370], ["Super Drift Paddock", "info", "Team paddock", "B", 742, 272],
  ["Hyatt Regency Hotel", "info", "Landmark", "B", 280, 430], ["Vista Club", "info", "Hospitality club on Rainbow Lagoon", "B", 505, 592],
  ["Lagoon Park", "info", "Park beside Rainbow Lagoon", "B", 728, 512], ["Arena Park", "info", "Landmark by the Arena", "O", 520, 392],
  ["Seaside Club", "info", "Hospitality", "C", 98, 85], ["Bistro Row", "info", "Food and drink", "C", 55, 205],
  ["Hospitality Village", "info", "Hospitality", "C", 130, 255], ["NTT IndyCar Series Paddock", "info", "Team paddock", "C", 128, 350],
  ["IMSA WeatherTech Paddock", "info", "IMSA team paddock, Friday and Saturday", "C", 430, 88], ["Exotic Car Paddock", "info", "Exotic cars, Sunday only", "C", 430, 122],
  ["Club C300", "info", "Hospitality club", "C", 630, 272], ["Food Truck Experience", "food", "Food trucks", "O", 503, 655],
  ["Shoreline Village", "info", "Shops and restaurants on the harbor", "B", 250, 845], ["Marina Park", "info", "Park by the marina", "O", 438, 663],
]
PARK = [
  ["Shoreline Parking", "#EC407A", "Pre-paid reserved parking", "A", [[100, 5], [243, 62], [192, 127], [65, 72]]],
  ["Pike Parking", "#F28C28", "Pre-paid reserved parking", "A", [[250, 25], [335, 0], [420, 72], [380, 108]]],
  ["Marina Parking", "#29B6F6", "Pre-paid reserved parking, wheelchair accessible", "C", [[630, 440], [662, 472], [195, 868], [157, 833]]],
]
pois = P.map { |n, k, d, v, sx, sy| ll = place.(px(v, sx, sy)); { "n" => n, "k" => k, "d" => d, "ll" => ll } }
parks = PARK.map { |n, c, d, v, cs| { "n" => n, "c" => c, "d" => d, "poly" => cs.map { |x, y| place.(px(v, x, y)) } } }

# turn labels
turn_ll = { "T1" => st.pos[a1], "T2" => loop_ll[6], "T3" => loop_ll[11], "T4" => loop_ll[14], "T5" => st.pos[nj], "T6" => st.pos[nt6],
            "T7" => place.(px("B", 97, 345)), "T8" => st.pos[nt8], "T9" => infield.first, "T10" => infield[23], "T11" => infield.last }

turn_ll = UV_TURNS if defined?(UV_TURNS)
# ---------- hand-off to the shared finishing step ----------
sf_pt = sfs[0]; sf_nxt = sfs[4]
fr_len = poly_len(front); acc = 0.0; seg = []
front.each_cons(2) { |a, b| l = dm(a, b); f0 = acc / fr_len; seg << a if f0 >= sfs[2] - 0.13 && f0 <= sfs[2] + 0.06; acc += l }
pit_ll = seg.size > 3 ? offset_poly(seg, 13.0) : nil        # pit lane runs beside the front straight, on the right-hand side
META = {
  "id" => "long-beach", "name" => "Long Beach Street Circuit", "short" => "Long Beach", "place" => "Long Beach, California", "length" => "1.97 mi", "opened" => 1975,
  "blurb" => "A temporary 1.968-mile, 11-turn street circuit that wraps around the Long Beach Convention Center and the Aquarium of the Pacific. Shoreline Drive is the fast front straight, and the rest is tight and technical. The course, grandstands and gates are rebuilt every April; this is the 2027 layout.",
  "facts" => { "Signature sections" => "Shoreline Drive front straight, Acura Turn 1, the Turn 9 to 11 hairpin section", "Race weekend" => "Rebuilt on city streets every spring", "Best seat for value" => "Grandstands along Shoreline Drive by the start/finish line", "Crossings" => "Pedestrian bridges at Turns 2, 5, 8, the front straight and the hairpin" },
  "events" => [{ "d" => "2027-04-16", "e" => "Acura Grand Prix of Long Beach", "s" => "IMSA WeatherTech, 100-minute race", "t" => 2 }],
  "tz" => "America/Los_Angeles", "eventName" => "Acura Grand Prix of Long Beach", "nturns" => 11
}
OUTFILE = "long-beach.js"
DATA_BB = [33.7495, -118.2085, 33.7795, -118.1735]
STREET_LABELS = [[/^Ocean Boulevard$|East Ocean Boulevard/, "Ocean Blvd"], [/^Shoreline Drive$/, "Shoreline Drive"], [/Long Beach Boulevard/, "Long Beach Blvd"], [/Pine Avenue/, "Pine Ave"], [/East Seaside Way/, "Seaside Way"], [/^Linden Avenue$/, "Linden Ave"], [/Alamitos Avenue/, "Alamitos Ave"]]
CLOSE_WATER_SOUTH = false
eval(File.read("finish_street.rb"), binding)
