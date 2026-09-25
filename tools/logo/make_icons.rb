# Trackside Pass app icons: a map pin whose dot is a black and white chequered disc. Day = coral pin on sage, night = coral pin on the night-map dark.
# Writes the SVG masters here; icon PNGs are made from them (see README.md).
CELL = 12.0
def check(r = 24, cx = 60, cy = 50)
  n = 4; cell = 2 * r / n; x0 = cx - r; y0 = cy - r
  sq = []; n.times { |i| n.times { |j| sq << %(<rect x="#{(x0 + i * cell).round(2)}" y="#{(y0 + j * cell).round(2)}" width="#{cell}" height="#{cell}"/>) if (i + j).even? } }
  %(<clipPath id="chk"><circle cx="#{cx}" cy="#{cy}" r="#{r}"/></clipPath><g clip-path="url(#chk)"><rect x="#{x0}" y="#{y0}" width="#{2 * r}" height="#{2 * r}" fill="#FFFFFF"/><g fill="#14171A">#{sq.join}</g></g><circle cx="#{cx}" cy="#{cy}" r="#{r}" fill="none" stroke="#14171A" stroke-width="1.6"/>)
end
PIN = %(<path d="M60 110C60 110 26 78 26 50A34 34 0 0 1 94 50C94 78 60 110 60 110Z" fill="#E39B7B"/>)
# the pin sits inside the middle 80% so Android's round/squircle masks never cut it
def art(bg, rx = 0, extra = "")
  %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">#{extra}<rect class="bg" width="120" height="120" rx="#{rx}" fill="#{bg}"/><g transform="translate(60 60) scale(0.9) translate(-60 -63)">#{PIN}#{check}</g></svg>)
end
File.write("icon-day.svg", art("#DCE8E0"))
File.write("icon-night.svg", art("#16191D"))
File.write("favicon.svg", art("#DCE8E0", 27, %(<style>@media (prefers-color-scheme: dark){.bg{fill:#16191D}}</style>)))
# the pin alone, for the in-app header
File.write("pin.svg", %(<svg xmlns="http://www.w3.org/2000/svg" viewBox="24 14 72 98">#{PIN}#{check}</svg>))
puts "svg masters written"
