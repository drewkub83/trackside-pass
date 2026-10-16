# encoding: utf-8
# Reusable helpers for building a street-circuit track file from OpenStreetMap + an official circuit map image.
require "json"
Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

MLAT = 110900.0
def mlon(lat)
  111320.0 * Math.cos(lat * Math::PI / 180)
end
def dm(a, b); Math.hypot((a[0] - b[0]) * MLAT, (a[1] - b[1]) * mlon((a[0] + b[0]) / 2)); end

# ---------- graph of drivable ways ----------
class Street
  attr_reader :pos, :adj, :ways
  def initialize(els)
    @ways = els.select { |w| w["type"] == "way" && w["tags"] && w["tags"]["highway"] }
    @pos = {}; @adj = Hash.new { |h, k| h[k] = [] }
    @ways.each do |w|
      t = w["tags"]; ow = t["oneway"]; ow = "yes" if ow.nil? && t["highway"].to_s =~ /motorway/
      w["nodes"].each_with_index { |id, i| g = w["geometry"][i]; @pos[id] = [g["lat"], g["lon"]] }
      w["nodes"].each_cons(2) do |a, b|
        len = dm(@pos[a], @pos[b]); meta = { name: t["name"].to_s, hw: t["highway"], id: w["id"] }
        if ow == "yes" then @adj[a] << [b, len, meta]
        elsif ow == "-1" then @adj[b] << [a, len, meta]
        else @adj[a] << [b, len, meta]; @adj[b] << [a, len, meta] end
      end
    end
  end
  def nearest_node(p, pred = nil)
    @pos.select { |id, _| pred.nil? || pred.(id) }.min_by { |_, q| dm(p, q) }.first
  end
  def on_name(re)
    ->(id) { @adj[id].any? { |_, _, m| m[:name] =~ re } }
  end
  def route(s, g, allow)
    dist = { s => 0.0 }; prev = {}; q = [[0.0, s]]; done = {}
    until q.empty?
      d, u = q.min_by(&:first); q.delete([d, u]); next if done[u]; done[u] = true; break if u == g
      @adj[u].each { |v, len, m| next unless allow.(m); nd = d + len; if !dist[v] || nd < dist[v] then dist[v] = nd; prev[v] = u; q << [nd, v] end }
    end
    return nil unless dist[g]
    path = [g]; path.unshift(prev[path[0]]) while prev[path[0]]
    path.map { |id| @pos[id] }
  end
end

# ---------- geometry ----------
def poly_len(pts)
  pts.each_cons(2).sum { |a, b| dm(a, b) }
end
def point_at(pts, frac)          # point and heading at a fraction of arc length
  total = poly_len(pts); target = total * frac; acc = 0.0
  pts.each_cons(2) { |a, b| l = dm(a, b); if acc + l >= target then t = l.zero? ? 0 : (target - acc) / l; return [[a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], b] end; acc += l }
  [pts.last, pts.last]
end
def snap_to_poly(p, pts)         # nearest point on a polyline -> [point, segment index, fraction along whole line, distance m]
  best = nil; total = poly_len(pts); acc = 0.0
  pts.each_cons(2).with_index do |(a, b), i|
    ax, ay = a[1] * mlon(a[0]), a[0] * MLAT; bx, by = b[1] * mlon(a[0]), b[0] * MLAT; px, py = p[1] * mlon(a[0]), p[0] * MLAT
    dx, dy = bx - ax, by - ay; l2 = dx * dx + dy * dy; t = l2.zero? ? 0 : [[((px - ax) * dx + (py - ay) * dy) / l2, 0].max, 1].min
    q = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; d = dm(p, q); l = dm(a, b)
    best = [q, i, (acc + l * t) / total, d, b] if best.nil? || d < best[3]
    acc += l
  end
  best
end
def dp(pts, tol)                 # Douglas-Peucker on [x,y] points
  return pts if pts.size < 3
  a, b = pts.first, pts.last; dx, dy = b[0] - a[0], b[1] - a[1]; l = Math.hypot(dx, dy)
  idx, dmax = 0, 0
  (1...pts.size - 1).each { |i| p = pts[i]; d = l.zero? ? Math.hypot(p[0] - a[0], p[1] - a[1]) : ((p[0] - a[0]) * dy - (p[1] - a[1]) * dx).abs / l; if d > dmax then dmax = d; idx = i end }
  return [a, b] if dmax <= tol
  dp(pts[0..idx], tol)[0..-2] + dp(pts[idx..-1], tol)
end
def ring_area_m2(ring)
  (ring.each_cons(2).sum { |a, b| (a[1] * mlon(a[0]) * b[0] * MLAT) - (b[1] * mlon(a[0]) * a[0] * MLAT) }.abs / 2)
end

# ---------- affine fit (least squares) + IDW residual warp ----------
def solve(m)                     # gaussian elimination on augmented matrix
  n = m.size
  n.times { |i| pv = (i...n).max_by { |r| m[r][i].abs }; m[i], m[pv] = m[pv], m[i]; d = m[i][i]; m[i] = m[i].map { |v| v / d }; n.times { |r| next if r == i; f = m[r][i]; m[r] = m[r].zip(m[i]).map { |u, v| u - f * v } } }
  m.map { |r| r[n] }
end
def affine_fit(pairs)            # pairs: [[[x,y],[lat,lon]],...]
  rows = pairs.map { |(x, y), _| [1.0, x, y] }
  fit = ->(idx) { ata = Array.new(3) { |i| Array.new(3) { |j| rows.each_index.sum { |k| rows[k][i] * rows[k][j] } } }; atb = Array.new(3) { |i| rows.each_index.sum { |k| rows[k][i] * pairs[k][1][idx] } }; solve(ata.each_with_index.map { |r, i| r + [atb[i]] }) }
  [fit.(0), fit.(1)]
