# Adding circuits (quick way and full), lap-record rules and tools

(Moved out of CLAUDE.md Nov 2 2026 to keep that file small. Read this file only when working on the topic.)

## Lap records (`lapRecord` in `data/<track>.js`)
A list, one entry per series (per class for IMSA and WEC): the series' **track record on the layout the map draws** -- the fastest lap ever
in any session (race, qualifying, pole, even practice), whatever the year; the user does not care when it was set. Only top series that are
on that track's calendar in the app (IMSA, IndyCar, GT World Challenge America/Europe) plus F1/MotoGP/NASCAR where they appear there, and WEC
(not set up yet, but its venues Imola, Spa, COTA and Portimao already carry its Hypercar and LMGT3 records). No support series (Pilot Challenge,
Carrera Cup, MX-5, GT4, ELMS, Indy NXT...). Layouts stay apart (oval vs road course, chicane vs no chicane). `note` says whether the lap was a
race or qualifying lap. Wikipedia is fine for circuit lap records; IMSA's class "track records" (qualifying) come from IMSA's own reports.
Never guess a number: if a record cannot be found, leave the entry out. The Info tab shows series, time and driver (no year).
Repeatable tools (read each series' own results, fastest lap over every session, no guessing): `tools/indycar_laprecords.py` (INDYCAR's results API, lap times exist from 2010 on; ovals publish no single qualifying laps; run `scan` once, then `best`), `tools/gtwce_laprecords.py` (GT World Challenge Europe, 2014 on, practice, qualifying, race), `tools/gtwca_laprecords.py` (GT World Challenge America, practice and qualifying only: the site has no per-car race page). These pages name a car's crew, not who set the lap: Sprint qualifying N is driven by the Nth-listed driver (Endurance qualifying too when the crew list is complete), but confirm the driver in a series report before writing `who`; for a practice lap list the crew. Check the layout (Barcelona's final chicane was removed in 2023 and the map shows the current no-chicane layout, Zandvoort's 2020 layout, Phoenix's 2018 re-profile, the Nurburgring Sprint circuit in 2016 all change lap times).

