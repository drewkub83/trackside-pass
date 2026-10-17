/* Which video is live on a YouTube channel right now. The app used to embed youtube.com/embed/live_stream?channel=…,
   which YouTube no longer plays reliably, so the hub asks this first and embeds the actual video id instead.
   It reads the channel's public /live page (the same page "Open in YouTube" goes to), only for a well-formed channel
   id, and caches the answer for 60 s so many phones cost YouTube one request. GET /.netlify/functions/ytlive?ch=UC… */
export default async (req) => {
  const ch = new URL(req.url).searchParams.get("ch") || "";
  const head = { "content-type": "application/json", "access-control-allow-origin": "*", "netlify-cdn-cache-control": "public, max-age=60, stale-while-revalidate=60", "cache-control": "public, max-age=30" };
  if (!/^UC[\w-]{22}$/.test(ch)) return new Response(JSON.stringify({ error: "bad channel id" }), { status: 400, headers: head });
  try {
    const r = await fetch(`https://www.youtube.com/channel/${ch}/live`, { headers: { "user-agent": "Mozilla/5.0 (Trackside Pass live check)", "accept-language": "en-US,en;q=0.8", cookie: "CONSENT=YES+1" } });
    const h = r.ok ? await r.text() : "";
    const id = (h.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/) || [])[1] || null;
    const live = !!id && /"isLiveNow":true|"isLive":true/.test(h);
    return new Response(JSON.stringify({ ch, id: live ? id : null, live }), { headers: head });
  } catch (e) {
    return new Response(JSON.stringify({ ch, id: null, live: false, error: "could not reach YouTube" }), { status: 502, headers: head });
  }
};
