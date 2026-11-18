#!/usr/bin/env node
/* Daily feedback email. Reads the notes not yet emailed (feedback.digested_at is null) from Supabase with the service-role key, emails them to
   DIGEST_TO through Resend, then marks them sent. On Mondays it also sends last week's usage totals even when there is no feedback.
     node tools/feedback_digest.mjs [--dry]      (--dry: print a sample email, send nothing, change nothing)
   Needs SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, DIGEST_TO (GitHub Actions secrets; never committed). Without them it says so and exits quietly.
   This repository is public and its Action logs are public: the script prints counts only, never a note, an email address or a name. */
const DRY = process.argv.includes("--dry");
const { SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, DIGEST_TO } = process.env;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const day = (d) => d.toISOString().slice(0, 10);
const KIND = { idea: "Idea", problem: "Problem", other: "Other" };

function build(rows, stats, weekly, range) {
  const lines = [], html = [];
  if (rows.length) {
    lines.push(`${rows.length} new note${rows.length === 1 ? "" : "s"}`, "");
    html.push(`<h2 style="margin:0 0 12px">${rows.length} new note${rows.length === 1 ? "" : "s"}</h2>`);
    for (const r of rows) {
      const c = r.ctx || {}, where = [c.screen, c.track, c.plat].filter(Boolean).join(" · ");
      lines.push(`[${KIND[r.kind] || r.kind}] ${r.at.slice(0, 16).replace("T", " ")} UTC${where ? " · " + where : ""}`, r.msg, r.contact ? `Reply to: ${r.contact}` : "(no contact left)", "");
      html.push(`<div style="margin:0 0 16px;padding:12px 14px;border-radius:10px;background:#f3f4f2"><div style="font-size:12px;color:#666;margin-bottom:6px"><b>${esc(KIND[r.kind] || r.kind)}</b> · ${esc(r.at.slice(0, 16).replace("T", " "))} UTC${where ? " · " + esc(where) : ""}</div><div style="white-space:pre-wrap">${esc(r.msg)}</div><div style="font-size:12px;color:#666;margin-top:6px">${r.contact ? "Reply to: " + esc(r.contact) : "No contact left"}</div></div>`);
    }
  }
  if (stats) {
    const top = (a) => (a || []).map(([k, n]) => `${k} (${n})`).join(", ") || "none";
    const t = [`${stats.people} people, ${stats.opens} opens, ${stats.new_people} new`, `${stats.picks} podium picks, ${stats.checkins} passport check-ins`, `Top tracks: ${top(stats.top_tracks)}`, `Top screens: ${top(stats.top_screens)}`];
    lines.push(`Usage ${range}`, ...t, "");
    html.push(`<h3 style="margin:18px 0 6px">Usage ${esc(range)}</h3>` + t.map((x) => `<div>${esc(x)}</div>`).join(""));
  }
  const subject = rows.length ? `Trackside Pass: ${rows.length} new feedback note${rows.length === 1 ? "" : "s"}` : "Trackside Pass: weekly usage";
  return { subject, text: lines.join("\n"), html: `<div style="font:15px/1.45 -apple-system,Segoe UI,sans-serif;color:#111;max-width:560px">${html.join("")}</div>` };
}

if (DRY) {
  const m = build([{ kind: "problem", at: "2026-11-19T14:02:00Z", msg: "The map zoom felt off.\nSecond <line>.", contact: "fan@example.com", ctx: { screen: "detail", track: "sepang", plat: "ios" } }, { kind: "idea", at: "2026-11-19T15:30:00Z", msg: "A dark map for night races.", contact: null, ctx: { screen: "settings", plat: "web" } }],
    { people: 7, opens: 31, new_people: 2, picks: 9, checkins: 1, top_tracks: [["sepang", 4], ["daytona", 2]], top_screens: [["home", 7], ["play", 5]] }, true, "2026-11-12 to 2026-11-18");
  console.log(m.subject + "\n\n" + m.text); process.exit(0);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_API_KEY || !DIGEST_TO) { console.log("Feedback digest: secrets are not all set (SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, DIGEST_TO). Nothing sent."); process.exit(0); }

const H = { apikey: SUPABASE_SERVICE_KEY, Authorization: "Bearer " + SUPABASE_SERVICE_KEY, "Content-Type": "application/json" };
const get = async (p) => { const r = await fetch(SUPABASE_URL + "/rest/v1/" + p, { headers: H }); if (!r.ok) throw new Error("Supabase read failed: " + r.status); return r.json(); };
const rows = await get("feedback?digested_at=is.null&order=at.asc&limit=100&select=id,at,kind,msg,contact,ctx");
const now = new Date(), monday = now.getUTCDay() === 1;
if (!rows.length && !monday) { console.log("Feedback digest: nothing new."); process.exit(0); }
let stats = null, range = "";
if (monday || rows.length) {
  const to = new Date(now - 864e5), from = monday ? new Date(now - 7 * 864e5) : to; range = monday ? `${day(from)} to ${day(to)}` : `on ${day(to)}`;
  try { const r = await fetch(SUPABASE_URL + "/rest/v1/rpc/daily_stats", { method: "POST", headers: H, body: JSON.stringify({ p_from: day(from), p_to: day(to) }) }); if (r.ok) stats = await r.json(); } catch (e) {}
}
const m = build(rows, stats, monday, range);
const res = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ from: "Trackside Pass <onboarding@resend.dev>", to: [DIGEST_TO], subject: m.subject, text: m.text, html: m.html }) });
if (!res.ok) { console.error("Resend refused the email: HTTP " + res.status); process.exit(1); }
if (rows.length) {
  const ids = rows.map((r) => r.id).join(",");
  const u = await fetch(SUPABASE_URL + `/rest/v1/feedback?id=in.(${ids})`, { method: "PATCH", headers: { ...H, Prefer: "return=minimal" }, body: JSON.stringify({ digested_at: new Date().toISOString() }) });
  if (!u.ok) { console.error("Sent, but could not mark the notes as sent: HTTP " + u.status); process.exit(1); }
}
console.log(`Feedback digest sent: ${rows.length} note(s)${monday ? ", with the weekly usage totals" : ""}.`);
