/* Cloudflare Pages Function: GET /api/ytlive?ch=UC... -- the same code as the Netlify function, reused (YT_API_KEY is a secret of the Pages project). */
import handler from "../../netlify/functions/ytlive.mjs";
export const onRequestGet = ({ request, env }) => handler(request, env);