## Adding a new circuit: the quick way (Oct 2026)
When OpenStreetMap has the whole lap as `highway=raceway` pieces (most permanent circuits, and Miami, Montreal, Jeddah): add a dict to `SPECS` in `tools/track-data/make_config.py`, run `python3 tools/track-data/fetch_track_osm.py <id> <lat> <lon> [radius]`, find the lap with `chain_circuit.py <id> <official_km>` (or `chain_circuit2.py` when the pieces are drawn in mixed directions or do not share nodes: it prints signed ids, a minus means drive that piece backwards, and `build_permanent.rb` understands them; pass an exclude regex that does NOT drop real corner names), find the pit lane with `list_pits.py` / `pit_candidates.py` (a `pit_slice` on a lap piece stands in when none is mapped), then `python3 tools/track-data/new_track.py <id>` does config, build, split, crossings, walking grid and grandstands. Then check reach in the browser (every badge reachable from every gate/restroom/food/parking badge; remove isolated parking/paddock badges and false positives such as "Camp" matching "Camperio"), `elev_build.py`/`apply_elev.py` only where there is relief (add the id to `GLOBAL` for non-US tracks), and add the lap record with `python3 tools/track-data/add_laprecord.py` (fastest lap ever in any session; check pole laps on the race's own page, never trust a list). Street circuits that OpenStreetMap does not map as a lap (Melbourne, Monaco, Baku, Singapore) need an official map or a traced GeoJSON instead.

## Adding a new circuit (US or overseas)
1. `tools/track-data/fetch_track_osm.py <id> <lat> <lon> [radius]` downloads the OpenStreetMap data (it uses a working Overpass
   mirror; the main one is often down). `osm_raceways.py` lists raceway pieces; `chain_circuit.py <id> <official_km>` chains
   them into one closed lap and prints the way ids (compare the length with the official one; several layouts can share a site
   -- Barcelona has the chicane and no-chicane laps -- so pick the one whose turn count matches the series' published layout).
2. `make_config.py` (edit SPECS) writes `tools/street-circuits/permanent/<id>.rb`: official length / turns / lap record from the
   series' own event page, corner labels from OpenStreetMap's own piece names (never invented). Then
   `ruby tools/street-circuits/build_permanent.rb tools/street-circuits/permanent/<id>.rb` builds `data/<id>.js` and registers it
   in `index.html` and `sw.js`.
3. Run `python3 tools/track-data/split_tracks.py <id>` (the builder writes a whole file), then crossings, walking grid, elevation as in the section above. For new tracks build the grid with `build(tid, rle=True)`: the
   rows are run-length encoded (`route.rle`, decoded in `walkRows()`) to keep data files small.
4. Grandstands: OpenStreetMap often has them (`leisure=bleachers`, `building=grandstand`) even though the first build ignores them:
   run `python3 tools/track-data/osm_stands.py <id> --write` (named stands keep their name, unnamed ones are clustered and named after the
   nearest corner), then nudge any badge the walking grid cannot reach. Other fan facilities (gates, food stands, restrooms, event parking)
   are mostly NOT in OpenStreetMap and need the circuit's official fan map; say so in the track's `facts` rather than leaving the map looking complete.
Venues of a series that have no map yet go in that series' `stops` in `data/champs.js` as "Map coming soon" (with real dates);
a stop disappears by itself once a track with the same id exists.

## Fan-map placement helpers (Nov 2026)
- `tools/track-data/fit_silhouette.py <id> <image> <x0,y0,x1,y1> <B,G,R,tol> <out.json> [rot_lo rot_hi]`: fits the track lap to a drawn map by overlapping filled silhouettes. Use it when `fit_map.py` fails (an oval drawn as a pale band). An oval fits two ways (180 degrees apart): check an existing badge, such as the front-stretch grandstand or a tunnel, to pick the right one. Angled illustrations (Pocono, Las Vegas, Darlington) were matched by hand: three track corners, or the grandstands and tunnels already on the map.
- `tools/track-data/place_items.py`: `run(id, fit, items, source)` adds the badges (same-kind badges close to an existing one are skipped) and grows the track's frame (`vb` and `geo` together, so no existing coordinate moves) up to 520 units beyond the old frame. The walking grid does not grow: badges outside it show as reachable only at the grid edge, so Directions to them is rough.
- Only draw `cross` badges where a tunnel or bridge really crosses the circuit; a bridge over a road or creek is an `info` badge.


## Walkability check (Nov 6 2026)
Every badge on every track should be reachable by the walking grid (CLAUDE.md "Check"). Method: open each track in the preview, set `walkOrigin` to a gate / restroom / food / parking badge, and count the badges for which `walkMetresTo` is not null (try several origins: an infield badge as the origin gives a false low). 91 of 94 tracks were at 100% after this pass.
- Growing a track's frame (`place_items.py`) does NOT grow its grid: rebuild it with `build_route.build(id, rle=True)` afterwards. Only rebuild grids that were generated: some carry hand edits (a rebuild changed 3-8% of St. Petersburg's and VIR's cells), so for those use `connect_islands.py <id> --patch`.
- `tools/track-data/connect_islands.py <id> [--patch] [--max-m N]` finds badges in a part of the grid that no route can reach and either carves a short walkable `link` (an island closed off by a building or fence; saved as `links` in the track's file and re-applied by `build_route.build`) or, where the gap is the circuit itself, adds a "Crossing (position assumed)" badge on the circuit line. The app re-closes the circuit line at run time and opens it only at `cross` badges, so a link carved across the circuit does nothing.
- A crossing badge must be within 60 m of the circuit line (the app and the builder ignore it otherwise): snap it onto the line.
- Still unreachable (far from any walkable ground, probably across water or a fence): St. Petersburg Yacht Parking, Nurburgring D9 / D10 / one restroom, Sepang Parking 5, two Michigan infield restrooms.
