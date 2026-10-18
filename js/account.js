/* ---- Accounts, friends and leaderboards (Supabase) ----
   Optional and local-first: the app works exactly as before without an account. Signing in (email + a one-time code, no password) backs up your
   Pick-your-podium picks to the server, which then locks them at the start of the race, banks the win chance and timing bonus itself, scores them
   from the official result and ranks you against your friends and everyone else (schema and rules: supabase/schema.sql; tested in tools/sync_games.mjs's
   sibling tests). Plain fetch to Supabase's REST endpoints, no library. Loaded after js/app.js, shares its globals (K, picksAll, gameKey, ENTRIES, esc, toast ...).
   Everything is off until SB.url and SB.key (the project URL and its public "anon" key: safe to ship, the database rules decide what anyone can do) are set. */
const SB = { url: "https://hspehgxhksctfegcfgyv.supabase.co", key: "sb_publishable_wWDezKw6jjcELQ3Mvjz5qQ_9CA5rF_l" };   // both public by design: the database rules decide what anyone can do
const sbOn = () => !!(SB.url && SB.key);
const sbEsc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---- session ---- */
function sbSession() { try { return JSON.parse(localStorage.getItem(K.session) || "null"); } catch (e) { return null; } }
function sbStore(s) { try { if (s) localStorage.setItem(K.session, JSON.stringify(s)); else localStorage.removeItem(K.session); } catch (e) {} }
function sbShape(j) { return { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (j.expires_in || 3600), uid: j.user && j.user.id, email: j.user && j.user.email }; }
async function sbJson(path, opts) {
  const r = await fetch(SB.url + path, opts); let j = null; try { j = await r.json(); } catch (e) {}
  if (!r.ok) { const err = new Error((j && (j.message || j.msg || j.error_description || j.error)) || ("Error " + r.status)); err.status = r.status; err.code = j && j.code; throw err; }
  return j;
}
let sbRefreshing = null;
async function sbToken() {
  let s = sbSession(); if (!s) return null;
  if (s.expires_at - 60 > Date.now() / 1000) return s.access_token;
  if (!sbRefreshing) sbRefreshing = sbJson("/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { apikey: SB.key, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: s.refresh_token }) })
    .then(j => { s = sbShape(j); sbStore(s); return s.access_token; })
    .catch(e => { if (e.status === 400 || e.status === 401) sbStore(null); throw e; })   // an expired or revoked sign-in: back to signed out
    .finally(() => { sbRefreshing = null; });
  return sbRefreshing;
}
async function sbRpc(name, args) {
  const t = await sbToken(); if (!t) throw new Error("Sign in first");
  return sbJson("/rest/v1/rpc/" + name, { method: "POST", headers: { apikey: SB.key, Authorization: "Bearer " + t, "Content-Type": "application/json" }, body: JSON.stringify(args || {}) });
}
const sbSendCode = email => sbJson("/auth/v1/otp", { method: "POST", headers: { apikey: SB.key, "Content-Type": "application/json" }, body: JSON.stringify({ email, create_user: true }) });
async function sbVerify(email, token) { const j = await sbJson("/auth/v1/verify", { method: "POST", headers: { apikey: SB.key, "Content-Type": "application/json" }, body: JSON.stringify({ type: "email", email, token }) }); sbStore(sbShape(j)); return j; }
async function sbSignOut() { const s = sbSession(); sbStore(null); try { localStorage.removeItem(K.acctHint); } catch (e) {} if (s) fetch(SB.url + "/auth/v1/logout", { method: "POST", headers: { apikey: SB.key, Authorization: "Bearer " + s.access_token } }).catch(() => {}); }

/* ---- the profile (display name, invite code) kept for offline display ---- */
let acct = { profile: null, friends: [], msg: "", busy: false, step: "email", email: "", loaded: false };
function hintGet() { try { return JSON.parse(localStorage.getItem(K.acctHint) || "null"); } catch (e) { return null; } }
function hintSet(p) { try { if (p) localStorage.setItem(K.acctHint, JSON.stringify(p)); else localStorage.removeItem(K.acctHint); } catch (e) {} }
async function acctLoad() {
  if (!sbOn() || !sbSession()) { acct.profile = null; acct.friends = []; acct.loaded = true; return; }
  acct.profile = hintGet(); acct.loaded = true;
  try { acct.profile = await sbRpc("my_profile"); hintSet(acct.profile); acct.friends = acct.profile ? await sbRpc("my_friends") : []; }
  catch (e) { acct.msg = e.status ? e.message : "Offline: showing what was saved on this phone."; }
}

/* ---- picks: local first, then to the server ---- */
const pendingGet = () => { try { return JSON.parse(localStorage.getItem(K.unsynced) || "[]"); } catch (e) { return []; } };
const pendingSet = a => { try { localStorage.setItem(K.unsynced, JSON.stringify([...new Set(a)])); } catch (e) {} };
const pushTimers = {};
function acctAfterPick(g, cls) {                       // called by the game screen after every change of a pick
  if (!sbOn() || !sbSession()) return;
  const k = gameKey(g) + "~" + cls; pendingSet(pendingGet().concat(k)); clearTimeout(pushTimers[k]); pushTimers[k] = setTimeout(() => acctPush(g, cls), 700);
}
async function acctPush(g, cls) {
  const k = gameKey(g) + "~" + cls;
  try {
    const rows = await sbRpc("save_picks", { p_game: gameKey(g), p_cls: cls, p_cars: picksOf(g)[cls] || [] });
    acctApply(g, cls, rows); pendingSet(pendingGet().filter(x => x !== k));
  } catch (e) {
    if (e.status && e.status < 500 && !/Sign in/i.test(e.message)) { pendingSet(pendingGet().filter(x => x !== k)); if (typeof toast === "function") toast(/locked/i.test(e.message) ? "The race has started: the server kept your earlier picks." : e.message); acctPull(); }
    /* offline or a server hiccup: stays in the pending list and goes next time */
  }
}
/* make the local copy match what the server banked: the chance and timing bonus are the server's, so the phone and the leaderboard agree */
function acctApply(g, cls, rows) {
  const all = picksAll(), k = gameKey(g); all[k] = Object.assign({}, all[k]);
  const list = rows.slice().sort((a, b) => a.slot - b.slot).map(r => String(r.car));
  const P = Object.assign({}, all[k]._p), M = Object.assign({}, all[k]._m);
  Object.keys(P).filter(x => x.startsWith(cls + "|")).forEach(x => delete P[x]); Object.keys(M).filter(x => x.startsWith(cls + "|")).forEach(x => delete M[x]);
  rows.forEach(r => { P[cls + "|" + r.car] = r.p; M[cls + "|" + r.car] = r.m; });
  if (list.length) all[k][cls] = list; else delete all[k][cls];
  all[k]._p = P; all[k]._m = M;
  try { localStorage.setItem(K.picks, JSON.stringify(all)); } catch (e) {}
}
async function acctPull() {
  if (!sbOn() || !sbSession() || typeof ENTRIES === "undefined") return;
  let rows; try { rows = await sbRpc("my_picks"); } catch (e) { return; }
  const by = {}; rows.forEach(r => { (by[r.game_key + "~" + r.cls] = by[r.game_key + "~" + r.cls] || []).push(r); });
  const pend = pendingGet(); let changed = false;
  ENTRIES.forEach(g => g.classes.forEach(c => {
    const k = gameKey(g) + "~" + c.h, srv = by[k], local = (picksOf(g)[c.h] || []);
    if (pend.includes(k)) { acctPush(g, c.h); return; }                                   // a change made offline goes up first
    if (srv) { const ser = srv.sort((a, b) => a.slot - b.slot).map(r => String(r.car)).join(","); if (ser !== local.join(",") || pickM(g, c.h, srv[0].car) !== srv[0].m) { acctApply(g, c.h, srv); changed = true; } }
    else if (local.length && !gameLocked(g)) acctPush(g, c.h);                              // picks made before signing in
  }));
  if (changed && typeof hubMode !== "undefined" && hubMode) renderHub();
}
window.addEventListener("online", () => { if (sbOn() && sbSession()) acctPull(); });

/* ---- screens (the Home-level modal #infoModal) ---- */
function acctOpenModal(html) { document.getElementById("infoBody").innerHTML = html; const m = document.getElementById("infoModal"); m.hidden = false; document.body.style.overflow = "hidden"; m.querySelector(".mcard").scrollTop = 0; }
const acctWrap = h => `<div class="mkick">Account</div>${h}`;
const acctBtn = (label, on, cls) => `<button class="btn ${cls || "primary"} acBtn" onclick="${on}">${label}</button>`;
function acctMsg() { return acct.msg ? `<p class="plRules acMsg">${sbEsc(acct.msg)}</p>` : ""; }
async function openAccount() {
  if (!sbOn()) return;
  acct.msg = ""; acctOpenModal(acctWrap(`<h3 id="infoTitle">Account</h3><p class="plRules">Loading…</p>`));
  await acctLoad(); acctRender();
}
function acctRender() {
  const s = sbSession(); const m = document.getElementById("infoModal"); if (m.hidden) return;
  let h;
  if (!s) {
    h = acct.step === "code"
      ? `<h3 id="infoTitle">Check your email</h3><p class="plRules">We sent a code to <b>${sbEsc(acct.email)}</b>. Type it here. It can take a minute.</p>
         <input class="acIn" id="acCode" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="Code" onkeydown="if(event.key==='Enter')acctCode()">
         ${acctMsg()}${acctBtn("Sign in", "acctCode()")}${acctBtn("Use a different email", "acct.step='email';acct.msg='';acctRender()", "quiet")}`
      : `<h3 id="infoTitle">Play against your friends</h3><p class="plRules">An account keeps your picks and points safe, scores them from the official results, and puts you on the leaderboards. No password: we email you a code. Your email is never shown to anyone.</p>
         <input class="acIn" id="acEmail" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" value="${sbEsc(acct.email)}" onkeydown="if(event.key==='Enter')acctEmail()">
         ${acctMsg()}${acctBtn("Email me a code", "acctEmail()")}<p class="plRules fine">By signing in you accept the <a href="privacy.html" target="_blank" rel="noopener">privacy policy and terms</a>. The game works without an account too.</p>`;
  } else if (!acct.profile) {
    h = `<h3 id="infoTitle">Choose your name</h3><p class="plRules">This is what friends and the leaderboard show: 3 to 20 letters, numbers, spaces, dots, dashes or underscores. Not your email.</p>
         <input class="acIn" id="acName" maxlength="20" autocomplete="nickname" placeholder="Display name" onkeydown="if(event.key==='Enter')acctName()">${acctMsg()}${acctBtn("Create my profile", "acctName()")}${acctBtn("Sign out", "acctOut()", "quiet")}`;
  } else {
    const p = acct.profile, fr = acct.friends || [];
    h = `<h3 id="infoTitle">${sbEsc(p.display_name)}</h3><p class="plRules">Signed in as ${sbEsc(s.email || "")}</p>${acctMsg()}
         ${acctBtn("Leaderboard", "openBoard()")}
         <h4 class="ptH">Invite a friend</h4>
         <p class="plRules">Send them your code. When they type it in, you are friends and see each other on the Friends leaderboard.</p>
         <div class="acCode sel">${sbEsc(p.invite_code || "")}</div>
         <div class="acRow">${acctBtn("Share my code", "acctShare()", "quiet")}</div>
         <h4 class="ptH">Add a friend</h4>
         <div class="acRow"><input class="acIn" id="acFriend" maxlength="12" autocapitalize="characters" placeholder="Their code" onkeydown="if(event.key==='Enter')acctAdd()">${acctBtn("Add", "acctAdd()")}</div>
         <h4 class="ptH">Friends (${fr.length})</h4>
         ${fr.length ? fr.map(f => `<div class="acFriend"><span>${sbEsc(f.display_name)}</span><button class="acX" aria-label="Remove ${sbEsc(f.display_name)}" onclick="acctRemove('${f.id}')">Remove</button></div>`).join("") : `<p class="plRules">No friends yet.</p>`}
         <h4 class="ptH">Privacy</h4>
         <label class="acCheck"><input type="checkbox" ${p.show_global ? "checked" : ""} onchange="acctGlobal(this.checked)"> Show me on the Everyone leaderboard</label>
         <p class="plRules fine">Friends always see you. Nobody sees your email. Friends can see your picks once a race has started.</p>
         <h4 class="ptH">Your account</h4>
         ${acctBtn("Sign out", "acctOut()", "quiet")}${acctBtn("Delete my account", "acctDelete()", "quiet acDanger")}
         <p class="plRules fine">Deleting removes your profile, picks and friendships from the server for good. <a href="privacy.html" target="_blank" rel="noopener">Privacy policy</a></p>`;
  }
  document.getElementById("infoBody").innerHTML = acctWrap(h);
}
async function acctEmail() {
  const v = (document.getElementById("acEmail").value || "").trim(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { acct.msg = "That does not look like an email address."; return acctRender(); }
  acct.email = v; acct.msg = "Sending…"; acctRender();
  try { await sbSendCode(v); acct.step = "code"; acct.msg = ""; } catch (e) { acct.msg = e.status === 429 ? "Too many tries: wait a minute and try again." : e.message; }
  acctRender();
}
async function acctCode() {
  const t = (document.getElementById("acCode").value || "").replace(/\s/g, ""); if (!/^\d{6,10}$/.test(t)) { acct.msg = "Type the numbers from the email."; return acctRender(); }
  acct.msg = "Checking…"; acctRender();
  try { await sbVerify(acct.email, t); acct.msg = ""; acct.step = "email"; await acctLoad(); acctPull(); }
  catch (e) { acct.msg = /expired|invalid/i.test(e.message) ? "That code is wrong or has expired. Ask for a new one." : e.message; }
  acctRender();
}
async function acctName() {
  const v = (document.getElementById("acName").value || "").trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9 _.-]{1,18}[A-Za-z0-9]$/.test(v)) { acct.msg = "3 to 20 characters: letters, numbers, spaces, dots, dashes or underscores."; return acctRender(); }
  try { acct.profile = await sbRpc("create_profile", { p_name: v }); hintSet(acct.profile); acct.msg = ""; acct.friends = []; } catch (e) { acct.msg = e.message; }
  acctRender();
}
async function acctAdd() {
  const v = (document.getElementById("acFriend").value || "").trim(); if (!v) return;
  try { const r = await sbRpc("add_friend", { p_code: v }); acct.msg = `You and ${r.friend} are now friends.`; acct.friends = await sbRpc("my_friends"); } catch (e) { acct.msg = e.message; }
  acctRender();
}
async function acctRemove(id) { if (!confirm("Remove this friend?")) return; try { await sbRpc("remove_friend", { p_friend: id }); acct.friends = await sbRpc("my_friends"); acct.msg = ""; } catch (e) { acct.msg = e.message; } acctRender(); }
async function acctGlobal(on) { try { const t = await sbToken(); await sbJson("/rest/v1/profiles?id=eq." + sbSession().uid, { method: "PATCH", headers: { apikey: SB.key, Authorization: "Bearer " + t, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ show_global: !!on }) }); acct.profile.show_global = !!on; hintSet(acct.profile); acct.msg = on ? "You are on the Everyone leaderboard." : "You are hidden from the Everyone leaderboard."; } catch (e) { acct.msg = e.message; } acctRender(); }
function acctShare() {
  const code = acct.profile && acct.profile.invite_code, text = `Join me on Trackside Pass: pick the podium each race weekend. My friend code is ${code}. https://tracksidepass.com`;
  if (navigator.share) navigator.share({ title: "Trackside Pass", text }).catch(() => {});
  else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => { acct.msg = "Copied. Paste it into a message."; acctRender(); }).catch(() => {});
}
async function acctOut() { await sbSignOut(); acct = { profile: null, friends: [], msg: "You are signed out. Your picks stay on this phone.", busy: false, step: "email", email: "", loaded: true }; acctRender(); }
async function acctDelete() {
  if (!confirm("Delete your account? Your profile, picks and friendships are removed from the server for good. Picks on this phone stay.")) return;
  if (!confirm("This cannot be undone. Delete it?")) return;
  try { await sbRpc("delete_my_account"); } catch (e) { acct.msg = e.message; return acctRender(); }
  await sbSignOut(); acct = { profile: null, friends: [], msg: "Your account was deleted.", busy: false, step: "email", email: "", loaded: true }; acctRender();
}

