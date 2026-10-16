# encoding: utf-8
# Builds data/detroit.js from OpenStreetMap (dt.json) + the official 2026 Detroit Grand Prix track map (read in zoom views).
require "./lib_track.rb"

K = 800.0 / 735
VIEW = { "D0" => [190, 560, 0.72], "D1" => [330, 600, 0.72], "D2" => [880, 600, 0.72] }
def px(v, sx, sy)
  return [sx / 0.4, (sy - 125.5) / 0.4] if v == "O"          # overview screenshot of the 2000px map
  x0, y0, s = VIEW[v]; [x0 + sx / (s * K), y0 + sy / (s * K)]
end

els = JSON.parse(File.read("dt.json"))["elements"]
st = Street.new(els)
jef = ->(m) { m[:name] =~ /Jefferson Avenue/ }
node = ->(lat, lon, re = nil) { st.nearest_node([lat, lon], re ? st.on_name(re) : nil) }

nT2 = node.(42.33328, -83.03417, /Rivard/); nT1 = node.(42.33193, -83.03329, /Rivard/)
nT9 = node.(42.33017, -83.03735, /Franklin/); nT8 = node.(42.32924, -83.03669, /Saint Antoine/)
nT5 = node.(42.32733, -83.04219, /Bates/); nT4 = node.(42.32894, -83.04345, /Bates/)
nA = node.(42.32834, -83.04549, /West Jefferson Avenue/); nB = node.(42.32819, -83.04537, /West Jefferson Avenue/)
jefW = st.route(nT2, nA, jef) or abort "no westbound Jefferson"
jefE = st.route(nB, nT4, jef) or abort "no eastbound Jefferson"
bates = st.route(nT4, nT5, ->(m) { m[:name] =~ /Bates Street/ }) or abort "no Bates"
river = st.route(nT5, nT8, ->(m) { m[:name] =~ /Atwater Street/ }) or abort "no Atwater"
stant = st.route(nT8, nT9, ->(m) { m[:name] =~ /Saint Antoine/ }) or abort "no St Antoine"
frank = st.route(nT9, nT1, ->(m) { m[:name] =~ /Franklin Street/ }) or abort "no Franklin"
riv = st.route(nT1, nT2, ->(m) { m[:name] =~ /Rivard Street/ }) or abort "no Rivard"
hair = [st.pos[nA], st.pos[nB]]
puts "legs (m): jeffW=%.0f hairpin=%.0f jeffE=%.0f bates=%.0f river=%.0f stAntoine=%.0f franklin=%.0f rivard=%.0f"%[poly_len(jefW), poly_len(hair), poly_len(jefE), poly_len(bates), poly_len(river), poly_len(stant), poly_len(frank), poly_len(riv)]

# ---------- pixel traces of each section (native px) ----------
front_px = ([["D2",573,52],["D2",500,50],["D2",400,49],["D2",300,48],["D2",200,47],["D2",100,47],["D2",0,47],["D0",540,80],["D0",450,80],["D0",360,80],["D0",270,80],["D0",200,80],["D0",150,80]]).map { |v, x, y| px(v, x, y) }
hair_px  = ([["D0",150,80],["D0",145,90],["D0",145,102],["D0",150,115],["D0",160,120],["D0",200,120],["D0",250,121],["D0",305,122]]).map { |v, x, y| px(v, x, y) }
bates_px = ([["D0",305,122],["D0",303,180],["D0",302,250],["D0",305,313]]).map { |v, x, y| px(v, x, y) }
river_px = ([["D0",305,313],["D0",345,317],["D0",400,318],["D0",437,358],["D0",520,358],["D0",600,358],["D0",680,358],["D0",752,358]]).map { |v, x, y| px(v, x, y) }
stant_px = ([["D2",213,328],["D2",214,280],["D2",217,213]]).map { |v, x, y| px(v, x, y) }
frank_px = ([["D2",218,213],["D2",300,213],["D2",400,213],["D2",500,213],["D2",565,213]]).map { |v, x, y| px(v, x, y) }
riv_px   = ([["D2",565,213],["D2",568,130],["D2",573,52]]).map { |v, x, y| px(v, x, y) }

anchors = [
  [px("D2", 573, 52), st.pos[nT2]], [px("D2", 565, 213), st.pos[nT1]], [px("D2", 218, 213), st.pos[nT9]], [px("D2", 213, 328), st.pos[nT8]],
  [px("D0", 305, 313), st.pos[nT5]], [px("D0", 305, 122), st.pos[nT4]],
  [px("D0", 145, 102), [(st.pos[nA][0] + st.pos[nB][0]) / 2, (st.pos[nA][1] + st.pos[nB][1]) / 2]],
]
warp = Warp.new(anchors)
puts "warp residuals (m) at anchors: " + warp.residuals.map { |_, r| r }.inspect

ring = jefW + jefE + bates[1..-1] + river[1..-1] + stant[1..-1] + frank[1..-1] + riv[1..-1]
ring = ring.each_with_index.select { |p, i| i == 0 || dm(p, ring[i - 1]) > 0.5 }.map(&:first)
lap_m = poly_len(ring) + dm(ring.last, ring.first)
puts "lap length %.0f m = %.3f mi (official 1.645 mi)"%[lap_m, lap_m / 1609.34]

