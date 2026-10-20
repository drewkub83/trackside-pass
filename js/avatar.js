/* Profile pictures. Three looks: the first letter of your name (the default), one of a few colour schemes inspired by classic race liveries
   (plain stripes and a number roundel: no logos, no sponsors, no cars), or your own photo. Colour schemes can be seen by anyone who can see you;
   a photo only by you and your friends (it lives in a private storage bucket, see supabase/schema.sql). Needs js/account.js (sign-in, sbRpc, sbJson). */
const LIVERIES = [
  { id: "powder", name: "Powder blue", bg: "#8CC6EA", stripes: [[26, 12, "#F57C00"]], roundel: "#FFFFFF", ring: "#F57C00", ink: "#123A52" },
  { id: "triple", name: "Triple stripe", bg: "#F4F1E8", stripes: [[18, 6, "#1B3F8B"], [26, 6, "#6FB1E5"], [34, 6, "#D0312D"]], roundel: "#FFFFFF", ring: "#1B3F8B", ink: "#1B3F8B" },
  { id: "green", name: "British green", bg: "#0B5D3B", stripes: [[28, 8, "#F2C230"]], roundel: "#F4F1E8", ring: "#F2C230", ink: "#0B5D3B" },
  { id: "rosso", name: "Rosso", bg: "#C8102E", stripes: [[29, 3, "#FFFFFF"], [34, 3, "#FFFFFF"]], roundel: "#FFFFFF", ring: "#FFFFFF", ink: "#C8102E" },
  { id: "gold", name: "Black and gold", bg: "#141414", stripes: [[22, 2, "#C9A227"], [31, 2, "#C9A227"], [40, 2, "#C9A227"]], roundel: "#C9A227", ring: "#141414", ink: "#141414" },
  { id: "silver", name: "Silver", bg: "#C7CCD2", stripes: [[30, 4, "#222222"], [36, 2, "#C8102E"]], roundel: "#FFFFFF", ring: "#222222", ink: "#222222" },
  { id: "papaya", name: "Papaya", bg: "#FF8700", stripes: [[26, 12, "#0B1F4B"]], roundel: "#FFFFFF", ring: "#0B1F4B", ink: "#0B1F4B" },
  { id: "chequer", name: "Chequered", bg: "#FFFFFF", checker: true, stripes: [], roundel: "#FFFFFF", ring: "#111111", ink: "#111111" },
];
const avEsc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const avInitial = name => (String(name || "?").trim()[0] || "?").toUpperCase();
function liverySvg(id, letter, px) {
  const L = LIVERIES.find(x => x.id === id); if (!L) return "";
  const stripes = L.stripes.map(([x, w, c]) => `<rect x="${x}" y="-12" width="${w}" height="88" fill="${c}" transform="rotate(-18 32 32)"/>`).join("");
  let checks = ""; if (L.checker) for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if ((r + c) % 2) checks += `<rect x="${c * 16}" y="${r * 16}" width="16" height="16" fill="#111"/>`;
  return `<svg viewBox="0 0 64 64" width="${px}" height="${px}" aria-hidden="true"><rect width="64" height="64" fill="${L.bg}"/>${checks}${stripes}<circle cx="32" cy="32" r="15" fill="${L.roundel}" stroke="${L.ring}" stroke-width="2.5"/><text x="32" y="39" text-anchor="middle" font-family="Barlow Condensed, Outfit, sans-serif" font-size="21" font-weight="700" fill="${L.ink}">${avEsc(letter)}</text></svg>`;
}

