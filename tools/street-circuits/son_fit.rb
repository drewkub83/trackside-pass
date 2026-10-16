require File.join(__dir__, "lib_track.rb")
els = JSON.parse(File.read(File.join(__dir__, "osm/raceway-sonoma.json")))["elements"]
g = ->(id) { els.find { |e| e["id"] == id }["geometry"].map { |q| [q["lat"], q["lon"]] } }
ring = [505453048, 1494191149, 1494191150].flat_map.with_index { |i, k| k.zero? ? g.(i) : g.(i)[1..-1] }; closed = ring + [ring.first]
cum = [0.0]; closed.each_cons(2) { |a, b| cum << cum.last + dm(a, b) }
# map pixels (user's Sonoma map, 978x657) of the numbered turns
T = { "T1" => [548, 325], "T2" => [505, 240], "T3" => [587, 180], "T4" => [665, 172], "T5" => [662, 225], "T6" => [587, 252], "T7" => [752, 203],
      "T8" => [716, 262], "T8A" => [697, 303], "T9" => [601, 353], "T10" => [546, 440], "T11" => [300, 465], "T12" => [445, 430] }
# similarity transform from two anchors: SE hairpin (T11) and NW hairpin (T7)
a_ll = [38.15859, -122.45205]; b_ll = [38.16668, -122.46219]
to_m = ->(p) { [(p[1] - a_ll[1]) * mlon(a_ll[0]), (p[0] - a_ll[0]) * MLAT] }   # east, north metres from T11 apex
bm = to_m.(b_ll); ap = T["T11"]; bp = T["T7"]
# pixel vector -> metres: complex-number similarity  m = k * (p - ap), k complex
pv = [bp[0] - ap[0], -(bp[1] - ap[1])]   # pixel x right, y up
kc = Complex(bm[0], bm[1]) / Complex(pv[0], pv[1])
puts "scale %.3f m/px, rotation %.0f deg" % [kc.abs, kc.arg * 180 / Math::PI]
pos = ->(p) { z = kc * Complex(p[0] - ap[0], -(p[1] - ap[1])); [a_ll[0] + z.imag / MLAT, a_ll[1] + z.real / mlon(a_ll[0])] }
T.each do |n, px|
  ll = pos.(px); sn = snap_to_poly(ll, closed); d = cum[sn[1]] + dm(closed[sn[1]], sn[0])
  puts "%-4s -> %.5f,%.5f  off ring %3.0f m  at ring %4.0f m" % [n, ll[0], ll[1], sn[3], d]
end

# order-constrained assignment: turns must follow each other along the ring (lap starts at T1, ring positions unwrapped past the start)
puts "--- monotonic assignment"
samples = (0...(cum.last / 5).to_i).map { |i| d = i * 5.0; idx = cum.index { |c| c >= d } || 0; [d, closed[idx]] }
names = %w[T1 T2 T3 T4 T5 T6 T7 T8 T8A T9 T10 T11 T12]
cands = names.map { |n| p0 = pos.(T[n]); samples.select { |d, p| dm(p, p0) < 130 }.map { |d, p| [d, dm(p, p0)] } }
lap = cum.last
best = nil
(cands[0]).each do |d0, e0|
  next unless d0 > 1700 && d0 < 2400        # T1 lies after the pit straight
  path = [[d0, e0]]; total = e0; ok = true
  (1...names.size).each do |i|
    prev = path.last[0]
    opts = cands[i].map { |d, e| dd = d; dd += lap while dd < prev; [dd, e] }.select { |dd, _| dd - prev < 900 }
    if opts.empty? then ok = false; break end
    pick = opts.min_by { |dd, e| e + (dd - prev) * 0.02 }; path << pick; total += pick[1]
  end
  best = [total, path] if ok && (best.nil? || total < best[0])
end
if best then best[1].each_with_index { |(d, e), i| p = closed[cum.index { |c| c >= (d % lap) } || 0]; puts "%-4s ring %4.0f m  (off %3.0f m)  %.5f,%.5f" % [names[i], d % lap, e, p[0], p[1]] } else puts "no consistent assignment" end
