/* Trackside Pass service worker: makes the app work with no signal.
   - First visit: downloads the app and every track's info first (small), then each track's map one at a time
     (about 4.6 MB in all). A dropped signal only skips the maps it missed; the app tops them up on later launches.
   - After that: opens instantly from the phone, then quietly refreshes files in the background
     when there is a connection, so edits show up on the next launch.
   Bump VERSION to force a clean re-download of everything. */
const VERSION = "v162";
const CACHE = "paddock-" + VERSION;
const FONT_CACHE = "paddock-fonts";
const TRACKS = ["daytona","sebring","laguna-seca","watkins-glen","road-america","vir","indianapolis","road-atlanta","mid-ohio","long-beach","detroit","canadian-tire-motorsport-park","phoenix","barber","st-petersburg","arlington","cota","sonoma","indianapolis-oval","spa-francorchamps","paul-ricard","nurburgring","barcelona-catalunya","portimao","brands-hatch","imola"];
const SHELL = [
  "./", "index.html", "css/styles.css", "js/native.js", "js/app.js", "js/passport.js", "data/series.js", "data/champs.js", "data/watch.js", "data/results.js", "data/standings.js", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon.svg", "icons/favicon-32.png", "icons/pin.svg",
  ...TRACKS.map(t => "data/" + t + ".js")
];
const MAPS = TRACKS.map(t => "data/maps/" + t + ".js");   /* base map + walking grid + elevation, fetched when a track is opened */

/* Saves any track maps not on the phone yet, three at a time. Returns true once every map is saved. */
async function saveMaps(cache) {
  const todo = [];
  for (const u of MAPS) if (!(await cache.match(u))) todo.push(u);
  let i = 0;
  await Promise.all([0, 1, 2].map(async () => {
    while (i < todo.length) {
      const u = todo[i++];
      try { const r = await fetch(new Request(u, { cache: "reload" })); if (r.ok) await cache.put(u, r); } catch (_) { /* offline: try again next launch */ }
    }
  }));
  for (const u of MAPS) if (!(await cache.match(u))) return false;
  return true;
}
async function tellClients(type) { (await self.clients.matchAll({ includeUncontrolled: true })).forEach(c => c.postMessage({ type })); }

/* Must match the <link> in index.html exactly. Saved up front so the fonts also work offline. */
const FONT_CSS = "https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600&display=swap";

async function saveFonts() {
  try {
    const fc = await caches.open(FONT_CACHE);
    const css = await fetch(FONT_CSS);
    if (!css.ok) return;
    await fc.put(FONT_CSS, css.clone());
    const urls = [...(await css.text()).matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]);
    await Promise.all(urls.map(async u => { const r = await fetch(u); if (r.ok) await fc.put(u, r); }));
  } catch (_) { /* fonts are nice-to-have; the app falls back to system fonts */ }
}

self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL.map(u => new Request(u, { cache: "reload" })));
    await saveFonts();
    self.skipWaiting();
    if (await saveMaps(cache)) await tellClients("offline-ready");
  })());
});

/* The page asks for this on launch (when online), so a first visit that lost signal still ends up fully saved. */
self.addEventListener("message", e => {
  if (!e.data || e.data.type !== "topup") return;
  e.waitUntil((async () => { if (await saveMaps(await caches.open(CACHE))) await tellClients("offline-ready"); })());
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("paddock-") && k !== CACHE && k !== FONT_CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (url.origin !== location.origin && !isFont) return;
  e.respondWith((async () => {
    const cache = await caches.open(isFont ? FONT_CACHE : CACHE);
    const hit = await cache.match(req, { ignoreSearch: !isFont, ignoreVary: true });
    const refresh = fetch(req).then(res => {
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    }).catch(() => null);
    if (hit) { e.waitUntil(refresh); return hit; }
    const res = await refresh;
    if (res) return res;
    if (req.mode === "navigate") { const home = await cache.match("index.html"); if (home) return home; }
    return new Response("Offline", { status: 503, statusText: "Offline" });
  })());
});
