# encoding: utf-8
# Turns a Track Builder file (<id>.spec.json) into data/<id>.js and registers the track in index.html and sw.js.
#   ruby tools/street-circuits/build_track.rb path/to/<id>.spec.json [--replace] [--no-register]
# Needs internet the first time (downloads the OpenStreetMap base into tools/street-circuits/osm/<id>.json, reused afterwards).
require "json"
require "fileutils"
require "time"
require File.join(__dir__, "lib_track.rb")

args = ARGV.dup
replace = !args.delete("--replace").nil?
register = args.delete("--no-register").nil?
specfile = args.shift or abort "usage: ruby build_track.rb spec.json [--replace] [--no-register]"
spec = JSON.parse(File.read(specfile, encoding: "UTF-8"))
circ = spec["circuit"] || {}

# ---------- checks ----------
id = spec["id"].to_s.strip
abort "spec has no id" if id.empty?
abort "id must be lowercase letters, digits and dashes" unless id =~ /\A[a-z0-9]+(-[a-z0-9]+)*\z/
path = (circ["path"] || []).map { |la, lo| [la.to_f, lo.to_f] }
abort "circuit has only #{path.size} points" if path.size < 8
abort "start/finish is not set" unless circ["sf"]
path.pop if path.size > 2 && dm(path.first, path.last) < 1.0
root = File.expand_path("../..", __dir__)
outfile = File.join(root, "data", "#{id}.js")
rev = 1
if File.exist?(outfile)
  abort "data/#{id}.js already exists. Re-run with --replace to overwrite it (a backup is kept in tools/street-circuits/backup/). Layout edits saved in the app since then are NOT in the new file." unless replace
  FileUtils.mkdir_p(File.join(__dir__, "backup")); FileUtils.cp(outfile, File.join(__dir__, "backup", "#{id}.#{Time.now.strftime('%Y%m%d-%H%M%S')}.js"))
  rev = (File.read(outfile, encoding: "UTF-8")[/"rev":(\d+)/, 1] || "1").to_i + 1
end

# ---------- circuit ring, starting at the start/finish line ----------
smooth = ((spec["style"] || {}).key?("smooth") ? spec["style"]["smooth"] : 2).to_i      # corners are rounded by default (Chaikin); "style":{"smooth":0} keeps the points exactly as placed
path = chaikin(path + [path.first], smooth)[0..-2] if smooth > 0
closed = path + [path.first]
sfs = snap_to_poly(circ["sf"].map(&:to_f), closed)
i = sfs[1]
ring = [sfs[0]] + path[(i + 1)..-1].to_a + path[0..i]
ring = ring.each_with_index.select { |p, k| k == 0 || dm(p, ring[k - 1]) > 0.5 }.map(&:first)
lap_m = poly_len(ring) + dm(ring.last, ring.first)
off = spec["officialMiles"].to_f
puts "circuit: %d points, lap %.0f m = %.3f mi%s; S/F snapped %.0f m onto the line"%[ring.size, lap_m, lap_m / 1609.34, off > 0 ? " (official #{off} mi, %+.1f%%)"%[(lap_m / 1609.34 - off) / off * 100] : "", sfs[3]]
sf_pt = sfs[0]; sf_nxt = point_at(ring + [ring.first], 0.004)[0]

# ---------- the same frame finish_street.rb will pick, so we only download what is needed ----------
cs, cn = ring.map { |p| p[0] }.minmax; cw, ce = ring.map { |p| p[1] }.minmax
latc = (cs + cn) / 2; lonc = (cw + ce) / 2
cw_m = (ce - cw) * mlon(latc); ch_m = (cn - cs) * MLAT
width_m = cw_m * 1.5 + 300; need_h = (cw_m * 1.06) / 0.46 * 1.12; height_m = [ch_m * 1.5 + 300, width_m * 1.2, need_h].max
mx = width_m / 2 + 350; my = height_m / 2 + 350
bb = [latc - my / MLAT, lonc - mx / mlon(latc), latc + my / MLAT, lonc + mx / mlon(latc)].map { |v| v.round(5) }
DATA_BB = bb

