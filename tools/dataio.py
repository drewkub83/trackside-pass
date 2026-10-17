"""Small helpers the series updaters share (stdlib only, so they run on a plain GitHub runner):
  track_events()   {track id: [{d, t, e}]} for every track in data/ (read with node, the same way auto_update.py does)
  set_record(...)  lap records: write a venue's lapRecord row for a series only if the new lap is faster than the stored one
  js_entry_replace / js_entry_add  for the one-entry-per-race blocks of data/results.js
Nothing here invents data: callers pass what the series' own pages said."""
import os, re, sys, json, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..")
sys.path.insert(0, os.path.join(HERE, "track-data"))

def read(rel): return open(os.path.join(ROOT, rel), encoding="utf8").read()
def write(rel, s): open(os.path.join(ROOT, rel), "w", encoding="utf8").write(s)

def track_events():
    js = """const fs=require('fs');const skip=['champs.js','series.js','results.js','entries.js','standings.js','watch.js'];const out={};
for(const f of fs.readdirSync('data')){ if(!/^[a-z0-9-]+\\.js$/.test(f)||skip.includes(f)) continue; const T=[]; try{ new Function('TRACKS',fs.readFileSync('data/'+f,'utf8'))(T); }catch(e){ continue }
 const t=T[0]; if(t) out[t.id]=(t.events||[]).map(e=>({d:e.d,t:e.t||1,e:e.e||''})); } console.log(JSON.stringify(out))"""
    return json.loads(subprocess.run(["node", "-e", js], capture_output=True, text=True, cwd=ROOT, check=True).stdout)

def app_event(events, track, day):
    """The app's event on `track` that contains the calendar day `day` (YYYY-MM-DD), or None."""
    import datetime
    d = datetime.date.fromisoformat(day)
    for e in events.get(track, []):
        s = datetime.date.fromisoformat(e["d"])
        if s <= d <= s + datetime.timedelta(days=e["t"] - 1): return e
    return None

def secs(t):
    m = re.fullmatch(r"(\d+):(\d\d)\.(\d+)", (t or "").strip())
    return int(m.group(1)) * 60 + int(m.group(2)) + float("0." + m.group(3)) if m else None
def fmt(v, dec=4):
    m = int(v // 60); return f"{m}:{v - 60 * m:0{dec + 3}.{dec}f}"

def set_record(track, series, time_s, who, car, year, note, dec=4, dry=False):
    """Writes data/<track>.js's lapRecord row for `series` when `time_s` (m:ss.fff) beats the stored one (or there is none).
    Returns True if it changed. Layout rules are the caller's job (only pass laps from the layout the map draws)."""
    import build_route as B
    new = secs(time_s)
    if new is None: return False
    T = B.load(track); lr = T.get("lapRecord") or []
    old = next((r for r in lr if r.get("series") == series), None)
    if old and secs(old.get("time")) is not None and not new < secs(old["time"]) - 0.0004: return False
    print(f"  record {track} {series}: {old['time'] if old else 'none'} -> {fmt(new, dec)} {who}")
    if dry: return True
    lr = [r for r in lr if r.get("series") != series] + [{"series": series, "time": fmt(new, dec), "who": who, "car": car, "year": year, "note": note}]
    T["lapRecord"] = lr; B.save(track, T); return True
