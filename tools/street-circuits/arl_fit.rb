# encoding: utf-8
# Arlington: fit the official track map (north up, 2000 x 1166 px) to lat/lon with facility markers whose real coordinates the event's map publishes.
require File.join(__dir__, "lib_track.rb")
ANCH = [
  [[902, 640], 32.74656, -97.08965], [[180, 635], 32.74670, -97.09640], [[1092, 293], 32.74907, -97.08776], [[1466, 272], 32.74905, -97.08421], [[1858, 285], 32.74921, -97.07993],
  [[1028, 305], 32.74923, -97.08827], [[943, 625], 32.74673, -97.08907], [[312, 275], 32.74957, -97.09518], [[152, 297], 32.74932, -97.09668], [[137, 405], 32.74834, -97.09684],
  [[1631, 260], 32.74944, -97.08239], [[1701, 260], 32.74944, -97.08168],
]
def fit_affine(pairs)
  rows = pairs.map { |(x, y), *_| [1.0, x, y] }
  fit = ->(i) { ata = Array.new(3) { |a| Array.new(3) { |b| rows.each_index.sum { |k| rows[k][a] * rows[k][b] } } }
                atb = Array.new(3) { |a| rows.each_index.sum { |k| rows[k][a] * pairs[k][1 + i] } }; solve(ata.each_with_index.map { |r, a| r + [atb[a]] }) }
  [fit.(0), fit.(1)]
end
A = fit_affine(ANCH)
def px2ll(x, y) [A[0][0] + A[0][1] * x + A[0][2] * y, A[1][0] + A[1][1] * x + A[1][2] * y] end
if __FILE__ == $0
  ANCH.each { |(x, y), la, lo| p = px2ll(x, y); puts "  %-12s %5.0f m" % [[x, y].inspect, dm(p, [la, lo])] }
  puts "scale %.2f m/px across, %.2f m/px down; rotation terms %.1e %.1e" % [dm(px2ll(0, 0), px2ll(1000, 0)) / 1000, dm(px2ll(0, 0), px2ll(0, 1000)) / 1000, A[0][1], A[1][2]]
end