/* ---- leaderboard ---- */
let lb = { scope: "friends", series: "", game: "", rows: null, err: "" };
function boardGames() { return (typeof ENTRIES === "undefined" ? [] : ENTRIES).filter(g => typeof gameResult === "function" && gameResult(g) && g.d.slice(0, 4) === String(new Date().getFullYear())).sort((a, b) => b.d.localeCompare(a.d)); }
async function openBoard() {
  if (!sbOn()) return; await acctLoad();
  if (!sbSession() || !acct.profile) { acctOpenModal(acctWrap(`<h3 id="infoTitle">Leaderboard</h3><p class="plRules">Sign in and choose a name to join the leaderboards.</p>${acctBtn("Sign in", "openAccount()")}`)); return; }
  lb.rows = null; lb.err = ""; boardRender(); boardLoad();
}
async function boardLoad() {
  try { lb.rows = await sbRpc("leaderboard", { p_scope: lb.scope, p_year: new Date().getFullYear(), p_series: lb.series || null, p_game: lb.game || null }); lb.err = ""; }
  catch (e) { lb.rows = null; lb.err = e.status ? e.message : "Offline: the leaderboard needs a signal."; }
  boardRender();
}
function boardRender() {
  const seg = (items, cur, on) => `<div class="gmTabs lbTabs">${items.map(([v, l]) => `<button class="gmTab${v === cur ? " on" : ""}" onclick="${on}('${v}')">${sbEsc(l)}</button>`).join("")}</div>`;
  const ser = [...new Set((typeof ENTRIES === "undefined" ? [] : ENTRIES).map(g => g.s))].map(s => [s, typeof watchSeriesName === "function" ? watchSeriesName({ s }) : s]);
  const gm = boardGames();
  const rows = lb.rows ? (lb.rows.length ? lb.rows.map(r => `<div class="lbRow${r.is_me ? " me" : ""}"><span class="lbRank">${r.rank}</span><span class="lbName">${sbEsc(r.display_name)}${r.is_me ? " (you)" : ""}<small>${r.weekends} weekend${Number(r.weekends) === 1 ? "" : "s"} · ${r.winners} winner${Number(r.winners) === 1 ? "" : "s"} called</small></span><b>${r.points}</b>${r.is_me?"":`<button class="acX" aria-label="Report ${sbEsc(r.display_name)}" onclick="acctReport('${r.user_id}')">Report</button>`}</div>`).join("") : `<p class="plRules">${lb.scope === "friends" ? "No scores yet. Add friends from your account, then make picks." : "Nobody has scored yet this season."}</p>`) : `<p class="plRules">${sbEsc(lb.err || "Loading…")}</p>`;
  document.getElementById("infoBody").innerHTML = acctWrap(`<h3 id="infoTitle">Leaderboard · ${new Date().getFullYear()}</h3>
    ${seg([["friends", "Friends"], ["global", "Everyone"]], lb.scope, "boardScope")}
    <div class="acRow"><select class="acIn acSel" onchange="boardSeries(this.value)"><option value="">All series</option>${ser.map(([v, l]) => `<option value="${sbEsc(v)}"${v === lb.series ? " selected" : ""}>${sbEsc(l)}</option>`).join("")}</select>
    <select class="acIn acSel" onchange="boardGame(this.value)"><option value="">Whole season</option>${gm.map(g => { const t = TRACKS.find(x => x.id === g.t); return `<option value="${sbEsc(gameKey(g))}"${gameKey(g) === lb.game ? " selected" : ""}>${sbEsc((t ? t.short : g.t) + " · " + (typeof watchSeriesName === "function" ? watchSeriesName({ s: g.s }) : g.s))}</option>`; }).join("")}</select></div>
    <div class="lbList">${rows}</div>
    <p class="plRules fine">Points are scored on the server from the official results. <a href="#" onclick="openPoints();return false">How points work</a></p>
    <div class="acRow">${acctBtn("My account", "openAccount()", "quiet")}</div>`);
}
function boardScope(v) { lb.scope = v; lb.rows = null; boardRender(); boardLoad(); }
function boardSeries(v) { lb.series = v; lb.rows = null; boardRender(); boardLoad(); }
function boardGame(v) { lb.game = v; lb.rows = null; boardRender(); boardLoad(); }

