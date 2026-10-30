# Sonoma 2026 NASCAR facility map (illustrated, 2000x1328 display px) -> lat/lon with a homography fitted on the numbered turns.
require File.join(__dir__, "lib_track.rb")
els = JSON.parse(File.read(File.join(__dir__, "osm/raceway-sonoma.json")))["elements"]
g = ->(id) { els.find { |e| e["id"] == id }["geometry"].map { |q| [q["lat"], q["lon"]] } }
ring = [505453048, 1494191149, 1494191150].flat_map.with_index { |i, k| k.zero? ? g.(i) : g.(i)[1..-1] }; closed = ring + [ring.first]; lap = poly_len(closed)
lat0 = 38.1625; lon0 = -122.4570
m = ->(p) { [(p[1] - lon0) * mlon(lat0), (p[0] - lat0) * MLAT] }
ll = ->(e, n) { [lat0 + n / MLAT, lon0 + e / mlon(lat0)] }
ANCH = { [1150, 658] => 2050, [1025, 497] => 2270, [1200, 370] => 2490, [1347, 363] => 2795, [1370, 466] => 2955, [1188, 520] => 3100, [1488, 417] => 3988,
         [1475, 548] => 4155, [1430, 640] => 4265, [1205, 733] => 4525, [1115, 915] => 4780, [620, 948] => 5390, [927, 887] => 5740 }
pairs = ANCH.map { |px, d| [px, m.(point_at(closed, (d % lap) / lap)[0])] }
def homography(pairs)
  rows = []; rhs = []
  pairs.each { |(x, y), (e, n)| x /= 1000.0; y /= 1000.0; e /= 1000.0; n /= 1000.0; rows << [x, y, 1, 0, 0, 0, -e * x, -e * y]; rhs << e; rows << [0, 0, 0, x, y, 1, -n * x, -n * y]; rhs << n }
  ata = Array.new(8) { |a| Array.new(8) { |b| rows.each_index.sum { |k| rows[k][a] * rows[k][b] } } }
  atb = Array.new(8) { |a| rows.each_index.sum { |k| rows[k][a] * rhs[k] } }
  h = solve(ata.each_with_index.map { |r, a| r + [atb[a]] })
  ->(x, y) { x /= 1000.0; y /= 1000.0; w = h[6] * x + h[7] * y + 1; [(h[0] * x + h[1] * y + h[2]) / w * 1000, (h[3] * x + h[4] * y + h[5]) / w * 1000] }
end
H = homography(pairs)
res = pairs.map { |(x, y), (e, n)| pe, pn = H.(x, y); Math.hypot(pe - e, pn - n) }
puts "homography residuals (m): " + res.map(&:round).inspect + "  RMS %.0f" % Math.sqrt(res.sum { |v| v * v } / res.size)
def to_ll(lat0, lon0, e, n) [lat0 + n / MLAT, lon0 + e / mlon(lat0)] end
if __FILE__ == $0
  { "4A" => [1385, 318], "7A" => [1605, 473], "9A" => [1240, 778] }.each { |n, px| e, nn = H.(*px); p = to_ll(lat0, lon0, e, nn); sn = snap_to_poly(p, closed); puts "#{n}: off ring %.0f m at ring %.0f" % [sn[3], closed.each_cons(2).first(0).size + 0] }
end

# plain affine for comparison
rows = pairs.map { |(x, y), _| [1.0, x / 1000.0, y / 1000.0] }
sol = [0, 1].map { |k| ata = Array.new(3) { |r| Array.new(3) { |c| rows.sum { |rw| rw[r] * rw[c] } } }; atb = Array.new(3) { |r| rows.each_index.sum { |i| rows[i][r] * pairs[i][1][k] } }; solve(ata.each_with_index.map { |rw, r| rw + [atb[r]] }) }
AFF = ->(x, y) { [sol[0][0] + sol[0][1] * x / 1000.0 + sol[0][2] * y / 1000.0, sol[1][0] + sol[1][1] * x / 1000.0 + sol[1][2] * y / 1000.0] }
ares = pairs.map { |(x, y), (e, n)| pe, pn = AFF.(x, y); Math.hypot(pe - e, pn - n) }
puts "affine residuals (m): " + ares.map(&:round).inspect + "  RMS %.0f" % Math.sqrt(ares.sum { |v| v * v } / ares.size)