end
class Warp
  def initialize(pairs)
    @a = affine_fit(pairs); @anch = pairs.map { |px, ll| g = aff(px); [px, [ll[0] - g[0], ll[1] - g[1]]] }
  end
  def aff((x, y))
    [@a[0][0] + @a[0][1] * x + @a[0][2] * y, @a[1][0] + @a[1][1] * x + @a[1][2] * y]
  end
  def call(px, power: 2.0)
    g = aff(px); wsum = 0.0; rl = 0.0; ro = 0.0
    @anch.each { |apx, (rlat, rlon)| d = Math.hypot(px[0] - apx[0], px[1] - apx[1]); return [g[0] + rlat, g[1] + rlon] if d < 1.0; w = 1.0 / (d**power); wsum += w; rl += w * rlat; ro += w * rlon }
    [g[0] + rl / wsum, g[1] + ro / wsum]
  end
  def residuals
    @anch.map { |px, (a, b)| [px, Math.hypot(a * MLAT, b * 92500).round] }
  end
end

# ---------- more helpers (street-circuit v2) ----------
def parse_d(d)
  d.scan(/(-?\d+\.?\d*),(-?\d+\.?\d*)/).map { |x, y| [x.to_f, y.to_f] }
end
def chaikin(pts, n = 2)            # round off sharp corners of a polyline of [x,y] or [lat,lon]
  n.times do
    out = [pts.first]
    pts.each_cons(2) { |a, b| out << [a[0] * 0.75 + b[0] * 0.25, a[1] * 0.75 + b[1] * 0.25] << [a[0] * 0.25 + b[0] * 0.75, a[1] * 0.25 + b[1] * 0.75] }
    out << pts.last; pts = out
  end
  pts
end
def offset_poly(pts, meters)        # lat/lon polyline shifted to its right-hand side by meters
  pts.each_with_index.map do |p, i|
    a = pts[[i - 1, 0].max]; b = pts[[i + 1, pts.size - 1].min]
    te = (b[1] - a[1]) * mlon(p[0]); tn = (b[0] - a[0]) * MLAT; l = Math.hypot(te, tn); l = 1 if l.zero?
    [p[0] + (-te / l) * meters / MLAT, p[1] + (tn / l) * meters / mlon(p[0])]     # right of travel = (tn, -te) in (east, north)
  end
end

# walking grid: '1' blocked, '2' preferred road/path, '0' open ground (same format the other tracks use)
class WalkGrid
  attr_reader :nx, :ny, :cell
  def initialize(w, h, cell)
    @cell = cell; @nx = (w / cell).ceil; @ny = (h / cell).ceil; @a = Array.new(@ny) { Array.new(@nx, "0") }
  end
  def set(cx, cy, v, only = nil)
    return if cx < 0 || cy < 0 || cx >= @nx || cy >= @ny
    @a[cy][cx] = v if only.nil? || only.include?(@a[cy][cx])
  end
  def fill(pts, v, only = nil)
    ys = pts.map { |p| p[1] }; y0 = [(ys.min / @cell).floor, 0].max; y1 = [(ys.max / @cell).floor, @ny - 1].min
    (y0..y1).each do |cy|
      yc = (cy + 0.5) * @cell; xs = []
      pts.each_cons(2) { |a, b| next if (a[1] <= yc) == (b[1] <= yc); xs << a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) }
      xs.sort!; xs.each_slice(2) { |xa, xb| next unless xb; ((xa / @cell - 0.5).ceil..(xb / @cell - 0.5).floor).each { |cx| set(cx, cy, v, only) } }
    end
  end
  def stroke(pts, width, v, only = nil)
    r = width / 2.0
    pts.each_cons(2) do |a, b|
      len = Math.hypot(b[0] - a[0], b[1] - a[1]); steps = [(len / (@cell * 0.5)).ceil, 1].max
      (0..steps).each do |i|
        x = a[0] + (b[0] - a[0]) * i / steps.to_f; y = a[1] + (b[1] - a[1]) * i / steps.to_f
        ((y - r) / @cell).floor.upto(((y + r) / @cell).floor) { |cy| ((x - r) / @cell).floor.upto(((x + r) / @cell).floor) { |cx| set(cx, cy, v, only) if Math.hypot((cx + 0.5) * @cell - x, (cy + 0.5) * @cell - y) <= r + @cell * 0.35 } }
      end
    end
  end
  def disc(x, y, r, v, only = nil)
    ((y - r) / @cell).floor.upto(((y + r) / @cell).floor) { |cy| ((x - r) / @cell).floor.upto(((x + r) / @cell).floor) { |cx| set(cx, cy, v, only) if Math.hypot((cx + 0.5) * @cell - x, (cy + 0.5) * @cell - y) <= r } }
  end
  def rows
    @a.map(&:join)
  end
end

def taper_offset(pts, meters)       # shift a lat/lon polyline to its LEFT by up to `meters`, easing to zero at both ends
  total = poly_len(pts); acc = 0.0
  pts.each_with_index.map do |p, i|
    acc += dm(pts[i - 1], p) if i > 0
    m = meters * Math.sin(Math::PI * (total.zero? ? 0 : acc / total))
    a = pts[[i - 1, 0].max]; b = pts[[i + 1, pts.size - 1].min]
    te = (b[1] - a[1]) * mlon(p[0]); tn = (b[0] - a[0]) * MLAT; l = Math.hypot(te, tn); l = 1 if l.zero?
    [p[0] + (te / l) * m / MLAT, p[1] + (-tn / l) * m / mlon(p[0])]
  end
end