osmdir = File.join(__dir__, "osm"); FileUtils.mkdir_p(osmdir)
osmfile = File.join(osmdir, "#{id}.json")
unless File.exist?(osmfile) && File.size(osmfile) > 1000
  b = bb.join(",")
  q = "[out:json][timeout:170];( way[\"highway\"](#{b}); way[\"building\"](#{b}); way[\"natural\"~\"water|coastline|beach\"](#{b}); way[\"waterway\"](#{b}); " \
      "way[\"leisure\"~\"park|garden|marina|pitch|playground\"](#{b}); way[\"amenity\"=\"parking\"](#{b}); way[\"landuse\"~\"grass|recreation_ground|forest\"](#{b}); " \
      "relation[\"natural\"=\"water\"](#{b}); relation[\"leisure\"=\"park\"](#{b}); ); out geom;"
  File.write(File.join(osmdir, "#{id}.q"), q)
  ok = false
  ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"].each do |url|
    puts "downloading OpenStreetMap data for #{id} from #{url.split('/')[2]} ..."
    system("curl", "-s", "-f", "-m", "240", "-A", "TracksidePass/0.1 (personal race-day app)", "-H", "Accept: */*", "--data-urlencode", "data@#{File.join(osmdir, "#{id}.q")}", "-o", osmfile, url)
    if File.exist?(osmfile) && File.size(osmfile) > 1000 && File.read(osmfile, 60) =~ /"elements"|"version"/ then ok = true; break end
    File.delete(osmfile) if File.exist?(osmfile)
  end
  abort "could not download OpenStreetMap data (check the internet connection and try again)" unless ok
end
els = JSON.parse(File.read(osmfile, encoding: "UTF-8"))["elements"]
st = Street.new(els)
puts "OpenStreetMap: %d elements, %.1f MB"%[els.size, File.size(osmfile) / 1e6]

# ---------- street labels: the named streets that carry the circuit, longest first ----------
ABBR = { "Boulevard" => "Blvd", "Avenue" => "Ave", "Street" => "St", "Drive" => "Dr", "Road" => "Rd", "Highway" => "Hwy", "Parkway" => "Pkwy", "Place" => "Pl", "Court" => "Ct", "Lane" => "Ln" }
near = Hash.new(0.0)
samples = ring.each_cons(2).flat_map { |a, b| m = [1, (dm(a, b) / 20).ceil].max; (0...m).map { |k| [a[0] + (b[0] - a[0]) * k / m, a[1] + (b[1] - a[1]) * k / m] } }
st.ways.each do |w|
  nm = w["tags"]["name"].to_s; next if nm.empty? || w["tags"]["highway"] =~ /footway|path|steps|cycleway|service|raceway/ || nm =~ /Grand Prix|Infield|Hairpin|Pit /
  g = w["geometry"].map { |q| [q["lat"], q["lon"]] }
  near[nm] += g.count { |p| samples.any? { |s| (s[0] - p[0]).abs < 0.0003 && (s[1] - p[1]).abs < 0.0004 && dm(s, p) < 25 } } * 15.0
end
names = near.select { |_, v| v > 0 }.sort_by { |_, v| -v }.first(10).map(&:first)
STREET_LABELS = names.map { |n| [/\A#{Regexp.escape(n)}\z/, n.split(" ").map { |t| ABBR[t] || t }.join(" ")] }
puts "street labels: " + STREET_LABELS.map { |_, t| t }.join(", ")

# ---------- badges, lots, turns, pit ----------
pois = (spec["pois"] || []).map { |p| h = { "n" => p["n"], "k" => p["k"], "d" => p["d"].to_s, "ll" => [p["lat"].to_f, p["lon"].to_f] }; h["shower"] = true if p["shower"]; h }
parks = (spec["lots"] || []).map { |l| { "n" => l["n"], "c" => l["c"] || "#EC407A", "d" => l["d"] || "Parking", "poly" => l["poly"].map { |la, lo| [la.to_f, lo.to_f] } } }
turn_ll = (circ["turns"] || []).sort_by { |t| t["n"].to_i }.map { |t| ["T#{t["n"]}", [t["lat"].to_f, t["lon"].to_f]] }.to_h
pit_ll = (circ["pit"] || []).size > 1 ? circ["pit"].map { |la, lo| [la.to_f, lo.to_f] } : nil
puts "warning: no pedestrian crossings (kind 'cross'): walking directions will not be able to cross the circuit" unless pois.any? { |p| p["k"] == "cross" }
puts "warning: #{turn_ll.size} turns placed but the spec says #{spec["nturns"]}" if spec["nturns"].to_i > 0 && turn_ll.size != spec["nturns"].to_i

events = (spec["events"] || []).map { |e| { "d" => e["d"], "e" => e["e"], "s" => e["s"].to_s, "t" => (e["t"] || 1).to_i } }
META = { "id" => id, "name" => spec["name"] || spec["short"] || id, "short" => spec["short"] || spec["name"] || id, "place" => spec["place"].to_s, "length" => spec["length"] || ("%.2f mi"%[lap_m / 1609.34]),
         "opened" => spec["opened"], "blurb" => spec["blurb"].to_s, "facts" => spec["facts"] || {}, "events" => events, "tz" => spec["tz"] || "America/New_York",
         "eventName" => spec["eventName"] || (events.first && events.first["e"]) || spec["name"], "nturns" => (spec["nturns"] || turn_ll.size).to_i }.reject { |_, v| v.nil? }
OUTFILE = outfile
CLOSE_WATER_SOUTH = !!spec["riverSouth"]
STYLE_TW = ((spec["style"] || {})["tw"] || 5.5).to_f
REV = rev
TRACK_ID = id                      # finish_street.rb reuses the local name `id` for badge ids
Dir.chdir(__dir__) { eval(File.read("finish_street.rb", encoding: "UTF-8"), binding) }
id = TRACK_ID

# ---------- register the track in the app ----------
if register
  html = File.join(root, "index.html"); h = File.read(html, encoding: "UTF-8")
  tag = %(<script src="data/#{id}.js"></script>)
  if h.include?(tag) then puts "index.html: #{id} already listed"
  else h.sub!(%(<script src="data/series.js"></script>), tag + "\n" + %(<script src="data/series.js"></script>)) or abort "could not find the series.js tag in index.html"; File.write(html, h); puts "index.html: added #{id}" end
  sw = File.join(root, "sw.js"); s = File.read(sw, encoding: "UTF-8")
  unless s =~ /const TRACKS = \[[^\]]*"#{Regexp.escape(id)}"/
    s.sub!(/(const TRACKS = \[[^\]]*)\]/) { "#{$1},\"#{id}\"]" } or abort "could not find TRACKS in sw.js"; puts "sw.js: added #{id} to TRACKS"
  end
  s.sub!(/const VERSION = "v(\d+)"/) { %(const VERSION = "v#{$1.to_i + 1}") }; File.write(sw, s)
  puts "sw.js: " + s[/const VERSION = "[^"]+"/]
end
puts "done. Now run ./build.sh and drag dist onto Netlify when you are ready to publish."