secs = [[front_px, jefW], [hair_px, hair + jefE], [bates_px, bates], [river_px, river], [stant_px, stant], [frank_px, frank], [riv_px, riv]]
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
  ve, vn = p[0] - q[0], -(p[1] - q[1])
  side = (tp[0] * vn + tp[1] * ve) >= 0 ? 1.0 : -1.0
  mpp = poly_len(rr) / total; dist = d * mpp
  [base[0] + (te * side * dist) / MLAT, base[1] + (-tn * side * dist) / mlon(base[0])]
end

# start / finish: the finish line is on Franklin Street, the start line on Jefferson Avenue
fin_ll = place.(px("D2", 385, 213)); fin = snap_to_poly(fin_ll, frank)
start_ll = place.(px("D0", 558, 80)); startp = snap_to_poly(start_ll, jefW)

P = [
  ["Start line", "info", "Race start line on Jefferson Avenue", "D0", 558, 82],
  ["Grandstand 1", "stand", "Reserved seat grandstand", "D2", 405, 197], ["Grandstand 9", "stand", "Reserved seat grandstand", "D2", 352, 197],
  ["Grandstand 8", "stand", "Reserved seat grandstand", "D0", 725, 382], ["Grandstand 4", "stand", "Reserved seat grandstand", "D0", 270, 138],
  ["Grandstand 3A", "stand", "Reserved seat grandstand", "D0", 128, 65], ["Grandstand 3B", "stand", "Reserved seat grandstand", "D0", 108, 102],
  ["Rooftop: Port Atwater Garage", "info", "Rooftop viewing, ticket or pass required", "D0", 690, 268], ["Rooftop: Franklin Garage", "info", "Rooftop viewing, ticket or pass required", "D2", 268, 182],
  ["Rooftop: Center Garage", "info", "Rooftop viewing presented by Piston Group, ticket or pass required", "D0", 378, 275], ["Rooftop: River East Garage", "info", "Rooftop viewing, ticket or pass required", "D2", 518, 270],
  ["Corvette & Cadillac Car Corral", "info", "Car corral at the Beaubien Garage", "D0", 695, 318],
  ["Turn 3 Club", "info", "Hospitality", "D0", 150, 140], ["Plaza Club", "info", "Hospitality", "D0", 140, 168],
  ["Jumbo screen", "screen", "Big screen", "D0", 162, 98], ["Jumbo screen", "screen", "Big screen", "D0", 255, 102], ["Jumbo screen", "screen", "Big screen", "D0", 740, 262],
  ["Jumbo screen", "screen", "Big screen", "D0", 740, 342], ["Jumbo screen", "screen", "Big screen", "D2", 322, 196], ["Jumbo screen", "screen", "Big screen", "D2", 388, 196],
  ["Jumbo screen", "screen", "Big screen", "D2", 430, 277],
  ["Viewing platform", "stand", "Standing viewing platform", "D0", 275, 52], ["Viewing platform", "stand", "Standing viewing platform", "D0", 433, 52],
  ["Viewing platform", "stand", "Standing viewing platform", "D0", 538, 52], ["Viewing platform", "stand", "Standing viewing platform", "D0", 641, 52],
  ["Viewing platform", "stand", "Standing viewing platform", "D0", 541, 378],
  ["First Aid", "med", "", "D0", 148, 243], ["First Aid", "med", "", "D0", 655, 341], ["First Aid", "med", "", "D2", 370, 157],
  ["Information booth", "info", "", "D0", 410, 62], ["Information booth", "info", "", "D0", 145, 270], ["Information booth", "info", "", "D0", 222, 153],
  ["Information booth", "info", "", "D0", 523, 290], ["Information booth", "info", "", "D0", 635, 290], ["Information booth", "info", "", "D2", 238, 127],
  ["Ticket Sales", "gate", "Ticket sales booth", "D0", 22, 150], ["Ticket Sales", "gate", "Ticket sales booth", "D0", 545, 330], ["Ticket Sales", "gate", "Ticket sales booth", "D2", 425, 158],
  ["Pedestrian bridge (Woodward)", "cross", "Crosses the circuit at Spirit Plaza", "D0", 208, 100], ["Pedestrian bridge (Renaissance Center)", "cross", "Crosses Jefferson Avenue by the Renaissance Center", "D0", 503, 120],
  ["Pedestrian bridge (Bates)", "cross", "Crosses the circuit near Turn 4", "D0", 302, 147], ["Pedestrian bridge (Rivard)", "cross", "Crosses the circuit at Woodbridge St", "D2", 568, 143],
  ["Pedestrian bridge (ticket required)", "cross", "Pedestrian bridge, ticket or pass required", "D0", 752, 300], ["Pedestrian bridge (ticket required)", "cross", "Pedestrian bridge by the pit lane, ticket or pass required", "D2", 440, 240],
  ["Shuttle stop R1", "info", "Event shuttle stop", "D0", 48, 300], ["Shuttle stop R2", "info", "Event shuttle stop", "D0", 180, 322], ["Shuttle stop R3", "info", "Event shuttle stop", "D0", 270, 335],
  ["Shuttle stop R4", "info", "Event shuttle stop", "D0", 598, 388], ["Shuttle stop R5", "info", "Event shuttle stop", "D2", 535, 428],
  ["Shuttle stop J1", "info", "Event shuttle stop", "D0", 388, 122], ["Shuttle stop J2", "info", "Event shuttle stop", "D0", 522, 122], ["Shuttle stop J3", "info", "Event shuttle stop", "D0", 763, 140],
  ["Shuttle stop J4", "info", "Event shuttle stop", "D2", 442, 108], ["Shuttle stop J5", "info", "Event shuttle stop", "D0", 628, 230],
  ["Spirit Plaza", "info", "Activation area", "D0", 232, 45], ["Hart Plaza", "info", "Activation area", "D0", 150, 255], ["Pratt Miller Patio", "info", "Activation area", "D0", 245, 290],
  ["Fifth Third Paddock", "info", "Team paddock", "D2", 450, 382], ["INDY NXT by Firestone Paddock", "info", "Team paddock", "D2", 615, 372],
  ["DGP Credential Center", "info", "1801 Atwater St", "D2", 740, 392], ["Autotrader Winner's Circle", "info", "Victory lane", "D2", 430, 332],
  ["DAUCH Pit Lane Suites", "info", "Suites along the pit lane", "D2", 280, 335], ["Citizens Trackside Suites", "info", "Suites trackside", "D2", 355, 335],
  ["Renaissance Center", "info", "Landmark", "D0", 560, 168], ["Millender Center", "info", "Landmark", "D0", 490, 42], ["Detroit Windsor Tunnel", "info", "Landmark", "D0", 378, 163],
  ["Tower 300", "info", "Landmark", "D0", 588, 300], ["Cullen Plaza", "info", "Landmark", "D2", 605, 437],
]
P.reject! { |q| q[0] == "Information booth" }
pois = P.map { |n, k, d, v, sx, sy| { "n" => n, "k" => k, "d" => d, "ll" => place.(px(v, sx, sy)) } }

