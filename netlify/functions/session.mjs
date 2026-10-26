/* Qualifying order and race classification for a race weekend, read from the series' own published results and returned as small JSON:
   Formula 1 from the Jolpica F1 API (api.jolpi.ca, an Ergast-compatible mirror of the FIA's published results), IndyCar from INDYCAR's results service
   (www.indycar.com/api/results, the one tools/indycar_update.py uses), F1 Academy from the series' own results pages (their embedded page data says whether a result is
   official), Porsche Carrera Cup North America from the series' results page (porschecarreracup.us/results), FIA Formula 2 and Formula 3 from their race pages. The app uses it for the Race Day hub's "Starting grid" card and for "Unofficial results" in the minutes
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


/* F1 Academy: every results page (/Racing-Series/Results?raceid=N) carries the whole season's race list and that round's sessions as page data, with a flag for official results.
   The race is found by date; the race session by name ("Opening Race", "Reverse Grid Race", "Feature Race") or, failing that, by day; the qualifying order is "Qualifying 1"
   (the Feature Race grid is the final classification of the qualifying session; "Qualifying 2" ranks second-fastest laps and sets the Opening Race grid). */
const FA = "https://www.f1academy.com/Racing-Series/";
const page = async (url) => { try { const r = await fetch(url, { headers: UA }); return r.ok ? await r.text() : ""; } catch (_) { return ""; } };
const nextData = (h) => { const m = /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/.exec(h); try { return m ? JSON.parse(m[1]).props.pageProps.pageData : null; } catch (_) { return null; } };
const sp = (v) => String(v || "").replace(/\s+/g, " ").trim();
/* the series' own pages mix "janne stiak", "tyler MAXSON" and "Tyler Maxson": capitalise only words that are all lower or all upper case, so "McCann" and "van Berlo" survive */
const cap = (v) => sp(v).split(" ").map((w) => (w === w.toLowerCase() || w === w.toUpperCase() ? w.toLowerCase().replace(/(^|[-'])([a-z])/g, (_, a, b) => a + b.toUpperCase()) : w)).join(" ");
async function f1academy(date, name) {
  const cal = await page(FA + "Calendar"), ids = [...cal.matchAll(/Results\?raceid=(\d+)/g)].map((m) => m[1]);
  if (!ids.length) return reply({ error: "F1 Academy calendar unreachable" }, 502);
  let d = nextData(await page(`${FA}Results?raceid=${ids[0]}`)); if (!d) return reply({ error: "F1 Academy results unreachable" }, 502);
  const race = (d.SeasonRaces || []).find((r) => Math.abs(day(r.RaceStartDate) - day(date)) <= 3 && date >= r.RaceStartDate.slice(0, 10) && date <= r.RaceEndDate.slice(0, 10)) || (d.SeasonRaces || []).find((r) => date >= r.RaceStartDate && date <= r.RaceEndDate);
  if (!race) return reply({ error: "no round on that day" }, 404);
  if (String(d.RaceId) !== String(race.RaceId)) { d = nextData(await page(`${FA}Results?raceid=${race.RaceId}`)); if (!d) return reply({ error: "F1 Academy results unreachable" }, 502); }
  const sess = d.SessionResults || [], rows = (x) => (x.Results || []).filter((r) => r.FinishPosition || r.DisplayFinishPosition);
  const raceSess = sess.filter((x) => x.SessionType === "RESULT");
  const nm = String(name || "").toLowerCase(), pick = raceSess.find((x) => nm && nm.includes(x.SessionName.toLowerCase())) || raceSess.filter((x) => String(x.SessionStartTime).slice(0, 10) === date).pop();
  const q = sess.find((x) => x.SessionName === "Qualifying 1") || sess.find((x) => x.SessionType === "QUALIFYING");
  const one = (r) => ({ num: String(r.CarNumber), name: sp(`${r.DriverForename} ${r.DriverSurname}`), team: r.TeamName });
  return reply({
    s: "f1academy", season: String(d.SeasonName || date.slice(0, 4)), race: pick ? pick.SessionName : "Race", date, fetchedAt: new Date().toISOString(),
    qualifying: q && rows(q).length ? rows(q).map((r) => ({ pos: r.FinishPosition, ...one(r), time: sp(r.TimeOrFinishReason) })) : null, qualifyingOfficial: q ? !!q.ResultsAreOfficial : undefined,
    result: pick && rows(pick).length ? rows(pick).map((r) => ({ pos: String(r.DisplayFinishPosition || r.FinishPosition), ...one(r), grid: "", time: r.FinishPosition === 1 ? sp(r.TimeOrFinishReason) : (/^\d/.test(r.Gap || "") ? "+" + sp(r.Gap) : sp(r.ResultStatus || r.TimeOrFinishReason)), status: sp(r.ResultStatus), laps: String(r.LapsCompleted ?? "") })) : null, resultOfficial: pick ? !!pick.ResultsAreOfficial : undefined,
  });
}

/* Porsche Carrera Cup North America: one WordPress page holds every round of every season, each with Practice / Qualifying / Race tables whose columns vary a little from round to round
   (names are matched case-insensitively). The round is found by track and year, the race by the number in the session name ("Race 1 of 2" -> "Race 1"). */
const PCC_TRACKS = { daytona: "daytona", sebring: "sebring", "long-beach": "long-beach", miami: "miami", "watkins-glen": "watkins", "road-america": "road-america", indianapolis: "indianapolis", "road-atlanta": "road-atlanta", cota: "americas" };
async function carrera(date, name, track) {
  const key = PCC_TRACKS[track]; if (!key) return reply({ error: "unknown track" }, 400);
  const h = await page("https://porschecarreracup.us/results/"); if (!h) return reply({ error: "Carrera Cup results unreachable" }, 502);
  const year = date.slice(0, 4), start = [...h.matchAll(/<div class="result-content" data-season="(\d+)" data-name="([^"]+)">/g)].find((m) => m[1] === year && m[2].includes(key));
  if (!start) return reply({ error: "no round there that year" }, 404);
  const from = start.index, next = h.indexOf('<div class="result-content"', from + 10), blk = h.slice(from, next > 0 ? next : h.length);
  const clean = (v) => String(v).replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#0?39;|&rsquo;/g, "'").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
  const parts = [...blk.matchAll(/<li class="part-link[^"]*" data-target-part="([^"]+)">([^<]+)<\/li>/g)].map((m) => {
    const c = new RegExp(`<div class="content[^"]*" id="${m[1]}">([\\s\\S]*?)(?=<div class="content[^"]*" id=|$)`).exec(blk), tb = c ? c[1] : "", hdr = [...tb.matchAll(/<th class="column-\d+">([\s\S]*?)<\/th>/g)].map((x) => clean(x[1]).toLowerCase());
    const rows = [...tb.matchAll(/<tr class="row-\d+">([\s\S]*?)<\/tr>/g)].map((r) => { const cells = [...r[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((x) => clean(x[1])); const o = {}; hdr.forEach((k, i) => { o[k] = cells[i]; }); return o; }).filter((o) => /^\d+$/.test(o.pos || o.position || ""));
    return { name: clean(m[2]), rows };
  });
  const rn = /race\s*(\d)/i.exec(name || ""), racePart = (rn && parts.find((p) => new RegExp(`^race\\s*${rn[1]}\\b`, "i").test(p.name))) || null, qPart = parts.find((p) => /^qualifying/i.test(p.name));
  const get = (o, ...ks) => { for (const k of ks) if (o[k] !== undefined && o[k] !== "") return o[k]; return ""; };
  const map = (o) => ({ pos: get(o, "pos", "position"), num: get(o, "number", "no", "car"), name: cap(`${get(o, "first name")} ${get(o, "last name")}`) || cap(get(o, "driver")), team: sp(get(o, "team")), cls: cap(get(o, "class")) });
  return reply({
    s: "carrera", season: year, race: `Porsche Carrera Cup North America${racePart ? ": " + racePart.name : ""}`, date, fetchedAt: new Date().toISOString(),
    qualifying: qPart && qPart.rows.length ? qPart.rows.map((o) => ({ ...map(o), time: get(o, "time") })) : null,
    result: racePart && racePart.rows.length ? racePart.rows.map((o, i) => { const g = get(o, "gap_first", "gap"); return { ...map(o), grid: "", time: i === 0 ? "" : /^[+\d]/.test(g) ? (g.startsWith("+") ? g : "+" + g) : g, status: "", laps: "" }; }) : null,
  });
}

/* FIA Formula 2 / Formula 3: a round's page (fiaformula2.com/en/racing/<year>/<venue>) embeds every session's start time and, for the LATEST completed session only, its results
   (Next.js page data, `"results":[...]` inside the session object, each row with a `version`). So the answer for an earlier session comes from a small memory kept in the edge cache
   for 4 days each time the page is read (the app reads it while the hub is open); a session nobody saw while it was the latest has no results here. F3 qualifies in two groups
   ("Qualifying 1" / "Qualifying 2"): the order combines the groups that were seen, fastest first. The venue slug comes from the app's track id. */
const FIA_SLUG = { bahrain: "sakhir", jeddah: "jeddah", melbourne: "melbourne", montreal: "montreal", monaco: "monte-carlo", "red-bull-ring": "spielberg", silverstone: "silverstone", monza: "monza", madrid: "madrid", baku: "baku", istanbul: "istanbul", "mexico-city": "mexico-city", lusail: "lusail", "yas-marina": "yas-marina", "spa-francorchamps": "spa-francorchamps", hungaroring: "budapest", "barcelona-catalunya": "barcelona", miami: "miami-gardens" };
const jsonAt = (t, i) => { let d = 0, str = false, esc = false; for (let k = i; k < t.length; k++) { const c = t[k]; if (str) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') str = false; continue; } if (c === '"') str = true; else if (c === "{") d++; else if (c === "}" && --d === 0) return t.slice(i, k + 1); } return ""; };
const rscText = (h) => [...h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map((m) => { try { return JSON.parse(m[1]); } catch (_) { return ""; } }).join("");
const memoUrl = (k) => new Request("https://tracksidepass.com/__memo/" + encodeURIComponent(k));
const memoPut = async (k, v) => { try { await caches.default.put(memoUrl(k), new Response(JSON.stringify(v), { headers: { "cache-control": "public, max-age=345600" } })); } catch (_) {} };
const memoGet = async (k) => { try { const r = await caches.default.match(memoUrl(k)); return r ? await r.json() : null; } catch (_) { return null; } };
const fiaTime = (x) => x.lapTime || x.bestLapTime || x.qualifyingTime || x.time || x.raceTime || "";
async function fia(kind, date, name, track) {
  const slug = FIA_SLUG[track]; if (!slug) return reply({ error: "unknown venue" }, 400);
  const host = kind === "f2" ? "https://www.fiaformula2.com" : "https://www.fiaformula3.com", year = date.slice(0, 4);
  const h = await page(`${host}/en/racing/${year}/${slug}`); if (!h) return reply({ error: "results page unreachable" }, 502);
  const p = rscText(h), sessions = [];
  for (const m of p.matchAll(/\{"session":"/g)) { try { const o = JSON.parse(jsonAt(p, m.index)); if (o && o.sessionType) sessions.push(o); } catch (_) {} }
  if (!sessions.length) return reply({ error: "no sessions on that page" }, 404);
  const rowOf = (x) => ({ pos: String(x.positionValue || x.positionNumber || ""), num: String(x.racingNumber || ""), name: sp(`${x.driverFirstName} ${x.driverLastName}`), team: sp(x.teamName), time: fiaTime(x), gap: x.gapToLeader, status: x.completionStatusCode, laps: String(x.lapsCompleted ?? ""), final: x.version === "Final" });
  for (const o of sessions) {   // remember each session's results the moment it is the one the page carries
    const k = `fia|${kind}|${year}|${o.meetingSessionKey}`;
    if (Array.isArray(o.results) && o.results.length) { o.rows = o.results.map(rowOf); await memoPut(k, o.rows); } else { o.rows = await memoGet(k); }
  }
  const dayOf = (o) => String(o.startTime).slice(0, 10), nm = String(name || "").toLowerCase();
  const races = sessions.filter((o) => o.sessionType === "Race"), race = races.find((o) => nm && nm.includes(String(o.shortName).toLowerCase())) || races.filter((o) => dayOf(o) === date).pop();
  const qs = sessions.filter((o) => o.sessionType === "Qualifying" && o.rows && o.rows.length);
  let qrows = null; if (qs.length) { qrows = qs.flatMap((o) => o.rows); if (qs.length > 1 || qrows.some((r, i) => i && r.pos === "1")) qrows.sort((a, b) => String(a.time).localeCompare(String(b.time), undefined, { numeric: true })); qrows = qrows.map((r, i) => ({ ...r, pos: qs.length > 1 ? i + 1 : r.pos })); }
  const rr = race && race.rows;
  return reply({
    s: kind, season: year, race: race ? race.shortName : "Race", date, fetchedAt: new Date().toISOString(),
    qualifying: qrows && qrows.map((r) => ({ pos: r.pos, num: r.num, name: r.name, team: r.team, time: r.time })), qualifyingOfficial: qs.length ? qs.every((o) => o.rows.every((r) => r.final)) : undefined,
    result: rr && rr.length ? rr.map((r, i) => ({ pos: r.pos, num: r.num, name: r.name, team: r.team, grid: "", time: i === 0 ? r.time : (r.gap && r.gap !== "0" ? "+" + r.gap : r.status && r.status !== "OK" ? r.status : r.time), status: r.status === "OK" ? "" : r.status, laps: r.laps })) : null, resultOfficial: rr && rr.length ? rr.every((r) => r.final) : undefined,
  });
}

export default async (req) => {
  const u = new URL(req.url), s = (u.searchParams.get("s") || "").toLowerCase(), date = u.searchParams.get("date") || "";
  if (!/^20\d\d-\d\d-\d\d$/.test(date)) return reply({ error: "bad date" }, 400);
  if (s === "f1") return f1(date);
  if (s === "indycar") return indycar(date);
  const name = u.searchParams.get("name") || "", track = (u.searchParams.get("track") || "").toLowerCase();
  if (s === "f1academy") return f1academy(date, name);
  if (s === "carrera") return carrera(date, name, track);
  if (s === "f2" || s === "f3") return fia(s, date, name, track);
  return reply({ error: "unknown series" }, 400);
};
