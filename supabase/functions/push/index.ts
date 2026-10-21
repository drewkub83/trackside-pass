// Supabase Edge Function "push": sends a phone notification for one row of `notifications`.
// Called by the database trigger private.notify_push() with {id} and the header x-push-secret. Deploy it with "Verify JWT" OFF (the secret is the check).
// Secrets (Edge Functions > Secrets): PUSH_SECRET, APNS_KEY (the .p8 file's text), APNS_KEY_ID, APNS_TEAM_ID, APNS_TOPIC (the bundle id),
// FCM_SERVICE_ACCOUNT (the Firebase service-account JSON). SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.
// Free tiers: APNs and FCM cost nothing. Dead tokens are deleted when a service says they are gone.
const URL_ = Deno.env.get("SUPABASE_URL")!, SVC = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const rest = (path: string, init: RequestInit = {}) => fetch(`${URL_}/rest/v1/${path}`, { ...init, headers: { apikey: SVC, Authorization: `Bearer ${SVC}`, "Content-Type": "application/json", ...(init.headers || {}) } });
const b64u = (b: ArrayBuffer | Uint8Array | string) => { const bytes = typeof b === "string" ? new TextEncoder().encode(b) : b instanceof Uint8Array ? b : new Uint8Array(b); let s = ""; bytes.forEach((x) => (s += String.fromCharCode(x))); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const pem = (p: string) => Uint8Array.from(atob(p.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "")), (c) => c.charCodeAt(0));

