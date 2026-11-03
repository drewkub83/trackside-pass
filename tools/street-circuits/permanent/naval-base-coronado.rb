# NASCAR San Diego at Naval Base Coronado ("Qualcomm Circuit San Diego"): a 3.4-mile temporary course with 16 turns on the pavement of Naval Air Station North Island
# (streets, aprons and taxiways, mostly NOT mapped as roads in OpenStreetMap). The lap is TRACED from NASCAR's official course map (an aerial image) and
# georeferenced with three points the owner marked on Google Maps (Turn 12, Turn 5 and the Ellyson start/finish line): scale 2.67 m per image pixel, rotation
# 3.4 degrees. The traced lap is 3.45 mi against the official 3.4 mi. Positions are approximate (about 25 m). The pit lane is NOT published: pit-file is a stand-in
# along the start/finish straight. Turn labels are the map's numbered badges snapped to the lap.
{
  id: "naval-base-coronado", name: "Naval Base Coronado (NASCAR San Diego)", short: "San Diego", place: "Coronado, California", tz: "America/Los_Angeles",
  center: [32.7075, -117.1985], radius: 0.012, circuit_file: "naval-base-coronado-lap.json", pit_file: "naval-base-coronado-pit.json", smooth: 0, keep_within_m: 1200,
  official_mi: "3.4 mi", length: "3.4 mi (5.5 km)", opened: 2026, nturns: 16,
  corner_labels: [
    ["Turn 1", 32.7040709, -117.195584, true],
    ["Turn 2", 32.7026075, -117.1924739, true],
    ["Turn 3", 32.7048058, -117.190521, true],
    ["Turn 4", 32.7059994, -117.1921426, true],
    ["Turn 5", 32.7111295, -117.1904726, true],
    ["Turn 6", 32.713913, -117.198142, true],
    ["Turn 7", 32.7144364, -117.1984515, true],
    ["Turn 8", 32.7147327, -117.2028295, true],
    ["Turn 9", 32.7133606, -117.2028403, true],
    ["Turn 10", 32.713077, -117.2043844, true],
    ["Turn 11", 32.7127035, -117.2054097, true],
    ["Turn 12", 32.712078, -117.2090397, true],
    ["Turn 13", 32.7081068, -117.2085527, true],
    ["Turn 14", 32.7072411, -117.2056633, true],
    ["Turn 15", 32.7062356, -117.2054292, true],
    ["Turn 16", 32.7036235, -117.2013557, true]
  ],
  blurb: "NASCAR's San Diego street course at Naval Base Coronado: 3.4 miles and 16 turns across the pavement of Naval Air Station North Island, the longest circuit on the NASCAR schedule. The lap starts at the Ellyson Start/Finish Line, runs past Carrier Corner (Turn 5) beside the aircraft carrier piers, through the Coronado Chicane (Turns 8 and 9) and down Runway Road on the airfield side.",
  facts: { "Signature sections" => "Ellyson Start/Finish Line, Carrier Corner (Turn 5), the Coronado Chicane (Turns 8 and 9) and Runway Road",
           "Venue data" => "The lap is traced from NASCAR's official course map and placed on the ground from three owner-marked points, so it is accurate to about 25 m. The pit lane is not published (the one drawn is a stand-in along the start/finish straight). Gates, restrooms, food and the other facilities are placed from the 2026 facility map, which is drawn at an angle, so their positions are approximate." },
  events: [{ "d" => "2027-07-30", "e" => "NASCAR San Diego", "s" => "NASCAR Cup Series", "t" => 3 }]
}
