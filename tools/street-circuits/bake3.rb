# encoding: utf-8
# Bakes a "Copy layout" export into a track's data file (v3: added badges, stable ids, deletes, rev bump).
# Usage (from the project root): ruby bake3.rb layout.json
require "json"
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8
lay = JSON.parse(File.read(ARGV[0]))
f = "data/#{lay["track"]}.js"
t = JSON.parse(File.read(f).sub(/\ATRACKS\.push\(/, "").sub(/\);\s*\z/, ""))

# give every badge a permanent id (slug of its original name), once
unless t["pois"].all? { |p| p["id"] }
  seen = Hash.new(0)
  t["pois"].each do |p|
    base = p["n"].downcase.gsub(/[^a-z0-9]+/, "-").gsub(/\A-|-\z/, "")
    seen[base] += 1
    p["id"] = seen[base] > 1 ? "#{base}-#{seen[base]}" : base
  end
  puts "assigned ids to #{t["pois"].size} badges"
end
find = ->(key) { t["pois"].find { |q| q["id"] == key } || t["pois"].find { |q| q["n"] == key } }

# badges added in dev mode: append them (with their ids) before applying edits
(lay["added"] || []).each do |a|
  next if t["pois"].any? { |q| q["id"] == a["id"] }
  poi = { "k" => a["k"] || "info", "n" => a["n"] || "New badge", "x" => a["x"], "y" => a["y"] }
  poi["d"] = a["d"] unless a["d"].to_s.empty?
  poi["id"] = a["id"]
  t["pois"] << poi
  puts "added #{poi["n"]} at (#{poi["x"]}, #{poi["y"]})"
end

(lay["moved"] || {}).each do |key, o|
  p = find.(key) or (warn "no badge: #{key}"; next)
  if o["del"]
    t["pois"].delete(p); t["lots"].reject! { |l| l["n"] == p["n"] }; puts "deleted #{p["n"]}"; next
  end
  orig_n = p["n"]
  p["x"] = o["x"] if o["x"]; p["y"] = o["y"] if o["y"]
  p["k"] = o["k"] if o["k"]
  if o.key?("shower")   # only store it when it differs from the track default
    if o["shower"] == (t["showers"] ? true : false) then p.delete("shower") else p["shower"] = o["shower"] end
  end
  p["d"] = o["d"] if o.key?("d") && !o["d"].to_s.empty?      # blank description = keep what is there
  if o["n"] && o["n"] != orig_n && (m = orig_n[/\d{3,4}[–-]\d{3,4}/]) && !p["d"].to_s.include?(m)   # keep site numbers when the name is simplified
    p["d"] = [p["d"], "Sites #{m}"].reject { |v| v.to_s.empty? }.join(" · ")
  end
  p["n"] = o["n"] if o["n"] && !o["n"].empty?
  l = t["lots"].find { |q| q["n"] == orig_n }
  if l
    l["n"] = p["n"]
    (l["x"] = p["x"]; l["y"] = p["y"]) if o["x"]
  end
end

(lay["lots"] || {}).each do |name, pts|
  l = t["lots"].find { |q| q["n"] == name } or (warn "no lot: #{name}"; next)
  l["d"] = "M" + pts.map { |x, y| "#{'%.1f' % x},#{'%.1f' % y}" }.join(" L") + " Z"
end

t["rev"] = (t["rev"] || 0) + 1
File.write(f, "TRACKS.push({\n" + t.map { |k, v| "  #{k.to_json}:#{v.to_json}" }.join(",\n") + "\n});\n")
puts "baked #{(lay["moved"] || {}).size} edits, #{(lay["added"] || []).size} new badges, #{(lay["lots"] || {}).size} lots; rev=#{t["rev"]}; badges=#{t["pois"].size}"
