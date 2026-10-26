/* Qualifying order and race classification for a race weekend, read from the series' own published results and returned as small JSON:
   Formula 1 from the Jolpica F1 API (api.jolpi.ca, an Ergast-compatible mirror of the FIA's published results), IndyCar from INDYCAR's results service
   (www.indycar.com/api/results, the one tools/indycar_update.py uses). The app uses it for the Race Day hub's "Starting grid" card and for "Unofficial results" in the minutes
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

const HEAD = { "content-type": "application/json", "access-control-allow-origin": "*", "cache-control": "public, max-age=20", "netlify-cdn-cache-control": "public, max-age=30, stale-while-revalidate=60" };
const reply = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: HEAD });

async function f1(date) {
  const year = date.slice(0, 4), sched = await get(`${year}.json`), races = (sched && sched.MRData.RaceTable.Races) || [];
  const race = races.find((r) => Math.abs(day(r.date) - day(date)) <= 1);
  if (!race) return reply({ error: why || "no race on that day" }, why ? 502 : 404);
  const [q, r] = await Promise.all([get(`${year}/${race.round}/qualifying.json`), get(`${year}/${race.round}/results.json`)]);
  const qr = q && q.MRData.RaceTable.Races[0] && q.MRData.RaceTable.Races[0].QualifyingResults, rr = r && r.MRData.RaceTable.Races[0] && r.MRData.RaceTable.Races[0].Results;
  return reply({
    s: "f1", season: year, round: +race.round, race: race.raceName, date: race.date, fetchedAt: new Date().toISOString(),
    qualifying: qr && qr.length ? qr.map((x) => ({ pos: +x.position, num: x.number, name: who(x.Driver), team: team(x.Constructor.name), time: x.Q3 || x.Q2 || x.Q1 || "", seg: x.Q3 ? "Q3" : x.Q2 ? "Q2" : "Q1" })) : null,
    result: rr && rr.length ? rr.map((x) => ({ pos: x.positionText, num: x.number, name: who(x.Driver), team: team(x.Constructor.name), grid: x.grid, time: (x.Time && x.Time.time) || "", status: x.status, laps: x.laps })) : null,
  });
}

/* IndyCar: the season's events and their sessions come from SeasonDropDown, each session's classification from EventsSessionDetails. A session's date is only in its
   details, so the date -> event map is built once (all race sessions of the year, in parallel) and kept for 30 minutes. Qualifying: "Combined Qualifying" when it exists,
   else the qualifying session with the most cars (an oval's single session, the Indy 500's days). */
const INDY = "https://www.indycar.com/api/results/", INDY_SID = "b856a4f1-e85c-4fac-8c36-fd58d962227a";
const iget = async (path) => { try { const r = await fetch(INDY + path, { headers: UA }); return r.ok ? await r.json() : null; } catch (_) { return null; } };
const mdy = (v) => { const [m, d, y] = String(v).split("/").map(Number); return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; };
const lap = (v) => (v ? String(v).replace(/^0+(?=\d:)/, "").replace(/^00:/, "").replace(/^0(?=\d:)/, "").replace(/(\.\d{3})\d+$/, "$1") : "");
const clock = (v) => (v ? String(v).replace(/^0(?=\d:)/, "").replace(/^00:/, "").replace(/(\.\d{3})\d+$/, "$1") : "");
async function indycarEvents(year) {
  const c = (globalThis.__indy ||= {});
  if (c[year] && Date.now() - c[year].t < 30 * 60000) return c[year].list;
  const seasons = await iget(`SeasonDropDown?id=${INDY_SID}`), yr = seasons && seasons.find((x) => x.Year === year);
  if (!yr) return null;
  const list = (await Promise.all(yr.Events.map(async (ev) => { const race = ev.Sessions.find((x) => x.SessionName === "Race"); if (!race) return null; const d = await iget(`EventsSessionDetails?id=${race.EventsSessionID}`); return d && d.SessionDate ? { ev, raceId: race.EventsSessionID, date: mdy(d.SessionDate) } : null; }))).filter(Boolean);
  c[year] = { t: Date.now(), list }; return list;
}
async function indycar(date) {
  const list = await indycarEvents(date.slice(0, 4));
  if (!list) return reply({ error: "INDYCAR results unreachable" }, 502);
  const hit = list.find((x) => Math.abs(day(x.date) - day(date)) <= 1);
  if (!hit) return reply({ error: "no race on that day" }, 404);
  const qs = hit.ev.Sessions.filter((x) => /qualif/i.test(x.SessionName));
  const qd = await Promise.all(qs.map(async (x) => ({ x, d: await iget(`EventsSessionDetails?id=${x.EventsSessionID}`) })));
  const qBest = qd.filter((y) => y.d && y.d.records && y.d.records.length).sort((a, b) => (b.x.SessionName === "Combined Qualifying") - (a.x.SessionName === "Combined Qualifying") || b.d.records.length - a.d.records.length || +b.x.EventsSessionID - +a.x.EventsSessionID)[0];
  const rd = await iget(`EventsSessionDetails?id=${hit.raceId}`), rrec = rd && rd.records && rd.records.filter((x) => x.PositionFinish);
  const who2 = (x) => x.DriverName || `${x.FirstName} ${x.LastName}`;
  return reply({
    s: "indycar", season: date.slice(0, 4), race: hit.ev.EventName, date: hit.date, fetchedAt: new Date().toISOString(),
    qualifying: qBest ? qBest.d.records.filter((x) => x.PositionFinish).sort((a, b) => a.PositionFinish - b.PositionFinish).map((x) => ({ pos: x.PositionFinish, num: x.CarNumber, name: who2(x), team: x.TeamName, time: lap(x.BestLapTime) || (x.SpeedAvgFormatted ? `${x.SpeedAvgFormatted} mph` : "") })) : null,
    result: rrec && rrec.length ? rrec.sort((a, b) => a.PositionFinish - b.PositionFinish).map((x) => {
      const diff = /^\d/.test(x.Difference || "") ? "+" + String(x.Difference).replace(/^0(?=\d:)/, "").replace(/^00:/, "").replace(/(\.\d{3})\d+$/, "$1") : x.LapsDown > 0 && x.LapsComplete > 0 ? `+${x.LapsDown} lap${x.LapsDown > 1 ? "s" : ""}` : "";
      return { pos: String(x.PositionFinish), num: x.CarNumber, name: who2(x), team: x.TeamName, grid: x.PositionStart ? String(x.PositionStart) : "", time: x.PositionFinish === 1 ? clock(x.ElapsedTime) : diff, status: x.Status || "", laps: String(x.LapsComplete ?? "") };
    }) : null,
  });
}

export default async (req) => {
  const u = new URL(req.url), s = (u.searchParams.get("s") || "").toLowerCase(), date = u.searchParams.get("date") || "";
  if (!/^20\d\d-\d\d-\d\d$/.test(date)) return reply({ error: "bad date" }, 400);
  if (s === "f1") return f1(date);
  if (s === "indycar") return indycar(date);
  return reply({ error: "unknown series" }, 400);
};