turn_ll = { "T1" => st.pos[nT1], "T2" => st.pos[nT2], "T3" => hair[0], "T4" => st.pos[nT4], "T5" => st.pos[nT5],
            "T6" => place.(px("D0", 400, 318)), "T7" => place.(px("D0", 437, 358)), "T8" => st.pos[nT8], "T9" => st.pos[nT9] }

# ---------- hand-off to the shared finishing step ----------
sf_pt = fin[0]; sf_nxt = fin[4]
pit_way = st.ways.find { |w| w["tags"]["highway"] == "raceway" && w["tags"]["name"].to_s =~ /Pit Lane/ }
pit_ll = pit_way ? pit_way["geometry"].map { |q| [q["lat"], q["lon"]] } : nil
parks = []
META = {
  "id" => "detroit", "name" => "Detroit Street Circuit", "short" => "Detroit", "place" => "Detroit, Michigan", "length" => "1.65 mi", "opened" => 2023,
  "blurb" => "A 1.645-mile, nine-turn street circuit through downtown Detroit beside the Renaissance Center and the Detroit River. The cars run flat out down Jefferson Avenue, hairpin at Turn 3, then dive down Bates Street and along the riverfront before the pit lane on Franklin Street. This is the 2026 layout and it may change for 2027.",
  "facts" => { "Signature sections" => "Jefferson Avenue front straight, the Turn 3 hairpin, the Atwater Street riverfront run", "Race weekend" => "Rebuilt on city streets every year", "Best seat for value" => "Rooftop and plaza viewing platforms along Jefferson Avenue", "Crossings" => "Pedestrian bridges over Jefferson Avenue, Bates Street and Rivard Street" },
  "events" => [{ "d" => "2027-06-04", "e" => "Chevrolet Detroit Grand Prix", "s" => "IMSA WeatherTech, GTP and GTD PRO", "t" => 2 }],
  "tz" => "America/Detroit", "eventName" => "Chevrolet Detroit Grand Prix", "nturns" => 9
}
OUTFILE = "detroit.js"
DATA_BB = [42.3165, -83.0640, 42.3435, -83.0160]
STREET_LABELS = [[/East Jefferson Avenue/, "Jefferson Ave"], [/Woodward Avenue/, "Woodward Ave"], [/Rivard Street/, "Rivard St"], [/Franklin Street/, "Franklin St"], [/Atwater Street/, "Atwater St"], [/Bates Street/, "Bates St"], [/Saint Antoine Street/, "St Antoine"], [/Beaubien Street/, "Beaubien St"], [/Griswold Street/, "Griswold St"], [/East Larned Street/, "Larned St"], [/East Congress Street/, "Congress St"], [/Randolph Street/, "Randolph St"]]
CLOSE_WATER_SOUTH = true
eval(File.read("finish_street.rb"), binding)
