/* First-run walkthrough: a short full-screen tour for a new install (Welcome, what the app does, series you follow, a look, the
   at-the-track switches, an optional account). It appears once, only on a fresh install (index.html records `window.__fresh`
   before anything is saved), and can be replayed from Settings > About. It uses the app's own tokens, so it follows whichever
   style (Classic, Race Control, Ticket Stubs, Editorial) and light/dark theme is on, and the choices it offers are the real
   settings (toggleFollow, setStyle, toggleAuto, toggleAlerts, openAccount): nothing is stored twice. */
let obStep = 0;
const OB_ICON = {
  map: '<path d="M12 21s-6.5-5.2-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.8 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.4"/>',
  hub: '<path d="M5 21V4M5 4h11l-2.2 3.5L16 11H5"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'
};
const obIcon = k => `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${OB_ICON[k]}</svg>`;
const obHasAccount = () => typeof SB !== "undefined" && SB && SB.url;
const obSteps = () => {
  const s = ["welcome", "features", "series", "look", "track"];
  if (obHasAccount()) s.push("account");
  return s;
};
function obSeriesRows() {
  return CHAMPS.filter(c => !c.viaSupport).map(c => `<div class="obRow"><div><b>${esc(c.name)}</b><small>${esc(c.full || "")}</small></div><button class="sw${followed(c) ? " on" : ""}" role="switch" aria-checked="${followed(c)}" aria-label="Follow ${esc(c.name)}" onclick="obFollow('${c.id}')"><i></i></button></div>`).join("");
}
function obLookRows() {
  const p = stylePref(), note = { classic: "The original soft look.", race: "Bold condensed type, a black header and orange accents.", ticket: "Race weekends as paper tickets with a coloured date stub.", editorial: "A quiet black-on-white magazine look." };
  return STYLES.map(([k, l]) => `<button class="obLook${k === p ? " on" : ""}" onclick="obLook('${k}')"><b>${l}</b><small>${note[k]}</small></button>`).join("");
}
function obHtml(name) {
  switch (name) {
    case "welcome": return `<img class="obLogo" src="icons/pin.svg" alt="" width="54" height="74"><h2>Welcome to Trackside Pass</h2><p class="obLead">Your race-day companion for the track: maps, walking directions, schedules and live info for every race weekend.</p><p class="obNote">Once it has saved itself, it works with no signal.</p>`;
    case "features": return `<h2>What it does</h2>
      <div class="obFeat">${obIcon("map")}<div><b>Maps and walking directions</b><small>Find your gate, seat, food and restrooms, with routes that stay off the track.</small></div></div>
      <div class="obFeat">${obIcon("hub")}<div><b>Race Day hub</b><small>What's on track now, what to watch, the weather and links to live timing.</small></div></div>
      <div class="obFeat">${obIcon("cal")}<div><b>Every session</b><small>Practice, qualifying and races for each series at the weekend. Star the ones you care about for an alert.</small></div></div>
      <div class="obFeat">${obIcon("star")}<div><b>Passport and Pick your podium</b><small>Collect a stamp at each track you visit, and call the podium before each race.</small></div></div>`;
    case "series": return `<h2>Which series do you follow?</h2><p class="obLead">Your Home screen shows the next race of each one. Change this any time in Settings.</p><div class="obList" id="obSeries">${obSeriesRows()}</div>`;
    case "look": return `<h2>Pick a look</h2><p class="obLead">Tap one to try it now. You can change it later in Settings.</p><div class="obList" id="obLooks">${obLookRows()}</div>`;
    case "track": return `<h2>At the track</h2><p class="obLead">These two use your location, only while the app is open, just to know which track you're at.</p>
      <div class="obRow"><div><b>Open at the track</b><small>The app opens on that track's Race Day hub.</small></div><button class="sw${autoOn() ? " on" : ""}" id="obAuto" role="switch" aria-checked="${autoOn()}" aria-label="Open at the track" onclick="obAuto()"><i></i></button></div>
      <div class="obRow"><div><b>On-track alerts</b><small>A card pops up when a session is on track.</small></div><button class="sw${alertsOn() ? " on" : ""}" id="obAlert" role="switch" aria-checked="${alertsOn()}" aria-label="On-track alerts" onclick="obAlert()"><i></i></button></div>
      <p class="obNote">Your phone will ask for permission when you turn one on.</p>`;
    case "account": return `<h2>An account is optional</h2><p class="obLead">Make one to play Pick your podium with friends, join the leaderboards and keep your passport safe if you change phones. Everything else works without one.</p><button class="btn primary obWide" onclick="obAccount()">Sign in or create an account</button>`;
  }
  return "";
}
function obRender() {
  const steps = obSteps(), name = steps[obStep], last = obStep === steps.length - 1, v = document.getElementById("obv");
  if (!v) return;
  v.querySelector(".obBody").innerHTML = obHtml(name);
  v.querySelector(".obBody").scrollTop = 0;
  v.querySelector(".obDots").innerHTML = steps.map((_, i) => `<i class="${i === obStep ? "on" : ""}"></i>`).join("");
  v.querySelector(".obBack").style.display = obStep ? "" : "none";
  v.querySelector(".obNext").textContent = obStep === 0 ? "Show me around" : last ? "Start exploring" : "Next";
  v.querySelector(".obSkip").style.display = last ? "none" : "";
}
function obOpen() {
  if (document.getElementById("obv")) return;
  obStep = 0;
  const v = document.createElement("div");
  v.id = "obv"; v.setAttribute("role", "dialog"); v.setAttribute("aria-modal", "true"); v.setAttribute("aria-label", "Welcome to Trackside Pass");
  v.innerHTML = `<div class="obTop"><button class="obSkip" onclick="obClose()">Skip</button></div><div class="obBody"></div><div class="obBar"><button class="obBack btn quiet" onclick="obGo(-1)">Back</button><div class="obDots"></div><button class="obNext btn primary" onclick="obGo(1)">Next</button></div>`;
  document.body.appendChild(v); document.body.style.overflow = "hidden";
  obRender();
}
function obGo(d) { const n = obSteps().length; if (d > 0 && obStep === n - 1) { obClose(); return; } obStep = Math.max(0, Math.min(n - 1, obStep + d)); obRender(); }
function obClose() { LSset(K.onboarded, "1"); const v = document.getElementById("obv"); if (v) v.remove(); document.body.style.overflow = ""; }
function obFollow(id) { toggleFollow(id); const b = document.getElementById("obSeries"); if (b) b.innerHTML = obSeriesRows(); }
function obLook(k) { setStyle(k); const b = document.getElementById("obLooks"); if (b) b.innerHTML = obLookRows(); }
async function obAuto() { await toggleAuto(); const b = document.getElementById("obAuto"); if (b) { b.classList.toggle("on", autoOn()); b.setAttribute("aria-checked", autoOn()); } }
async function obAlert() { await toggleAlerts(); const b = document.getElementById("obAlert"); if (b) { b.classList.toggle("on", alertsOn()); b.setAttribute("aria-checked", alertsOn()); } }
function obAccount() { obClose(); if (typeof openAccount === "function") openAccount(); }
if (window.__fresh && !LSget(K.onboarded, "")) setTimeout(obOpen, 700);
