/* Regression harness for the Race Day hub (and anything it calls). Paste the whole file into the browser console of the running app
   (localhost or the Browser pane), then:
     const base = await window.__runHarness();            // BEFORE a refactor: hashes of the hub HTML for every track at ~10 pretend
     localStorage.setItem("__hubBaseline", JSON.stringify(base));   // moments (off-season, week before, race day, mid-session...)
     location.reload(); paste the file again;
     const now = await window.__runHarness(), base = JSON.parse(localStorage.getItem("__hubBaseline"));
     Object.keys(now).filter(k => now[k] !== base[k])      // [] means the refactor changed nothing the hub renders
   It freezes the clock (a fake Date), blocks network calls and clears weather/picks/stars so results are repeatable. */
window.__runHarness = async function () {
  const RealDate = window.__RealDate || Date; window.__RealDate = RealDate; let NOW = 0;
  function FD(...a) { if (!new.target) return new RealDate(NOW).toString(); return a.length ? new RealDate(...a) : new RealDate(NOW); }
  FD.now = () => NOW; FD.UTC = RealDate.UTC; FD.parse = RealDate.parse; FD.prototype = RealDate.prototype; window.Date = FD;
  const realFetch = window.__realFetch || window.fetch; window.__realFetch = realFetch; window.fetch = () => Promise.reject(new Error("offline"));
  Object.keys(localStorage).filter((k) => /paddock:(wx|picks|stars|going)/.test(k)).forEach((k) => localStorage.removeItem(k));
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h; };
  const out = {}; const L = (y, m, d, h = 12, mi = 0) => new RealDate(y, m - 1, d, h, mi).getTime();
  const day = (s, dx = 0, h = 12) => { const [y, m, d] = s.split("-").map(Number); return new RealDate(y, m - 1, d + dx, h).getTime(); };
  for (const t of TRACKS) {
    await openTrack(t.id); try { document.getElementById("hubTabBtn").click(); } catch (e) {}
    const evs = t.events.filter((e) => e.d >= "2026-10-14").sort((a, b) => a.d.localeCompare(b.d)).slice(0, 2); const states = [["now", L(2026, 10, 15, 14)]];
    evs.forEach((e, i) => { const end = eventEnd(e); states.push([`e${i}-20`, day(e.d, -20)], [`e${i}-3`, day(e.d, -3)], [`e${i}-d0`, day(e.d, 0, 12)], [`e${i}-d1`, day(e.d, 1, 15)], [`e${i}-end`, day(end, 0, 12)], [`e${i}+2`, day(end, 2, 12)]); });
    const ss = (t.sessions || []).filter((s) => evs[0] && s.d >= evs[0].d && s.d <= eventEnd(evs[0])).slice(0, 3);
    for (const s of ss) { const st = localToDate(s.d, s.s, t.tz).getTime(), en = s.e ? localToDate(s.d, s.e, t.tz).getTime() : st + 3600000; states.push([`s${s.d}${s.s}+5m`, st + 300000], [`s${s.d}${s.s}-30m`, st - 1800000], [`s${s.d}${s.s}end+30m`, en + 1800000]); }
    for (const [k, now] of states) { NOW = now; try { renderHub(); out[t.id + "|" + k] = hash(document.getElementById("hubBody").innerHTML); } catch (e) { out[t.id + "|" + k] = "ERR " + e.message; } }
  }
  window.Date = RealDate; window.fetch = realFetch; return out;
};
