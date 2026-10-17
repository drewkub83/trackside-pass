/* Which video is live on a YouTube channel right now, and whether it may play inside the app.
   The app used to embed youtube.com/embed/live_stream?channel=…, which YouTube no longer plays reliably, so the hub
   asks this first and embeds the actual video id instead. GET /.netlify/functions/ytlive?ch=UC…
   - With the YT_API_KEY environment variable set in Netlify (Site configuration > Environment variables; never put
     the key in this repo), it uses YouTube's official Data API: the channel's uploads playlist (live streams appear
     there while live) and those videos' live status (2 quota units of 10,000 a day); only if that finds nothing,
     YouTube's live search (100 units).
   - Without a key it reads the channel's public /live page, which YouTube often answers with a bot check when the
     request comes from a server; `why` then says so.
   Cached 60 s so many phones cost YouTube one request. */
const json = (o, status, head) => new Response(JSON.stringify(o), { status, headers: head });

async function viaApi(ch, key) {
  const api = "https://www.googleapis.com/youtube/v3/";
  const pick = async (ids, how) => {
    if (!ids.length) return null;
    const v = await fetch(`${api}videos?part=snippet,status,liveStreamingDetails&id=${ids.slice(0, 50).join(",")}&key=${key}`);
    if (!v.ok) return { id: null, live: false, embeddable: false, why: `youtube api answered ${v.status}` };
    const live = ((await v.json()).items || []).filter((x) => x.snippet && x.snippet.liveBroadcastContent === "live")
      .sort((a, b) => String((b.liveStreamingDetails || {}).actualStartTime).localeCompare(String((a.liveStreamingDetails || {}).actualStartTime)));
    if (!live.length) return null;
    const x = live[0], embeddable = !(x.status && x.status.embeddable === false);
    return { id: x.id, live: true, embeddable, title: x.snippet.title, found: how, why: embeddable ? "ok" : "channel blocks embedding" };
  };
  /* 1) the channel's uploads playlist, 50 newest (2 quota units). A race stream is often scheduled days ahead, so it
        sits below newer clips; 10 was not enough for a busy channel like GT World. */
  const pl = await fetch(`${api}playlistItems?part=contentDetails&maxResults=50&playlistId=UU${ch.slice(2)}&key=${key}`);
  if (!pl.ok) return { id: null, live: false, embeddable: false, why: `youtube api answered ${pl.status}` };
  const ids = ((await pl.json()).items || []).map((i) => i.contentDetails && i.contentDetails.videoId).filter(Boolean);
  const a = await pick(ids, "uploads");
  if (a) return a;
  /* 2) YouTube's own "live now on this channel" search (100 units of the 10,000 a day; only reached when 1 found nothing) */
  const sr = await fetch(`${api}search?part=id&channelId=${ch}&eventType=live&type=video&maxResults=5&key=${key}`);
  if (!sr.ok) return { id: null, live: false, embeddable: false, why: `youtube api search answered ${sr.status}` };
  const sids = ((await sr.json()).items || []).map((i) => i.id && i.id.videoId).filter(Boolean);
  return (await pick(sids, "search")) || { id: null, live: false, embeddable: false, why: "nothing live on the channel" };
}

async function viaPage(ch) {
  const r = await fetch(`https://www.youtube.com/channel/${ch}/live`, { headers: { "user-agent": "Mozilla/5.0 (Trackside Pass live check)", "accept-language": "en-US,en;q=0.8", cookie: "CONSENT=YES+1" } });
  const h = r.ok ? await r.text() : "";
  const id = (h.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/) || [])[1] || null;
  const live = !!id && /"isLiveNow":true|"isLive":true/.test(h);
  /* A channel can forbid playback outside YouTube; the watch page says so and YouTube's oEmbed answers 401. */
  let embeddable = live && !/"playableInEmbed":false/.test(h);
  if (embeddable) {
    const o = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent("https://www.youtube.com/watch?v=" + id)}`).catch(() => null);
    if (o && (o.status === 401 || o.status === 403)) embeddable = false;
  }
  const why = !r.ok ? `youtube answered ${r.status}` : /confirm you.{0,8}re not a bot|consent\.youtube\.com/i.test(h) ? "youtube asked for a bot check / consent" : !id ? "no live video on the channel page" : !live ? "video found but not live" : embeddable ? "ok" : "channel blocks embedding";
  return { id: live ? id : null, live, embeddable, why };
}

export default async (req) => {
  const ch = new URL(req.url).searchParams.get("ch") || "";
  const head = { "content-type": "application/json", "access-control-allow-origin": "*", "netlify-cdn-cache-control": "public, max-age=60, stale-while-revalidate=60", "cache-control": "public, max-age=30" };
  if (!/^UC[\w-]{22}$/.test(ch)) return json({ error: "bad channel id" }, 400, head);
  const key = (globalThis.Netlify && Netlify.env && Netlify.env.get("YT_API_KEY")) || process.env.YT_API_KEY || "";
  try {
    const out = key ? await viaApi(ch, key) : await viaPage(ch);
    return json({ ch, source: key ? "api" : "page", ...out }, 200, head);
  } catch (e) {
    return json({ ch, id: null, live: false, embeddable: false, why: "could not reach YouTube" }, 502, head);
  }
};