let apnsJwt: { t: string; at: number } | null = null;
async function apnsToken() {
  if (apnsJwt && Date.now() - apnsJwt.at < 50 * 60 * 1000) return apnsJwt.t;
  const key = await crypto.subtle.importKey("pkcs8", pem(Deno.env.get("APNS_KEY")!), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const head = b64u(JSON.stringify({ alg: "ES256", kid: Deno.env.get("APNS_KEY_ID") })), body = b64u(JSON.stringify({ iss: Deno.env.get("APNS_TEAM_ID"), iat: Math.floor(Date.now() / 1000) }));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(`${head}.${body}`));
  apnsJwt = { t: `${head}.${body}.${b64u(sig)}`, at: Date.now() }; return apnsJwt.t;
}
// returns "ok" | "dead" | "retry"
async function sendApns(token: string, title: string, body: string, data: Record<string, string>): Promise<string> {
  const jwt = await apnsToken(); let dead = 0;
  for (const host of ["api.push.apple.com", "api.sandbox.push.apple.com"]) {     // a build run from Xcode uses the sandbox, TestFlight and the App Store the production server
    const r = await fetch(`https://${host}/3/device/${token}`, { method: "POST", headers: { authorization: `bearer ${jwt}`, "apns-topic": Deno.env.get("APNS_TOPIC")!, "apns-push-type": "alert", "apns-priority": "10" }, body: JSON.stringify({ aps: { alert: { title, body }, sound: "default" }, ...data }) });
    if (r.ok) return "ok";
    const j = await r.json().catch(() => ({})); const why = j.reason || "";
    if (why === "BadDeviceToken" || why === "Unregistered" || r.status === 410) { dead++; continue; }
    console.log("apns", host, r.status, why); if (why === "TooManyRequests" || r.status >= 500) return "retry";
  }
  return dead === 2 ? "dead" : "retry";
}
let fcm: { t: string; at: number } | null = null;
async function fcmToken(sa: any) {
  if (fcm && Date.now() - fcm.at < 50 * 60 * 1000) return fcm.t;
  const key = await crypto.subtle.importKey("pkcs8", pem(sa.private_key), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000), head = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" })), body = b64u(JSON.stringify({ iss: sa.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${head}.${body}`));
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${head}.${body}.${b64u(sig)}` });
  const j = await r.json(); if (!j.access_token) throw new Error("fcm oauth: " + JSON.stringify(j)); fcm = { t: j.access_token, at: Date.now() }; return fcm.t;
}
async function sendFcm(token: string, title: string, body: string, data: Record<string, string>): Promise<string> {
  const sa = JSON.parse(Deno.env.get("FCM_SERVICE_ACCOUNT")!), access = await fcmToken(sa);
  const r = await fetch(`https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`, { method: "POST", headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: { token, notification: { title, body }, data, android: { priority: "high", notification: { icon: "ic_stat_icon", color: "#C97F5F" } } } }) });
  if (r.ok) return "ok";
  const j = await r.json().catch(() => ({})); const st = j.error?.details?.[0]?.errorCode || j.error?.status || "";
  if (st === "UNREGISTERED" || st === "NOT_FOUND" || st === "INVALID_ARGUMENT") return "dead";
  console.log("fcm", r.status, JSON.stringify(j).slice(0, 200)); return "retry";
}
const text = (n: any) => n.type === "friend_request" ? ["Friend request", `${n.data?.name || "Someone"} wants to be friends`] : n.type === "friend_accepted" ? ["Friend request accepted", `${n.data?.name || "Someone"} accepted your friend request`] : ["Trackside Pass", "You have a new notification"];

Deno.serve(async (req) => {
  if (!Deno.env.get("PUSH_SECRET") || req.headers.get("x-push-secret") !== Deno.env.get("PUSH_SECRET")) return new Response("no", { status: 401 });
  const input = await req.json().catch(() => ({}));
  if (input.ping) {   // a configuration check (needs the secret): which secrets exist and whether the keys can be read; sends nothing
    const have = (k: string) => !!Deno.env.get(k), res: Record<string, unknown> = { PUSH_SECRET: true, APNS_KEY: have("APNS_KEY"), APNS_KEY_ID: have("APNS_KEY_ID"), APNS_TEAM_ID: have("APNS_TEAM_ID"), APNS_TOPIC: have("APNS_TOPIC"), FCM_SERVICE_ACCOUNT: have("FCM_SERVICE_ACCOUNT") };
    try { await apnsToken(); res.apnsKeyReadable = true; } catch (e) { res.apnsKeyReadable = String(e).slice(0, 120); }
    try { if (have("FCM_SERVICE_ACCOUNT")) { await fcmToken(JSON.parse(Deno.env.get("FCM_SERVICE_ACCOUNT")!)); res.fcmLogin = true; } } catch (e) { res.fcmLogin = String(e).slice(0, 160); }
    return new Response(JSON.stringify(res), { headers: { "Content-Type": "application/json" } });
  }
  if (input.picks) {   // the Thursday "lock in your picks" nudge (called by pg_cron, see schema.sql): one push per phone per game
    const r = await rest("rpc/pick_reminder_targets", { method: "POST", body: "{}" });
    const rows: { token: string; platform: string; game_key: string; title: string; quali_start: string | null }[] = r.ok ? await r.json() : [];
    let ok = 0, dead = 0;
    for (const w of rows) {
      const early = w.quali_start && new Date(w.quali_start).getTime() > Date.now();
      const body = `${w.title}: pick your podium ${early ? "before qualifying for the +25% early bonus." : "before the race starts."}`, data = { type: "pick_reminder", game: w.game_key };
      let res = "retry";
      try { res = w.platform === "ios" ? await sendApns(w.token, "Lock in your picks", body, data) : await sendFcm(w.token, "Lock in your picks", body, data); } catch (e) { console.log("send failed", w.platform, String(e)); }
      if (res === "ok") ok++; if (res === "dead") { dead++; await rest(`push_tokens?token=eq.${encodeURIComponent(w.token)}`, { method: "DELETE" }); }
    }
    return new Response(JSON.stringify({ picks: { targets: rows.length, sent: ok, dead } }), { headers: { "Content-Type": "application/json" } });
  }
  const { id } = input;
  if (!Number.isInteger(id)) return new Response("bad request", { status: 400 });
  const n = (await (await rest(`notifications?id=eq.${id}&select=id,user_id,type,data`)).json())[0];
  if (!n) return new Response("gone", { status: 404 });
  const toks: { token: string; platform: string }[] = await (await rest(`push_tokens?user_id=eq.${n.user_id}&select=token,platform`)).json();
  const [title, body] = text(n), data = { type: String(n.type), name: String(n.data?.name || "") }; const out: Record<string, string> = {};
  for (const t of toks) {
    let r = "retry";
    try { r = t.platform === "ios" ? await sendApns(t.token, title, body, data) : await sendFcm(t.token, title, body, data); } catch (e) { console.log("send failed", t.platform, String(e)); }
    out[t.token.slice(0, 8)] = r;
    if (r === "dead") await rest(`push_tokens?token=eq.${encodeURIComponent(t.token)}`, { method: "DELETE" });
  }
  return new Response(JSON.stringify({ sent: out }), { headers: { "Content-Type": "application/json" } });
});
