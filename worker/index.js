/* Cloudflare Worker entry (Workers Builds, wrangler.jsonc): serves the server functions under /api/ and hands everything else to the static
   files in dist/ (run_worker_first in wrangler.jsonc means only /api/* ever reaches this code). The functions are the Netlify ones, reused.

   Caching, so 10,000 phones cost the sources about what one phone does (Nov 2026):
   - /api/session, /api/gtwce: one answer per URL per Cloudflare data centre for 25 / 30 s (the Cache API below). Each data centre asks the
     source at most about twice a minute however many phones are connected to it.
   - /api/weather caches itself (10 minutes per ~1 km square).
   - /api/ytlive: ONE answer per channel for the whole world. A Cloudflare data-centre cache would not be enough: YouTube's daily quota is
     10,000 units and one lookup that falls back to the live search costs 102, so a few data centres asking every minute would use it up in
     minutes. So every request goes to a Durable Object per channel (YtLiveCache). It answers from memory for 60 s, shares one in-flight
     lookup between simultaneous callers, and runs the expensive search at most once every 10 minutes per channel. If the Durable Object is
     not available (no binding), the function just runs directly, as before. */
import { DurableObject } from "cloudflare:workers";
import ytlive from "../netlify/functions/ytlive.mjs";
import gtwce from "../netlify/functions/gtwce.mjs";
import weather from "../netlify/functions/weather.mjs";
import session from "../netlify/functions/session.mjs";

const TTL = { "/api/session": 25, "/api/gtwce": 30 };

/* Cache API wrapper: only 200 answers are kept; a failed answer is never shared. */
async function edgeCached(request, ctx, ttl, run) {
  const cache = caches.default, key = new Request(new URL(request.url).toString(), { method: "GET" });
  const hit = await cache.match(key);
  if (hit) { const h = new Response(hit.body, hit); h.headers.set("x-cache", "edge"); return h; }
  const res = await run();
  if (res.status !== 200) return res;
  const out = new Response(res.body, res);
  out.headers.set("cache-control", `public, max-age=${Math.min(20, ttl)}, s-maxage=${ttl}`);
  ctx.waitUntil(cache.put(key, out.clone()));
  return out;
}

export class YtLiveCache extends DurableObject {
  constructor(state, env) { super(state, env); this.env = env; this.memo = null; this.at = 0; this.inflight = null; this.lastSearch = 0; }
  async fetch(request) {
    const now = Date.now();
    if (this.memo && now - this.at < 60000) return new Response(this.memo, { headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "public, max-age=30", "x-cache": "shared" } });
    if (!this.inflight) {
      const allowSearch = now - this.lastSearch >= 600000;   // the 100-unit YouTube search, at most once every 10 minutes
      this.inflight = (async () => {
        const res = await ytlive(request, this.env, { allowSearch });
        const text = await res.text();
        if (res.status === 200) {
          this.memo = text; this.at = Date.now();
          try { if (JSON.parse(text).searched) this.lastSearch = Date.now(); } catch (_) {}
        }
        return new Response(text, { status: res.status, headers: res.headers });
      })().finally(() => { this.inflight = null; });
    }
    const r = await this.inflight;
    return r.clone();
  }
}

export default {
  async fetch(request, env, ctx) {
    const p = new URL(request.url).pathname;
    if (p === "/api/ytlive") {
      const ch = new URL(request.url).searchParams.get("ch") || "";
      if (env.YT_LIVE && /^UC[\w-]{22}$/.test(ch)) {
        try { return await env.YT_LIVE.get(env.YT_LIVE.idFromName(ch)).fetch(request); } catch (_) { /* fall through to a direct lookup */ }
      }
      return ytlive(request, env);
    }
    if (p === "/api/gtwce") return edgeCached(request, ctx, TTL[p], () => gtwce(request, env));
    if (p === "/api/weather") return weather(request, env);
    if (p === "/api/session") return edgeCached(request, ctx, TTL[p], () => session(request, env));
    return env.ASSETS.fetch(request);
  },
};
