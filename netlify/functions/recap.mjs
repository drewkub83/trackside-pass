/* The series' own race-highlights video for a finished race, so the Race Day hub can offer it after the flag.
   GET /api/recap?ch=UC…&since=YYYY-MM-DD   (ch = the series' YouTube channel, since = the race day)
   Looks at the channel's 50 newest uploads (playlistItems, 1 quota unit), keeps videos published from the race day on (up to 9 days later) whose
   title says highlights / recap / race review, drops sprint, qualifying, practice, live, preview and reaction videos, then asks YouTube
   which of them may be played outside YouTube (videos.list, 1 unit) and answers with the newest. Needs the YT_API_KEY secret; without it: no video.
   Optional v = comma-separated venue words (first letters of the track and event names) that prefer this weekend's titles over the next race's.
   Optional q = a regular expression the title must match (data/series.js `rq`): channels that carry several series (NASCAR, GT World, IMSA) would otherwise give another series' highlights.
   Only the series' official channels are ever listed (data/series.js `rc` / `yt`); the app embeds the video with YouTube's own player. */
const json = (o, status, head) => new Response(JSON.stringify(o), { status, headers: head });
const WANT = /highlights|best (motogp )?moments|recap|race review|race report|race summary|as it happened|race in \d|extended (cut|highlights)/i;
const SKIP = /\b(live|preview|reaction|press conference|onboard|practice|qualifying|sprint|fp[123]|warm.?up|trailer|shorts?|best radio|top \d+)\b/i;
const OTHER_LANG = /\b(espa[nñ]ol|italiano|deutsch|fran[cç]ais|portugu[eê]s|nederlands|polski|t[uü]rk[cç]e)\b/i;

export default async (req, env) => {
  const u = new URL(req.url), ch = u.searchParams.get("ch") || "", since = u.searchParams.get("since") || "", q = (u.searchParams.get("q") || "").slice(0, 120), vtok = (u.searchParams.get("v") || "").toLowerCase().split(",").map((x) => x.trim()).filter((x) => x.length >= 4).slice(0, 8);
  let must = null; try { must = q ? new RegExp(q, "i") : null; } catch (e) { return json({ error: "bad q" }, 400, { "content-type": "application/json" }); }   // q: a series-specific title pattern, for channels that carry several series (NASCAR, GT World, IMSA): no match = no video, never the wrong one
  const head = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "public, max-age=120" };
  if (!/^UC[\w-]{22}$/.test(ch) || !/^\d{4}-\d{2}-\d{2}$/.test(since)) return json({ error: "bad request" }, 400, head);
  const key = (env && env.YT_API_KEY) || (typeof process !== "undefined" && process.env && process.env.YT_API_KEY) || "";
  if (!key) return json({ id: null, why: "no api key" }, 200, head);
  const yearOk = (t) => { const m = /\b(19|20)\d\d\b/.exec(t); return !m || m[0] === since.slice(0, 4); };   // a throwback ("Extended Highlights | 2008 Brazilian Grand Prix") names another year
  const api = "https://www.googleapis.com/youtube/v3/", from = Date.parse(since + "T00:00:00Z"), to = from + 7 * 864e5;
  try {
    const pl = await fetch(`${api}playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=UU${ch.slice(2)}&key=${key}`);
    if (!pl.ok) return json({ id: null, why: "youtube api answered " + pl.status }, 200, head);
    const cand = ((await pl.json()).items || []).map((i) => ({ id: i.contentDetails && i.contentDetails.videoId, title: (i.snippet && i.snippet.title) || "", at: Date.parse((i.contentDetails && i.contentDetails.videoPublishedAt) || (i.snippet && i.snippet.publishedAt) || "") }))
      .filter((x) => x.id && x.at >= from && x.at <= to && WANT.test(x.title) && !SKIP.test(x.title) && !OTHER_LANG.test(x.title) && yearOk(x.title) && (!must || must.test(x.title)));
    /* weekly series post a highlights video every week, and the next race's can land inside the window: when some titles name this venue (v= tokens: the first letters of the track and event words), only those count */
    const norm = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (vtok.length) { const m = cand.filter((x) => vtok.some((t) => norm(x.title).includes(t))); if (m.length) cand.splice(0, cand.length, ...m); else if (cand.length > 1) cand.splice(0, cand.length, cand.slice().sort((a, b) => a.at - b.at)[0]); }   // no title names the venue: the earliest one after the race
    if (!cand.length) return json({ id: null, why: "no recap video yet" }, 200, head);
    const v = await fetch(`${api}videos?part=status&id=${cand.slice(0, 50).map((x) => x.id).join(",")}&key=${key}`);
    const ok = new Set(v.ok ? ((await v.json()).items || []).filter((x) => x.status && x.status.embeddable !== false && x.status.privacyStatus === "public").map((x) => x.id) : cand.map((x) => x.id));
    const best = cand.filter((x) => ok.has(x.id)).sort((a, b) => (/race( \d)? highlights/i.test(b.title) - /race( \d)? highlights/i.test(a.title)) || (/^extended/i.test(a.title) - /^extended/i.test(b.title)) || b.at - a.at)[0];   // the normal race highlights first (not the extended cut), then the newest (a doubleheader's second race)
    return json(best ? { id: best.id, title: best.title, at: new Date(best.at).toISOString() } : { id: null, why: "recap videos cannot be embedded" }, 200, head);
  } catch (e) { return json({ id: null, why: "could not reach YouTube" }, 502, head); }
};
