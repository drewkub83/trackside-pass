/* Cloudflare Pages Function: GET /api/gtwce?round=portimao -- the same code as the Netlify function, reused. */
import handler from "../../netlify/functions/gtwce.mjs";
export const onRequestGet = ({ request, env }) => handler(request, env);
