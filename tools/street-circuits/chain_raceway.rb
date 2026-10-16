# encoding: utf-8
# Finds closed loops that can be built from OpenStreetMap raceway pieces (oneway direction respected) and prints them.
require File.join(__dir__, "lib_track.rb")
id = ARGV[0]; skip = (ARGV[1] || "").split(",").map(&:to_i); tol = 4.0
els = JSON.parse(File.read(File.join(__dir__, "osm/raceway-#{id}.json")))["elements"]
ws = els.select { |w| w["type"] == "way" && w["geometry"] && w["tags"] && w["tags"]["highway"] == "raceway" && !skip.include?(w["id"]) && w["tags"]["name"].to_s !~ /Pit|Drag|Karting|Short|NASCAR|Runoff/i && w["nodes"].first != w["nodes"].last }
P = ws.map { |w| { id: w["id"], name: w["tags"]["name"].to_s, g: w["geometry"].map { |q| [q["lat"], q["lon"]] } } }
puts "#{P.size} pieces, total #{P.sum { |p| poly_len(p[:g]) }.round} m"
loops = []
search = lambda do |path, used, cur_end, start_pt, len|
  return if loops.size > 20
  if path.size > 2 && dm(cur_end, start_pt) < tol then loops << [path.dup, len]; return end
  P.each { |p| next if used.include?(p[:id]); if dm(p[:g].first, cur_end) < tol then search.(path + [[p, false]], used + [p[:id]], p[:g].last, start_pt, len + poly_len(p[:g])) end }
end
first = P.max_by { |p| poly_len(p[:g]) }
search.([[first, false]], [first[:id]], first[:g].last, first[:g].first, poly_len(first[:g]))
loops.sort_by! { |_, l| -l }
loops.first(5).each { |path, len| puts "loop %.0f m (%.3f mi), %d pieces: %s" % [len, len / 1609.34, path.size, path.map { |p, _| "#{p[:id]}#{p[:name].empty? ? "" : ":" + p[:name]}" }.join(" > ")] }
puts "no closed loop found" if loops.empty?
# dangling ends
ends = P.flat_map { |p| [[p, :first, p[:g].first], [p, :last, p[:g].last]] }
ends.each { |p, w, pt| n = ends.count { |q, w2, pt2| q[:id] != p[:id] && dm(pt, pt2) < tol }; puts "  free end: #{p[:id]} #{p[:name]} #{w} #{pt.map { |v| v.round(5) }.inspect}" if n == 0 }
