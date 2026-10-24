/* The forecast for one track, fetched by the server and shared by every phone: each track's forecast is downloaded
   at most once every 10 minutes (Cloudflare's cache, or Netlify's CDN), however many people have the app open.
   The answer keeps Open-Meteo's JSON shape, which is what js/app.js reads, so moving to another provider later
   (Open-Meteo's paid plan, Apple WeatherKit) means changing only forecast() below to return the same fields.
   GET /api/weather?lat=36.27&lon=-115.01&tz=America/Los_Angeles */
const TTL = 600;
const FIELDS =
  "&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation,wind_speed_10m,wind_gusts_10m,wind_direction_10m,is_day" +
  "&hourly=temperature_2m,precipitation_probability,weather_code,is_day" +
  "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset" +
  "&minutely_15=precipitation&forecast_minutely_15=16&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=16";

async function forecast(lat, lon, tz) {
  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}${FIELDS}&timezone=${encodeURIComponent(tz)}`);
  if (!r.ok) throw new Error("open-meteo " + r.status);
  return await r.json();
}

export default async (req) => {
  const u = new URL(req.url), lat = +u.searchParams.get("lat"), lon = +u.searchParams.get("lon"), tz = u.searchParams.get("tz") || "auto";
  const head = { "content-type": "application/json", "access-control-allow-origin": "*", "netlify-cdn-cache-control": `public, max-age=${TTL}, stale-while-revalidate=300`, "cache-control": "public, max-age=60" };
  if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || !/^[A-Za-z0-9_+\-\/]{1,40}$/.test(tz))
    return new Response(JSON.stringify({ error: "bad lat, lon or tz" }), { status: 400, headers: head });
  const la = lat.toFixed(2), lo = lon.toFixed(2);          // ~1 km: every phone at the same track shares one cached forecast
  const cache = typeof caches !== "undefined" && caches.default ? caches.default : null;     // Cloudflare only
  const key = new Request(`https://tracksidepass.com/api/weather?lat=${la}&lon=${lo}&tz=${encodeURIComponent(tz)}`);
  if (cache) { const hit = await cache.match(key); if (hit) return hit; }
  try {
    const data = await forecast(la, lo, tz);
    const res = new Response(JSON.stringify(data), { headers: { ...head, "cache-control": `public, max-age=60, s-maxage=${TTL}` } });
    if (cache) await cache.put(key, res.clone());
    return res;
  } catch (e) {
    return new Response(JSON.stringify({ error: "forecast unavailable" }), { status: 502, headers: head });
  }
};
