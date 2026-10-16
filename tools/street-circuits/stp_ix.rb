# encoding: utf-8
require File.join(__dir__, "stp_fit.rb")
els = JSON.parse(File.read(File.join(__dir__, "osm/stp-lite.json")))["elements"]
ways = els.select { |w| w["type"] == "way" && w["tags"] && w["tags"]["highway"] && w["tags"]["name"] }
nodes = Hash.new { |h, k| h[k] = [] }; pos = {}
ways.each { |w| w["nodes"].each_with_index { |id, i| nodes[id] << w["tags"]["name"]; g = w["geometry"][i]; pos[id] = [g["lat"], g["lon"]] } }
def ix(nodes, pos, a, b)
  nodes.select { |id, ns| ns.any? { |n| n =~ a } && ns.any? { |n| n =~ b } }.map { |id, _| pos[id] }
end
[["1st Street S", /^1st Street South/, /^5th Avenue South/, [1205, 1283]], ["1st St x 2nd Ave S", /^1st Street South/, /^2nd Avenue South/, [640, 1283]],
 ["1st St x 1st Ave SE", /^1st Street South/, /^1st Avenue South/, [500, 1283]],
 ["Bay Shore x Central", /^Bay Shore/, /^Central Avenue/, [372, 1050]], ["Beach x Central", /^Beach Drive/, /^Central Avenue/, [372, 1198]],
 ["Beach x 1st Ave", /^Beach Drive/, /^1st Avenue South/, [500, 1198]], ["Beach x 1st Ave SE", /^Beach Drive/, /^1st Avenue Southeast/, [500, 1198]],
 ["Bay Shore x 1st Ave NE", /^Bay Shore/, /^1st Avenue Northeast/, [238, 1035]],
 ["1st St x 2nd Ave", /^1st Street/, /^2nd Avenue/, [640,1283]],
 ["1st St SE x 5th Ave S", /^1st Street Southeast/, /^5th Avenue South/, [1205,1283]],
 ["1st St SE x 2nd Ave S", /^1st Street Southeast/, /^2nd Avenue South/, [640,1283]],
 ["1st St SE x 1st Ave SE", /^1st Street Southeast/, /^1st Avenue Southeast/, [500,1283]]].each do |lab, a, b, px|
  r = ix(nodes, pos, a, b); puts "%-26s px=%s  osm=%s   affine says %s" % [lab, px.inspect, r.map { |q| q.map { |v| v.round(5) } }.inspect, px2ll(*px).map { |v| v.round(5) }.inspect]
end