async function acctReport(id) {
  const why = prompt("Why are you reporting this player? (an offensive name, cheating ...)"); if (!why) return;
  try { await sbRpc("report_user", { p_user: id, p_reason: why }); if (typeof toast === "function") toast("Thanks: we will look at it."); } catch (e) { if (typeof toast === "function") toast(e.message); }
}

/* a friend's picks for a weekend that has started (the Game sheet's "Friends' picks" button) */
async function openFriendPicks(gk) {
  try {
    const rows = await sbRpc("friend_picks", { p_game: gk }); const by = {};
    rows.forEach(r => { (by[r.display_name] = by[r.display_name] || []).push(r); });
    const g = (typeof ENTRIES === "undefined" ? [] : ENTRIES).find(x => gameKey(x) === gk);
    const car = (cls, n) => { const c = g && g.classes.find(x => x.h === cls), r = c && c.cars.find(x => String(x[0]) === String(n)); return `#${sbEsc(n)}${r ? " " + sbEsc(r[1]) : ""}`; };
    acctOpenModal(acctWrap(`<h3 id="infoTitle">Friends' picks</h3>${Object.keys(by).length ? Object.entries(by).map(([n, rs]) => `<h4 class="ptH">${sbEsc(n)}</h4>${rs.map(r => `<div class="acFriend"><span>${sbEsc(r.cls)} · ${r.slot}</span><span>${car(r.cls, r.car)}</span></div>`).join("")}`).join("") : `<p class="plRules">No friend has picks here, or the race has not started yet.</p>`}`));
  } catch (e) { if (typeof toast === "function") toast(e.message); }
}

/* the app calls these from its own screens */
function acctAppOpen() { if (sbOn() && sbSession()) acctPull(); }
document.addEventListener("DOMContentLoaded", () => { const r = document.getElementById("acctRow"); if (r && sbOn()) r.hidden = false; if (sbOn() && sbSession()) setTimeout(acctPull, 1500); });
