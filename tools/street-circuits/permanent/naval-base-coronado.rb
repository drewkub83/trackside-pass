# NASCAR San Diego at Naval Base Coronado ("Qualcomm Circuit San Diego"): a 3.4-mile temporary course with 16 turns on the pavement of Naval Air Station North Island
# (streets, aprons and taxiways, mostly NOT mapped as roads in OpenStreetMap). The lap is TRACED from NASCAR's official course map (an aerial image) and
# georeferenced with three points the owner marked on Google Maps (Turn 12, Turn 5 and the Ellyson start/finish line): scale 2.67 m per image pixel, rotation
# 3.4 degrees. The traced lap was first 3.45 mi, then refined against the 5 raceway pieces OpenStreetMap already maps for this course (highway=raceway, wikidata Q135664661: Runway Road, the chicanes, the start/finish straight: 2.4 km of ground truth, fitted by ICP to a median of 9 m; scale 0.954, 4.9 degrees, 120 m shift) and snapped to those pieces and to mapped streets, giving 3.32 mi against the official 3.4 mi. THEN the owner edited the lap by hand in the Track Builder (tools/track-builder/naval-base-coronado.spec.json, Nov 3 2026) to follow the streets and the OpenStreetMap raceway pieces more closely: that edited lap is the one used (3.44 mi against the official 3.4, the pit line and the turn markers are the owner's too). Positions are approximate (about 10-25 m). The pit lane is NOT published: pit-file is a stand-in
# along the start/finish straight. Turn labels are the map's numbered badges snapped to the lap.
{
  id: "naval-base-coronado", name: "Naval Base Coronado (NASCAR San Diego)", short: "San Diego", place: "Coronado, California", tz: "America/Los_Angeles",
  center: [32.7075, -117.1985], radius: 0.012, circuit_file: "naval-base-coronado-lap.json", pit_file: "naval-base-coronado-pit.json", smooth: 0, keep_within_m: 1200,
  official_mi: "3.4 mi", length: "3.4 mi (5.5 km)", opened: 2026, nturns: 16,
  corner_labels: [
    ["Turn 1", 32.704486, -117.194856, true],
    ["Turn 2", 32.702739, -117.19039, true],
    ["Turn 3", 32.705382, -117.188764, true],
    ["Turn 4", 32.70626, -117.190787, true],
    ["Turn 5", 32.711491, -117.189529, true],
    ["Turn 6", 32.713782, -117.197449, true],
    ["Turn 7", 32.714389, -117.197744, true],
    ["Turn 8", 32.714421, -117.201869, true],
    ["Turn 9", 32.712308, -117.201666, true],
    ["Turn 10", 32.712241, -117.203243, true],
    ["Turn 11", 32.71187, -117.203892, true],
    ["Turn 12", 32.710895, -117.20814, true],
    ["Turn 13", 32.707361, -117.20733, true],
    ["Turn 14", 32.706783, -117.205244, true],
    ["Turn 15", 32.706395, -117.205147, true],
    ["Turn 16", 32.70324, -117.198852, true]
  ],
  blurb: "NASCAR's San Diego street course at Naval Base Coronado: 3.4 miles and 16 turns across the pavement of Naval Air Station North Island, the longest circuit on the NASCAR schedule. The lap starts at the Ellyson Start/Finish Line, runs past Carrier Corner (Turn 5) beside the aircraft carrier piers, through the Coronado Chicane (Turns 8 and 9) and down Runway Road on the airfield side.",
  facts: { "Signature sections" => "Ellyson Start/Finish Line, Carrier Corner (Turn 5), the Coronado Chicane (Turns 8 and 9) and Runway Road",
           "Venue data" => "The lap is traced from NASCAR's official course map, then fitted to the OpenStreetMap raceway pieces and snapped to mapped streets, so it is accurate to roughly 10-25 m. The pit lane is not published (the one drawn is a stand-in along the start/finish straight). Gates, restrooms, food and the other facilities are placed from the 2026 facility map, which is drawn at an angle, so their positions are approximate." },
  events: [{ "d" => "2027-07-30", "e" => "NASCAR San Diego", "s" => "NASCAR Cup Series", "t" => 3 }]
}
