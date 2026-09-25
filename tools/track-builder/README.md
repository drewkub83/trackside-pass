# Track Builder

Trace a circuit over OpenStreetMap, place badges, export a spec, and turn it into a Trackside Pass track.

1. Double-click `start.command` (it starts a small local server and opens Chrome; internet needed for the map). Do not open `builder.html` as a plain file: OpenStreetMap blocks map tiles for pages with no referrer.
2. Go to the venue, load the official map image, drag its three orange corners onto the streets.
3. Draw the circuit (Circuit tool, "Follow roads" on, after "Load roads for this view"), then Start/finish, Turns, Pit lane, Badges, Parking.
   Pedestrian bridges/crossings use the kind "Pedestrian bridge / crossing": walking routes only cross the circuit there.
4. Fill in Track details, run "Find roads the circuit doubles back on" and separate the pair.
5. "Download track file" gives `<id>.spec.json`.
6. Build it (needs internet the first time):

```
ruby tools/street-circuits/build_track.rb ~/Downloads/<id>.spec.json
./build.sh
```

`build_track.rb` writes `data/<id>.js`, adds the script tag to `index.html`, adds the id to `sw.js` and bumps its version.
Use `--replace` to rebuild an existing track (a backup goes to `tools/street-circuits/backup/`), `--no-register` to skip the app registration.
Then drag `dist` onto Netlify.
