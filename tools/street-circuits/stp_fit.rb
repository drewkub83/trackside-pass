# encoding: utf-8
# St. Petersburg: fit the official festival map (displayed 2000 px wide; north points LEFT, east points UP) to real lat/lon
# using landmarks that OpenStreetMap knows, then convert the map's turn points and circuit polyline to lat/lon.
require File.join(__dir__, "lib_track.rb")

ANCH = [   # [map px, lat, lon]
  [[835, 1150], 27.76820, -82.63299],    # Al Lang Stadium
  [[1190, 915], 27.76611, -82.63138],    # Salvador Dali Museum
  [[435, 1122], 27.77084, -82.63291],    # Pioneer Park
  [[135, 1070], 27.77247, -82.63250],    # South Straub Park
  [[990, 1045], 27.76710, -82.63210],    # Mahaffey Theater
  [[1205, 1283], 27.76573, -82.63396], [[640, 1283], 27.76947, -82.63400], [[500, 1283], 27.77034, -82.63400],   # 1st St x 5th / 2nd / 1st Ave
  [[372, 1198], 27.77122, -82.63333], [[500, 1198], 27.77034, -82.63341], [[372, 1050], 27.77123, -82.63220],   # Beach Dr / Bay Shore Dr x Central / 1st Ave
]

def fit_affine(pairs)          # px -> [lat, lon]
  rows = pairs.map { |(x, y), *_| [1.0, x, y] }
  fit = ->(i) { ata = Array.new(3) { |a| Array.new(3) { |b| rows.each_index.sum { |k| rows[k][a] * rows[k][b] } } }
                atb = Array.new(3) { |a| rows.each_index.sum { |k| rows[k][a] * pairs[k][1 + i] } }; solve(ata.each_with_index.map { |r, a| r + [atb[a]] }) }
  [fit.(0), fit.(1)]
end
A = fit_affine(ANCH)
def px2ll(x, y) [A[0][0] + A[0][1] * x + A[0][2] * y, A[1][0] + A[1][1] * x + A[1][2] * y] end
if __FILE__ == $0
  puts "residuals (m):"; ANCH.each { |(x, y), la, lo| p = px2ll(x, y); puts "  %-22s %5.0f m" % [[x, y].inspect, dm(p, [la, lo])] }
  sx = dm(px2ll(0, 0), px2ll(1000, 0)) / 1000; sy = dm(px2ll(0, 0), px2ll(0, 1000)) / 1000
  puts "scale: %.2f m/px across, %.2f m/px down" % [sx, sy]
  T = { "T1" => [1488, 1105], "T2" => [1330, 1110], "T3" => [1203, 1280], "T4" => [640, 1280], "T5" => [633, 1153], "T6" => [533, 1148], "T7" => [500, 1198], "T8" => [372, 1198], "T9" => [376, 1055],
        "T10" => [1119, 845], "T11" => [1020, 507], "T12" => [1035, 430], "T13" => [950, 245], "T14" => [1035, 205], "S/F" => [1290, 660] }
  T.each { |n, (x, y)| puts "  %-4s %.5f, %.5f" % [n, *px2ll(x, y)] }
  puts "runway 07/25 ends in OSM: NE (27.76792,-82.6236)  SW (27.76319,-82.63364)"
end
