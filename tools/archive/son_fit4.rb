require File.join(__dir__, "lib_track.rb")
els = JSON.parse(File.read(File.join(__dir__, "osm/raceway-sonoma.json")))["elements"]
g = ->(id) { els.find { |e| e["id"] == id }["geometry"].map { |q| [q["lat"], q["lon"]] } }
ring = [505453048, 1494191149, 1494191150].flat_map.with_index { |i, k| k.zero? ? g.(i) : g.(i)[1..-1] }; closed = ring + [ring.first]
cum = [0.0]; closed.each_cons(2) { |a, b| cum << cum.last + dm(a, b) }; lap = cum.last
T = { "T1" => [1150, 658], "T2" => [1025, 497], "T3" => [1200, 370], "T4" => [1347, 363], "T5" => [1370, 466], "T6" => [1188, 520], "T7" => [1488, 417],
      "T8" => [1475, 548], "T8A" => [1430, 640], "T9" => [1205, 733], "T10" => [1115, 915], "T11" => [620, 948], "T12" => [927, 887] }
names = T.keys
samples = (0...(lap / 4).to_i).map { |i| d = i * 4.0; j = cum.index { |c| c >= d } || 0; [d, closed[j]] }
lat0 = 38.1625; lon0 = -122.4570
m = ->(p) { [(p[1] - lon0) * mlon(lat0), (p[0] - lat0) * MLAT] }      # east, north metres
# start: similarity from the two hairpins
a = m.([38.15859, -122.45205]); b = m.([38.16668, -122.46219]); ap = T["T11"]; bp = T["T7"]
kc = Complex(b[0] - a[0], b[1] - a[1]) / Complex(bp[0] - ap[0], -(bp[1] - ap[1]))
f = ->(p) { z = kc * Complex(p[0] - ap[0], -(p[1] - ap[1])); [a[0] + z.real, a[1] + z.imag] }
assign = nil
5.times do |it|
  cands = names.map { |n| p0 = f.(T[n]); samples.select { |d, p| Math.hypot(m.(p)[0] - p0[0], m.(p)[1] - p0[1]) < 140 }.map { |d, p| [d, Math.hypot(m.(p)[0] - p0[0], m.(p)[1] - p0[1])] } }
  best = nil
  cands[0].each do |d0, e0|
    next unless d0 > 1750 && d0 < 2400
    path = [[d0, e0]]; tot = e0; ok = true
    (1...names.size).each do |i|
      prev = path.last[0]; opts = cands[i].map { |d, e| dd = d; dd += lap while dd < prev; [dd, e] }.select { |dd, _| dd - prev < 800 }
      (ok = false; break) if opts.empty?
      pick = opts.min_by { |dd, e| e + (dd - prev) * 0.01 }; path << pick; tot += pick[1]
    end
    best = [tot, path] if ok && (best.nil? || tot < best[0])
  end
  abort "no assignment" unless best
  assign = best[1]
  # refit an affine (map px -> metres) to the matched pairs
  pairs = names.each_with_index.map { |n, i| d = assign[i][0] % lap; j = cum.index { |c| c >= d } || 0; [T[n], m.(closed[j])] }
  rows = pairs.map { |(x, y), _| [1.0, x, y] }
  sol = [0, 1].map { |k| ata = Array.new(3) { |r| Array.new(3) { |c| rows.sum { |rw| rw[r] * rw[c] } } }; atb = Array.new(3) { |r| rows.each_index.sum { |i| rows[i][r] * pairs[i][1][k] } }; solve(ata.each_with_index.map { |rw, r| rw + [atb[r]] }) }
  f = ->(p) { [sol[0][0] + sol[0][1] * p[0] + sol[0][2] * p[1], sol[1][0] + sol[1][1] * p[0] + sol[1][2] * p[1]] }
  puts "iteration #{it + 1}: total offset %.0f m" % best[0]
end
puts "--- final"
names.each_with_index { |n, i| d = assign[i][0] % lap; j = cum.index { |c| c >= d } || 0; p = closed[j]; puts "%-4s ring %4.0f m  off %3.0f m  %.6f, %.6f" % [n, d, assign[i][1], p[0], p[1]] }

