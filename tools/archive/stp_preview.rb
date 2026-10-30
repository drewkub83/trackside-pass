# encoding: utf-8
require File.join(__dir__, "lib_track.rb")
els = JSON.parse(File.read("osm/stp-lite.json"))["elements"]
sp = JSON.parse(File.read("st-petersburg.spec.json"))
lat0 = 27.7672; lon0 = -82.6300; sc = 1.15   # px per metre
xy = ->(p) { [((p[1] - lon0) * mlon(lat0) * sc).round(1), (-(p[0] - lat0) * MLAT * sc).round(1)] }
svg = +""
els.each do |w|
  next unless w["type"] == "way" && w["geometry"] && w["tags"]
  t = w["tags"]; g = w["geometry"].map { |q| xy.([q["lat"], q["lon"]]) }
  next if g.all? { |x, y| x.abs > 1700 || y.abs > 900 }
  pts = g.map { |x, y| "#{x},#{y}" }.join(" ")
  if t["aeroway"] then svg << "<polyline points='#{pts}' fill='none' stroke='#c9c9c9' stroke-width='#{t["aeroway"] == "runway" ? 26 : 8}'/>"
  elsif t["highway"] then svg << "<polyline points='#{pts}' fill='none' stroke='#999' stroke-width='1.2'/>" end
end
pa = sp["circuit"]["path"].map { |p| xy.(p).join(",") }.join(" ")
svg << "<polygon points='#{pa}' fill='none' stroke='#e5341f' stroke-width='3' opacity='.85'/>"
sp["circuit"]["turns"].each { |t| x, y = xy.([t["lat"], t["lon"]]); svg << "<circle cx='#{x}' cy='#{y}' r='9' fill='#fff' stroke='#e5341f'/><text x='#{x}' y='#{y + 3.5}' font-size='10' text-anchor='middle'>#{t["n"]}</text>" }
col = { "gate" => "#1e88e5", "med" => "#d32f2f", "screen" => "#8e24aa", "merch" => "#f57c00", "info" => "#00897b", "cross" => "#795548", "stand" => "#6a1b9a", "food" => "#2e7d32" }
sp["pois"].each { |p| x, y = xy.([p["lat"], p["lon"]]); svg << "<circle cx='#{x}' cy='#{y}' r='4' fill='#{col[p["k"]] || "#000"}'/>" }
sp["circuit"]["pit"].each_cons(2) { |a, b| svg << "<line x1='#{xy.(a)[0]}' y1='#{xy.(a)[1]}' x2='#{xy.(b)[0]}' y2='#{xy.(b)[1]}' stroke='#fbc02d' stroke-width='3'/>" }
File.write("stp-preview.html", "<body style='margin:0;background:#dfeef5'><svg width='800' height='450' viewBox='-470 -330 900 506'>#{svg}</svg></body>")
