require File.join(__dir__, "lib_track.rb")
els = JSON.parse(File.read(File.join(__dir__, "osm/raceway-sonoma.json")))["elements"]
g = ->(id) { els.find { |e| e["id"] == id }["geometry"].map { |q| [q["lat"], q["lon"]] } }
ring = [505453048, 1494191149, 1494191150].flat_map.with_index { |i, k| k.zero? ? g.(i) : g.(i)[1..-1] }
pit = g.(230287120)
lat0 = 38.1625; lon0 = -122.4570; sc = 0.42
xy = ->(p) { [((p[1] - lon0) * mlon(lat0) * sc + 450).round(1), (450 - (p[0] - lat0) * MLAT * sc).round(1)] }
svg = +"<polyline fill='none' stroke='#222' stroke-width='5' points='#{(ring + [ring.first]).map { |p| xy.(p).join(",") }.join(" ")}'/>"
svg << "<polyline fill='none' stroke='#e8a' stroke-width='3' points='#{pit.map { |p| xy.(p).join(",") }.join(" ")}'/>"
cum = [0.0]; (ring + [ring.first]).each_cons(2) { |a, b| cum << cum.last + dm(a, b) }
(0..4000).step(250) { |d| i = cum.index { |c| c >= d } || 0; x, y = xy.(ring[i]); svg << "<circle cx='#{x}' cy='#{y}' r='4' fill='#d33'/><text x='#{x + 6}' y='#{y - 5}' font-size='13' fill='#d33'>#{d}</text>" }
x, y = xy.(ring[0]); svg << "<text x='#{x}' y='#{y}' font-size='16' fill='blue'>START</text>"
File.write("son-plot.html", "<body style='margin:0;background:#f4f4ee'><svg width='900' height='900' viewBox='0 0 900 900'>#{svg}</svg></body>")
