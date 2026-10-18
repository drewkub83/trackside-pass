/* Cloudflare Worker entry (Workers Builds, wrangler.jsonc): serves the two server functions under /api/ and hands everything else to the static
   files in dist/ (run_worker_first in wrangler.jsonc means only /api/* ever reaches this code). The functions are the Netlify ones, reused. */
import ytlive from "../netlify/functions/ytlive.mjs";
import gtwce from "../netlify/functions/gtwce.mjs";
export default {
  async fetch(request, env) {
    const p = new URL(request.url).pathname;
    if (p === "/api/ytlive") return ytlive(request, env);
    if (p === "/api/gtwce") return gtwce(request, env);
    return env.ASSETS.fetch(request);
  },
};
