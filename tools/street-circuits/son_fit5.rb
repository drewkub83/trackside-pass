require File.join(__dir__, "lib_track.rb")
els = JSON.parse(File.read(File.join(__dir__, "osm/raceway-sonoma.json")))["elements"]
g = ->(id) { els.find { |e| e["id"] == id }["geometry"].map { |q| [q["lat"], q["lon"]] } }
ring = [505453048, 1494191149, 1494191150].flat_map.with_index { |i, k| k.zero? ? g.(i) : g.(i)[1..-1] }; closed = ring + [ring.first]; lap = poly_len(closed)
lat0 = 38.1625; lon0 = -122.4570
m = ->(p) { [(p[1] - lon0) * mlon(lat0), (p[0] - lat0) * MLAT] }
def to_ll(lat0, lon0, e, n) [lat0 + n / MLAT, lon0 + e / mlon(lat0)] end
ANCH = { [1150, 658] => 2050, [1025, 497] => 2270, [1200, 370] => 2490, [1347, 363] => 2795, [1370, 466] => 2955, [1188, 520] => 3100, [1488, 417] => 3988,
         [1475, 548] => 4155, [1430, 640] => 4265, [1205, 733] => 4525, [1115, 915] => 4780, [620, 948] => 5390, [927, 887] => 5740 }
names = %w[T1 T2 T3 T4 T5 T6 T7 T8 T8A T9 T10 T11 T12]
px = ANCH.keys; ringd = ANCH.values.dup
cum = [0.0]; closed.each_cons(2) { |a, b| cum << cum.last + dm(a, b) }
at_ring = ->(d) { point_at(closed, (d % lap) / lap)[0] }
fit = ->(ds) { prs = px.each_with_index.map { |p, i| [p, m.(at_ring.(ds[i]))] }
  rws = prs.map { |(x, y), _| [1.0, x / 1000.0, y / 1000.0] }
  sl = [0, 1].map { |k| ata = Array.new(3) { |r| Array.new(3) { |c| rws.sum { |rw| rw[r] * rw[c] } } }; atb = Array.new(3) { |r| rws.each_index.sum { |i| rws[i][r] * prs[i][1][k] } }; solve(ata.each_with_index.map { |rw, r| rw + [atb[r]] }) }
  ->(x, y) { [sl[0][0] + sl[0][1] * x / 1000.0 + sl[0][2] * y / 1000.0, sl[1][0] + sl[1][1] * x / 1000.0 + sl[1][2] * y / 1000.0] } }
f = fit.(ringd)
6.times do |it|
  new = ringd.each_with_index.map do |d, i|
    e, n = f.(*px[i]); best = nil
    (-260..260).step(10) { |o| dd = d + o; pt = m.(at_ring.(dd)); err = Math.hypot(pt[0] - e, pt[1] - n) + o.abs * 0.05; best = [dd, err] if best.nil? || err < best[1] }
    best[0]
  end
  # keep the order along the lap
  new.each_with_index { |v, i| new[i] = [v, new[i - 1] + 20].max if i > 0 && v <= new[i - 1] }
  ringd = new; f = fit.(ringd)
