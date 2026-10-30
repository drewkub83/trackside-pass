require File.join(__dir__, "lib_track.rb")
els = JSON.parse(File.read(File.join(__dir__, "osm/raceway-sonoma.json")))["elements"]
g = ->(id) { els.find { |e| e["id"] == id }["geometry"].map { |q| [q["lat"], q["lon"]] } }
ring = [505453048, 1494191149, 1494191150].flat_map.with_index { |i, k| k.zero? ? g.(i) : g.(i)[1..-1] }
# resample every 10 m
pts = []; acc = 0.0; ring2 = ring + [ring.first]
ring2.each_cons(2) { |a, b| l = dm(a, b); n = [1, (l / 5).ceil].max; n.times { |k| pts << [a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n] } }
step = poly_len(pts + [pts.first]) / pts.size
hd = pts.each_index.map { |i| a = pts[i]; b = pts[(i + 1) % pts.size]; Math.atan2((b[1] - a[1]) * mlon(a[0]), (b[0] - a[0]) * MLAT) * 180 / Math::PI }
tot = []; win = (30 / step).round
pts.each_index { |i| d = hd[(i + win) % hd.size] - hd[(i - win) % hd.size]; d -= 360 while d > 180; d += 360 while d < -180; tot << d }
on = tot.map { |v| v.abs > 55 }
arcs = []; cur = nil
on.each_with_index { |f, i| if f then (cur ||= [i, i]); cur[1] = i elsif cur then arcs << cur; cur = nil end }
arcs << cur if cur
# merge arcs closer than 25 m
puts "lap #{poly_len(ring2).round} m, step %.1f m, #{pts.size} samples" % step
cumd = ->(i) { i * step }
arcs.each_with_index { |(a, b), k| m = pts[(a + b) / 2]; s = tot[(a + b) / 2]; puts "arc %2d at %.0f m  centre %.5f, %.5f  turn %+d deg %s" % [k + 1, cumd.((a + b) / 2), m[0], m[1], s.round, s > 0 ? "RIGHT" : "LEFT"] }
puts "start point #{pts[0].map { |v| v.round(5) }.inspect}"
