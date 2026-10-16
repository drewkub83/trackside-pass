# encoding: utf-8
require File.join(__dir__, "stp_fit.rb")
els = JSON.parse(File.read(File.join(__dir__, "osm/stp-lite.json")))["elements"]
els.each { |w| next unless w["type"] == "way" && w["tags"] && w["tags"]["aeroway"] =~ /runway|taxiway/; w["tags"]["highway"] = "service"; w["tags"]["name"] ||= "aeroway " + w["tags"]["aeroway"].to_s + " " + w["tags"]["ref"].to_s }
S = Street.new(els)
TURNS = { "T1" => [1488, 1105], "T2" => [1330, 1110], "T3" => [1203, 1280], "T4" => [640, 1280], "T5" => [633, 1153], "T6" => [533, 1148], "T7" => [500, 1198], "T8" => [372, 1198], "T9" => [376, 1055],
          "T10" => [1119, 845], "T11" => [1020, 507], "T12" => [1035, 430], "T13" => [950, 245], "T14" => [1035, 205] }
if __FILE__ == $0
  names = TURNS.keys; names << "T1"
  names.each_cons(2) do |a, b|
    pa = px2ll(*TURNS[a]); pb = px2ll(*TURNS[b])
    na = S.nearest_node(pa); nb = S.nearest_node(pb)
    r = S.route(na, nb, ->(m) { !%w[footway steps path pedestrian cycleway].include?(m[:hw]) })
    if r then st = []; puts "%s->%s straight %4.0f m  snapA %3.0f m snapB %3.0f m  route %4.0f m" % [a, b, dm(pa, pb), dm(pa, S.pos[na]), dm(pb, S.pos[nb]), poly_len(r)]
    else puts "#{a}->#{b} NO ROUTE" end
  end
  puts S.ways.map { |w| w["tags"]["name"].to_s }.uniq.sort.first(80).inspect
end
