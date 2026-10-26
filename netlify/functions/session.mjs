/* Qualifying order and race classification for a Formula 1 weekend, read from the Jolpica F1 API (api.jolpi.ca, an Ergast-compatible mirror of the FIA's
   published results) and returned as small JSON. The app uses it for the Race Day hub's "Starting grid" card and for "Unofficial results" in the minutes
   before our own data/results.js entry (written by tools/f1_update.py) exists. It only fetches that one host; the answer is cached for 30 s so many
   phones cost one request. GET /api/session?s=f1&date=2026-10-25 (the race day in the track's own time zone; the race is matched within one day,
   because Jolpica dates a night race by its UTC day). Nothing is stored. */
const JOLPICA = "https://api.jolpi.ca/ergast/f1/";
const UA = { "user-agent": "Mozilla/5.0 (Trackside Pass results reader)" };
let why = "";   // the last failure, so an unreachable feed says why instead of "no race"
const get = async (path) => { try { const r = await fetch(JOLPICA + path, { headers: UA }); if (!r.ok) { why = `feed answered ${r.status}`; return null; } return await r.json(); } catch (e) { why = "feed unreachable: " + String(e).slice(0, 80); return null; } };
const day = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 864e5;
/* the same short names and team names as tools/f1_update.py (and formula1.com), so the cards read like our own results */
const TEAMS = { "Red Bull": "Red Bull Racing", "RB F1 Team": "Racing Bulls", "Alpine F1 Team": "Alpine", "Haas F1 Team": "Haas", "Cadillac F1 Team": "Cadillac" }, NAMES = { "Andrea Kimi Antonelli": "Kimi Antonelli" };
const team = (n) => TEAMS[n] || n, who = (d) => { const n = `${d.givenName} ${d.familyName}`; return NAMES[n] || n; };

export default async (req) => {
  const u = new URL(req.url), s = (u.searchParams.get("s") || "").toLowerCase(), date = u.searchParams.get("date") || "";
  const head = { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "public, max-age=20", "netlify-cdn-cache-control": "public, max-age=30, stale-while-revalidate=60" };
  const bad = (m, status = 400) => new Response(JSON.stringify({ error: m }), { status, headers: head });
  if (s !== "f1") return bad("unknown series");
  if (!/^20\d\d-\d\d-\d\d$/.test(date)) return bad("bad date");
  const year = date.slice(0, 4), sched = await get(`${year}.json`), races = (sched && sched.MRData.RaceTable.Races) || [];
  const race = races.find((r) => Math.abs(day(r.date) - day(date)) <= 1);
  if (!race) return bad(why || "no race on that day", why ? 502 : 404);
  const [q, r] = await Promise.all([get(`${year}/${race.round}/qualifying.json`), get(`${year}/${race.round}/results.json`)]);
  const qr = q && q.MRData.RaceTable.Races[0] && q.MRData.RaceTable.Races[0].QualifyingResults, rr = r && r.MRData.RaceTable.Races[0] && r.MRData.RaceTable.Races[0].Results;
  const out = {
    s, season: year, round: +race.round, race: race.raceName, date: race.date, fetchedAt: new Date().toISOString(),
    qualifying: qr && qr.length ? qr.map((x) => ({ pos: +x.position, num: x.number, name: who(x.Driver), team: team(x.Constructor.name), time: x.Q3 || x.Q2 || x.Q1 || "", seg: x.Q3 ? "Q3" : x.Q2 ? "Q2" : "Q1" })) : null,
    result: rr && rr.length ? rr.map((x) => ({ pos: x.positionText, num: x.number, name: who(x.Driver), team: team(x.Constructor.name), grid: x.grid, time: (x.Time && x.Time.time) || "", status: x.status, laps: x.laps })) : null,
  };
  return new Response(JSON.stringify(out), { headers: head });
};