/* what is known about each player's look: {avatar: "livery:id" | null, photo_v: number | null}; photos are fetched as blobs (they need the sign-in) and kept for the session */
const AV = { info: {}, photo: {}, asking: false };
const avSelf = () => { try { return (sbSession() || {}).uid || null; } catch (e) { return null; } };
function avLook(uid, name, px) {                         // the inner HTML of an avatar: photo, colour scheme or the letter
  let me = uid === "me" || uid === avSelf(); const i = me ? { avatar: (acct.profile || {}).avatar, photo_v: (acct.profile || {}).photo_v } : AV.info[uid] || {};
  const real = me ? avSelf() : uid, url = i.photo_v ? AV.photo[real + "|" + i.photo_v] : null;
  if (url) return `<img src="${url}" alt="" width="${px}" height="${px}">`;
  const m = /^livery:([a-z0-9]+)$/.exec(i.avatar || ""); if (m && LIVERIES.some(x => x.id === m[1])) return liverySvg(m[1], avInitial(name), px);
  return `<b class="avL" style="font-size:${Math.round(px * .46)}px">${avEsc(avInitial(name))}</b>`;
}
function avatarHtml(uid, name, px) {
  return `<span class="av" data-uid="${avEsc(uid)}" data-n="${avEsc(name)}" data-px="${px}" style="width:${px}px;height:${px}px">${avLook(uid, name, px)}</span>`;
}
let avTimer = 0;
function avHydrate() {                                    // fill in every avatar on screen: one request for the looks, then the photos that exist
  clearTimeout(avTimer); avTimer = setTimeout(async () => {
    if (!sbOn() || !sbSession()) return;
    const els = [...document.querySelectorAll(".av[data-uid]")]; if (!els.length) return;
    const need = [...new Set(els.map(e => e.dataset.uid).filter(u => u !== "me" && !(u in AV.info)))];
    if (need.length && !AV.asking) {
      AV.asking = true;
      try { (await sbRpc("avatars_of", { p_ids: need.slice(0, 200) })).forEach(r => { AV.info[r.id] = { avatar: r.avatar, photo_v: r.photo_v }; }); need.forEach(u => { if (!(u in AV.info)) AV.info[u] = {}; }); }
      catch (e) { need.forEach(u => { AV.info[u] = {}; }); }
      AV.asking = false;
    }
    const jobs = []; const ids = new Set(els.map(e => e.dataset.uid === "me" ? avSelf() : e.dataset.uid));
    ids.forEach(u => { const i = u === avSelf() ? acct.profile : AV.info[u]; if (i && i.photo_v && !(u + "|" + i.photo_v in AV.photo)) { AV.photo[u + "|" + i.photo_v] = null; jobs.push(avFetch(u, i.photo_v)); } });
    await Promise.all(jobs); els.forEach(e => { if (e.isConnected) e.innerHTML = avLook(e.dataset.uid, e.dataset.n, +e.dataset.px); }); avBar();
  }, 60);
}
async function avFetch(uid, v) {
  try { const t = await sbToken(), r = await fetch(`${SB.url}/storage/v1/object/authenticated/avatars/${uid}.jpg`, { headers: { apikey: SB.key, Authorization: "Bearer " + t } });
    if (r.ok) AV.photo[uid + "|" + v] = URL.createObjectURL(await r.blob()); else delete AV.photo[uid + "|" + v]; } catch (e) { delete AV.photo[uid + "|" + v]; }
}
/* anything drawn later (lists, the hub, the friend page) is filled in by looking at the page whenever it changes */
new MutationObserver(m => { if (m.some(x => [...x.addedNodes].some(n => n.nodeType === 1 && (n.matches(".av") || n.querySelector(".av"))))) avHydrate(); }).observe(document.documentElement, { childList: true, subtree: true });
/* the Account tab in the bottom bar wears your picture once you have chosen one */
function avBar() {
  const t = document.getElementById("acctTab"), ini = t && t.querySelector(".acIni"), p = acct && acct.profile; if (!ini || !p || !(p.avatar || p.photo_v)) return;
  ini.hidden = false; const ic = t.querySelector(".acIcon"); if (ic) ic.style.display = "none"; ini.classList.add("avIni"); ini.innerHTML = avLook("me", p.display_name, 24);
}