end
res = px.each_with_index.map { |p, i| e, n = f.(*p); pt = m.(at_ring.(ringd[i])); Math.hypot(pt[0] - e, pt[1] - n) }
puts "final RMS %.0f m; per turn:" % Math.sqrt(res.sum { |v| v * v } / res.size)
names.each_with_index { |nm, i| puts "  %-4s ring %5.0f  off %3.0f m" % [nm, ringd[i] % lap, res[i]] }
FILE = ARGV.include?("--facilities")
if FILE
  fac = [
    ["Gate 1", "gate", "Entry gate on Highway 121", 545, 1122], ["Gate 3", "gate", "Entry gate on Highway 121", 1312, 872], ["Gate 6", "gate", "Entry gate on Highway 121", 1792, 742],
    ["Gate 7", "gate", "Entry gate", 1855, 652], ["Gate 9", "gate", "Entry gate", 1505, 92], ["Gate 8", "gate", "Exit gate", 147, 980],
    ["Main Grandstand", "stand", "Grandstand along the pit straight", 988, 770], ["The Point General Admission", "stand", "General admission viewing", 1215, 640],
    ["Turn 2 Seating", "stand", "Terrace seating", 1025, 443], ["Turn 3 Seating", "stand", "Terrace seating", 1232, 320], ["Turn 7 Seating", "stand", "Terrace seating", 1632, 447], ["Turn 9 Seating", "stand", "Terrace seating", 1380, 730],
    ["Media Center", "info", "Media center", 884, 833], ["Will Call and Guest Services", "info", "Tickets, credentials and guest services", 455, 950],
    ["Information", "info", "Information", 1675, 445], ["Information", "info", "Information", 1055, 688], ["Information", "info", "Information", 1190, 873],
    ["First Aid", "med", "First aid", 963, 737], ["First Aid", "med", "First aid", 1617, 503],
    ["Restrooms", "rest", "Restrooms", 1713, 435], ["Restrooms", "rest", "Restrooms", 1020, 890],
    ["Bag Check", "info", "Bag check", 898, 695], ["Bag Check", "info", "Bag check", 560, 873], ["Bag Check", "info", "Bag check", 1061, 625], ["Bag Check", "info", "Bag check", 1667, 563],
    ["Ticket Renewal", "info", "Ticket renewal", 933, 760], ["Ticket Renewal", "info", "Ticket renewal", 1775, 390], ["Ticket Renewal", "info", "Ticket renewal", 1633, 570],
    ["Reverse ATM", "info", "Cash machine", 955, 792],
    ["Pedestrian Bridge (Turn 1)", "cross", "Walkway over the circuit", 1112, 590], ["Tunnel (Turn 10)", "cross", "Walkway under the circuit", 1140, 850], ["Crosswalk (Turn 10)", "cross", "Marked crossing", 1275, 930], ["Track Crossing (Pit Straight)", "cross", "Crossing at the pit straight", 1080, 725],
    ["Cougar Mountain", "camp", "Camping", 967, 205], ["RV Terrace", "camp", "Camping", 1160, 212], ["Turn 3 and 4 Camping", "camp", "Camping", 1272, 297], ["The Chute", "camp", "Camping", 1455, 328],
    ["Turn 7 Camping", "camp", "Camping", 1680, 378], ["Turn 8 Camping", "camp", "Camping", 1548, 558], ["Carousel", "camp", "Camping", 1280, 533], ["The Point Camping", "camp", "Camping", 1135, 510],
    ["Turn 1 Camping", "camp", "Camping", 1015, 585], ["50 Acres Campground", "camp", "Camping", 1618, 890],
    ["Fan Zone", "food", "Fan Zone concessions (vendors change by event)", 911, 718], ["Sonoma Raceway Cafe", "food", "Cafe near the paddock", 655, 825], ["Wine Garden", "food", "Wine garden (vendors change by event)", 868, 768],
    ["Turn 2 Concessions", "food", "Food area (vendors change by event)", 993, 412], ["Turn 7 Concessions", "food", "Food area (vendors change by event)", 1695, 352], ["Turn 9 Concessions", "food", "Food area (vendors change by event)", 1398, 760],
    ["North Grandstands Concessions", "food", "Food area (vendors change by event)", 1065, 695]]
LOTQ = { "Lot 1" => [[150,820],[330,820],[330,1000],[150,1000]], "ADA Parking" => [[150,700],[330,700],[330,800],[150,800]], "Lot 2" => [[445,690],[690,690],[690,830],[445,830]],
         "Lot 3" => [[790,545],[915,545],[915,625],[790,625]], "Lot 4" => [[1180,110],[1400,110],[1400,230],[1180,230]], "Lot 5" => [[960,115],[1090,115],[1090,200],[960,200]],
         "Lot 11" => [[1590,180],[1710,180],[1710,290],[1590,290]], "Lot 12" => [[1770,325],[1890,325],[1890,430],[1770,430]], "Lot 13" => [[1750,455],[1880,455],[1880,580],[1750,580]],
         "Lot 14" => [[1610,575],[1770,575],[1770,710],[1610,710]], "Lot E" => [[315,1035],[410,1035],[410,1100],[315,1100]], "Lot M" => [[660,545],[760,545],[760,610],[660,610]],
         "Premium Parking" => [[1580,340],[1670,340],[1670,400],[1580,400]], "50 Acres Parking Lot" => [[1690,780],[1800,780],[1800,830],[1690,830]] }
  out = fac.map { |n, k, d, x, y| e, nn = f.(x, y); la, lo = to_ll(lat0, lon0, e, nn); [n, k, d, la.round(6), lo.round(6)] }
  lo = LOTQ.map { |n, q| { "n" => n, "poly" => q.map { |x, y| e, nn = f.(x, y); la, lon = to_ll(lat0, lon0, e, nn); [la.round(6), lon.round(6)] } } }
  File.write(File.join(__dir__, "permanent/sonoma_facilities.json"), JSON.generate({ "_source" => "Positions read from Sonoma Raceway's 2026 NASCAR facility and concessions maps (illustrated maps), placed on the real circuit by matching the numbered turns. Approximate, about 60 m.", "pois" => out, "lots" => lo }))
  # turn labels
  tl = names.each_with_index.map { |nm, i| p = at_ring.(ringd[i]); [nm, p[0].round(6), p[1].round(6)] }
  File.write(File.join(__dir__, "permanent/sonoma_turns.json"), JSON.generate(tl))
  puts "wrote sonoma_facilities.json (#{out.size} badges, #{lo.size} lots) and sonoma_turns.json"
end
