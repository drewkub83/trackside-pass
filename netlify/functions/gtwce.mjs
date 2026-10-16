/* Live session results for GT World Challenge Europe, read from the series' own public results pages
   (gt-world-challenge-europe.com/results/<season>/<round>/<session>) and returned as small JSON.
   The app calls this so qualifying grids and race classifications show up within a minute of being published,
   without a new app release. It only ever fetches that one host and path shape, and the answer is cached for 30 s
   so many phones cost the series' site one request. GET /.netlify/functions/gtwce?round=portimao[&season=2026] */
const HOST = "https://www.gt-world-challenge-europe.com";
const CLASSES = { "Pro Cup": "Pro", "Gold Cup": "Gold", "Silver Cup": "Silver", "Bronze Cup": "Bronze", "Pro-AM Cup": "Pro-Am" };
const SESSIONS = ["free-practice-1", "free-practice-2", "free-practice-3", "qualifying-combined", "main-race"];
const clean = (s) => s.replace(/<[^>]+>/g, " ").replace(/&uuml;/g, "ü").replace(/&amp;/g, "&").replace(/&#0?39;|&rsquo;/g, "'").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();

async function page(season, round, session) {
  const r = await fetch(`${HOST}/results/${season}/${round}/${session}`, { headers: { "user-agent": "Mozilla/5.0 (Trackside Pass results reader)" } });
  return r.ok ? await r.text() : "";
}
function rows(h) {
  const i = h.indexOf("<table"); if (i < 0) return [];
  const tb = h.slice(i, h.indexOf("</table>", i)); let hdr = null; const out = [];
  for (const tr of tb.match(/<tr[\s\S]*?<\/tr>/g) || []) {
    const c = (tr.match(/<t[dh][\s\S]*?<\/t[dh]>/g) || []).map(clean);
    if (c[0] === "Pos") { hdr = c; continue; }
    if (!hdr || c.length !== hdr.length) continue;
    const o = Object.fromEntries(hdr.map((k, j) => [k, c[j]]));
    if (!/^\d+$/.test(o.Pos) || !CLASSES[o.Class]) continue;
    out.push({ pos: +o.Pos, num: o["Car #"], cls: CLASSES[o.Class], drivers: o.Drivers, team: o.Team, car: o.Car, time: o.Time || o["Avg Time"] || "", laps: o.Laps || "", gap: o.Gap || "" });
  }
  return out;
}
/* "main-race-after-1-30-hour" -> 90 minutes; "…after-0-5-h" -> 30 */
const mins = (slug) => { const m = slug.match(/after-(\d+)(?:-(\d+))?/); if (!m) return 0; const h = +m[1], x = m[2] ? +m[2] : 0; return h * 60 + (m[2] && m[2].length === 1 ? x * 6 : x); };

export default async (req) => {
  const u = new URL(req.url), round = (u.searchParams.get("round") || "").toLowerCase(), season = u.searchParams.get("season") || "2026";
  const head = { "content-type": "application/json", "access-control-allow-origin": "*", "netlify-cdn-cache-control": "public, max-age=30, stale-while-revalidate=60", "cache-control": "public, max-age=20" };
  if (!/^[a-z0-9-]{3,60}$/.test(round) || !/^20\d\d$/.test(season)) return new Response(JSON.stringify({ error: "bad round or season" }), { status: 400, headers: head });
  try {
    const index = await page(season, round, "");
    const inter = [...new Set((index.match(/results\/\d{4}\/[a-z0-9-]+\/(main-race-after-[a-z0-9-]+)/g) || []).map((x) => x.split("/").pop()))].sort((a, b) => mins(b) - mins(a));
    const out = { round, season, fetchedAt: new Date().toISOString(), sessions: {} };
    const pages = await Promise.all(SESSIONS.map((s) => page(season, round, s).then((h) => [s, rows(h)])));
    for (const [s, r] of pages) if (r.length) out.sessions[s] = r;
    if (!out.sessions["main-race"] && inter.length) {   // the race is running: the latest published hour-mark classification
      for (const s of inter.slice(0, 3)) { const r = rows(await page(season, round, s)); if (r.length) { out.sessions["race-running"] = r; out.runningLabel = s.replace("main-race-after-", "").replace(/-/g, " "); break; } }
    }
    return new Response(JSON.stringify(out), { headers: head });
  } catch (e) {
    return new Response(JSON.stringify({ error: "could not read the results page" }), { status: 502, headers: head });
  }
};