/* ---- choosing: Account > your picture ---- */
async function avSave(fields) {
  const t = await sbToken(); await sbJson("/rest/v1/profiles?id=eq." + sbSession().uid, { method: "PATCH", headers: { apikey: SB.key, Authorization: "Bearer " + t, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify(fields) });
  Object.assign(acct.profile, fields); if (typeof hintSet === "function") hintSet(acct.profile);
}
function openAvatarPicker() {
  const p = acct.profile; if (!p) return; const cur = p.avatar || "";
  const opt = (val, inner, label) => `<button class="avOpt${cur === val ? " on" : ""}" aria-label="${avEsc(label)}" aria-pressed="${cur === val}" onclick="avChoose('${val}')">${inner}<small>${avEsc(label)}</small></button>`;
  acctModal(`<div class="mkick">Account</div><h3 id="infoTitle">Your picture</h3>
    <div class="avBig">${avatarHtml("me", p.display_name, 88)}</div>
    <p class="plRules fine">${p.photo_v ? "Your friends see your photo. Everyone else sees your colours or your letter." : "Pick a look. Add a photo and only your friends will see it."}</p>
    <div class="avGrid">${opt("", `<span class="av" style="width:46px;height:46px"><b class="avL" style="font-size:21px">${avEsc(avInitial(p.display_name))}</b></span>`, "Letter")}${LIVERIES.map(L => opt("livery:" + L.id, `<span class="av" style="width:46px;height:46px">${liverySvg(L.id, avInitial(p.display_name), 46)}</span>`, L.name)).join("")}</div>
    <div class="acRow"><label class="btn primary acBtn avFile">${p.photo_v ? "Change photo" : "Add a photo"}<input type="file" id="avFile" accept="image/*" hidden onchange="avPhoto(this.files[0]); this.value=''"></label>${p.photo_v ? `<button class="btn quiet acBtn" onclick="avRemovePhoto()">Remove photo</button>` : ""}</div>
    <p class="plRules fine" id="avMsg"></p>`);
}
async function avChoose(val) {
  try { await avSave({ avatar: val || null }); openAvatarPicker(); acctRender(); avBar(); } catch (e) { const m = document.getElementById("avMsg"); if (m) m.textContent = e.message; }
}
/* the photo is cropped to a square and shrunk to 192 px (about 15 KB) on the phone before it is sent */
async function avPhoto(file) {
  const msg = document.getElementById("avMsg"); if (!file) return; if (msg) msg.textContent = "Saving your photo…";
  try {
    const bmp = await (window.createImageBitmap ? createImageBitmap(file, { imageOrientation: "from-image" }) : new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(file); }));
    const w = bmp.width || bmp.naturalWidth, h = bmp.height || bmp.naturalHeight, s = Math.min(w, h), cv = document.createElement("canvas"); cv.width = cv.height = 192;
    cv.getContext("2d").drawImage(bmp, (w - s) / 2, (h - s) / 2, s, s, 0, 0, 192, 192);
    const blob = await new Promise(ok => cv.toBlob(ok, "image/jpeg", 0.85)); if (!blob) throw new Error("That photo could not be read.");
    const t = await sbToken(), uid = sbSession().uid;
    const r = await fetch(`${SB.url}/storage/v1/object/avatars/${uid}.jpg`, { method: "POST", headers: { apikey: SB.key, Authorization: "Bearer " + t, "Content-Type": "image/jpeg", "x-upsert": "true", "cache-control": "3600" }, body: blob });
    if (!r.ok) throw new Error(r.status === 413 ? "That photo is too big." : "The photo could not be saved (" + r.status + ").");
    const v = Date.now(); await avSave({ photo_v: v }); AV.photo[uid + "|" + v] = URL.createObjectURL(blob);
    openAvatarPicker(); acctRender(); avBar();
  } catch (e) { const m = document.getElementById("avMsg"); if (m) m.textContent = e.message || "That did not work."; }
}
async function avRemovePhoto() {
  try { const t = await sbToken(); await fetch(`${SB.url}/storage/v1/object/avatars/${sbSession().uid}.jpg`, { method: "DELETE", headers: { apikey: SB.key, Authorization: "Bearer " + t } }); await avSave({ photo_v: null }); openAvatarPicker(); acctRender(); avBar(); }
  catch (e) { const m = document.getElementById("avMsg"); if (m) m.textContent = e.message; }
}
async function avDeleteMine() { try { const t = await sbToken(); await fetch(`${SB.url}/storage/v1/object/avatars/${sbSession().uid}.jpg`, { method: "DELETE", headers: { apikey: SB.key, Authorization: "Bearer " + t } }); } catch (e) {} }
