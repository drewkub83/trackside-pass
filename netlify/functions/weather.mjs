/* The forecast for one track, fetched by the server and shared by every phone: each track's forecast is downloaded
   at most once every 10 minutes (Cloudflare's cache, or Netlify's CDN), however many people have the app open.
   The answer keeps Open-Meteo's JSON shape, which is what js/app.js reads, so moving to another provider later
   (Open-Meteo's paid plan, Apple WeatherKit) means changing only forecast() below to return the same fields.
   Apple WeatherKit is used when the Worker has the four WEATHERKIT_* secrets (see CLAUDE.md); otherwise, or if Apple fails, the
   answer comes from Open-Meteo. `_src` in the answer says which ("apple" or "open-meteo"); Apple's terms require showing it.
   GET /api/weather?lat=36.27&lon=-115.01&tz=America/Los_Angeles */
const TTL = 600;
const FIELDS =
  "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation,wind_speed_10m,wind_gusts_10m,wind_direction_10m,is_day" +
  "&hourly=temperature_2m,precipitation_probability,weather_code,is_day" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset" +
  "&minutely_15=precipitation&forecast_minutely_15=16&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=16";

async function openMeteo(lat, lon, tz) {
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}${FIELDS}&timezone=${encodeURIComponent(tz)}`);
  if (!r.ok) throw new Error("open-meteo " + r.status);
  const d = await r.json(); d._src = "open-meteo"; return d;
}

/* ---------------- Apple WeatherKit (REST) ---------------- */
const b64u = (b) => { const u = typeof b === "string" ? new TextEncoder().encode(b) : new Uint8Array(b); let s = ""; u.forEach((c) => (s += String.fromCharCode(c))); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
let jwt = null;
async function appleToken(env) {
  if (jwt && Date.now() - jwt.at < 25 * 60 * 1000) return jwt.t;
  const pem = String(env.WEATHERKIT_KEY).replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)), { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const now = Math.floor(Date.now() / 1000);
  const head = b64u(JSON.stringify({ alg: "ES256", kid: env.WEATHERKIT_KEY_ID, id: `${env.WEATHERKIT_TEAM_ID}.${env.WEATHERKIT_SERVICE_ID}` }));
  const body = b64u(JSON.stringify({ iss: env.WEATHERKIT_TEAM_ID, iat: now, exp: now + 3600, sub: env.WEATHERKIT_SERVICE_ID }));
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, new TextEncoder().encode(`${head}.${body}`));
  jwt = { t: `${head}.${body}.${b64u(sig)}`, at: Date.now() };
  return jwt.t;
}
const WMO = { Clear: 0, MostlyClear: 1, PartlyCloudy: 2, MostlyCloudy: 3, Cloudy: 3, Foggy: 45, Haze: 1, Smoky: 1, Dust: 1, BlowingDust: 1, Breezy: 1, Windy: 1, Frigid: 0, Hot: 0,
  Drizzle: 53, FreezingDrizzle: 56, Rain: 63, HeavyRain: 65, SunShowers: 80, Hail: 96, FreezingRain: 66, Sleet: 67, WintryMix: 67,
  Flurries: 71, SunFlurries: 71, Snow: 73, BlowingSnow: 73, HeavySnow: 75, Blizzard: 75,
  IsolatedThunderstorms: 95, ScatteredThunderstorms: 95, Thunderstorms: 95, StrongStorms: 95, TropicalStorm: 95, Hurricane: 95 };
const wmo = (c) => (c in WMO ? WMO[c] : 3);
const F = (c) => (c == null ? null : Math.round((c * 9 / 5 + 32) * 10) / 10), MPH = (k) => (k == null ? null : Math.round(k * 0.621371 * 10) / 10);
/* an instant as the track's local clock, "YYYY-MM-DDTHH:MM" (the shape Open-Meteo uses with &timezone=) */
function local(ms, tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
/* Apple's answer -> Open-Meteo's shape. `minutely` is Open-Meteo's minutely_15 block when Apple has no next-hour data here. */
export function fromApple(a, tz, minutely) {
  const c = a.currentWeather, H = a.forecastHourly.hours, D = a.forecastDaily.days, t = (x) => Date.parse(x);
  const windByDay = {}; H.forEach((h) => { const d = local(t(h.forecastStart), tz).slice(0, 10); windByDay[d] = Math.max(windByDay[d] || 0, h.windSpeed || 0); });
  const out = {
    _src: "apple",
    current: { time: local(t(c.asOf), tz), temperature_2m: F(c.temperature), apparent_temperature: F(c.temperatureApparent), relative_humidity_2m: Math.round((c.humidity || 0) * 100),
      weather_code: wmo(c.conditionCode), precipitation: c.precipitationIntensity ?? 0, wind_speed_10m: MPH(c.windSpeed), wind_gusts_10m: MPH(c.windGust ?? c.windSpeed), wind_direction_10m: c.windDirection, is_day: c.daylight ? 1 : 0 },
    hourly: { time: H.map((h) => local(t(h.forecastStart), tz)), temperature_2m: H.map((h) => F(h.temperature)), precipitation_probability: H.map((h) => Math.round((h.precipitationChance || 0) * 100)),
      weather_code: H.map((h) => wmo(h.conditionCode)), is_day: H.map((h) => (h.daylight ? 1 : 0)) },
    daily: { time: D.map((d) => local(t(d.forecastStart), tz).slice(0, 10)), weather_code: D.map((d) => wmo(d.conditionCode)), temperature_2m_max: D.map((d) => F(d.temperatureMax)), temperature_2m_min: D.map((d) => F(d.temperatureMin)),
      precipitation_probability_max: D.map((d) => Math.round((d.precipitationChance || 0) * 100)), wind_speed_10m_max: D.map((d) => MPH(windByDay[local(t(d.forecastStart), tz).slice(0, 10)] ?? 0)),
      sunrise: D.map((d) => (d.sunrise ? local(t(d.sunrise), tz) : null)), sunset: D.map((d) => (d.sunset ? local(t(d.sunset), tz) : null)) },
  };
  const M = a.forecastNextHour && a.forecastNextHour.minutes;
  if (M && M.length) {      // 16 buckets of 15 minutes ending on the quarter hours, mm per bucket (the average mm/h of its minutes / 4)
    const q = 15 * 60000, first = Math.ceil(Date.now() / q) * q, time = [], precipitation = [];
    for (let k = 0; k < 16; k++) { const end = first + k * q, v = M.filter((m) => t(m.startTime) >= end - q && t(m.startTime) < end).map((m) => m.precipitationIntensity || 0);
      time.push(local(end, tz)); precipitation.push(v.length ? Math.round((v.reduce((x, y) => x + y, 0) / v.length / 4) * 100) / 100 : null); }
    out.minutely_15 = { time, precipitation };
  } else if (minutely) out.minutely_15 = minutely;
  return out;
}
async function apple(lat, lon, tz, env) {
  const now = Date.now(), start = local(now, tz).slice(0, 10), startMs = now - (now % 86400000) - 86400000, from = new Date(startMs).toISOString().replace(/\.\d+Z$/, "Z");
  const url = `https://weatherkit.apple.com/api/v1/weather/en/${lat}/${lon}?dataSets=currentWeather,forecastDaily,forecastHourly,forecastNextHour&timezone=${encodeURIComponent(tz)}&dailyStart=${from}&hourlyStart=${from}&dailyEnd=${new Date(startMs + 11 * 86400000).toISOString().replace(/\.\d+Z$/, "Z")}&hourlyEnd=${new Date(startMs + 11 * 86400000).toISOString().replace(/\.\d+Z$/, "Z")}`;
  const r = await fetch(url, { headers: { authorization: `Bearer ${await appleToken(env)}` } });
  if (!r.ok) throw new Error("weatherkit " + r.status);
  const a = await r.json();
  let minutely = null;
  if (!(a.forecastNextHour && a.forecastNextHour.minutes && a.forecastNextHour.minutes.length)) {      // no next-hour data in this country: borrow Open-Meteo's 15-minute rain line
    try { const m = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&minutely_15=precipitation&forecast_minutely_15=16&timezone=${encodeURIComponent(tz)}`); if (m.ok) minutely = (await m.json()).minutely_15 || null; } catch (e) {}
  }
  const out = fromApple(a, tz, minutely);
  // the app lists the day it is today onward: drop yesterday (fetched only so the first hours of "today" in far-east time zones are never missing)
  const today = out.current.time.slice(0, 10), di = out.daily.time.indexOf(today), hi = out.hourly.time.findIndex((x) => x.slice(0, 10) >= today);
  if (di > 0) for (const k of Object.keys(out.daily)) out.daily[k] = out.daily[k].slice(di);
  if (hi > 0) for (const k of Object.keys(out.hourly)) out.hourly[k] = out.hourly[k].slice(hi);
  return out;
}

async function forecast(lat, lon, tz, env) {
  if (env && env.WEATHERKIT_KEY && env.WEATHERKIT_KEY_ID && env.WEATHERKIT_TEAM_ID && env.WEATHERKIT_SERVICE_ID && tz !== "auto") {
    try { return await apple(lat, lon, tz, env); } catch (e) { console.log("weatherkit failed, using open-meteo:", String(e).slice(0, 200)); }
  }
  return await openMeteo(lat, lon, tz);
}

export default async (req, env) => {
  const u = new URL(req.url), lat = +u.searchParams.get("lat"), lon = +u.searchParams.get("lon"), tz = u.searchParams.get("tz") || "auto";
  const head = { "content-type": "application/json", "access-control-allow-origin": "*", "netlify-cdn-cache-control": `public, max-age=${TTL}, stale-while-revalidate=300`, "cache-control": "public, max-age=60" };
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || !/^[A-Za-z0-9_+\-\/]{1,40}$/.test(tz))
    return new Response(JSON.stringify({ error: "bad lat, lon or tz" }), { status: 400, headers: head });
  const la = lat.toFixed(2), lo = lon.toFixed(2);          // ~1 km: every phone at the same track shares one cached forecast
  const cache = typeof caches !== "undefined" && caches.default ? caches.default : null;     // Cloudflare only
  const key = new Request(`https://tracksidepass.com/api/weather?lat=${la}&lon=${lo}&tz=${encodeURIComponent(tz)}`);
  if (cache) { const hit = await cache.match(key); if (hit) return hit; }
  try {
    const data = await forecast(la, lo, tz, env);
    const res = new Response(JSON.stringify(data), { headers: { ...head, "cache-control": `public, max-age=60, s-maxage=${TTL}` } });
    if (cache) await cache.put(key, res.clone());
    return res;
  } catch (e) {
    return new Response(JSON.stringify({ error: "forecast unavailable" }), { status: 502, headers: head });
  }
};
