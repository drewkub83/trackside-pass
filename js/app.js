/* js/app.js: one file, in this order (search for the marker text).
   Home and series ......... "HOME" (hero, series list, my races, race-week banner)
   Track screen ............ "DETAIL" (openTrack/ensureMap, map render, badges, declutter, GPS, food, events, info)
   Walking directions ...... "walking directions" (grid, dijkstra, elevation, hill notes)
   Schedule + Race Day hub . "schedule: sessions" (time zones, hub, series guide)
   Map interaction ......... "origin for walk times" (parking/restroom modes, saved spot, badge editing, pan/zoom, sheets)
   At the track ............ "open straight at the track" (auto-open, on-track alerts, session notifications)
   Settings, theme ......... "toggleSettingsGroup", "THEME_KEY", "more settings"
   Weather and units ....... "WEATHER"
   App shell ............... "offline support", "swipe back"
   Startup statements (renderHome(), timers, listeners) sit between the functions and rely on hoisting, so do not split
   this file without moving them all to a final boot step first. */
/* ---------------- STORAGE KEYS ----------------
   Every localStorage key the app uses, in one place (all of it stays on this phone). A key ending in ":" is per track: append the track id.
   tools/validate.js fails the build if a key string of that form appears anywhere else, so a new key has to be added here and described. */
const K={
  theme:"paddock:theme",         /* light / dark / auto */
  style:"paddock:style",         /* Classic or Race Control look (also read by the inline script in index.html before first paint) */
  times:"paddock:times",         /* track time or my time */
  units:"paddock:units",         /* legacy combined units key (migrated to wxUnits and distUnits) */
  wxUnits:"paddock:wxUnits",       /* weather units (imperial / metric) */
  distUnits:"paddock:distUnits",     /* distance units (imperial / metric) */
  haptics:"paddock:haptics",       /* vibration on/off */
  awake:"paddock:awake",         /* keep the screen awake */
  dev:"paddock:dev",           /* developer tools on */
  accessRoutes:"paddock:accessRoutes",  /* avoid unmarked / wooded ground in walking directions (Settings) */
  auto:"paddock:auto",          /* open straight at the track when you arrive */
  alerts:"paddock:alerts",        /* session alerts on/off (iPhone app) */
  alertsSeen:"paddock:alertsSeen",    /* whether the alerts permission prompt was shown */
  remind:"paddock:remind",        /* going-race reminders on/off */
  goDays:"paddock:goDays",        /* how many days before a weekend the hub shows What to watch / the game */
  going:"paddock:going",         /* races you are going to */
  stars:"paddock:stars",         /* starred sessions */
  picks:"paddock:picks",         /* Pick your podium picks, with the win chance and timing bonus banked per pick (_p, _m) */
  favSeries:"paddock:favSeries",     /* the series starred on the hub */
  followSub:"paddock:followSub",     /* support series you chose to follow */
  unfollow:"paddock:unfollow",      /* series you switched off */
  seriesOrder:"paddock:seriesOrder",   /* your arrangement of series on Home */
  raceWeekShown:"paddock:raceWeekShown", /* race weeks whose banner was already shown */
  offline:"paddock:offline",       /* set once the offline maps are saved */
  passport:"paddock:passport",      /* passport stamps and unlocked badges */
  pp:"paddock:pp",            /* passport check-in switch */
  ppGroup:"paddock:ppGroup",       /* passport grouping (region / series) */
  layout:"paddock:layout:",        /* your edits to a track's map badges, per track (+ track id) */
  lots:"paddock:lots:",          /* parking lot tweaks, per track (+ track id) */
  added:"paddock:added:",         /* stands you added to the map, per track (+ track id) */
  spot:"paddock:spot:",          /* your saved spot, per track (+ track id) */
  rev:"paddock:rev:",           /* track data revision last seen, per track (+ track id) */
  wx:"paddock:wx:",            /* cached weather, per track (+ track id) */
  stands:"paddock:",        /* stands added by you for a track are stored under the bare prefix + track id (older key shape) */
};
const K_RETIRED=["paddock:vpgap","paddock:gapAsked"];   /* removed features: cleared on startup */
/* Map space is a 1000 x 700 box. geo = lat/lng of that box's edges so GPS can be placed on it. */
const KINDS = {
  food:{label:"Food",c:"var(--food)"}, stand:{label:"Grandstands",c:"var(--stand)"}, gate:{label:"Gates",c:"var(--gate)"},
  park:{label:"Parking",c:"var(--park)"}, rest:{label:"Restrooms",c:"var(--rest)"}, shower:{label:"Showers",c:"#2A8FBD"}, camp:{label:"Camping",c:"var(--camp)"},
  med:{label:"Medical",c:"var(--med)"}, merch:{label:"Merch",c:"var(--merch)"}, info:{label:"Landmarks",c:"var(--info)"}, screen:{label:"Big screens",c:"var(--screen)"}, cross:{label:"Crossings",c:"var(--cross)"}, view:{label:"Best views",c:"var(--view)"}
};



/* ---------------- STATE ---------------- */
let cur = null, layers = new Set(Object.keys(KINDS).filter(k=>k!=="park"&&k!=="shower")), watchId = null, userPos = null;

/* ---------------- HOME ---------------- */
/* the circuit itself, with a little margin: every tile, hero and passport stamp is drawn from this, so all tracks fill their space alike */
function trackBox(t){
  if(t._tb) return t._tb; const n=(t.path.match(/-?\d+\.?\d*/g)||[]).map(Number); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let i=0;i+1<n.length;i+=2){ x0=Math.min(x0,n[i]); x1=Math.max(x1,n[i]); y0=Math.min(y0,n[i+1]); y1=Math.max(y1,n[i+1]); }
  const w=x1-x0, h=y1-y0, p=Math.max(w,h)*0.05; return t._tb=[+(x0-p).toFixed(1),+(y0-p).toFixed(1),+(w+2*p).toFixed(1),+(h+2*p).toFixed(1)];
}
function miniSvg(t){       /* stroke is sized for the 62 x 48 px tile */
  const b=trackBox(t), sc=Math.min(62/b[2],48/b[3]);
  return `<svg viewBox="${b.join(" ")}" aria-hidden="true"><path d="${t.path}" fill="none" stroke="var(--asphalt-2)" stroke-width="${(1.05/sc).toFixed(1)}" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function localToday(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function addDays(d,n){ const x=new Date(d+"T12:00:00"); x.setDate(x.getDate()+n); return x.toISOString().slice(0,10); }
function eventEnd(e){ return addDays(e.d,(e.t||1)-1); }
/* "Sep 18–20" / "Sep 30–Oct 3" (no year) and "Sep 30 – Oct 3, 2026" (with year; both years if it spans two) */
function fmtSpan(e){ const s=new Date(e.d+"T12:00:00"), f=new Date(eventEnd(e)+"T12:00:00"); if(e.d===eventEnd(e)) return fmt(e.d); return s.getMonth()===f.getMonth()?`${fmt(e.d)}–${f.getDate()}`:`${fmt(e.d)}–${fmt(eventEnd(e))}`; }
function fmtRange(e){ const s=new Date(e.d+"T12:00:00"), f=new Date(eventEnd(e)+"T12:00:00"), sy=s.getFullYear(), fy=f.getFullYear(); return sy===fy?`${fmtSpan(e).replace("–"," – ")}, ${sy}`:`${fmt(e.d)}, ${sy} – ${fmt(eventEnd(e))}, ${fy}`; }
function fmt(d){ const x=new Date(d+"T12:00:00"); return x.toLocaleDateString(undefined,{month:"short",day:"numeric"}); }
function daysBetween(a,b){ return Math.round((new Date(b+"T12:00:00")-new Date(a+"T12:00:00"))/864e5); }

/* ---- championships (data/champs.js): which race is on now, which is next ---- */
const champ=id=>CHAMPS.find(c=>c.id===id);
const inChamp=(c,e)=>{ const hay=c.viaSupport?(e.support||[]).join(" | "):(e.s||""); return c.match.test(hay)&&!(c.skip&&c.skip.test(hay)); };
const isImsa=e=>inChamp(champ("imsa"),e);
function guessMin(n){ return /Qualif|Shootout/i.test(n)?25:/Race|8 Hour/i.test(n)?60:/Practice|Test/i.test(n)?50:30; }
/* `e` (end time) is optional: some organisers only publish start times. Those sessions show a start time only and use `m` minutes (or a guess) to know when they are over. */
function sessionsOf(t){ return (t.sessions||[]).map(s=>{ const start=localToDate(s.d,s.s,t.tz), est=!s.e; return {...s,start,est,end:est?new Date(+start+(s.m||guessMin(s.n))*60000):localToDate(s.d,s.e,t.tz)}; }).sort((a,b)=>a.start-b.start); }
/* an event is over after its last session ends (or after its last calendar day when there is no session list) */
function eventDone(t,e){
  const last=eventEnd(e), ss=sessionsOf(t).filter(s=>s.d>=e.d&&s.d<=last);
  return ss.length ? new Date()>new Date(Math.max(...ss.map(s=>+s.end))) : localToday()>last;
}
/* the event weekend a track is "on" right now: its soonest unfinished event of any kind, plus anything that overlaps it (IMSA + IndyCar share a weekend).
   When that weekend ends it moves on to the next one by itself: no series has to be told about it. */
function nextEventAt(t){ return (t.events||[]).filter(e=>!eventDone(t,e)).sort((a,b)=>a.d.localeCompare(b.d))[0]||null; }
function focusAt(t){
  const f=nextEventAt(t); if(!f) return null; const end=eventEnd(f);
  const group=t.events.filter(e=>!eventDone(t,e)&&e.d<=end&&eventEnd(e)>=f.d).sort((a,b)=>a.d.localeCompare(b.d));
  return {first:f, group, d:f.d, end:group.reduce((m,e)=>eventEnd(e)>m?eventEnd(e):m,end)};
}
/* races you are going to (saved on this phone). Close to the date the home tile shows your race instead of the soonest one. */
const GO_KEY=K.going;
function goingList(){ try{ return JSON.parse(localStorage.getItem(GO_KEY)||"[]"); }catch(e){ return []; } }
const goKey=(t,e)=>t.id+"|"+e.d+"|"+e.e;
function isGoing(t,e){ return goingList().includes(goKey(t,e)); }
function setGoing(t,e,on){ let l=goingList().filter(k=>k!==goKey(t,e)); if(on) l.push(goKey(t,e)); try{ localStorage.setItem(GO_KEY,JSON.stringify(l)); }catch(x){} setTimeout(()=>scheduleGoingReminders(on),0); }
/* Starred sessions: tap the star on a session to get an alert 10 minutes before it (works anywhere, not just at the track,
   because you picked that session yourself). The star list is on this phone; alerts are the iPhone app's own notifications. */
const STAR_KEY=K.stars, STAR_ID_BASE=2000;
const starKey=(t,s)=>`${t.id}|${s.d}|${s.s}|${s.n}`;
function starList(){ try{ return JSON.parse(localStorage.getItem(STAR_KEY)||"[]"); }catch(e){ return []; } }
function isStarred(t,s){ return starList().includes(starKey(t,s)); }
function toggleStar(i){
  const s=sessionsResolved()[i]; if(!s) return; const k=starKey(cur,s), on=!starList().includes(k);
  let l=starList().filter(x=>x!==k); if(on) l.push(k); try{ localStorage.setItem(STAR_KEY,JSON.stringify(l.slice(-80))); }catch(e){}
  renderSchedule(); if(hubMode) renderHub();
  toast(on?(nativeNotifier()?"Starred. You'll get an alert 10 minutes before.":"Starred. It shows in your day on the hub."):"Removed from your sessions.");
  scheduleStarAlerts(on);
}
async function scheduleStarAlerts(ask){
  const LN=nativeNotifier(); if(!LN) return;
  const pending=await LN.getPending(), old=pending.notifications.filter(n=>n.id>=STAR_ID_BASE);
  if(old.length) await LN.cancel({notifications:old.map(n=>({id:n.id}))});
  const now=Date.now(), lead=SESSION_ALERT_LEAD_MIN*60000, out=[];
  starList().forEach(k=>{ const [tid,d,st,...nm]=k.split("|"), t=TRACKS.find(x=>x.id===tid), n=nm.join("|"), s=t&&sessionsOf(t).find(x=>x.d===d&&x.s===st&&x.n===n);
    if(s&&s.start.getTime()-lead>now) out.push({t,s}); });
  if(!out.length) return;
  let display=(await LN.checkPermissions()).display; if(display!=="granted"&&ask) display=(await LN.requestPermissions()).display; if(display!=="granted") return;
  out.sort((a,b)=>a.s.start-b.s.start);
  await LN.schedule({notifications:out.slice(0,40).map(({t,s},i)=>({id:STAR_ID_BASE+i,title:shortName(s.n),body:`${t.short} · starts in ${SESSION_ALERT_LEAD_MIN} minutes`,sound:"racecar.caf",schedule:{at:new Date(s.start.getTime()-lead)},extra:{track:t.id}}))});
}
/* Add to calendar: a .ics file with one event per session and a 10-minute alarm, shared with the phone's own Calendar app. */
const icsDate=d=>d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
const icsEsc=x=>String(x).replace(/\\/g,"\\\\").replace(/;/g,"\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
const icsFold=l=>{ let o="",b=l; while(b.length>73){ o+=b.slice(0,73)+"\r\n "; b=b.slice(73); } return o+b; };
function buildIcs(t,list,evName){
  const L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Trackside Pass//EN","CALSCALE:GREGORIAN","METHOD:PUBLISH"], stamp=icsDate(new Date());
  list.forEach(s=>{ L.push("BEGIN:VEVENT",`UID:${starKey(t,s).replace(/[^A-Za-z0-9]/g,"")}@tracksidepass`,`DTSTAMP:${stamp}`,`DTSTART:${icsDate(s.start)}`,`DTEND:${icsDate(s.end)}`,`SUMMARY:${icsEsc(shortName(s.n))}`,`LOCATION:${icsEsc(t.name+", "+t.place)}`,`DESCRIPTION:${icsEsc(evName+". Times shown in your calendar's own time zone.")}`,"BEGIN:VALARM","TRIGGER:-PT10M","ACTION:DISPLAY",`DESCRIPTION:${icsEsc(shortName(s.n)+" starts in 10 minutes")}`,"END:VALARM","END:VEVENT"); });
  L.push("END:VCALENDAR"); return L.map(icsFold).join("\r\n")+"\r\n";
}
async function deliverIcs(name,text){
  try{ const file=new File([text],name,{type:"text/calendar"}); if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:name}); return; } }catch(e){ if(e&&e.name==="AbortError") return; }
  const url=URL.createObjectURL(new Blob([text],{type:"text/calendar"})), a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),4000);
  toast("Calendar file ready. Open it to add the sessions.");
}
function addToCalendar(scope){
  const now=new Date(), all=sessionsResolved().filter(s=>s.end>now), list=scope==="mine"?all.filter(s=>isStarred(cur,s)):all;
  if(!list.length){ toast(scope==="mine"?"Star a session first.":"No upcoming sessions to add."); return; }
  const fo=focusAt(cur), ev=fo?[...new Set(fo.group.map(e=>e.e))].join(" · "):cur.eventName||cur.name;
  deliverIcs(`${cur.id}-${list[0].d}.ics`,buildIcs(cur,list,ev));
}
function hubToggleGoing(){ const fo=focusAt(cur); if(!fo) return; const on=!isGoing(cur,fo.first); setGoing(cur,fo.first,on); renderHub(); renderHero(); toast(on?`You're going: ${cur.short}`:"Removed from your races"); }
function nextGoing(){ const out=[]; TRACKS.forEach(t=>(t.events||[]).forEach(e=>{ if(isGoing(t,e)&&!eventDone(t,e)) out.push({t,e}); })); return out.sort((a,b)=>a.e.d.localeCompare(b.e.d))[0]||null; }
/* race week: a one-time celebration banner, the first time the app is opened during the week of a
   race you've marked "going" -- from 7 days before it starts through its last day. Shown once per
   event (tracked by the same t.id|date|name key "going" already uses), never again after that. */
const RACE_WEEK_KEY=K.raceWeekShown;
function checkRaceWeek(){
  const g=nextGoing(); if(!g) return;
  const startIn=daysBetween(localToday(),g.e.d), endIn=daysBetween(localToday(),eventEnd(g.e));
  if(startIn>7||endIn<0) return;
  const key=goKey(g.t,g.e); let shown=[]; try{ shown=JSON.parse(localStorage.getItem(RACE_WEEK_KEY)||"[]"); }catch(e){}
  if(shown.includes(key)) return;
  /* geo-gated like the hub, and the same reason: only fire once you're actually AT the track, not the
     first time you open the app during race week while still at home. Keeps re-checking (never marks
     itself "shown") until that's actually true, so it still catches you the moment you arrive. */
  if(!navigator.geolocation||!g.t.geo) return;
  const tryGeo=()=>{ navigator.geolocation.getCurrentPosition(pos=>{
    const km=haversine(pos.coords.latitude,pos.coords.longitude,(g.t.geo.n+g.t.geo.s)/2,(g.t.geo.w+g.t.geo.e)/2);
    if(km>HUB_RADIUS_KM) return;
    try{ localStorage.setItem(RACE_WEEK_KEY,JSON.stringify([...shown,key].slice(-10))); }catch(e){}
    showRaceWeek(g.t,g.e);
  }, ()=>{}, {maximumAge:600000,timeout:8000}); };
  if(navigator.permissions&&navigator.permissions.query){
    navigator.permissions.query({name:"geolocation"}).then(p=>{ if(p.state==="granted") tryGeo(); }).catch(()=>{});
  }
}
function raceWeekConfetti(){
  const wrap=document.getElementById("rwConfetti"); if(!wrap) return;
  const colors=["#E2574C","#F2B84B","#26A69A","#4F7F94","#ffffff","#14171A"];
  let html=""; for(let i=0;i<40;i++){
    const left=Math.round(Math.random()*100), delay=(Math.random()*0.5).toFixed(2), dur=(2+Math.random()*1).toFixed(2), color=colors[i%colors.length], rot=Math.round(Math.random()*80-40), size=Math.round(7+Math.random()*7), round=i%3===0?" round":"";
    html+=`<i class="${round.trim()}" style="left:${left}%;width:${size}px;height:${size}px;background:${color};animation-delay:${delay}s;animation-duration:${dur}s;transform:rotate(${rot}deg)"></i>`; }
  wrap.innerHTML=html;
}
function showRaceWeek(t,e){
  document.getElementById("rwText").textContent=`${e.e} at ${t.short} — ${fmtRange(e)}`;
  document.getElementById("raceWeekModal").hidden=false; document.body.style.overflow="hidden"; raceWeekConfetti();
}
function closeRaceWeek(){ document.getElementById("raceWeekModal").hidden=true; document.body.style.overflow=""; }
function nextIn(c,t){ return t.events.filter(e=>inChamp(c,e)&&!eventDone(t,e)).sort((a,b)=>a.d.localeCompare(b.d))[0]; }
function orderOf(c){ return TRACKS.map(t=>({t,e:nextIn(c,t)})).filter(x=>x.e).sort((a,b)=>a.e.d.localeCompare(b.e.d)); }
function stopsOf(c){ return (c.stops||[]).filter(s=>!TRACKS.some(t=>t.id===s.id)&&localToday()<=eventEnd(s)).sort((a,b)=>a.d.localeCompare(b.d)); }   /* venues without a map yet */
const imsaOrder=()=>orderOf(champ("imsa")), imsaCurrent=()=>imsaOrder()[0]||null;   /* IMSA: the race on now, or the next one */
/* the soonest race at each venue across every championship (home hero, passport order, weather, sun times) */
function anyOrder(){ return TRACKS.map(t=>{ const x=CHAMPS.filter(followed).map(c=>({c,e:nextIn(c,t)})).filter(z=>z.e).sort((a,b)=>a.e.d.localeCompare(b.e.d))[0]; return x?{t,e:x.e,c:x.c}:null; }).filter(Boolean).sort((a,b)=>a.e.d.localeCompare(b.e.d)); }
const nextAny=()=>anyOrder()[0]||null;
function nextAt(t){ return CHAMPS.map(c=>nextIn(c,t)).filter(Boolean).sort((a,b)=>a.d.localeCompare(b.d))[0]||null; }
function champsAt(t,e){ const last=eventEnd(e); return CHAMPS.filter(c=>{ if(c.optIn) return false; const n=nextIn(c,t); return n&&n.d<=last&&eventEnd(n)>=e.d; }); }   /* which series race at this venue that weekend -- support series never headline this */

function renderHero(){
  const g=nextGoing(), gnear=!!g&&daysBetween(localToday(),g.e.d)<=goDays(), c=gnear?g:nextAny(), el=document.getElementById("hero"); if(!c){ el.innerHTML=""; return; }
  const {t,e}=c, today=localToday(), on=e.d<=today, n=daysBetween(today,e.d), day=Math.min(e.t||1,daysBetween(e.d,today)+1), who=champsAt(t,e).map(x=>x.name).join(" + ")||e.s;
  el.innerHTML=`<button class="hero" onclick="openTrack('${t.id}','home')">
    <svg class="art" viewBox="${trackBox(t).join(" ")}" aria-hidden="true"><path d="${t.path}" fill="none" stroke="var(--ink)" stroke-width="${(trackBox(t)[2]*0.024).toFixed(1)}" stroke-linejoin="round" stroke-linecap="round"/></svg>
    <span class="kick">${on?"Happening now":(gnear?"You're going":"Next up")} · ${who}</span>
    <div class="num">${on?"Day "+day:n}<small>${on?`of ${e.t||1} day${(e.t||1)>1?"s":""}`:(n===1?"day to go":"days to go")}</small></div>
    <div class="name">${e.e}</div><div class="sub">${t.short} · ${fmtRange(e)}</div></button>`;
}
/* "Your series, next up": a card for each followed series whose next race is within SEASON_CARD_DAYS (or on now): the race,
   a season opener/finale tag, and -- only while the NEXT race is in the same season as the last result -- who won last
   and who leads. Across a season break (IMSA's Petit Le Mans -> next year's Rolex 24) last/leads are last season's news,
   so they are left off. */
const SEASON_CARD_DAYS=30;
function seasonRole(c,pick){
  const yr=pick.e.d.slice(0,4), all=[];
  TRACKS.forEach(t=>t.events.forEach(e=>{ if(inChamp(c,e)) all.push(e.d); })); (c.stops||[]).forEach(st=>all.push(st.d));
  const ds=[...new Set(all)].sort(), i=ds.indexOf(pick.e.d), prev=ds[i-1], next=ds[i+1];   /* only what the app knows: a missing neighbour says nothing either way */
  if(next&&next.slice(0,4)>yr) return "Season finale";
  if(prev&&prev.slice(0,4)<yr) return "Season opener";
  return "";
}
function renderSeason(){
  const el=document.getElementById("season"); if(!el) return; const today=localToday();
  const cards=orderedChamps().filter(followed).map(c=>{
    const o=orderOf(c)[0], st=stopsOf(c)[0], pick=o&&(!st||o.e.d<=st.d)?{t:o.t.short,e:o.e}:st?{t:st.short,e:st}:null; if(!pick) return "";
    const n=daysBetween(today,pick.e.d); if(n>SEASON_CARD_DAYS) return "";
    const when=pick.e.d<=today?"On now":n===1?"Tomorrow":`In ${n} days`, yr=pick.e.d.slice(0,4);
    const last=typeof RESULTS!=="undefined"?RESULTS.filter(r=>r.s===c.guide).sort((a,b)=>b.d.localeCompare(a.d))[0]:null, lastOk=last&&last.d.slice(0,4)===yr;
    const g0=lastOk&&last.groups[0], win0=g0?(g0.order?g0.order[0].replace(/^\d+\.\s*/,""):g0.winner):"", win=win0.includes(" \u2014 ")?win0.split(" \u2014 ").pop():win0;   /* drivers, not the car */
    const std=standingsFor(c.guide), stYr=std&&((std.asOf||"").match(/20\d\d/)||[])[0], lead=std&&(stYr?stYr===yr:lastOk)&&std.classes[0]&&std.classes[0].rows[0];
    const role=seasonRole(c,pick);
    return `<button class="scard" data-s="${c.id}" onclick="openSeries('${c.id}')"><div class="scTop"><b>${esc(c.name)}</b><span>${when}</span></div><div class="scNext">${esc(pick.t)} \u00b7 ${esc(fmtRange(pick.e))}</div>${role?`<div class="scRow"><i>${role==="Season finale"?"Finale":"Opener"}</i>${role==="Season finale"?"Last race of":"First race of"} ${yr}</div>`:""}${win?`<div class="scRow"><i>Last</i>${esc(g0.h)}: ${esc(win)}</div>`:""}${lead?`<div class="scRow"><i>Leads</i>${esc(std.classes[0].h)}: ${esc(lead.who.replace(/\s*\(.*$/,""))}${lead.pts?" \u00b7 "+lead.pts+" pts":""}</div>`:""}</button>`; }).filter(Boolean).slice(0,4);
  const pc=playCardHtml();
  el.innerHTML=cards.length||pc?`${cards.length?`<div class="sect">Your series, next up</div>`:""}<div class="scards">${cards.join("")}${pc}</div>`:"";
}
function renderHome(){ renderHero(); renderSeason(); renderChampList(); if(curChamp) renderSeries(); }
/* the soonest unfinished race date for a series, so the home screen list can read "ordered by next race" just like each series' own track list does */
function champSoonest(c){ const o=orderOf(c)[0], s=stopsOf(c)[0]; return [o&&o.e.d,s&&s.d].filter(Boolean).sort()[0]||"9999-99-99"; }
/* series order: a fan-set arrangement (dragged in Settings) that overrides the "soonest race" default sort
   everywhere the series list appears. Any series never manually arranged (new ones, or on first run) sorts
   in after the arranged ones, soonest-first, so the list always has a sensible order even before you touch it. */
const SERIES_ORDER_KEY=K.seriesOrder;
function seriesOrderIds(){
  let saved; try{ saved=JSON.parse(LSget(SERIES_ORDER_KEY,"null")); }catch(e){ saved=null; }
  const known=new Set((saved||[]).filter(id=>CHAMPS.some(c=>c.id===id)));
  const rest=CHAMPS.map(c=>c.id).filter(id=>!known.has(id)).sort((a,b)=>champSoonest(champ(a)).localeCompare(champSoonest(champ(b))));
  return (saved||[]).filter(id=>known.has(id)).concat(rest);
}
function setSeriesOrderIds(ids){ LSset(SERIES_ORDER_KEY,JSON.stringify(ids)); }
function orderedChamps(){ const byId=Object.fromEntries(CHAMPS.map(c=>[c.id,c])); return seriesOrderIds().map(id=>byId[id]).filter(Boolean); }
function renderChampList(){
  const el=document.getElementById("champList"); if(!el) return;
  const ordered=orderedChamps().filter(followed);
  const row=c=>{ const mk=typeof seriesMark==="function"?seriesMark(c.id,60):"", n=c.showAll?TRACKS.length:orderOf(c).length+stopsOf(c).length, same=!mk&&String(c.tile).toLowerCase()===String(c.name).toLowerCase();
    return `<li><button class="track-row series${same?" same":""}" data-s="${c.id}" onclick="openSeries('${c.id}')"><span class="tile txt${mk?" mk":""}">${mk||c.tile}</span>
      <div><h2>${c.name}</h2><div class="meta"><span class="mfull">${c.full}<span class="msep"> · </span></span>${n} venue${n===1?"":"s"}</div></div>
      <svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></li>`; };
  /* once the series you follow span more than one part of the world, group them under region headings (your own
     order still rules within a region, and the regions follow whichever of your series comes first) */
  const regions=[...new Set(ordered.map(c=>c.region||"na"))];
  el.innerHTML=regions.length<2?ordered.map(row).join(""):regions.map(r=>`<li class="regionHead">${REGIONS[r]||r}</li>`+ordered.filter(c=>(c.region||"na")===r).map(row).join("")).join("");
}
let curChamp=null, serRows=[];
function toggleGoingSeries(i){ const r=serRows[i]; if(!r) return; const on=!isGoing(r.t,r.e); setGoing(r.t,r.e,on); renderSeries(); renderHero(); toast(on?`You're going: ${r.t.short}`:"Removed from your races"); }
function renderSeries(){
  const c=curChamp; if(!c) return; const today=localToday(), order=orderOf(c);
  document.getElementById("serTitle").innerHTML=`${seriesMark(c.id,34)}<span>${esc(c.name)}</span>`;
  document.getElementById("serAbout").innerHTML=c.guide?`<ul class="list"><li><button class="track-row series" onclick="showSeriesInfo('${c.id}')"><span class="tile txt">i</span>
    <div><h2>About ${c.name}</h2><div class="meta">The cars and how to follow the racing</div></div><svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg></button></li></ul>`:"";
  const items=order.map(({t,e})=>({d:e.d,t,e})).concat(stopsOf(c).map(s=>({d:s.d,s}))).sort((a,b)=>a.d.localeCompare(b.d));
  serRows=[];
  let html=items.map((x,i)=>{ const live=x.d<=today, top=i===0?(live?" top live":" top"):"";
    /* a season rolls over between two consecutive races here (e.g. Petit Le Mans into the next Rolex 24): mark it with a thin divider */
    const div=i>0&&x.d.slice(0,4)!==items[i-1].d.slice(0,4)?`<li class="seasonDiv"><span>${x.d.slice(0,4)} season</span></li>`:"";
    if(x.t){ const gi=serRows.push({t:x.t,e:x.e})-1, go=isGoing(x.t,x.e); return div+`<li class="tkli"><button class="tk${go?" on":""}" aria-pressed="${go}" aria-label="${go?"Remove from my races":"I'm going to this race"}" onclick="toggleGoingSeries(${gi})"><svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2.4"/></svg></button><button class="track-row${top}" onclick="openTrack('${x.t.id}','series')"><span class="tile">${miniSvg(x.t)}</span>
      <div><h2>${x.t.short}${isGoing(x.t,x.e)?'<span class="gopill">Going</span>':""}</h2><div class="meta">${x.e.e}</div>${x.e.support&&x.e.support.length?`<div class="meta support"><b>Also racing:</b> ${x.e.support.map(esc).join(" · ")}</div>`:""}</div>
      <div class="next"><span class="lv">${live?"On now":"Next up"}</span><b>${fmtSpan(x.e)}</b>${x.e.d.slice(0,4)}</div></button></li>`; }
    return div+`<li><div class="track-row nomap${top}"><span class="tile"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg></span>
      <div><h2>${x.s.short}</h2><div class="meta">${x.s.e} · ${x.s.kind}</div></div>
      <div class="next"><span class="lv">${live?"On now":"Next up"}</span><b>${fmtSpan(x.s)}</b>Map coming soon</div></div></li>`; }).join("");
  if(c.showAll) html+=TRACKS.filter(t=>!order.some(o=>o.t===t)).map(t=>
    `<li><button class="track-row" onclick="openTrack('${t.id}','series')"><span class="tile">${miniSvg(t)}</span>
      <div><h2>${t.short}</h2><div class="meta">Next ${c.name} race not announced yet</div></div>
      <div class="next">Date<b>TBA</b></div></button></li>`).join("");
  document.getElementById("trackList").innerHTML=html;
  document.getElementById("serNote").textContent=c.note||"";
}
/* screens: home (series + hero), imsa (track list), detail (a track) */
let backTo="series";
function showScreen(id){ document.querySelectorAll(".screen").forEach(s=>s.classList.toggle("on",s.id===id)); window.scrollTo(0,0); syncMapMode(); }
function syncMapMode(){ const d=document.getElementById("detail"), m=document.getElementById("pMap"); document.body.classList.toggle("mapmode",!!(d&&m&&d.classList.contains("on")&&m.classList.contains("on"))); updateWake(); }
function openSeries(id){ curChamp=champ(id)||CHAMPS[0]; renderSeries(); showScreen("series"); }

/* ---------------- DETAIL ---------------- */
/* Each time a track's data is re-issued with edits baked in (its `rev` goes up), forget this device's
   old saved edits so they can't hide the new layout. Saved spots and added stands are kept. */
function dropStaleEdits(){
  if(cur.rev===undefined) return;
  try{ const k=K.rev+cur.id; if(localStorage.getItem(k)===String(cur.rev)) return;
    localStorage.removeItem(K.layout+cur.id); localStorage.removeItem(K.lots+cur.id); localStorage.removeItem(K.added+cur.id); localStorage.setItem(k,String(cur.rev)); }catch(e){}
}
/* A track's base map, walking grid and elevation live in data/maps/<id>.js (about 90% of its data) and are
   fetched when the track is opened; the service worker keeps them on the phone, so this works with no signal. */
const mapLoads={};
function ensureMap(t){
  if(t.mapReady) return Promise.resolve();
  return mapLoads[t.id]||(mapLoads[t.id]=new Promise((ok,no)=>{
    const s=document.createElement("script"); s.src="data/maps/"+t.id+".js";
    s.onload=()=>{ Object.assign(t,TRACK_MAPS[t.id]); delete TRACK_MAPS[t.id]; t.mapReady=true; ok(); };
    s.onerror=()=>{ delete mapLoads[t.id]; s.remove(); no(); };
    document.head.appendChild(s); }));
}
let openSeq=0;
function openTrack(id,from){
  const t=TRACKS.find(x=>x.id===id), seq=++openSeq; if(!t) return Promise.resolve();
  if(t.mapReady){ openTrackNow(id,from); return Promise.resolve(); }
  const slow=setTimeout(()=>toast("Loading map…"),300);
  return ensureMap(t).then(()=>{ clearTimeout(slow); if(seq===openSeq) openTrackNow(id,from); },()=>{ clearTimeout(slow);
    toast(navigator.onLine?"Couldn't load this map. Try again.":"This map isn't saved on your phone yet. Connect once to download it."); });
}
function openTrackNow(id,from){
  cur = TRACKS.find(t=>t.id===id); userPos=null; stopGps(); dropStaleEdits(); syncPois(); backTo=(from==="imsa"?"series":from)||"series";
  document.querySelectorAll(".dn").forEach(el=>el.textContent=cur.short);
  view=null; limits=null; fitted=null; cancelAnim(); schedDay=null; fieldCache=null; parking=false; setMode(null); heading=0; devHeading=null; routePts=null; const _hold=document.getElementById("mapHolder"); if(_hold) _hold.style.transform=""; closeSheet(); setParkingUI(); applyDev(); renderNow(); renderSchedule(); if(editing) toggleEdit(); routeDest=null; renderMap(); renderSpot(); document.getElementById("nearBar").hidden=false; applyView(); renderLegend(); renderFood(); renderEvents(); renderInfo();
  showScreen("detail");
  document.getElementById("mapTabBtn").click();
  window.scrollTo(0,0);
  wx=null; wxToast=null; renderWx(); loadWeather();
  limits=null; view=fitted=fitView(); applyView(); { const w=document.getElementById("mapWrap"); lastSize=w.clientWidth+"x"+w.clientHeight; }
  hubDismissed=false; hubReturn=false; hubMode=false; document.getElementById("pMap").classList.remove("hub-mode"); enterHub(); checkRaceWeek();
  /* resume live GPS automatically if it's already been allowed before, same consent-respecting check the
     hub and race-week banner use -- never asks cold, only picks back up for someone who already said yes.
     A web page can't keep watchPosition running once the OS fully closes the tab/PWA (no background
     location API on the web, unlike a native app), so this can't make it survive that -- but it removes
     the need to re-tap Locate Me every time you come back to a track during the same visit. */
  if(navigator.permissions&&navigator.permissions.query){
    navigator.permissions.query({name:"geolocation"}).then(p=>{ if(p.state==="granted") startGps(true); }).catch(()=>{});
  }
}
function goHome(){
  /* The hub is the root of a track: Map/Events/Info step back to it, and only the hub's own back arrow
     leaves for the track list. (Swiping back does the same.) */
  const sc=document.querySelector(".screen.on"), pn=sc&&sc.id==="detail"&&sc.querySelector(".panel.on");
  if(pn&&!(hubMode&&pn.id==="pMap")){ if(pn.id==="pMap") backToHub(); else document.getElementById("hubTabBtn").click(); return; }
  renderHome(); stopGps(); showScreen(backTo);
}
function tab(btn){
  document.querySelectorAll(".tabs button").forEach(b=>b.classList.toggle("on",b===btn));
  document.querySelectorAll(".panel").forEach(p=>p.classList.toggle("on",p.id===btn.dataset.p));
  window.scrollTo(0,0); syncMapMode();
}
/* Hub and Map share one panel (pMap) but are two tabs: Hub forces the hub view on (even outside its
   usual geo/date window -- it just shows whatever's accurate, same as the old dev-only preview button),
   Map forces it off, so the two tabs behave like a normal mutually-exclusive pair. */
function tabHub(btn){ tab(btn); hubDismissed=false; enterHub(); }
function tabMap(btn){ tab(btn); if(hubMode) leaveHub(); }

/* map */
const TIER = {gate:1,stand:1,med:1,cross:1,screen:1,view:1,food:2,rest:2,merch:2,info:2,park:3,camp:3};
const ICON = {
  food:'<path d="M-8,-1 h16 M-7,-1 a7,7 0 0 1 14,0 M-9,3 h18 M-6,3 v3 h12 v-3" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  stand:'<path d="M-6,4 L-6,-2 L0,-6 L6,-2 L6,4 Z M-3,4 v-4 M3,4 v-4" stroke="#fff" stroke-width="1.8" fill="none"/>',
  gate:'<path d="M-5,5 v-9 h10 v9 M0,5 v-9" stroke="#fff" stroke-width="2" fill="none"/>',
  park:'<text y="4.5" text-anchor="middle" font-size="12" fill="#fff">P</text>',
  rest:'<g fill="#fff"><circle cx="-4" cy="-6" r="1.7"/><path d="M-5.6,-3.6 h3.2 v5 h-0.9 v5.2 h-1.4 v-5.2 h-0.9 z"/><circle cx="4" cy="-6" r="1.7"/><path d="M2.6,-3.6 h2.8 l1.7,5.4 h-1.4 l0.2,4.8 h-3.8 l0.2,-4.8 h-1.4 z"/><path d="M0,-6 v12" stroke="#fff" stroke-width=".7" opacity=".7"/></g>',
  camp:'<path d="M-6,5 L0,-6 L6,5 Z" stroke="#fff" stroke-width="2" fill="none"/>',
  med:'<path d="M0,-5 v10 M-5,0 h10" stroke="#fff" stroke-width="2.5"/>',
  merch:'<path d="M-3,-6 L-8,-3.4 L-6.4,0 L-4,-1 V6 H4 V-1 L6.4,0 L8,-3.4 L3,-6 Q0,-3.6 -3,-6 Z" stroke="#fff" stroke-width="1.7" fill="none" stroke-linejoin="round"/>',
  info:'<text y="4.5" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">i</text>',
  screen:'<rect x="-6.5" y="-5.5" width="13" height="9.5" rx="1.6" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M-3.5,6.8 h7 M0,4 v2.8" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  cross:'<path d="M-7,4 h14 M-5,4 v-5 M5,4 v-5 M-5,-1 a5,5 0 0 1 10,0" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  tunnel:'<path d="M-8,5 h16 M-6,5 v-4 a6,6 0 0 1 12,0 v4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M0,5 v-3" stroke="#fff" stroke-width="1.6" stroke-dasharray="1.5 1.5"/>',
  view:'<path d="M-7.5,0 C-4.5,-5.5 4.5,-5.5 7.5,0 C4.5,5.5 -4.5,5.5 -7.5,0 Z" fill="none" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/><circle r="2.3" fill="#fff"/>'
};
const SHOWER_ICON='<path d="M-4.5,-1 a4.5,4.5 0 0 1 9,0 z" fill="#fff"/><path d="M-3,2 v2.2 M0,2 v3 M3,2 v2.2" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>';
function poiEl(p,i){
  if(p.del) return "";
  const c = (p.k==='park'&&p.c)?p.c:KINDS[p.k].c;
  /* a restroom with showers is one elongated badge showing both icons */
  const pill = p.k==='rest'&&hasShower(p);
  const body = pill
    ? `<circle r="17" fill="transparent"/><rect class="pillbg" x="-17" y="-9" width="34" height="18" rx="9" fill="${c}" stroke="#fff" stroke-width="1.8"/><g transform="translate(-8,0) scale(.62)">${ICON.rest}</g><g transform="translate(8.5,0) scale(.95)">${SHOWER_ICON}</g>`
    : `<circle r="17" fill="transparent"/>${document.documentElement.getAttribute("data-style")==="race"?`<rect class="sqbg" x="-9.5" y="-9.5" width="19" height="19" rx="5.5" fill="${c}" stroke="#fff" stroke-width="1.8"/>`:`<circle r="9" fill="${c}" stroke="#fff" stroke-width="1.8"/>`}<g transform="scale(.7)">${p.k==='cross'&&/tunnel/i.test(p.n)?ICON.tunnel:ICON[p.k]}</g>`;
  return `<g class="poi" data-k="${p.k}" data-i="${i}" data-tier="${TIER[p.k]||3}" data-x="${p.x}" data-y="${p.y}" data-sh="${pill?1:0}" transform="translate(${p.x},${p.y})" style="display:${poiShown(p)?'':'none'}">
    <g class="sc">${body}
    <text class="plabel" y="20" text-anchor="middle" font-size="10" font-weight="500" fill="var(--ink)" stroke="var(--paper)" stroke-width="2.5" paint-order="stroke">${p.n}</text><circle class="halo" r="14" fill="none" stroke="var(--accent)" stroke-width="3"/><g class="cnt" transform="translate(11,-11)"><circle r="6.2" fill="var(--ink)" stroke="#fff" stroke-width="1.3"/><text y="3" text-anchor="middle" font-size="8.2" font-weight="700" fill="#fff"></text></g></g></g>`;
}
/* a restroom has showers if it says so (p.shower), else if its whole track does (track.showers) */
/* a restroom with showers stays visible when the Showers layer is on, even if Restrooms is off */
function poiShown(p){ return p.k==='park'?parking:(layers.has(p.k)||(p.k==='rest'&&layers.has('shower')&&hasShower(p))); }
function hasShower(p){ return p.shower!==undefined?!!p.shower:!!cur.showers; }
function showersAvailable(){ const ov=layoutOverrides(); return cur.pois.some(p=>{ const q=applyOv(p,ov[pid(p)]); return q.k==="rest"&&!q.del&&hasShower(q); }); }
function syncShowerRow(){ document.getElementById("peShowerRow").hidden=document.getElementById("peKind").value!=="rest"; }
/* shower badge on restrooms with showers; only visible while the Showers layer is on (see css .show-shwr) */
function userStands(){ try{ return JSON.parse(localStorage.getItem(K.stands+cur.id)||"[]"); }catch(e){ return []; } }
function baseSvg(t){
  if(!t.base) return "";
  const b=t.base; let s="";
  s+=b.polys.map(p=>`<path class="b-${p.k}" d="${p.d}"/>`).join("");
  const edge=["primary","residential","service","bridge","track"];
  s+=b.lines.filter(l=>edge.includes(l.k)).map(l=>`<path class="l-${l.k}-e" d="${l.d}"/>`).join("");
  s+=b.lines.map(l=>`<path class="l-${l.k}" d="${l.d}"/>`).join("");
  s+=b.labels.map(([x,y,n,a])=>`<text class="rl" transform="translate(${x},${y}) rotate(${a})" text-anchor="middle" dy="-4">${n}</text>`).join("");
  return s;
}
function renderMap(){ limits=null; document.getElementById("mapWrap").classList.toggle("show-shwr",layers.has("shower"));
  const t = cur, us = userStands();
  const ov=layoutOverrides();
  const all = t.pois.map(p=>applyOv(p,ov[pid(p)])).concat(us.map(s=>({k:"food",n:s.n,x:s.x,y:s.y})));
  document.getElementById("mapHolder").innerHTML = `
  <svg viewBox="${t.vb.join(" ")}" id="mapSvg"${t.lw?` style="--lw:${t.lw}"`:""} role="img" aria-label="Venue map of ${t.short}">
    <defs><pattern id="grass" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="var(--grass)"/><circle cx="6" cy="6" r="1" fill="var(--grass-2)" opacity=".35"/><circle cx="19" cy="17" r="1" fill="var(--grass-2)" opacity=".35"/></pattern></defs>
    <rect x="${t.vb[0]}" y="${t.vb[1]}" width="${t.vb[2]}" height="${t.vb[3]}" fill="url(#grass)"/>
    ${baseSvg(t)}
    ${t.pit?`<path d="${t.pit}" fill="none" stroke="var(--track-edge)" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round" opacity=".85"/><path d="${t.pit}" fill="none" stroke="var(--pit)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`:""}
    <path d="${t.path}" fill="none" stroke="var(--track-edge)" stroke-width="${(t.tw||7)+2}" stroke-linejoin="round"/>
    <path id="trackPath" d="${t.path}" fill="none" stroke="var(--track)" stroke-width="${t.tw||7}" stroke-linejoin="round"/>
    ${t.sfArrow?`<g class="sfa" transform="translate(${t.sfArrow[0]},${t.sfArrow[1]}) rotate(${t.sfArrow[2]})"><g class="sc noturn"><path d="M-9,0 H6 M1,-5 L6,0 L1,5" fill="none" stroke="#16181B" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/><path d="M-9,0 H6 M1,-5 L6,0 L1,5" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g></g>`:""}
    <g class="sf" transform="translate(${t.sf[0]},${t.sf[1]}) rotate(${t.sfArrow?t.sfArrow[2]:0})"><rect x="-2.4" y="-5.5" width="4.8" height="11" fill="#fff"/><rect x="-2.4" y="-5.5" width="2.4" height="2.75" fill="#16181B"/><rect x="0" y="-2.75" width="2.4" height="2.75" fill="#16181B"/><rect x="-2.4" y="0" width="2.4" height="2.75" fill="#16181B"/><rect x="0" y="2.75" width="2.4" height="2.75" fill="#16181B"/></g>
    ${(t.labels||[]).map(([x,y,l,s])=>`<g class="cl${s==="lm"?" lm":""}" transform="translate(${x},${y})"><g class="sc"><text text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)" stroke="var(--paper)" stroke-width="3" paint-order="stroke">${l}</text></g></g>`).join("")}
    <g id="lotLayer" style="display:${parking?'':'none'}">${lotLayerSvg(t)}</g>
    <g id="routeLayer"></g>
    <g id="spotLayer"></g>
    ${all.map(poiEl).join("")}
    <g id="you" style="display:none"><g class="sc"><circle class="you" r="12" fill="var(--gate)"/><circle r="7" fill="var(--gate)" stroke="#fff" stroke-width="2.5"/><text y="-14" text-anchor="middle" font-size="11" font-weight="600" fill="var(--ink)" stroke="var(--paper)" stroke-width="3" paint-order="stroke">You</text></g></g>
  </svg>`;
  if(mode) refreshMode(false);
}
/* the "Show on map" sheet: grouped, and only the kinds this track actually has badges for (a kind you are editing
   in, or one that is currently on, always stays so it can be switched off) */
const LAYER_GROUPS=[["Getting around",["gate","cross","info"]],["Watching",["stand","screen","view"]],["Facilities",["food","rest","shower","med","merch"]],["Staying",["camp"]]];
function renderLegend(){
  const have=new Set((cur.pois||[]).filter(p=>!p.del).map(p=>p.k)); if(showersAvailable()) have.add("shower");
  const chip=k=>`<button class="chip ${layers.has(k)?'on':''}" style="--c:${KINDS[k].c}" onclick="toggleLayer('${k}',this)"><i></i>${KINDS[k].label}</button>`;
  document.getElementById("layerList").innerHTML=LAYER_GROUPS.map(([h,ks])=>{ const on=ks.filter(k=>have.has(k)); return on.length?`<h4 class="lgrp">${h}</h4><div class="layers">${on.map(chip).join("")}</div>`:""; }).join("");
}
function toggleLayer(k,btn){
  layers.has(k)?layers.delete(k):layers.add(k); btn.classList.toggle("on");
  document.getElementById("mapWrap").classList.toggle("show-shwr",layers.has("shower"));
  if(k==="shower"||k==="rest") document.querySelectorAll('.poi[data-k="rest"]').forEach(el=>el.style.display=(layers.has("rest")||(layers.has("shower")&&el.dataset.sh==="1"))?"":"none");
  document.querySelectorAll(`.poi[data-k="${k}"]`).forEach(el=>el.style.display=layers.has(k)?"":"none"); applyView();
}

/* GPS */
function geoToXY(lat,lng){ const g=cur.geo,v=cur.vb; return {x:v[0]+(lng-g.w)/(g.e-g.w)*v[2], y:v[1]+(g.n-lat)/(g.n-g.s)*v[3]}; }
function xyToGeo(x,y){ const g=cur.geo,v=cur.vb; return {lat:g.n-(y-v[1])/v[3]*(g.n-g.s), lng:g.w+(x-v[0])/v[2]*(g.e-g.w)}; }
function inMap(x,y){ const v=cur.vb; return x>=v[0]&&x<=v[0]+v[2]&&y>=v[1]&&y<=v[1]+v[3]; }
function placeYou(x,y,label){
  const you = document.getElementById("you");
  const inside = inMap(x,y);
  you.style.display = inside?"":"none";
  if(inside) you.setAttribute("transform",`translate(${x},${y})`);
  const near = nearestPoiTo(x,y);
  document.getElementById("gpsTitle").textContent = inside ? (label||"You're on site") : "You're not at the track";
  document.getElementById("gpsText").textContent = inside && near ? `Closest: ${near.n} (${near.k==='food'?'food':KINDS[near.k].label.toLowerCase()}), about ${distLabel(near.m)} away` : (inside?"":"Come back when you arrive.");
}
function nearestPoiTo(x,y){
  const ov=layoutOverrides(); let best=null; cur.pois.map(p=>applyOv(p,ov[pid(p)])).forEach(p=>{ if(p.del||!layers.has(p.k)) return; const d=Math.hypot(p.x-x,p.y-y); if(!best||d<best.d) best={...p,d}; });
  if(!best) return null; const mPerUnit = (cur.geo.n-cur.geo.s)*111000/cur.vb[3]; return {...best, m:Math.round(best.d*mPerUnit/10)*10};
}
function startGps(quiet){   /* quiet: keep the current sheet open (used by the Restrooms / Camping sheets) */
  if(watchId!==null){ stopGps(); return; }
  if(!navigator.geolocation){ document.getElementById("gpsText").textContent="This browser has no location support."; return; }
  document.getElementById("gpsBtn").classList.add("on"); document.getElementById("gpsText").textContent="Finding you…"; if(!quiet) showSheet("shGps");
  watchId = navigator.geolocation.watchPosition(pos=>{
    const {latitude:lat,longitude:lng,accuracy}=pos.coords; const {x,y}=geoToXY(lat,lng);
    const km = haversine(lat,lng,(cur.geo.n+cur.geo.s)/2,(cur.geo.w+cur.geo.e)/2);
    placeYou(x,y,`You're on site (±${accLabel(accuracy)})`);
    if(!inMap(x,y)) document.getElementById("gpsText").textContent=`You're about ${distKmLabel(km)} from ${cur.short}.`;
  }, err=>{
    const t=document.getElementById("gpsText");
    /* Only "blocked" ends GPS. A slow or missing fix (indoors, under cover, first seconds after opening) just keeps
       looking -- the watch stays on -- and says so in the Locate sheet instead of popping a toast over the map. A
       manual tap on Locate (not quiet) still stops and says so, as before. */
    if(err.code===1){ t.textContent="Location is off. Allow it in your phone's settings for this app."; if(quiet) toast(t.textContent); stopGps(); if(mode) refreshMode(false); return; }
    if(quiet){ t.textContent="Still looking for your location…"; return; }
    t.textContent="Couldn't get a fix. Try again outdoors."; stopGps(); if(mode) refreshMode(false); }, {enableHighAccuracy:true,maximumAge:5000,timeout:15000});
}
function stopGps(){ if(watchId!==null){ navigator.geolocation.clearWatch(watchId); watchId=null; } const b=document.getElementById("gpsBtn"); if(b) b.classList.remove("on"); }
function haversine(a1,o1,a2,o2){ const R=6371,r=Math.PI/180,dA=(a2-a1)*r,dO=(o2-o1)*r,h=Math.sin(dA/2)**2+Math.cos(a1*r)*Math.cos(a2*r)*Math.sin(dO/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }

/* food */
function renderFood(){
  const ov = layoutOverrides(), built = cur.pois.map(p=>applyOv(p,ov[pid(p)])).filter(p=>p.k==="food"&&!p.del), us = userStands();
  const rows = built.map(p=>`<div class="item" style="--c:var(--food)"><span class="dot"></span><div><h4>${p.n}</h4><p>${p.d}</p><span class="tag">${p.h||""}</span></div><div class="side">${p.p||""}</div></div>`)
    .concat(us.map((s,i)=>`<div class="item user" style="--c:var(--food)"><span class="dot"></span><div><h4>${esc(s.n)}</h4><p>${esc(s.w)}</p><span class="tag">Added by you · ${esc(s.where)}</span></div><div class="side">${s.p}<br><button class="btn quiet" style="font-size:14px;padding:4px 8px;margin-top:6px" onclick="removeStand(${i})">Remove</button></div></div>`));
  document.getElementById("foodList").innerHTML = rows.join("") || `<div class="empty">No stands listed yet. Add the first one below.</div>`;
}
function esc(s){ return String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function addStand(){
  const n=document.getElementById("fName").value.trim(), w=document.getElementById("fWhat").value.trim(), where=document.getElementById("fWhere").value.trim(), p=document.getElementById("fPrice").value;
  if(!n){ toast("Give the stand a name first."); return; }
  const pos = userPos && userPos.inside ? userPos : {x:cur.sf[0]+Math.round(Math.random()*80-40), y:cur.sf[1]+Math.round(Math.random()*80-40)};
  const list = userStands(); list.push({n,w,where:where||"Location not set",p,x:pos.x,y:pos.y});
  try{ localStorage.setItem(K.stands+cur.id, JSON.stringify(list)); }catch(e){}
  ["fName","fWhat","fWhere"].forEach(id=>document.getElementById(id).value="");
  renderFood(); renderMap(); renderSpot(); toast("Stand added. Others at the track would see it too.");
}
function removeStand(i){ const list=userStands(); list.splice(i,1); try{ localStorage.setItem(K.stands+cur.id, JSON.stringify(list)); }catch(e){} renderFood(); renderMap(); }
function toast(msg){ const t=document.getElementById("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2200); }

/* events */
/* cars and drivers to watch for the weekend a track is on (data/watch.js, refreshed after the last race before each event) */
/* one entry per series for the weekend on now. An entry with a later "from" (a mid-weekend update, e.g. after qualifying) replaces the earlier one once that day arrives. */
function watchNow(){
  const fo=focusAt(cur); if(!fo||typeof WATCH==="undefined"||daysBetween(localToday(),fo.d)>goDays()) return [];   /* shown from two weeks before the weekend until it is over */
  const today=localToday(), best={};
  WATCH.forEach(x=>{ if(x.t!==cur.id||x.d<fo.d||x.d>fo.end||(x.from&&x.from>today)) return; const k=x.s||x.groups[0].h; if(!best[k]||(x.from||x.d)>=(best[k].from||best[k].d)) best[k]=x; });
  return Object.values(best);
}
function watchSeriesName(x){ const sr=SERIES.find(r=>r.id===x.s); return sr?sr.name:""; }
/* one result class, as the finishing order (as many places as the source gave, or a cap for the compact hub
   card) when there is one, else the older winner/gap/podium shape. Shared by the Info tab and the hub so
   the two never drift out of sync. */
function resultGroupHtml(g,cap){
  if(g.order&&g.order.length){ const list=cap?g.order.slice(0,cap):g.order;
    return `<div class="wgroup"><h4>${esc(g.h)}</h4>${list.map(line=>`<div class="witem sub"><span>${esc(line)}</span></div>`).join("")}</div>`; }
  return `<div class="wgroup"><h4>${esc(g.h)}</h4><div class="witem"><b>${esc(g.winner)}</b>${g.gap?`<span>${esc(g.gap)}</span>`:""}</div>${(g.podium||[]).map(p=>`<div class="witem sub"><span>${esc(p)}</span></div>`).join("")}</div>`;
}
/* championship standings (data/standings.js), one entry per series. Card in the Race Day hub follows the
   same series as What to watch and shows only the leader of each class; the sheet shows every row. */
function standingsFor(sid){ return typeof STANDINGS!=="undefined"?STANDINGS.find(s=>s.s===sid):null; }
function standingsRowHtml(r){ return `<div class="witem"><b>${r.pos}. ${esc(r.who)}</b>${r.pts?`<span>${r.pts} pts</span>`:(r.gap?`<span>${esc(r.gap)}</span>`:"")}</div>`; }
function openStandings(sid){
  const std=standingsFor(sid); if(!std) return;
  document.getElementById("stName").textContent=watchSeriesName({s:sid})+" standings";
  document.getElementById("stAsOf").textContent=std.asOf;
  document.getElementById("stBody").innerHTML=std.classes.map(c=>`<div class="wgroup"><h4>${esc(c.h)}</h4>${c.rows.map(standingsRowHtml).join("")}</div>`).join("")+(std.note?`<p class="wnote">${esc(std.note)}</p>`:"");
  showSheet("shStandings");
}
/* YouTube's "always whatever's live on this channel" embed -- loaded only on tap, into the sheet (not the
   hub body, which gets rebuilt every 30s) so it isn't restarted mid-stream. Stopped on close (see closeSheet). */
/* "Live timing" card: a link-out to the sanctioning body's own timing page (data/series.js `timing`), not an
   embed -- those sites run their own scripts and most refuse to load inside an iframe anyway. In a plain
   browser/installed PWA that means the phone's own browser, same as any other outbound link. Inside the
   Capacitor iOS shell, @capacitor/browser is present and this instead opens a real in-app Safari sheet
   (SFSafariViewController) -- a proper rise-up "Done"-button overlay, not a tab switch -- which is the one
   thing the plain web app can never do on its own. window.Capacitor only exists inside that native shell, so
   this same code runs unchanged for every other visitor and just takes the window.open path. */
function openLiveTiming(url){
  const cap=window.Capacitor;
  if(cap&&cap.isNativePlatform&&cap.isNativePlatform()&&cap.Plugins&&cap.Plugins.Browser){ cap.Plugins.Browser.open({url}); return; }
  window.open(url,"_blank");
}
/* rain radar: actual precipitation right now (RainViewer), not a forecast -- catches a storm the model-based
   rainOutlook() above hasn't recognized yet. Leaflet (map library) and its tiles are loaded only when this
   is opened, never on every page load, and the map is torn down on close (see closeSheet) so it never sits
   around using data in the background; reopening builds it fresh, centered on whichever track is current. */
let radarMap=null, radarLeafletLoading=null;
function loadLeaflet(){
  if(window.L) return Promise.resolve();
  if(radarLeafletLoading) return radarLeafletLoading;
  radarLeafletLoading=new Promise((resolve,reject)=>{
    const css=document.createElement("link"); css.rel="stylesheet"; css.href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(css);
    const s=document.createElement("script"); s.src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js";
    s.onload=()=>resolve(); s.onerror=()=>reject(new Error("load failed"));
    document.head.appendChild(s);
  });
  return radarLeafletLoading;
}
function closeRadar(){ if(radarMap){ radarMap.remove(); radarMap=null; } }
async function openRadar(){
  showSheet("shRadar");
  const asOf=document.getElementById("radarAsOf"); asOf.textContent="Loading radar…";
  try{
    await loadLeaflet();
    if(sheetState!=="shRadar") return;   /* closed again while the library was loading */
    const r=await fetch("https://api.rainviewer.com/public/weather-maps.json",{cache:"no-store"});
    if(!r.ok) throw new Error("radar "+r.status);
    const j=await r.json(), frames=(j.radar&&j.radar.past)||[];
    if(!frames.length) throw new Error("no frames");
    if(sheetState!=="shRadar") return;
    const latest=frames[frames.length-1];
    const lat=(cur.geo.n+cur.geo.s)/2, lon=(cur.geo.w+cur.geo.e)/2;
    closeRadar();
    radarMap=L.map("radarMap",{zoomControl:true,scrollWheelZoom:false,attributionControl:false}).setView([lat,lon],8);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{subdomains:"abc",maxZoom:12}).addTo(radarMap);
    L.tileLayer(`${j.host}${latest.path}/256/{z}/{x}/{y}/2/1_1.png`,{maxNativeZoom:7,maxZoom:12,opacity:0.75}).addTo(radarMap);
    L.circleMarker([lat,lon],{radius:7,color:"#E39B7B",weight:2,fillColor:"#E39B7B",fillOpacity:0.9}).addTo(radarMap);
    const ago=Math.max(0,Math.round((Date.now()/1000-latest.time)/60));
    asOf.textContent=`Radar from ${ago<1?"just now":ago+" min ago"}.`;
  }catch(e){ if(sheetState==="shRadar") asOf.textContent="Couldn't load the radar right now -- check your connection and try again."; }
}
/* the series you've starred in the Race Day hub, when more than one shares a weekend -- global, not per track */
function favSeries(){ try{ return localStorage.getItem(K.favSeries)||null; }catch(e){ return null; } }
function toggleFavSeries(id){ try{ localStorage.setItem(K.favSeries,favSeries()===id?"":id); }catch(e){} renderHub(); }
function renderWatch(){
  const sec=document.getElementById("watchSection"); if(!sec) return; const fo=focusAt(cur), title=document.getElementById("watchTitle");
  const w=watchNow();
  if(w.length){
    sec.hidden=false; if(title) title.textContent="Cars and drivers to watch";
    document.getElementById("watchList").innerHTML=w.map(x=>(w.length>1?`<h4 class="wseries">${esc(watchSeriesName(x))}</h4>`:"")+`<p class="asof">${esc(x.asOf)}</p>`+x.groups.map(g=>`<div class="wgroup"><h4>${esc(g.h)}</h4>${g.items.map(([n,t])=>`<div class="witem"><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join("")}</div>`).join("")+(x.note?`<p class="wnote">${esc(x.note)}</p>`:"")).join("");
    return;
  }
  /* no upcoming preview due -- show how the last race here actually finished, once results are in */
  const lastDone=(cur.events||[]).filter(e=>eventDone(cur,e)).sort((a,b)=>b.d.localeCompare(a.d))[0];
  const results=lastDone&&typeof RESULTS!=="undefined"?RESULTS.filter(x=>x.t===cur.id&&x.d===lastDone.d):[];
  if(!results.length){ sec.hidden=true; return; }
  sec.hidden=false; if(title) title.textContent=results.length>1?`How ${lastDone.e} finished`:`How ${results[0].event} finished`;
  document.getElementById("watchList").innerHTML=results.map(res=>(results.length>1?`<h4 class="wseries">${esc(res.event)}</h4>`:"")+res.groups.map(g=>resultGroupHtml(g)).join("")
    +(res.note?`<p class="wnote">${esc(res.note)}</p>`:"")).join("");
}
let evRows=[];
function renderEvents(){
  const today=localToday(), all=[...cur.events];
  const up=all.filter(e=>!eventDone(cur,e)).sort((a,b)=>a.d.localeCompare(b.d)), done=all.filter(e=>eventDone(cur,e)).sort((a,b)=>b.d.localeCompare(a.d));
  evRows=up;
  const first=up[0], firstEnd=first&&eventEnd(first);
  const row=(e,tag,isDone,idx)=>{ const d=new Date(e.d+"T12:00:00"), go=!isDone&&isGoing(cur,e), live=tag==="Happening now";
    return `<div class="item ev${tag?" nextup":""}${live?" live":""}${go?" going":""}" style="opacity:${isDone?.45:1}"><div class="date">${d.toLocaleDateString(undefined,{month:"short"})}<b>${d.getDate()}</b>${d.getFullYear()}</div>
      <div><h4>${esc(e.e)}</h4><p class="series">${esc(String(e.s).replace(/[,;]?\s*[—-]?\s*\d+-day weekend/i,""))}${e.t>1?` — ${e.t}-day weekend`:""}${isDone?" — done":""}</p>
      ${tag||go?`<p class="tags">${tag?`<span class="tag">${tag}</span>`:""}${go?`<span class="tag go">You're going</span>`:""}</p>`:""}</div>
      ${isDone?"":`<button class="gobtn${go?" on":""}" aria-pressed="${go}" aria-label="${go?"Remove from my races":"I'm going to this race"}" onclick="toggleGoingRow(${idx})"><svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/><path d="M14 6v12" stroke-dasharray="2 2.4"/></svg></button>`}</div>`; };
  document.getElementById("eventList").innerHTML = up.map((e,i)=>row(e, first&&e.d<=firstEnd&&eventEnd(e)>=first.d?(first.d<=today?"Happening now":"Next up"):"", false, i)).join("")
    + (done.length?`<h4 class="past-h">Finished</h4>`+done.map(e=>row(e,"",true,-1)).join(""):"");
}
function toggleGoingRow(i){ const e=evRows[i]; if(!e) return; const on=!isGoing(cur,e); setGoing(cur,e,on); renderEvents(); renderHero(); toast(on?"You're going to this one":"Removed from your races"); }

/* info */
/* every track's Info tab always shows the same six rows, in the same order, so venues compare cleanly.
   Signature section still comes from facts (several older spellings are accepted); Best views is built from
   any "view"-kind badges on the map (add one with the badge tool and it shows up here on its own); Lap record
   is its own field on the track (cur.lapRecord), because it is specific to the exact layout that file draws —
   a venue with more than one layout (an oval vs. its road course) gets a separate track id with its own record. */
function bestViewPois(){ const ov=layoutOverrides(); return cur.pois.map(p=>applyOv(p,ov[pid(p)])).filter(p=>p.k==="view"&&!p.del); }
/* lapRecord can also be a list, one per major series ({series, time, who, car, year, note}), for a venue
   several championships share -- each one's record stands on its own, they aren't comparable. The list shows
   only series, time and driver (year/car/note stay in the data as the source record). */
function lapRecordHtml(){
  const r = cur.lapRecord; if(!r) return `<dd class="tbd">Not added yet</dd>`;
  if(typeof r === "string") return `<dd>${esc(r)}</dd>`;
  if(Array.isArray(r)) return `<dd class="lrs">${r.map(x=>`<div class="lr"><span class="lr-s">${esc(x.series)}</span>${esc(x.time)}<span class="lr-who">${esc(x.who||"")}</span></div>`).join("")}</dd>`;
  return `<dd>${esc(r.time)}<span class="lr-who">${esc([r.who,r.car,r.year].filter(Boolean).join(" · "))}${r.note?` — ${esc(r.note)}`:""}</span></dd>`;
}
function renderInfo(){
  document.getElementById("iBlurb").textContent = cur.blurb;
  const facts = cur.facts || {};
  const sig = facts["Signature section"] || facts["Signature sections"] || facts["Signature"];
  const views = bestViewPois();
  const rows = [
    ["Location", cur.place],
    ["Opened", cur.opened],
    ["Turns", cur.nturns],
    ["Signature section", sig]
  ];
  document.getElementById("iVenue").innerHTML = rows.map(([k,v])=>`<dt>${k}</dt>${v?`<dd>${esc(String(v))}</dd>`:`<dd class="tbd">Not added yet</dd>`}`).join("")
    + `<dt>Best views</dt>${views.length?`<dd>${views.map(p=>esc(p.n)).join("<br>")}<span class="lr-who">Marked on the map with an eye icon</span></dd>`:`<dd class="tbd">Not added yet</dd>`}`
    + `<dt>Lap record${Array.isArray(cur.lapRecord)?"s":""}</dt>${lapRecordHtml()}`;
  const skip = new Set(["Signature section","Signature sections","Signature","Length"]);
  const rest = Object.entries(facts).filter(([k])=>!skip.has(k));
  document.getElementById("iFacts").innerHTML = rest.map(([k,v])=>`<dt>${k}</dt><dd>${v}</dd>`).join("");
  document.querySelector(".moreSect").classList.toggle("hideSect", rest.length===0);
}

/* track GPS position for stand placement */
const _place = placeYou; placeYou = function(x,y,l){ userPos={x:Math.round(x),y:Math.round(y),inside:inMap(x,y)}; fieldCache=null; _place(x,y,l); if(mode&&Date.now()-modeAt>1000){ modeAt=Date.now(); refreshMode(false); } if(routeDest!==null){ const sel=document.getElementById("dirFrom"); if(userPos.inside&&![...sel.options].some(o=>o.value==="you")){ sel.insertAdjacentHTML("afterbegin",`<option value="you">Your location</option>`); sel.value="you"; } if(sel.value==="you") computeRoute(); } };


/* walking directions */
let routeDest=null, routePath=null, routePts=null;
/* The baked walking grid blocks the whole circuit strip. Every time the bridges/tunnels change (moved, added or deleted in edit mode)
   the strip is re-closed and an opening is cut at each crossing badge, so directions always use the crossings as they are drawn. */
let walkCache=null;
function crossPoints(){ const ov=layoutOverrides(); return cur.pois.map(p=>applyOv(p,ov[pid(p)])).filter(p=>p.k==="cross"&&!p.del); }
function walkRows(){
  const r=cur.route, cs=crossPoints(), key=cur.id+"|"+cs.map(p=>Math.round(p.x)+","+Math.round(p.y)).join(";");
  if(walkCache&&walkCache.key===key) return walkCache.rows;
  const rows=r.rows.map(s=>(r.rle?s.replace(/([012])x(\d+);/g,(m,c,n)=>c.repeat(+n)):s).split("")), cell=r.cell, mpu=r.mpu, pe=document.getElementById("trackPath"), samples=[];
  const paint=(x,y,rad,fn)=>{ const i0=Math.max(0,Math.floor((x-rad-r.x0)/cell)), i1=Math.min(r.nx-1,Math.floor((x+rad-r.x0)/cell)), j0=Math.max(0,Math.floor((y-rad-r.y0)/cell)), j1=Math.min(r.ny-1,Math.floor((y+rad-r.y0)/cell));
    for(let j=j0;j<=j1;j++) for(let i=i0;i<=i1;i++) if(Math.hypot(r.x0+(i+.5)*cell-x,r.y0+(j+.5)*cell-y)<=rad) fn(i,j); };
  const open=(i,j)=>{ if(rows[j][i]==="1") rows[j][i]="2"; };
  if(pe){ const L=pe.getTotalLength(), step=Math.max(1,cell/2); for(let s=0;s<=L;s+=step){ const p=pe.getPointAtLength(s); samples.push([p.x,p.y]); paint(p.x,p.y,7.5/mpu,(i,j)=>{ rows[j][i]="1"; }); } }
  cs.forEach(p=>{
    paint(p.x,p.y,14/mpu,open);
    let q=null, best=60/mpu; samples.forEach(s=>{ const d=Math.hypot(s[0]-p.x,s[1]-p.y); if(d<best){ best=d; q=s; } });
    if(q){ paint(q[0],q[1],14/mpu,open); const n=Math.ceil(Math.hypot(q[0]-p.x,q[1]-p.y)/(cell/2)); for(let k=1;k<n;k++) paint(p.x+(q[0]-p.x)*k/n,p.y+(q[1]-p.y)*k/n,6/mpu,open); }
  });
  walkCache={key,rows}; fieldCache=null; return rows;
}
function gridCell(x,y){ const r=cur.route; return [Math.min(r.nx-1,Math.max(0,Math.floor((x-r.x0)/r.cell))), Math.min(r.ny-1,Math.max(0,Math.floor((y-r.y0)/r.cell)))]; }
function nearestFree(cx,cy){ const r=cur.route, rows=walkRows(); if(rows[cy][cx]!=="1") return [cx,cy]; for(let rad=1;rad<8;rad++){ for(let dx=-rad;dx<=rad;dx++) for(let dy=-rad;dy<=rad;dy++){ const X=cx+dx,Y=cy+dy; if(X>=0&&X<r.nx&&Y>=0&&Y<r.ny&&rows[Y][X]!=="1") return [X,Y]; } } return [cx,cy]; }
const ACCESS_KEY=K.accessRoutes;
function accessRoutes(){ try{ return localStorage.getItem(ACCESS_KEY)==="1"; }catch(e){ return false; } }
function setAccessRoutes(v){ try{ localStorage.setItem(ACCESS_KEY,v?"1":"0"); }catch(e){} renderAccessUI(); if(routeDest!==null) computeRoute(); }
function renderAccessUI(){ const on=accessRoutes(); document.querySelectorAll(".accessSeg").forEach(el=>{ el.innerHTML=[["0","Off"],["1","On"]].map(([k,l])=>`<button class="${(k==="1")===on?"on":""}" onclick="setAccessRoutes(${k==="1"})">${l}</button>`).join(""); }); }
function dijkstra(sx,sy,tx,ty){
  const r=cur.route, nx=r.nx, ny=r.ny, rows=walkRows(); const N=nx*ny;
  const dist=new Float64Array(N).fill(Infinity), prev=new Int32Array(N).fill(-1), done=new Uint8Array(N);
  const id=(x,y)=>y*nx+x; dist[id(sx,sy)]=0;
  const heap=[[0,id(sx,sy)]];
  const push=(it)=>{ heap.push(it); let i=heap.length-1; while(i>0){ const p=(i-1)>>1; if(heap[p][0]<=heap[i][0]) break; [heap[p],heap[i]]=[heap[i],heap[p]]; i=p; } };
  const pop=()=>{ const top=heap[0], last=heap.pop(); if(heap.length){ heap[0]=last; let i=0; for(;;){ const l=2*i+1,rr=l+1; let m=i; if(l<heap.length&&heap[l][0]<heap[m][0]) m=l; if(rr<heap.length&&heap[rr][0]<heap[m][0]) m=rr; if(m===i) break; [heap[m],heap[i]]=[heap[i],heap[m]]; i=m; } } return top; };
  const target=id(tx,ty);
  /* accessible routing: bias away from grade, not just off-path ground -- adds cost proportional to the
     elevation change of each step, using the same coarse grid the Directions "climbs/drops" stat reads.
     Cached per cell within this one search; harmless no-op when a track has no elev grid yet. */
  const wantAccess=accessRoutes()&&cur.elev, elevCache=new Map();
  const elevAtCell=(x,y)=>{ const k=y*nx+x; if(elevCache.has(k)) return elevCache.get(k); const v=elevAt(r.x0+(x+0.5)*r.cell,r.y0+(y+0.5)*r.cell); elevCache.set(k,v); return v; };
  while(heap.length){
    const [d,u]=pop(); if(done[u]) continue; done[u]=1; if(u===target) break;
    const x=u%nx, y=(u-x)/nx;
    for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){
      if(!dx&&!dy) continue; const X=x+dx,Y=y+dy; if(X<0||X>=nx||Y<0||Y>=ny) continue;
      if(rows[Y][X]==="1") continue; if(dx&&dy&&(rows[y][X]==="1"||rows[Y][x]==="1")) continue;
      /* strong preference for marked paths (0.5x) over unclassified open ground (1.5x, a 3x gap) --
         keeps a route from cutting straight through a hillside/treeline just because it's shorter,
         while still allowing short necessary stretches (leaving a stand, reaching a POI's door). */
      let w=(dx&&dy?1.4142:1)*(rows[Y][X]==="2"?0.5:1.5);
      if(wantAccess){ const e1=elevAtCell(x,y), e2=elevAtCell(X,Y); if(e1!=null&&e2!=null) w+=Math.abs(e2-e1)*3; }
      const v=id(X,Y); const nd=d+w;
      if(nd<dist[v]){ dist[v]=nd; prev[v]=u; push([nd,v]); }
    }
  }
  if(!isFinite(dist[target])) return null;
  const cells=[]; for(let u=target;u!==-1;u=prev[u]) cells.push([u%nx,(u-(u%nx))/nx]); return cells.reverse();
}
/* The search moves square to square on a 10 m grid, so a path running at an angle comes out as a staircase.
   Pull the line straight wherever it can stay within one square of the route that was found and never touch
   the circuit -- it still follows the same paths and crossings, just without the zigzag. */
function straighten(cells){
  const r=cur.route, nx=r.nx, rows=walkRows(), at=new Map(); cells.forEach(([x,y],k)=>at.set(y*nx+x,k));
  const near=(X,Y,i,j)=>{ for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++){ const k=at.get((Y+dy)*nx+X+dx); if(k!==undefined&&k>=i&&k<=j) return true; } return false; };
  const clear=(i,j)=>{ const [ax,ay]=cells[i], [bx,by]=cells[j], n=Math.ceil(Math.hypot(bx-ax,by-ay)*4);
    for(let s=1;s<n;s++){ const X=Math.floor(ax+.5+(bx-ax)*s/n), Y=Math.floor(ay+.5+(by-ay)*s/n); if(rows[Y][X]==="1"||!near(X,Y,i,j)) return false; } return true; };
  const out=[cells[0]]; let i=0;
  while(i<cells.length-1){ let j=i+1; while(j+1<cells.length&&clear(i,j+1)) j++; out.push(cells[j]); i=j; }
  return out;
}
function routeOrigins(){
  const o=[]; if(userPos&&userPos.inside) o.push({v:"you",l:"Your location",x:userPos.x,y:userPos.y}); const sp=getSpot(); if(sp) o.push({v:"spot",l:"My spot",x:sp.x,y:sp.y});
  /* "spectator side" = pushed away from the circuit's middle; tracks with no turn markers yet use the map's centre */
  const nt=cur.turns.length, cx=nt?cur.turns.reduce((s,t)=>s+t[0],0)/nt:cur.vb[0]+cur.vb[2]/2, cy=nt?cur.turns.reduce((s,t)=>s+t[1],0)/nt:cur.vb[1]+cur.vb[3]/2;
  const out=(x,y)=>{ const dx=x-cx, dy=y-cy, L=Math.hypot(dx,dy)||1, m=16/cur.route.mpu; return [x+dx/L*m, y+dy/L*m]; };
  const [sx,sy]=out(cur.sf[0],cur.sf[1]); o.push({v:"sf",l:"Start/finish line (spectator side)",x:sx,y:sy});
  cur.turns.forEach(([x,y,n])=>{ const [ox,oy]=out(x,y); o.push({v:"t"+n,l:"Turn "+n+" (spectator side)",x:ox,y:oy}); });
  return o;
}
/* elevation: cur.elev (when present) is a coarse grid baked in ahead of time -- USGS-sourced feet
   values sampled every ~100m across the property, never fetched live from the phone. Bilinear-
   interpolated so a walking route can report real climbing/descending, fully offline. */
function elevAt(x,y){
  const e=cur.elev; if(!e) return null;
  const fx=(x-e.x0)/e.cx, fy=(y-e.y0)/e.cy;
  const i0=Math.max(0,Math.min(e.nx-2,Math.floor(fx))), j0=Math.max(0,Math.min(e.ny-2,Math.floor(fy)));
  const tx=Math.max(0,Math.min(1,fx-i0)), ty=Math.max(0,Math.min(1,fy-j0));
  const g=(i,j)=>e.ft[j*e.nx+i];
  const v00=g(i0,j0), v10=g(i0+1,j0), v01=g(i0,j0+1), v11=g(i0+1,j0+1);
  if(v00==null||v10==null||v01==null||v11==null) return null;
  const top=v00+(v10-v00)*tx, bot=v01+(v11-v01)*tx;
  return top+(bot-top)*ty;
}
function routeElevation(pts){
  if(!cur.elev||!cur.route) return null;
  const stepU=20/cur.route.mpu;   /* resample every ~20m so a hill between two route vertices isn't missed */
  const samples=[];
  for(let i=0;i<pts.length-1;i++){
    const [ax,ay]=pts[i], [bx,by]=pts[i+1], n=Math.max(1,Math.round(Math.hypot(bx-ax,by-ay)/stepU));
    for(let k=0;k<n;k++){ const t=k/n; samples.push([ax+(bx-ax)*t,ay+(by-ay)*t]); }
  }
  samples.push(pts[pts.length-1]);
  const elevs=samples.map(([x,y])=>elevAt(x,y)).filter(v=>v!==null);
  if(elevs.length<2) return null;
  let gain=0,loss=0; for(let i=1;i<elevs.length;i++){ const d=elevs[i]-elevs[i-1]; if(d>0) gain+=d; else loss-=d; }
  return {gain,loss};
}
/* Plain-language hill callout instead of raw feet -- "+49 ft / -78 ft" means nothing to most people,
   but "hilly, up and down" is immediate. Feet are still what the underlying data is in (see elevAt). */
function hillNote(elev){
  if(!elev) return "";
  const NOTICE=15, STEEP=75, g=elev.gain, l=elev.loss, big=Math.max(g,l);
  if(big<NOTICE) return "";
  const both=Math.min(g,l)>=NOTICE&&Math.min(g,l)>=big*0.4, steep=big>=STEEP;
  if(both) return steep?"Hilly walk — steep in places.":"Hilly walk, up and down.";
  return g>l ? (steep?"Includes a steep climb.":"Includes some uphill.") : (steep?"Includes a steep drop.":"Includes some downhill.");
}
function startDirections(){ if(popI===null) return; routeDest=popI; following=false; devHeading=null; const sel=document.getElementById("dirFrom"); const os=routeOrigins(); const prevV=sel.value; sel.innerHTML=os.map(o=>`<option value="${o.v}">${o.l}</option>`).join(""); sel.value=os.some(o=>o.v===prevV)?prevV:os[0].v; const w=document.getElementById("dirWalk"); if(w) w.textContent="Start walking"; showSheet("shDir"); computeRoute(); }
function computeRoute(){
  if(routeDest===null||!cur.route) return;
  const ov=layoutOverrides(); const all=cur.pois.map(p=>applyOv(p,ov[pid(p)])).concat(userStands().map(s=>({k:"food",n:s.n,x:s.x,y:s.y}))); const dest=routeDest==="spot"?(()=>{ const s=getSpot(); return s?{n:"My spot",x:s.x,y:s.y}:null; })():all[routeDest]; if(!dest) return;
  const o=routeOrigins().find(q=>q.v===document.getElementById("dirFrom").value); if(!o) return;
  const [sx,sy]=nearestFree(...gridCell(o.x,o.y)), [tx,ty]=nearestFree(...gridCell(dest.x,dest.y));
  const cells=dijkstra(sx,sy,tx,ty); const r=cur.route;
  document.getElementById("dirTo").textContent="To "+dest.n;
  const layer=document.getElementById("routeLayer");
  if(!cells){ layer.innerHTML=""; document.getElementById("dirStat").textContent="No route"; document.getElementById("dirNote").textContent=crossPoints().length?"Couldn't find a way there without crossing the track.":"No bridges or tunnels are mapped at this track yet, so a walking route can't cross the circuit."; return; }
  const sm=[[o.x,o.y]].concat(straighten(cells).map(([x,y])=>[r.x0+(x+0.5)*r.cell, r.y0+(y+0.5)*r.cell]),[[dest.x,dest.y]]);
  routePts=sm; let metres=0; for(let i=1;i<sm.length;i++) metres+=Math.hypot(sm[i][0]-sm[i-1][0],sm[i][1]-sm[i-1][1])*r.mpu;
  const d="M"+sm.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" L");
  layer.innerHTML=`<path class="route-c" d="${d}"/><path class="route" d="${d}"/><circle cx="${o.x}" cy="${o.y}" r="5" fill="#fff" stroke="var(--gate)" stroke-width="2.5"/>`;
  const mins=Math.max(1,Math.round(metres/80)), elev=routeElevation(sm);
  document.getElementById("dirStat").textContent=`${distLabel(metres)} · about ${mins} min walk`;
  document.getElementById("dirNote").textContent=metres>0?[hillNote(elev),"Follows roads where possible and crosses the track only at the bridges and tunnel."].filter(Boolean).join(" "):"";
  updateHeading();
}
function clearRoute(){ routeDest=null; routePts=null; devHeading=null; following=false; const l=document.getElementById("routeLayer"); if(l) l.innerHTML=""; if(sheetState==="shDir") closeSheet(); updateHeading(); }
/* heading (compass) mode: the map shows the route flat/north-up until the person explicitly taps
   "Start walking" (following=true) -- just requesting directions should never spin the map on its own. */
let heading=0, devHeading=null, orientOn=false, following=false, smoothHd=null, lastHdAt=0;
function bearingTo(ax,ay,bx,by){ return (Math.atan2(bx-ax,-(by-ay))*180/Math.PI+360)%360; }
/* shortest signed distance from b to a around a circle, e.g. angDelta(2,358)=4, not -356 -- this is
   what keeps the map turning the short way instead of spinning almost all the way round. */
function angDelta(a,b){ let d=(a-b)%360; if(d>180) d-=360; if(d<-180) d+=360; return d; }
function toggleWalking(){
  following=!following; devHeading=null; smoothHd=null; if(following) startOrientation();
  const b=document.getElementById("dirWalk"); if(b) b.textContent=following?"Stop following":"Start walking";
  updateHeading();
}
function updateHeading(){
  let target=0;
  if(following&&routeDest!==null&&routePts&&routePts.length>1){ if(devHeading!==null) target=devHeading; else { const p=routePts[Math.min(routePts.length-1,3)]; target=bearingTo(routePts[0][0],routePts[0][1],p[0],p[1]); } }
  /* heading itself is left unwrapped (can grow past 360 or below 0) and always moves by the shortest
     angle to the target, so CSS's transition always turns the short way -- wrapping it to 0-360 before
     comparing is what used to make the map occasionally spin almost all the way round near due north. */
  const delta=angDelta(target,((heading%360)+360)%360);
  if(Math.abs(delta)>0.4){ heading+=delta; const hold=document.getElementById("mapHolder"); if(hold) hold.style.transform=heading?`rotate(${-heading}deg)`:""; applyView(); }
}
function startOrientation(){ if(orientOn) return; const go=()=>{ orientOn=true; window.addEventListener("deviceorientation",e=>{
  const hd=(e.webkitCompassHeading!==undefined)?e.webkitCompassHeading:(e.alpha!==null&&e.absolute?360-e.alpha:null);
  if(hd===null||routeDest===null) return;
  const now=Date.now(); if(now-lastHdAt<90) return; lastHdAt=now;   /* ~11 Hz is plenty and cuts sensor noise */
  /* light exponential smoothing on the raw compass reading -- phone compasses are noisy on their own,
     smoothing this (not just the CSS transition below) is what a real turn-by-turn app also does. */
  smoothHd = smoothHd===null ? hd : (smoothHd + angDelta(hd,smoothHd)*0.25 + 360) % 360;
  devHeading=smoothHd; updateHeading();
},true); };
  try{ if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==="function"){ DeviceOrientationEvent.requestPermission().then(s=>{ if(s==="granted") go(); }).catch(()=>{}); } else go(); }catch(e){} }
/* schedule: sessions in the track's time zone */
function tzOffsetMs(date,tz){ const dtf=new Intl.DateTimeFormat("en-US",{timeZone:tz,hour12:false,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}); const p={}; dtf.formatToParts(date).forEach(x=>p[x.type]=x.value); const asUTC=Date.UTC(+p.year,+p.month-1,+p.day,(+p.hour)%24,+p.minute,+p.second); return asUTC-date.getTime(); }
function localToDate(d,hm,tz){ const [y,m,dd]=d.split("-").map(Number); const [hh,mm]=hm.split(":").map(Number); const guess=new Date(Date.UTC(y,m-1,dd,hh,mm)); const off=tzOffsetMs(guess,tz); return new Date(guess.getTime()-off); }
function fmtTime(date,tz){ tz=timesPref()==="mine"?undefined:tz; return date.toLocaleTimeString("en-US",{timeZone:tz,hour:"numeric",minute:"2-digit"}).replace(" ","\u202f"); }
function sessionsResolved(){ const f=focusAt(cur); return f?sessionsOf(cur).filter(x=>x.d>=f.d&&x.d<=f.end):[]; }
function shortName(n){ return n.replace("WeatherTech Championship","WeatherTech").replace("Michelin Pilot Challenge","Pilot Challenge").replace("VP Racing SportsCar Challenge","VP Challenge").replace(" - "," · "); }
function relTime(ms){ const m=Math.round(ms/60000); if(m<1) return "now"; if(m<60) return `in ${m} min`; const h=Math.floor(m/60), r=m%60; if(h<24) return `in ${h}h${r?" "+r+"m":""}`; const d=Math.round(h/24); return `in ${d} day${d>1?"s":""}`; }
/* "Wed, Sep 30 · 9:05 AM" (adds the year when it is not this year) */
function fmtWhen(date,tz){ tz=timesPref()==="mine"?undefined:tz; const y=new Date().getFullYear(); const d=date.toLocaleDateString("en-US",{timeZone:tz,weekday:"short",month:"short",day:"numeric"}); const yr=+date.toLocaleDateString("en-US",{timeZone:tz,year:"numeric"}); return `${d}${yr!==y?", "+yr:""} · ${fmtTime(date,tz)}`; }
/* the session on track right now: sessions can overlap (a grid walk running into the race), so take the latest one that started and still has more than 10 minutes left; the last 10 minutes count as "next" */
function currentSession(ss,now){ const l=ss.filter(x=>x.start<=now&&now<x.end&&x.end-now>10*60000); return l.length?l[l.length-1]:null; }
function renderNow(){
  const pill=document.getElementById("nowPill"); const ss=sessionsResolved(), cu=nextAny(); if(!ss.length||!cu||cu.t.id!==cur.id){ pill.hidden=true; return; }
  const now=new Date(); const live=currentSession(ss,now); const next=ss.find(s=>s.start>now);
  pill.hidden=false; pill.classList.toggle("live",!!live);
  if(live){ document.getElementById("nowTag").textContent="ON TRACK"; document.getElementById("nowTxt").textContent=`${shortName(live.n)}${live.est?"":" · ends "+fmtTime(live.end,cur.tz)}`; }
  else if(next){ pill.classList.remove("live"); const soon=next.start-now<36e5; document.getElementById("nowTag").textContent="NEXT"; document.getElementById("nowTxt").textContent=`${shortName(next.n)} · ${soon?relTime(next.start-now):fmtWhen(next.start,cur.tz)}`; }
  else { document.getElementById("nowTag").textContent="DONE"; document.getElementById("nowTxt").textContent=`${cur.eventName||"Event"} weekend is over`; }
}
/* Race Day hub: the landing page of every track (Hub and Map are the first two tabs, sharing one panel). It
   shows whatever is accurate for the moment -- next/live sessions, weather, results, what to watch -- and the
   Map tab (or "Full map") is one tap away. Opening a track always starts on the hub; leaving it for the map
   sticks until you reopen that track. */
let hubMode=false, hubDismissed=false;
const HUB_RADIUS_KM=32.2;   /* 20 miles */
function hubTabs(){ const pm=document.getElementById("pMap"); if(!pm||!pm.classList.contains("on")) return; document.querySelectorAll(".tabs button[data-p=pMap]").forEach(b=>b.classList.toggle("on",hubMode===(b.getAttribute("onclick")||"").startsWith("tabHub"))); }
function enterHub(){ hubMode=true; hubTabs(); document.getElementById("pMap").classList.add("hub-mode"); document.getElementById("hubView").hidden=false; renderHub(); }
let hubReturn=false;   /* true while you're on the map because a hub button sent you there: swiping back or the header's back arrow return to the hub. Closing a popup (its own X, or End directions) never does -- that's just dismissing that one popup, not leaving the map, e.g. tapping a POI badge after "Full map" and closing it should leave you on the map, not bounce you back to the hub. */
function leaveHub(){ exitHub(); hubReturn=true; }
function backToHub(){ hubReturn=false; clearRoute(); setMode(null); closeSheet(); applyView(); hubDismissed=false; enterHub(); }
/* returns true when it took you back to the hub, so callers can skip their normal back step */
function hubBack(){ if(!hubReturn||hubMode) return false; const sc=document.querySelector(".screen.on"), pn=sc&&sc.querySelector(".panel.on"); if(!sc||sc.id!=="detail"||!pn||pn.id!=="pMap") return false; if(sheetState==="shLayers"||sheetState==="shGps") return false; backToHub(); return true; }
function endDirections(){ clearRoute(); }
function closeSheetBtn(){ closeSheet(); }
function exitHub(){ hubLive.want=false; if(hubLive.playing) stopHubLive(); hubMode=false; hubDismissed=true; hubTabs(); document.getElementById("pMap").classList.remove("hub-mode"); document.getElementById("hubView").hidden=true; }
/* Inline live stream in the Race Day hub. State survives the hub's 30 s re-render: the iframe is only touched when
   the channel changes. Starting it needs a tap (no data used on a weak signal); once started it follows the series
   from one race to the next until you stop it or leave the hub. */
let hubLive={ch:null,name:"",want:false,playing:false,vid:null,looking:false};
/* YouTube no longer reliably plays embed/live_stream?channel=…, so ask our function (netlify/functions/ytlive.mjs)
   for the video that is live right now and embed that. If it can't tell, fall back to the channel embed. */
async function resolveHubLive(){
  const ch=hubLive.ch; if(!ch||hubLive.looking) return; hubLive.looking=true; hubLive.vid=null;
  try{ const r=await fetch((/netlify\.app$/.test(location.hostname)?"":"https://deft-medovik-55a935.netlify.app")+"/.netlify/functions/ytlive?ch="+encodeURIComponent(ch)); const j=r.ok?await r.json():{}; if(hubLive.ch===ch) hubLive.vid=j.id||""; }
  catch(e){ if(hubLive.ch===ch) hubLive.vid=""; }
  hubLive.looking=false;
  const box=document.getElementById("hubLive"); if(box&&hubLive.playing&&hubLive.ch===ch) box.innerHTML=hubLiveHtml();
}
function updateHubLive(sr){
  const box=document.getElementById("hubLive"); if(!box) return;
  if(!sr||!sr.yt){ if(hubLive.playing){ box.innerHTML=""; hubLive.playing=false; } hubLive.ch=null; box.hidden=true; return; }
  const changed=sr.yt!==hubLive.ch; hubLive.name=sr.name;
  if(changed){ hubLive.ch=sr.yt; hubLive.vid=null; hubLive.playing=hubLive.want; box.innerHTML=hubLiveHtml(); if(hubLive.playing) resolveHubLive(); }
  else if(!hubLive.playing) box.innerHTML=hubLiveHtml();   /* not playing: cheap to refresh; playing: leave the iframe alone */
  box.hidden=false;
}
function hubLiveHtml(){
  const head=`<div class="hubLiveRow"><span class="hubLiveDot"></span><h4 style="margin:0">Live now: ${esc(hubLive.name)} race</h4></div>`;
  /* referrerpolicy: YouTube now refuses to play embeds that arrive with no referrer (its "Error 153"), which an app web view can do */
  const src=hubLive.vid?`https://www.youtube.com/embed/${hubLive.vid}?autoplay=1&playsinline=1&rel=0`:`https://www.youtube.com/embed/live_stream?channel=${hubLive.ch}&autoplay=1&playsinline=1`;
  if(hubLive.playing&&hubLive.vid===null) return head+`<div class="liveWrap"><div class="liveFinding" style="position:absolute;inset:0;display:grid;place-items:center;color:#fff;font-size:14px">Finding the stream…</div></div><button class="btn quiet hubLiveStop" onclick="stopHubLive()">Stop stream</button>`;
  if(hubLive.playing) return head+`<div class="liveWrap"><iframe src="${src}" title="${esc(hubLive.name)} live" frameborder="0" referrerpolicy="strict-origin-when-cross-origin" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div><button class="btn quiet hubLiveStop" onclick="stopHubLive()">Stop stream</button> <a class="hubLiveOpen" href="https://www.youtube.com/channel/${hubLive.ch}/live" target="_blank" rel="noopener" style="margin-left:12px;font-size:13px">Not playing? Open in YouTube</a>`;
  return head+`<div class="hubSessionSub" style="margin:4px 0 10px">Free on the series' YouTube channel.</div><button class="btn primary hubLivePlay" onclick="playHubLive()">Watch here</button> <a class="hubLiveOpen" href="https://www.youtube.com/channel/${hubLive.ch}/live" target="_blank" rel="noopener" style="margin-left:12px;font-size:13px">Open in YouTube</a>`;
}
function playHubLive(){ hubLive.want=true; hubLive.playing=true; document.getElementById("hubLive").innerHTML=hubLiveHtml(); if(hubLive.vid===null) resolveHubLive(); }
function stopHubLive(){ hubLive.want=false; hubLive.playing=false; hubLive.vid=null; document.getElementById("hubLive").innerHTML=hubLiveHtml(); }
/* Results get added to data/results.js minutes after a race ends. While the hub is showing "results will show here
   once they're posted", re-fetch that one file (straight from the network, at most once a minute) and swap the
   entries in place -- no app update or reload needed. Offline or failing fetches are ignored. */
let resultsAt=0;
async function refreshResults(){
  if(Date.now()-resultsAt<60000||typeof RESULTS==="undefined") return;
  resultsAt=Date.now();
  try{
    const r=await fetch("data/results.js?t="+Date.now(),{cache:"no-store"});
    if(!r.ok) return;
    const fresh=new Function(await r.text()+";return RESULTS;")();
    if(!Array.isArray(fresh)||JSON.stringify(fresh)===JSON.stringify(RESULTS)) return;
    RESULTS.length=0; fresh.forEach(x=>RESULTS.push(x));
    if(cur&&hubMode) renderHub();
  }catch(e){}
}
/* ---- Live results ----
   For a series that publishes its results pages (GT World Challenge Europe so far), a small Netlify function
   (netlify/functions/gtwce.mjs) reads them and the hub shows the latest session within about a minute: practice,
   the qualifying class grid, the running order during the race and the final classification. An entry in data/entries.js
   switches it on with live:{round:"<the series' round slug>"}. Nothing is stored; if the function is unreachable the card just does not show. */
const LIVE_API=/netlify\.app$/.test(location.hostname)?"/.netlify/functions/gtwce":"https://deft-medovik-55a935.netlify.app/.netlify/functions/gtwce";
const liveCache={}; let liveTimer=null, liveSig="";
function liveSrc(){
  const fo=focusAt(cur); if(!fo||typeof ENTRIES==="undefined") return null; const today=localToday();
  return ENTRIES.find(x=>x.t===cur.id&&x.live&&x.d>=fo.d&&x.d<=fo.end&&daysBetween(today,x.d)<=1&&daysBetween(today,fo.end)>=-1)||null;
}
const liveData=g=>{ const c=g&&g.live&&liveCache[g.live.round]; return c?c.data:null; };
const liveRows=(g,k)=>{ const d=liveData(g); return d&&d.sessions[k]||null; };
function liveFetch(g){
  const c=liveCache[g.live.round]; if(c&&Date.now()-c.t<25000) return Promise.resolve(c.data);
  return fetch(`${LIVE_API}?round=${encodeURIComponent(g.live.round)}`).then(r=>r.ok?r.json():null).then(d=>{ if(d&&d.sessions){ liveCache[g.live.round]={t:Date.now(),data:d}; return d; } return null; }).catch(()=>null);
}
function liveTick(){
  const g=hubMode&&cur?liveSrc():null; if(!g){ clearInterval(liveTimer); liveTimer=null; return; }
  liveFetch(g).then(d=>{ if(!d||!hubMode||cur.id!==g.t) return;
    const sig=Object.keys(d.sessions).map(k=>k+d.sessions[k].length+(d.sessions[k][0]||{}).num).join("|")+(d.runningLabel||"");
    if(sig!==liveSig){ liveSig=sig; renderHub(); if(sheetState==="shGame") renderGame(); } });
}
function liveStart(){ if(liveTimer) return; liveTick(); liveTimer=setInterval(liveTick,45000); }
/* the most recent session that has rows, newest kind first */
function liveBest(g){
  const d=liveData(g); if(!d) return null; const o=[["main-race","Race result"],["race-running",`Race running order, after ${d.runningLabel||"the latest hour mark"}`],["qualifying-combined","Qualifying: starting grid"],["free-practice-3","Practice 3: best times"],["free-practice-2","Practice 2: best times"],["free-practice-1","Practice 1: best times"]];
  const k=o.find(x=>d.sessions[x[0]]); return k?{key:k[0],title:k[1],rows:d.sessions[k[0]],at:d.fetchedAt}:null;
}
const LIVE_CLASSES=["Pro","Gold","Silver","Bronze"];
function liveCardHtml(g,chev){
  const b=liveBest(g); if(!b) return "";
  const lines=LIVE_CLASSES.map(c=>{ const r=b.rows.filter(x=>x.cls===c).slice(0,3); if(!r.length) return ""; return `<div class="lvRow"><i>${c}</i><span><b>1</b> #${esc(r[0].num)} ${esc(r[0].team)}${r.slice(1).map((x,i)=>` · <b>${i+2}</b> #${esc(x.num)}`).join("")}</span></div>`; }).join("");
  const t=b.at?new Date(b.at).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):"";
  return `<div class="hubCard hubTap" role="button" onclick="openLiveRes()"><div class="hubCardRow"><div><h4>${esc(b.title)}</h4><div class="hubSessionSub">Official results, read ${t}. Tap for every car.</div></div>${chev}</div>${lines}</div>`;
}
let liveResCls="Pro";
function openLiveRes(){ renderLiveRes(); showSheet("shRes"); }
function renderLiveRes(){
  const g=liveSrc()||ENTRIES.find(x=>x.t===cur.id&&x.live), b=g&&liveBest(g); if(!b) return;
  document.getElementById("rsTitle").textContent=b.title;
  document.getElementById("rsSub").textContent=`${watchSeriesName({s:g.s})} · read from the series' official results page${b.at?" at "+new Date(b.at).toLocaleTimeString([], {hour:"numeric",minute:"2-digit"}):""}. It refreshes about every minute while this screen is open, and the series can still change a result.`;
  const cls=LIVE_CLASSES.filter(c=>b.rows.some(x=>x.cls===c)); if(!cls.includes(liveResCls)) liveResCls=cls[0];
  document.getElementById("rsTabs").innerHTML=cls.map(c=>`<button class="gmTab${c===liveResCls?" on":""}" onclick="liveResCls='${c}';renderLiveRes()">${c}</button>`).join("");
  document.getElementById("rsList").innerHTML=b.rows.filter(x=>x.cls===liveResCls).map((x,i)=>`<div class="rsRow"><span class="rsPos">${i+1}</span><span class="gmNo">#${esc(x.num)}</span><span class="gmTxt"><b>${esc(x.team)}</b><small>${esc(x.drivers)}</small></span><span class="rsTime">${esc(x.time||"")}${x.gap?`<small>+${esc(x.gap)}</small>`:""}</span></div>`).join("");
}

/* ---- Pick your podium ----
   Before a race, call the top three cars in each class from the series' own entry list (data/entries.js). Picks lock at the
   race's start and are scored against data/results.js once the result is posted: 5 points for the right car in the right place,
   2 for a podium car in the wrong place, both times a long-shot multiplier: every pick banks the car's win chance (data/entries.js)
   at the moment you make it, and pays x sqrt(10 / chance%), kept between 0.5 and 3 (a 10% car pays x1, a 2% car about x2.2, a 30%
   car x0.58), then x1.25 for a pick locked in before qualifying starts or x0.75 for one made after it ends (gameTiming). Everything stays on this phone (paddock:picks, with the banked chances under "_p"); no accounts, no server.
   Results that only name the winner (or the winner and a podium, unordered) score only the places they actually settle. */
const PICK_KEY=K.picks;
const gameKey=g=>`${g.t}|${g.d}|${g.s}`;
function picksAll(){ try{ return JSON.parse(localStorage.getItem(PICK_KEY)||"{}"); }catch(e){ return {}; } }
function picksOf(g){ return picksAll()[gameKey(g)]||{}; }
const gameMult=p=>Math.min(3,Math.max(.5,Math.sqrt(10/(p>0?p:10))));
const gameExact=(p,t=1)=>Math.round(5*gameMult(p)*t), gameNear=(p,t=1)=>Math.round(2*gameMult(p)*t);
/* timing: lock a pick in before qualifying starts for +25%; picks made once qualifying is over score -25% (the grid is a big hint).
   Games with no qualifying session score at x1. The factor is stored with the pick ("_m"), like the banked win chance. */
function gameTiming(g,at){
  at=at||Date.now(); const qs=sessionsOf(cur).filter(s=>{ const sr=seriesFor(s.n); return cur.id===g.t&&sr&&sr.id===g.s&&kindOf(s.n)==="qualifying"&&s.d>=g.d&&s.d<=eventEnd({d:g.d,t:9}); });
  if(!qs.length) return {m:1,label:""};
  const first=Math.min(...qs.map(s=>+s.start)), last=Math.max(...qs.map(s=>+s.end));
  return at<first?{m:1.25,label:"Early bonus: +25% on every pick you lock in before qualifying starts",until:new Date(first)}:at<last?{m:1,label:"Qualifying is under way: normal points"}:{m:.75,label:"Qualifying is over: new picks score 25% less"};
}
const pickM=(g,cls,n)=>{ const v=(picksOf(g)._m||{})[cls+"|"+n]; return typeof v==="number"?v:1; };
/* win chance per car number for a class: the stored estimate, or -- once the live qualifying grid is in -- rebuilt from it
   (same model as tools/podium_odds.py: form tilt 0.5 per form point, 0.35 per grid place, 0.5% floor) */
function gameProbs(g,cls){
  const c=g.classes.find(x=>x.h===cls); if(!c) return null; const q=g.live?liveRows(g,"qualifying-combined"):null;
  if(!q||!c.cars.every(r=>typeof r[6]==="number")){ const m={}; c.cars.forEach(r=>{ if(typeof r[4]==="number") m[r[0]]=r[4]; }); return m; }
  const pos={}; let n=0; q.filter(x=>x.cls===cls).forEach(x=>{ pos[x.num]=++n; });
  const ws=c.cars.map(r=>0.5*(r[6]-0.5)-0.35*((pos[r[0]]||n+1)-1)), ex=ws.map(Math.exp), z=ex.reduce((a,b)=>a+b,0); let pr=ex.map(e=>Math.max(0.005,e/z)); const z2=pr.reduce((a,b)=>a+b,0); pr=pr.map(p=>p/z2);
  const m={}; c.cars.forEach((r,i)=>{ m[r[0]]=Math.round(pr[i]*1000)/10; }); return m;
}
function carP(g,cls,n){ const m=gameProbs(g,cls); return m&&typeof m[n]==="number"?m[n]:null; }
function pickP(g,cls,n){ const b=(picksOf(g)._p||{})[cls+"|"+n]; return typeof b==="number"?b:carP(g,cls,n); }   /* the chance banked when picked (or the current one for older picks) */
function setPickP(g,cls,n,p){ const all=picksAll(), k=gameKey(g); all[k]=Object.assign({},all[k]); const m=Object.assign({},all[k]._p), tm=Object.assign({},all[k]._m); if(p==null){ delete m[cls+"|"+n]; delete tm[cls+"|"+n]; } else { m[cls+"|"+n]=p; tm[cls+"|"+n]=gameTiming(g).m; } all[k]._p=m; all[k]._m=tm; try{ localStorage.setItem(PICK_KEY,JSON.stringify(all)); }catch(e){} }
function savePicks(g,cls,list){ const all=picksAll(), k=gameKey(g); all[k]=Object.assign({},all[k]); if(list.length) all[k][cls]=list; else delete all[k][cls]; try{ localStorage.setItem(PICK_KEY,JSON.stringify(all)); }catch(e){} }
const gameNum=str=>{ const m=/#(\d+)/.exec(str||""); return m?m[1]:null; };
function gameResult(g){
  const r=typeof RESULTS!=="undefined"?RESULTS.filter(x=>x.t===g.t&&x.d===g.d&&x.s===g.s).pop()||null:null; if(r) return r;
  const race=liveRows(g,"main-race"); if(!race) return null;   /* the official classification, read live, until the permanent result is added */
  const by={}; race.forEach(x=>{ (by[x.cls]=by[x.cls]||[]).push(x); });
  return {live:true,groups:Object.keys(by).map(h=>({h,order:by[h].slice(0,5).map((x,i)=>`${i+1}. #${x.num} ${x.team} — ${x.drivers}`)}))};
}
/* the race's settled places for one class: exact[i] = car number in place i+1 when the order was published, podium = every car known to be on it */
function gamePodium(res,cls){
  const grp=res&&res.groups.find(x=>x.h.toLowerCase()===cls.toLowerCase()); if(!grp) return null;
  if(grp.order){ const exact=grp.order.slice(0,3).map(gameNum); return {exact,podium:exact.filter(Boolean)}; }
  const w=gameNum(grp.winner), rest=(grp.podium||[]).map(gameNum).filter(Boolean);
  return {exact:[w],podium:[w].concat(rest).filter(Boolean),extra:rest.length};
}
function gameScore(g){
  const res=gameResult(g); if(!res) return null; const picks=picksOf(g); let pts=0,max=0,cars=0;
  const per={};
  g.classes.forEach(c=>{ const pk=picks[c.h]; const pd=gamePodium(res,c.h); if(!pk||!pd) return; const marks=[];
    const gain=[];
    pk.forEach((n,i)=>{ const p=pickP(g,c.h,n), tm=pickM(g,c.h,n), ex=gameExact(p,tm), ne=gameNear(p,tm); let got=0;
      if(pd.exact[i]!==undefined&&pd.exact[i]!==null){ max+=ex; const ok=pd.exact[i]===n; if(ok){ got=ex; marks.push("hit"); } else if(pd.podium.includes(n)){ got=ne; marks.push("near"); } else marks.push("miss"); }
      else if(pd.podium.includes(n)){ got=ne; max+=ne; marks.push("near"); } else marks.push(pd.exact[i]===null||pd.extra!==undefined||pd.exact.length<3?"open":"miss");
      pts+=got; gain.push(got); });
    per[c.h]=marks; per[c.h+"#"]=gain; cars+=pk.length; });
  return {pts,max,per,cars,res};
}
/* the entry list for the weekend in focus (null when we have none, or it is not time yet) */
function gameNow(){
  const fo=focusAt(cur); if(!fo||typeof ENTRIES==="undefined"||daysBetween(localToday(),fo.d)>goDays()) return null;
  return ENTRIES.find(x=>x.t===cur.id&&x.d>=fo.d&&x.d<=fo.end)||null;
}
function gameLock(g){   /* when the race starts: picks freeze then (or as soon as a result exists) */
  const race=sessionsOf(cur).filter(s=>{ const sr=seriesFor(s.n); return sr&&sr.id===g.s&&kindOf(s.n)==="race"&&s.d>=g.d; })[0];
  return race||null;
}
const gameLocked=g=>{ const l=gameLock(g); return !!gameResult(g)||(l&&l.start<=new Date()); };
let gameG=null, gameCls=null;
function gameCardHtml(g,chev){
  const sc=gameScore(g), pk=picksOf(g), done=g.classes.filter(c=>(pk[c.h]||[]).length===3).length, locked=gameLocked(g), lock=gameLock(g);
  const line=sc?`You scored <b>${sc.pts}</b> of ${sc.max} possible points.`:locked?(done?"Picks are locked. Your score comes after the race.":"The race has started, so picks are closed."):done?`${done} of ${g.classes.length} classes picked${lock?` · locks at the start of the race, ${fmtWhen(lock.start,cur.tz)}`:""}`:"Call the top three in each class before the race. Scored against the real result, on this phone only.";
  return `<div class="hubCard hubTap" role="button" onclick="openGame()"><div class="hubCardRow"><div><h4>Pick your podium</h4><div class="hubSessionSub">${line}</div></div>${chev}</div></div>`;
}
function openGame(){
  const g=gameNow(); if(!g) return; gameG=g; if(!gameCls||!g.classes.some(c=>c.h===gameCls)) gameCls=g.classes[0].h; renderGame(); showSheet("shGame");
}
function renderGame(){
  const g=gameG; if(!g) return; const locked=gameLocked(g), sc=gameScore(g), lock=gameLock(g), pk=picksOf(g), c=g.classes.find(x=>x.h===gameCls), mine=pk[c.h]||[];
  document.getElementById("gmTitle").textContent=`${watchSeriesName({s:g.s})}: pick your podium`;
  document.getElementById("gmSub").textContent=sc?`Scored against the official result: ${sc.pts} of ${sc.max} points.`:locked?"Picks are locked.":`Tap cars to fill 1st, 2nd and 3rd in each class. Picks lock at the start of the race${lock?`, ${fmtWhen(lock.start,cur.tz)}`:""}.${gameTiming(g).label?" "+gameTiming(g).label+".":""}`;
  document.getElementById("gmTabs").innerHTML=g.classes.map(x=>{ const n=(pk[x.h]||[]).length; return `<button class="gmTab${x.h===gameCls?" on":""}" onclick="gameCls='${x.h}';renderGame()">${esc(x.h)}${n?`<i>${n}/3</i>`:""}</button>`; }).join("");
  const pd=sc&&gamePodium(sc.res,c.h), marks=(sc&&sc.per[c.h])||[], find=n=>c.cars.find(r=>r[0]===n);
  document.getElementById("gmSlots").innerHTML=[0,1,2].map(i=>{ const n=mine[i], r=n&&find(n), mk=marks[i]; return `<button class="gmSlot${n?" full":""}${mk?" "+mk:""}" ${locked||!n?"disabled":""} onclick="gameDrop(${i})"><b>${i+1}</b><span>${r?`<strong>#${esc(r[0])}</strong> ${esc(r[1])}`:"Empty"}</span>${mk?`<em>${mk==="open"?"?":"+"+(((sc&&sc.per[c.h+"#"])||[])[i]||0)}</em>`:n&&!locked?`<em>${gameExact(pickP(g,c.h,n),pickM(g,c.h,n))} pts</em>`:""}</button>`; }).join("");
  const real=pd?`<div class="gmReal"><b>Official result</b> ${pd.exact.map((n,i)=>n?`${i+1}. #${n}`:`${i+1}. not listed`).join(" · ")}${pd.extra?` · also on the podium: ${pd.podium.slice(1).map(n=>"#"+n).join(", ")}`:""}</div>`:sc?`<div class="gmReal">The result for this class is not in yet.</div>`:"";
  const tm0=gameTiming(g).m, probs=gameProbs(g,c.h)||{}, gridOn=!!(g.live&&liveRows(g,"qualifying-combined")&&c.cars.every(r=>typeof r[6]==="number")), hasP=c.cars.some(r=>typeof r[4]==="number"), cars=hasP?c.cars.slice().sort((a,b)=>(probs[b[0]]||0)-(probs[a[0]]||0)):c.cars;
  const note=hasP?`<div class="gmNote"><b>Win chances, favourites first.</b> ${esc(gridOn?"Rebuilt from the official class grid, live from the series' qualifying result: starting position now drives the chances.":(g.oddsAsOf||"Our own estimate."))} A form guide, not betting odds or a prediction: it knows nothing about balance of performance, weather or strategy. Longer shots score more, early picks score more, and each pick keeps the chance and bonus it had when you made it.</div>`:"";
  document.getElementById("gmList").innerHTML=real+note+cars.map(r=>{ const at=mine.indexOf(r[0]), p=probs[r[0]]; return `<button class="gmCar${at>=0?" picked":""}" ${locked?"disabled":""} onclick="gamePick('${r[0]}')"><span class="gmNo">#${esc(r[0])}</span><span class="gmTxt"><b>${esc(r[1])}</b><small>${esc(r[2])} · ${esc(r[3])}</small>${gridOn?(()=>{ const q=liveRows(g,"qualifying-combined").filter(x=>x.cls===c.h), i=q.findIndex(x=>x.num===r[0]); return `<small class="gmWhy">${i>=0?"Qualified "+(i+1)+" of "+q.length+" in class":"No qualifying time"}</small>`; })():(r[5]?`<small class="gmWhy">${esc(r[5])}</small>`:"")}</span>${typeof p==="number"?`<span class="gmOdds"><b>~${p<10?p.toFixed(1):Math.round(p)}%</b><small>${gameLine(p)} · worth ${gameExact(p,tm0)}</small></span>`:""}${at>=0?`<em>${at+1}</em>`:""}</button>`; }).join("");
  document.getElementById("gmFoot").innerHTML=esc(g.asOf)+gameRecordHtml();
}
/* a win chance as a US money line, like a sportsbook would post it (fair line, no margin) */
function gameLine(p){ const f=p/100, v=f>=.5?-100*f/(1-f):100*(1-f)/f, a=Math.abs(v), r=a<1000?Math.round(a/5)*5:Math.round(a/50)*50; return (v<0?"-":"+")+r; }
function gamePick(n){
  const g=gameG; if(!g||gameLocked(g)) return; const list=(picksOf(g)[gameCls]||[]).slice(), at=list.indexOf(n);
  if(at>=0){ list.splice(at,1); setPickP(g,gameCls,n,null); } else if(list.length<3){ list.push(n); setPickP(g,gameCls,n,carP(g,gameCls,n)); } else { toast("Remove a pick first (tap it in the slots above)"); return; }
  savePicks(g,gameCls,list); renderGame(); if(hubMode) renderHub();
}
function gameDrop(i){ const g=gameG; if(!g||gameLocked(g)) return; const list=(picksOf(g)[gameCls]||[]).slice(), gone=list.splice(i,1)[0]; setPickP(g,gameCls,gone,null); savePicks(g,gameCls,list); renderGame(); if(hubMode) renderHub(); }
/* your season: every weekend you played in a calendar year, all series together, with a running total (the Home screen card and the
   bottom of the picker sheet). Counts only weekends that have a result; picks on this phone only. */
function gameSeason(year){
  const rows=[]; if(typeof ENTRIES==="undefined") return {rows,pts:0,max:0,winners:0};
  ENTRIES.filter(g=>g.d.slice(0,4)===String(year)).forEach(g=>{ const sc=gameScore(g); if(!sc||!sc.cars) return; const t=TRACKS.find(x=>x.id===g.t);
    const winners=g.classes.reduce((n,c)=>n+(((sc.per[c.h]||[])[0]==="hit")?1:0),0);
    rows.push({g,sc,winners,name:`${t?t.short:g.t} · ${watchSeriesName({s:g.s})}`}); });
  rows.sort((a,b)=>b.g.d.localeCompare(a.g.d));
  return {rows,pts:rows.reduce((n,r)=>n+r.sc.pts,0),max:rows.reduce((n,r)=>n+r.sc.max,0),winners:rows.reduce((n,r)=>n+r.winners,0)};
}
function gameRecordHtml(){
  const y=new Date().getFullYear(), st=gameSeason(y); if(!st.rows.length) return "";
  return `<div class="gmRecs"><h4>Your ${y} season</h4>${st.rows.map(r=>`<div class="gmRec"><span>${esc(r.name)}</span><b>${r.sc.pts}/${r.sc.max}</b></div>`).join("")}<div class="gmRec tot"><span>Total · ${st.winners} class winner${st.winners===1?"":"s"} called</span><b>${st.pts}</b></div></div>`;
}
/* a one-line Home card: your season total, or an invitation while a game is open */
function playCardHtml(){
  if(typeof ENTRIES==="undefined") return ""; const y=new Date().getFullYear(), st=gameSeason(y), today=localToday();
  const open=ENTRIES.find(g=>{ const t=TRACKS.find(x=>x.id===g.t); return t&&!gameResult(g)&&daysBetween(today,g.d)<=goDays()&&daysBetween(today,g.d)>=-4; });
  if(!st.rows.length&&!open) return "";
  const line=st.rows.length?`<b>${st.pts}</b> points in ${st.rows.length} weekend${st.rows.length===1?"":"s"}${open?" · a new game is open":""}`:"A game is open: call the top three in each class";
  return `<button class="scard playCard" onclick="openPlay()"><div class="scTop"><b>Pick your podium · ${y}</b><span>${st.rows.length?"Season total":"Play"}</span></div><div class="scNext">${line}</div></button>`;
}
function playOpenEntry(){ const today=localToday(); return (typeof ENTRIES!=="undefined"&&ENTRIES.find(g=>TRACKS.some(x=>x.id===g.t)&&!gameResult(g)&&daysBetween(today,g.d)<=goDays()&&daysBetween(today,g.d)>=-4))||null; }
function playNow(tid){ openTrack(tid,"home").then(()=>setTimeout(openGame,150)); }
function openPlay(){
  const y=new Date().getFullYear(), rec=gameRecordHtml(), openG=playOpenEntry();
  document.getElementById("infoBody").innerHTML=`<div class="mkick">Game</div><h3 id="infoTitle">Pick your podium · ${y}</h3><p class="plRules">Before each race, call the top three cars in each class from the official entry list. Picks lock at the green flag. Right car in the right place scores 5, a podium car in the wrong place 2, both multiplied for long shots (a pick keeps the win chance it had when you made it). Lock picks in before qualifying starts for 25% more; picks made after qualifying score 25% less. Every series counts toward one ${y} total, and it starts again each January. Scores stay on this phone.</p>${openG?`<button class="btn primary plGo" onclick="closeInfo();playNow('${openG.t}')">Make my picks: ${esc((TRACKS.find(x=>x.id===openG.t)||{}).short||"")}</button>`:""}${rec||`<p class="plRules">No scored weekends yet this year.</p>`}`;
  const m=document.getElementById("infoModal"); m.hidden=false; document.body.style.overflow="hidden"; m.querySelector(".mcard").scrollTop=0;
}

/* ---- Race Day hub: one function per card, composed by renderHub() ----
   Each card builder reads what it needs from the shared context c = {ss, now, live, next, chev, liveAll, sid, fav, resultsHtml} and returns
   its HTML ("" when the card does not apply). The order on screen is the order they are joined in renderHub(). */
function hubSessionCard(c){
  const {ss,now,live,next,chev}=c;
  const sessCard=(tag,name,sub,isLive)=>`<div class="hubCard hubTap${isLive?" liveNow":""}" role="button" onclick="showNowSession()"><div class="hubCardRow"><div><h4>${tag}</h4><div class="hubSessionName">${esc(name)}</div><div class="hubSessionSub">${sub}</div></div>${chev}</div></div>`;
  let sessionHtml;
  /* every session on track right now (a common-round weekend can have two or three at once) */
  const liveAll=ss.filter(x=>x.start<=now&&now<x.end&&x.end-now>10*60000);
  if(live) sessionHtml=liveAll.length>1
    ? sessCard("On track now",liveAll.length+" sessions",liveAll.map(x=>esc(shortName(x.n))+" · "+(x.est?"in progress":"ends "+fmtTime(x.end,cur.tz))).join("<br>"),true)
    : sessCard("On track now",shortName(live.n),live.est?"In progress":"Ends "+fmtTime(live.end,cur.tz),true);
  else if(next){ const soon=next.start-now<36e5; sessionHtml=sessCard("Next on track",shortName(next.n),soon?relTime(next.start-now):fmtWhen(next.start,cur.tz)); }
  else {
    /* nothing left to show a countdown for: say when the next event is (the hub is the landing page, so this is
       what an off-season visit sees), or "no more sessions today" in the middle of an event weekend */
    const fo=focusAt(cur), away=fo?daysBetween(localToday(),fo.d):0;
    const sub=!fo?"No upcoming event listed":away>0?`${esc(fmtRange(fo.first))} · ${away===1?"tomorrow":"in "+away+" days"}`:"No more sessions today";
    sessionHtml=`<div class="hubCard hubTap" role="button" onclick="showNowSession()"><div class="hubCardRow"><div><h4>${fo&&away>0?"Next event":esc(cur.eventName||"This weekend")}</h4>${fo&&away>0?`<div class="hubSessionName">${esc(fo.first.e)}</div>`:""}<div class="hubSessionSub">${sub}</div></div>${chev}</div></div>`;
  }
  return sessionHtml;
}
function hubTodayStrip(c){
  const {ss,now}=c;
  /* today at a glance: every session today as a small strip, so overlapping series (a common-round weekend
     like Barber or Road Atlanta) are visible without opening the schedule. Tapping it opens the schedule,
     same as the session card above. */
  const today=ss.filter(s=>s.d===localToday());
  let stripHtml="";
  if(today.length){
    const doneCount=today.filter(s=>s.end<=now).length;
    const chips=today.map(s=>{ const isLive=s.start<=now&&now<s.end, past=s.end<=now;
      return `<div class="hubChip${isLive?" live":past?" past":""}"><b>${fmtTime(s.start,cur.tz)}</b><span>${esc(shortName(s.n))}</span></div>`; }).join("");
    stripHtml=`<div class="hubCard hubTap" role="button" onclick="showNowSession()"><h4>Today</h4><div class="hubStripSub">${today.length} session${today.length>1?"s":""} today${doneCount?` · ${doneCount} done`:""}</div><div class="hubStrip">${chips}</div></div>`;
  }
  return stripHtml;
}
function hubWeatherCard(){
  let wxHtml="";
  if(wx&&wx.data&&wx.data.current){
    const c=wx.data.current, ro=rainOutlook(), wet=ro&&(ro.state==="now"||(ro.state==="soon"&&ro.mins<=60));
    wxHtml=`<div class="hubCard hubWxRow" role="button" onclick="openWeather()"><span class="wbig">${wxIcon(c.weather_code,c.is_day)}</span><div><div class="hubWxTemp">${tv(c.temperature_2m)}°</div><div class="hubWxDesc">${esc(wxInfo(c.weather_code)[0])}${!wet&&ro?" · "+esc(ro.text||""):""}</div>${wet?`<div class="hubWxAlert">☔ ${esc(ro.text)}</div>`:""}</div></div>`;
  }
  return wxHtml;
}
function hubActionTiles(){
  const spot=getSpot();
  const hasKind=k=>cur.pois.some(p=>p.k===k&&!p.del);
  const tile=(on,svg,label)=>`<button onclick="${on}"><svg viewBox="0 0 24 24">${svg}</svg>${label}</button>`;
  const actionsHtml=`<div class="hubActions">
    <button onclick="leaveHub();toggleMode('rest')"><svg viewBox="0 0 24 24" class="wc"><circle cx="7" cy="4.5" r="2"/><path d="M4.5 8h5v6H8.4v6H5.6v-6H4.5z"/><circle cx="17" cy="4.5" r="2"/><path d="M15 8h4l2 6h-1.7l.3 6h-5.2l.3-6H13z"/><path d="M12 3v18" stroke-width="1"/></svg>Restrooms</button>
    ${tile("leaveHub();toggleMode('food')",'<path d="M4 11h16M5 11a7 7 0 0 1 14 0M3 15h18M6 15v3h12v-3"/>',"Food")}
    ${hasKind("merch")?tile("leaveHub();toggleMode('merch')",'<path d="M8.5 3L3 6l2 4.5 2.5-1V21h9V9.5l2.5 1L21 6l-5.5-3q-1.5 2-3.5 2T8.5 3z"/>',"Merch"):""}
    ${hasKind("view")?tile("leaveHub();toggleMode('view')",'<path d="M2 12c3.2-6 16.8-6 20 0-3.2 6-16.8 6-20 0z"/><circle cx="12" cy="12" r="3"/>',"Best views"):""}
    ${tile(spot?"leaveHub();routeToSpot()":"leaveHub();saveSpot()",'<path d="M6 21V4M6 5h11l-2.6 4 2.6 4H6"/>',spot?"My spot":"Save my spot")}
    ${tile("leaveHub()",'<path d="M9 20l-5.447-2.724A1 1 0 0 1 3 16.382V5.618a1 1 0 0 1 1.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0 0 21 18.382V7.618a1 1 0 0 0-.553-.894L15 4m0 13V4m0 0L9 7"/>',"Full map")}
  </div>`;
  return actionsHtml;
}
/* which series the hub is about: the one live now, else the next one up (shared by What to watch, Standings and Live timing) */
function hubFocusSeries(c){
  const {ss,now,live}=c;
  /* "what to watch" follows the series on track (or next on track): when MX-5 Cup takes the track, its storylines are what shows.
     Starring a series (when more than one runs the same weekend) keeps that series showing even while another is on track.
     It swaps to a live running order once that data source exists and a session is live. */
  /* the series in focus: the one live now, else the next one up today or later -- shared by What to watch
     and Standings below, so they always agree on which series they're talking about. Starring a series
     (when more than one shares the weekend) keeps it in focus even while another is actually on track. */
  const cand=live?[live,...ss.filter(x=>x.start>now)]:ss.filter(x=>x.start>now);
  const fav=favSeries();
  let sid=null;
  if(fav&&cand.some(c=>{ const sr=seriesFor(c.n); return sr&&sr.id===fav; })) sid=fav;
  else for(const c of cand){ const sr=seriesFor(c.n); if(sr){ sid=sr.id; break; } }

  /* off-week: no live or upcoming session to follow, so fall back to the series of the next event for standings */
  if(!sid){ const nx=CHAMPS.filter(c=>!c.optIn&&followed(c)).map(c=>({c,e:nextIn(c,cur)})).filter(x=>x.e).sort((a,b)=>a.e.d.localeCompare(b.e.d)), pickS=nx.find(x=>standingsFor(x.c.guide||x.c.id))||nx[0]; if(pickS) sid=pickS.c.guide||pickS.c.id; }   /* the first series here that has standings to show */
  return {sid,fav};
}
function hubWatchCard(c){
  const {sid,fav}=c;
  const wAll=watchNow();
  let watchHtml="";
  if(wAll.length){
    const x=wAll.find(e=>e.s===sid)||wAll[0], isFav=fav===x.s, star=wAll.length>1?`<button class="hubStar${isFav?" on":""}" aria-label="${isFav?"Unstar":"Star"} ${esc(watchSeriesName(x))}" onclick="toggleFavSeries('${x.s}')"><svg viewBox="0 0 24 24"><path d="M12 3l2.9 6.2 6.6.8-5 4.6 1.4 6.6L12 18l-5.9 3.2L7.5 14.6l-5-4.6 6.6-.8z"/></svg></button>`:"";
    watchHtml=`<div class="hubCard"><h4>What to watch</h4><div class="hubSeriesRow"><div class="hubSeries">${seriesMark(x.s,24)}${esc(watchSeriesName(x))}</div>${star}</div><p class="asof hubAsof">${esc(x.asOf)}</p>${x.groups.map(g=>`<div class="wgroup"><h4>${esc(g.h)}</h4>${g.items.slice(0,2).map(([n,t])=>`<div class="witem"><b>${esc(n)}</b><span>${esc(t)}</span></div>`).join("")}</div>`).join("")}</div>`;
  }
  return watchHtml;
}
function hubStandingsCard(c){
  const {sid,chev}=c;
  /* championship standings for that same series -- top of each class only; tap for the full table. */
  let standingsHtml="";
  const std=sid?standingsFor(sid):null;
  if(std){
    standingsHtml=`<div class="hubCard hubTap" role="button" onclick="openStandings('${std.s}')"><div class="hubCardRow"><h4>Standings</h4>${chev}</div><p class="asof hubAsof">${esc(std.asOf)}</p>${std.classes.map(c=>`<div class="wgroup"><h4>${esc(c.h)}</h4>${c.rows.slice(0,5).map(standingsRowHtml).join("")}</div>`).join("")}</div>`;
  }
  return standingsHtml;
}
function hubResultsCard(c){
  const {now}=c;
  /* "how it finished": the most recently completed race (any series, within the last 6 hours) gets its own
     card right away -- before official results are added it says so plainly, and upgrades to the real
     summary automatically once a RESULTS entry (data/results.js) exists for that race. */
  let resultsHtml="";
  /* uses every session ever listed for this track, not sessionsResolved() -- the instant the weekend's
     last session ends, focusAt(cur) flips to the track's NEXT event (possibly months away), which would
     make sessionsResolved() (and its date) empty right at the exact moment this card matters most. */
  const doneAll=sessionsOf(cur).filter(s=>kindOf(s.n)==="race"&&s.end<=now&&now-s.end<=6*3600000).sort((a,b)=>b.end-a.end);
  const seenSr={}, doneRaces=doneAll.filter(s=>{ const r=seriesFor(s.n); if(!r||seenSr[r.id]) return false; seenSr[r.id]=1; return true; });
  let waitingRes=false;
  resultsHtml=doneRaces.map(jr=>{
    const sr=seriesFor(jr.n);
    const evt=(cur.events||[]).find(e=>jr.d>=e.d&&jr.d<=eventEnd(e));
    const res=evt&&typeof RESULTS!=="undefined"?RESULTS.filter(r=>r.t===cur.id&&r.d===evt.d&&r.s===sr.id).pop():null;
    if(!res) waitingRes=true;
    return `<div class="hubCard"><h4>How it finished</h4><div class="hubSeries">${seriesMark(sr.id,24)}${esc(sr.name)}</div>${res?res.groups.map(g=>resultGroupHtml(g,5)).join(""):`<div class="hubSessionSub">The race just ended -- results will show here once they're posted.</div>`}</div>`;
  }).join("");
  if(waitingRes) refreshResults();
  return resultsHtml;
}
const STREAM_TAIL_MIN=20;
function hubLiveStream(c){
  const {ss,now}=c;
  /* "watch live": only for a RACE of a series confirmed to stream its own races free on YouTube (data/series.js `yt`).
     The player lives in its own element above this card list (#hubLive) because the list below is rebuilt every
     30 s and rebuilding an iframe would restart the stream. See updateHubLive().
     Unlike the session cards (which drop a session 10 minutes before its end) the stream stays up through the whole race, the
     last minutes are the ones that matter, and for STREAM_TAIL_MIN after the scheduled end, since races run over and the podium follows. */
  const liveRace=ss.find(x=>x.start<=now&&now<(+x.end)+STREAM_TAIL_MIN*60000&&kindOf(x.n)==="race"&&(seriesFor(x.n)||{}).yt);
  updateHubLive(liveRace?seriesFor(liveRace.n):null);
  const liveStreamHtml="";
  return liveStreamHtml;
}
function hubTimingCard(c){
  const {sid,live}=c;
  const liveSr=live?seriesFor(live.n):null;   /* a session is on track: show the live dot */
  /* "Live timing": same on-track-now gating as Watch live, but keyed off `timing` instead of `yt` -- most
     series have one even when they don't stream free video, so this often shows on its own. */
  /* Always there for the series in focus (not only while a session is live), so the timing page is one tap away
     before and between sessions too. Inside the iPhone app it opens as an in-app browser sheet (openLiveTiming). */
  /* the series' own timing page when it has a guide (SERIES.timing); otherwise the first event on this weekend
     with an official page (TIMING_LINKS), so F1 and NASCAR weekends get one even without a session list. */
  const timingSr=sid?SERIES.find(r=>r.id===sid):null;
  let timingUrl=null, timingName=null;
  if(timingSr&&timingSr.timing){ timingUrl=timingSr.timing; timingName=timingSr.name; }
  else { const fo=focusAt(cur); const hit=(fo?fo.group:[]).map(e=>TIMING_LINKS.find(x=>x.match.test(e.s||""))).find(Boolean); if(hit){ timingUrl=hit.url; timingName=hit.name; } }
  const liveTimingHtml=timingUrl?`<div class="hubCard hubTap" role="button" onclick="openLiveTiming('${timingUrl}')"><div class="hubLiveRow">${liveSr?'<span class="hubLiveDot"></span>':""}<h4 style="margin:0">Live timing</h4></div><div class="hubSessionSub" style="margin-top:4px">${esc(timingName)} -- ${liveSr?"live now":"opens in an in-app browser"}</div></div>`:"";
  return liveTimingHtml;
}
function hubBeforeWeekend(c){
  const {ss,now,chev,resultsHtml}=c;
  /* before the weekend: countdown actions, your starred sessions, and how it went here last time */
  let quickHtml="", dayHtml="", lastHereHtml="";
  { const fq=focusAt(cur), aw=fq?daysBetween(localToday(),fq.d):-1, upcoming=ss.filter(x=>x.end>now);
    if(fq&&aw>0){ const going=isGoing(cur,fq.first);
      quickHtml=`<div class="hubQuick"><button class="${going?"on":""}" aria-pressed="${going}" onclick="hubToggleGoing()"><svg viewBox="0 0 24 24"><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4z"/></svg>${going?"I'm going":"I'm going?"}</button>${upcoming.length?`<button onclick="addToCalendar('all')">${CAL_SVG}Add to calendar</button>`:""}</div>`; }
    const mine=upcoming.filter(x=>isStarred(cur,x));
    if(mine.length) dayHtml=`<div class="hubCard hubTap" role="button" onclick="showNowSession()"><div class="hubCardRow"><h4>Your sessions</h4>${chev}</div><div class="hubStarList">${mine.slice(0,6).map(x=>`<div><b>${fmtWhen(x.start,cur.tz)}</b><span>${esc(shortName(x.n))}</span></div>`).join("")}</div><p class="asof hubAsof">${nativeNotifier()?"You'll get an alert 10 minutes before each one.":"Star more in the schedule."}</p></div>`;
    else if(upcoming.length&&aw>=0&&aw<=10) dayHtml=`<div class="hubCard hubTap" role="button" onclick="showNowSession()"><div class="hubCardRow"><div><h4>Plan your weekend</h4><div class="hubSessionSub">Star the sessions you care about in the schedule and get an alert before each.</div></div>${chev}</div></div>`;
    if(!resultsHtml&&aw>0&&typeof RESULTS!=="undefined"){ const last=RESULTS.filter(r=>r.t===cur.id).sort((a,b)=>b.d.localeCompare(a.d))[0];
      if(last) lastHereHtml=`<div class="hubCard"><h4>Last time here</h4><div class="hubSeries">${esc(last.event)}</div>${last.groups.slice(0,2).map(g=>resultGroupHtml(g,3)).join("")}</div>`; } }
  return {quickHtml,dayHtml,lastHereHtml};
}
function renderHub(){
  if(!hubMode) return;
  const nameEl=document.getElementById("hubTrackName"); if(nameEl) nameEl.textContent=cur.short;
  const body=document.getElementById("hubBody"); if(!body) return;
  const ss=sessionsResolved(), now=new Date();
  const live=currentSession(ss,now), next=ss.find(s=>s.start>now);
  const chev=`<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;
  const ctx={ss,now,live,next,chev,liveAll:ss.filter(x=>x.start<=now&&now<x.end&&x.end-now>10*60000)};
  const sessionHtml=hubSessionCard(ctx), stripHtml=hubTodayStrip(ctx), wxHtml=hubWeatherCard(), actionsHtml=hubActionTiles();
  const fs=hubFocusSeries(ctx); ctx.sid=fs.sid; ctx.fav=fs.fav;
  const watchHtml=hubWatchCard(ctx), standingsHtml=hubStandingsCard(ctx);
  const resultsHtml=hubResultsCard(ctx); ctx.resultsHtml=resultsHtml;
  const liveStreamHtml=hubLiveStream(ctx), liveTimingHtml=hubTimingCard(ctx);
  const {quickHtml,dayHtml,lastHereHtml}=hubBeforeWeekend(ctx);
  const gm=gameNow(), gameHtml=gm?gameCardHtml(gm,chev):"", lv=liveSrc(), liveHtml=lv?liveCardHtml(lv,chev):""; if(lv) liveStart();
  body.innerHTML=sessionHtml+quickHtml+dayHtml+liveHtml+resultsHtml+gameHtml+stripHtml+wxHtml+liveTimingHtml+actionsHtml+watchHtml+standingsHtml+lastHereHtml+liveStreamHtml;
  /* keep the Today strip pinned to the live/next session instead of wherever it happens to scroll to --
     body.innerHTML just replaced it, so it's back at scrollLeft 0 (the day's first, likely-past session)
     every render unless we reposition it. */
  const stripEl=body.querySelector(".hubStrip");
  if(stripEl){
    const target=stripEl.querySelector(".hubChip.live")||[...stripEl.querySelectorAll(".hubChip")].find(c=>!c.classList.contains("past"))||stripEl.lastElementChild;
    if(target) stripEl.scrollLeft=Math.max(0,target.offsetLeft-stripEl.offsetLeft);
  }
}
const CAL_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>';
function renderSchedule(){
  tzNote();
  renderWatch();
  const sec=document.getElementById("schedSection"); const ss=sessionsResolved(), fo=focusAt(cur);
  if(!fo){ sec.hidden=true; return; }
  document.getElementById("schedTools").innerHTML="";
  const names=[...new Set(fo.group.map(e=>e.e))].join(" · ");
  if(!ss.length){       /* the next weekend has no session times yet */
    const on=fo.d<=localToday(), when=fo.group.length>1?fmtRange({d:fo.d,t:daysBetween(fo.d,fo.end)+1}):fmtRange(fo.first);
    sec.hidden=false; document.getElementById("schedTitle").textContent=on?"This weekend":"Next up";
    document.getElementById("schedDays").innerHTML="";
    document.getElementById("schedList").innerHTML=`<div class="item nextcard"><div><h4>${esc(names)}</h4><p class="series">${esc(when)}${fo.group.length?` · ${esc([...new Set(fo.group.map(e=>e.s))].join(" + "))}`:""}</p><p class="series">Session times are not published yet. They will show here once the series releases them.</p></div></div>`;
    return;
  }
  sec.hidden=false; document.getElementById("schedTitle").textContent=names||cur.eventName||"This weekend"; const now=new Date();
  const days=[...new Set(ss.map(s=>s.d))];
  if(!days.includes(schedDay)){ const t=now.toLocaleDateString("en-CA",{timeZone:cur.tz}); schedDay=days.includes(t)?t:(days.find(d=>d>=t)||days[0]); }
  document.getElementById("schedDays").innerHTML=days.map(d=>{ const [y,m,dd]=d.split("-").map(Number), wd=new Date(Date.UTC(y,m-1,dd,12)).toLocaleDateString("en-US",{timeZone:"UTC",weekday:"short"});
    const live=ss.some(s=>s.d===d&&s.start<=now&&now<s.end); return `<button class="day${d===schedDay?" on":""}${live?" live":""}" onclick="pickDay('${d}')"><small>${wd}</small><b>${dd}</b></button>`; }).join("");
  document.getElementById("schedList").innerHTML=ss.map((s,i)=>({s,i})).filter(x=>x.s.d===schedDay).map(({s,i})=>{ const live=s.start<=now&&now<s.end, past=s.end<=now, sr=seriesFor(s.n);
    const chips=sr&&sr.cars.length>1?`<span class="chips">${sr.cars.map(chipHtml).join("")}</span>`:"";
    const inner=`<div class="st">${fmtTime(s.start,cur.tz)}${s.est?"":`<small>to ${fmtTime(s.end,cur.tz)}</small>`}</div><div class="sn">${s.n}${live?"<em>On track now</em>":(!past&&s.start-now<36e5?`<em>${relTime(s.start-now)}</em>`:"")}${chips}</div>${sr?`<span class="ib" aria-hidden="true">i</span>`:""}`;
    const on=isStarred(cur,s), star=past||live?"":`<button class="sstar${on?" on":""}" aria-pressed="${on}" aria-label="${on?"Remove from my sessions":"Alert me before this session"}" onclick="event.stopPropagation();toggleStar(${i})"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg></button>`;
    return sr?`<div class="sess tap ${live?"live":past?"past":""}" role="button" tabindex="0" onclick="showInfo(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();showInfo(${i})}" aria-label="About ${esc(s.n)}">${inner}${star}</div>`:`<div class="sess ${live?"live":past?"past":""}">${inner}${star}</div>`; }).join("");
  const mineN=ss.filter(x=>x.end>now&&isStarred(cur,x)).length, soonN=ss.filter(x=>x.end>now).length;
  document.getElementById("schedTools").innerHTML=soonN?`<button class="pill" onclick="addToCalendar('all')">${CAL_SVG}Add weekend to calendar</button>${mineN?`<button class="pill" onclick="addToCalendar('mine')">${CAL_SVG}My ${mineN} session${mineN>1?"s":""}</button>`:""}`:"";
}
/* ---- series guide (data/series.js) ---- */
function seriesFor(name){ return SERIES.find(s=>s.match.test(name))||null; }
function kindOf(n){ return /qualifying/i.test(n)?"qualifying":/practice/i.test(n)?"practice":"race"; }
const DEFAULT_WATCH={
  practice:"Teams tune their cars for the weekend, so lap times matter less than what the cars are trying. It is a good time to walk the paddock and see the cars up close.",
  qualifying:"Drivers go for one fast lap to decide the starting order. It is short and intense, and the front row is settled here.",
  race:"Position on track is what counts. Watch for passes, pit stops and restarts after yellow flags."
};
function chipHtml(c){ return `<i class="cc" style="--c:${c.c};--f:${c.fg||"#fff"}">${c.n}</i>`; }
function showInfo(i){
  const s=sessionsResolved()[i], sr=s&&seriesFor(s.n); if(!sr) return;
  const kind=kindOf(s.n), label={practice:"Practice",qualifying:"Qualifying",race:"Race"}[kind];
  const watch=(sr.watch&&sr.watch[kind])||DEFAULT_WATCH[kind], specials=(sr.specials||[]).filter(x=>x.match.test(s.n));
  document.getElementById("infoBody").innerHTML=`
    <div class="mhead">${seriesMark(sr.id,84)}<div><div class="mkick">${sr.tag}</div><h3 id="infoTitle">${sr.name}</h3></div></div><p class="mblurb">${sr.blurb}</p>
    <div class="mnow"><b>${label}: what to watch</b><p>${watch}</p>${specials.map(x=>`<p><b>${x.title}.</b> ${x.text}</p>`).join("")}</div>
    <h4 class="mh">${sr.cars.length>1?"The classes":"The car"}</h4>
    ${sr.cars.map(c=>`<div class="ccard"><div class="chead">${chipHtml(c)}<div><strong>${c.full}</strong><small>${c.type}</small></div>${c.pace?`<span class="pace">${c.pace}</span>`:""}</div><p>${c.text}</p>${c.spot?`<p class="spot"><b>How to spot it:</b> ${c.spot}</p>`:""}</div>`).join("")}
    ${sr.rule?`<div class="mrule"><b>Telling them apart</b><p>${sr.rule}</p></div>`:""}
    <p class="mfine">${sr.fine||"A spectator summary based on IMSA's 2026 class lineup. For official details, see IMSA.com."}</p>`;
  const m=document.getElementById("infoModal"); m.hidden=false; document.body.style.overflow="hidden"; m.querySelector(".mcard").scrollTop=0; m.querySelector(".sclose").focus();
}
function showSeriesInfo(id){
  const c=champ(id), sr=c&&SERIES.find(s=>s.id===c.guide); if(!sr) return;
  const card=x=>`<div class="ccard"><div class="chead">${chipHtml(x)}<div><strong>${x.full}</strong><small>${x.type}</small></div>${x.pace?`<span class="pace">${x.pace}</span>`:""}</div><p>${x.text}</p>${x.spot?`<p class="spot"><b>How to spot it:</b> ${x.spot}</p>`:""}</div>`;
  document.getElementById("infoBody").innerHTML=`
    <div class="mhead">${seriesMark(sr.id,84)}<div><div class="mkick">${sr.tag}</div><h3 id="infoTitle">${sr.name}</h3></div></div><p class="mblurb">${sr.blurb}</p>
    <div class="mnow"><b>What to watch</b><p>${(sr.watch&&sr.watch.race)||DEFAULT_WATCH.race}</p>${(sr.specials||[]).map(x=>`<p><b>${x.title}.</b> ${x.text}</p>`).join("")}</div>
    <h4 class="mh">${sr.cars.length>1?"The classes":"The car"}</h4>${sr.cars.map(card).join("")}
    ${sr.rule?`<div class="mrule"><b>Telling them apart</b><p>${sr.rule}</p></div>`:""}
    <p class="mfine">${sr.fine||"A spectator summary. For official details, see the series website."}</p>`;
  const m=document.getElementById("infoModal"); m.hidden=false; document.body.style.overflow="hidden"; m.querySelector(".mcard").scrollTop=0; m.querySelector(".sclose").focus();
}
function closeInfo(){ document.getElementById("infoModal").hidden=true; document.body.style.overflow=""; }
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeInfo(); });

/* pull down to dismiss any panel that pops up from the bottom of the screen (the POI/GPS/directions/weather
   sheet, and the session/series info card). Only takes over once the panel is already scrolled to its own top,
   so it never fights with scrolling long content inside it -- the same convention native bottom sheets use. */
function enableSwipeDown(panel,onClose){
  if(!panel) return;
  let sy=0,dy=0,dragging=false,moved=false;
  panel.addEventListener("touchstart",e=>{ if(panel.hidden) return; sy=e.touches[0].clientY; dy=0; moved=false; dragging=panel.scrollTop<=0; panel.style.transition="none"; },{passive:true});
  panel.addEventListener("touchmove",e=>{
    if(panel.hidden) return;
    if(!dragging){ if(panel.scrollTop<=0){ dragging=true; sy=e.touches[0].clientY; } else return; }
    dy=e.touches[0].clientY-sy;
    if(dy>4){ moved=true; panel.style.transform=`translateY(${dy}px)`; }
    else if(dy<0){ dragging=false; moved=false; panel.style.transform=""; }
  },{passive:true});
  panel.addEventListener("touchend",()=>{
    panel.style.transition=""; panel.style.transform="";
    if(moved&&dy>70) onClose();
    dragging=false; moved=false; dy=0;
  });
}
enableSwipeDown(document.getElementById("sheet"),closeSheet);
enableSwipeDown(document.querySelector("#infoModal .mcard"),closeInfo);
let schedDay=null;
function pickDay(d){ schedDay=d; renderSchedule(); }
/* the top "On Track / Next" pill: open the events tab on the right day with the current (or next) session in the middle of the screen */
function showNowSession(){
  const now=new Date(), ss=sessionsResolved(), tgt=ss.find(s=>s.start<=now&&now<s.end)||ss.find(s=>s.start>now);
  if(tgt) schedDay=tgt.d;
  document.querySelector(".tabs button[data-p=pEvents]").click(); renderSchedule();
  requestAnimationFrame(()=>{ const l=document.getElementById("schedList"), el=l&&(l.querySelector(".sess.live")||l.querySelector(".sess:not(.past)")); if(el) el.scrollIntoView({block:"center"}); });
}
setInterval(()=>{ if(document.getElementById("home").classList.contains("on")) renderHero(); if(cur){ renderNow(); if(hubMode) renderHub(); if(document.getElementById("pEvents").classList.contains("on")){ renderSchedule(); renderEvents(); } else if(document.getElementById("pInfo").classList.contains("on")) renderWatch(); } },30000);
/* origin for walk times and nearest */
function walkOrigin(){ if(userPos&&userPos.inside) return {x:userPos.x,y:userPos.y,l:"you"}; const s=getSpot(); if(s) return {x:s.x,y:s.y,l:"your spot"}; return null; }
function distField(sx,sy){
  const r=cur.route, nx=r.nx, ny=r.ny, rows=walkRows(), N=nx*ny; const dist=new Float64Array(N).fill(Infinity), real=new Float64Array(N).fill(Infinity), done=new Uint8Array(N);
  const id=(x,y)=>y*nx+x; dist[id(sx,sy)]=0; real[id(sx,sy)]=0; const heap=[[0,id(sx,sy)]];
  const push=(it)=>{ heap.push(it); let i=heap.length-1; while(i>0){ const p=(i-1)>>1; if(heap[p][0]<=heap[i][0]) break; [heap[p],heap[i]]=[heap[i],heap[p]]; i=p; } };
  const pop=()=>{ const top=heap[0], last=heap.pop(); if(heap.length){ heap[0]=last; let i=0; for(;;){ const l=2*i+1,rr=l+1; let m=i; if(l<heap.length&&heap[l][0]<heap[m][0]) m=l; if(rr<heap.length&&heap[rr][0]<heap[m][0]) m=rr; if(m===i) break; [heap[m],heap[i]]=[heap[i],heap[m]]; i=m; } } return top; };
  while(heap.length){ const [d,u]=pop(); if(done[u]) continue; done[u]=1; const x=u%nx, y=(u-x)/nx;
    for(let dx=-1;dx<=1;dx++) for(let dy=-1;dy<=1;dy++){ if(!dx&&!dy) continue; const X=x+dx,Y=y+dy; if(X<0||X>=nx||Y<0||Y>=ny) continue; if(rows[Y][X]==="1") continue; if(dx&&dy&&(rows[y][X]==="1"||rows[Y][x]==="1")) continue;
      const step=(dx&&dy?1.4142:1); const w=step*(rows[Y][X]==="2"?0.65:1); const v=id(X,Y); const nd=d+w; if(nd<dist[v]){ dist[v]=nd; real[v]=real[u]+step; push([nd,v]); } } }
  return real;
}
let fieldCache=null;
function walkMetresTo(x,y){
  const o=walkOrigin(); if(!o||!cur.route) return null;
  walkRows(); const key=cur.id+":"+o.x+","+o.y+"|"+walkCache.key; if(!fieldCache||fieldCache.key!==key){ const [sx,sy]=nearestFree(...gridCell(o.x,o.y)); fieldCache={key,dist:distField(sx,sy)}; }
  const [tx,ty]=nearestFree(...gridCell(x,y)); const d=fieldCache.dist[ty*cur.route.nx+tx]; if(!isFinite(d)) return null;
  return d*cur.route.cell*cur.route.mpu;
}
function walkLabel(m){ return distLabel(m); }
function nearest(kind){
  const o=walkOrigin();
  if(!cur.route){ toast("Directions aren\'t available on this track yet."); return; }
  if(!o){ toast("Turn on location, or save your spot, so I know where you are."); showSheet("shGps"); return; }
  const ov=layoutOverrides(); const all=cur.pois.map(p=>applyOv(p,ov[pid(p)])).concat(userStands().map(s=>({k:"food",n:s.n,x:s.x,y:s.y})));
  const label={rest:"restroom",food:"food",water:"water",med:"medical"}[kind];
  const cands=all.map((p,i)=>({p,i})).filter(c=>!c.p.del&&(c.p.k===kind||(kind==="water"&&/water/i.test(c.p.n))));
  if(!cands.length){ toast(kind==="water"?"No water stations mapped at this track yet.":`No ${label} mapped here yet.`); return; }
  let best=null; for(const c of cands){ const m=walkMetresTo(c.p.x,c.p.y); if(m!==null&&(best===null||m<best.m)) best={...c,m}; }
  if(!best){ toast(`Can\'t find a walking route to a ${label} from here.`); return; }
  routeDest=best.i; following=false; devHeading=null; const sel=document.getElementById("dirFrom"); const os=routeOrigins(); sel.innerHTML=os.map(q=>`<option value="${q.v}">${q.l}</option>`).join(""); sel.value=os[0].v;
  const w=document.getElementById("dirWalk"); if(w) w.textContent="Start walking";
  showSheet("shDir"); computeRoute(); document.getElementById("dirTo").textContent=`Nearest ${label}: ${best.p.n}`;
}
/* lot outlines: overrides + editing */
function lotOverrides(){ try{ return JSON.parse(localStorage.getItem(K.lots+cur.id)||"{}"); }catch(e){ return {}; } }
function saveLot(name,pts){ const o=lotOverrides(); o[name]=pts.map(p=>[Math.round(p[0]*10)/10,Math.round(p[1]*10)/10]); try{ localStorage.setItem(K.lots+cur.id, JSON.stringify(o)); }catch(e){} }
function parsePath(d){ return d.replace(/[MLZ]/g," ").trim().split(/\s+/).map(s=>s.split(",").map(Number)).filter(p=>p.length===2&&!isNaN(p[0])); }
function lotPoints(l){ const o=lotOverrides()[l.n]; if(o) return o; if(l.d) return parsePath(l.d); const n=10; return Array.from({length:n},(_,i)=>[l.x+l.r*Math.cos(i/n*2*Math.PI),l.y+l.r*Math.sin(i/n*2*Math.PI)]); }
function ptsPath(pts){ return "M"+pts.map(p=>p[0].toFixed(1)+","+p[1].toFixed(1)).join(" L")+" Z"; }
function lotLayerSvg(t){
  const ov=layoutOverrides(), gone=new Set(t.pois.filter(p=>ov[pid(p)]&&ov[pid(p)].del).map(p=>p.n));
  return (t.lots||[]).map((l,li)=>{ if(gone.has(l.n)) return ""; const pts=lotPoints(l); let s=`<g style="--c:${l.c}" data-lot="${li}"><path class="lotshape" data-lot="${li}" d="${ptsPath(pts)}"/>`;
    if(editing&&parking){ s+=pts.map((p,i)=>{ const q=pts[(i+1)%pts.length]; return `<circle class="mid" data-lot="${li}" data-i="${i}" cx="${(p[0]+q[0])/2}" cy="${(p[1]+q[1])/2}" r="3.5"/>`; }).join("")+pts.map((p,i)=>`<circle class="vtx" data-lot="${li}" data-i="${i}" cx="${p[0]}" cy="${p[1]}" r="5"/>`).join(""); }
    return s+"</g>"; }).join("");
}
function redrawLots(){ const ll=document.getElementById("lotLayer"); if(ll) ll.innerHTML=lotLayerSvg(cur); }
let lastVtxTap=null;
/* parking mode */
let parking=false;
function setParkingUI(){ redrawLots(); document.getElementById("parkBtn").classList.toggle("on",parking); document.getElementById("mapWrap").classList.toggle("parking",parking); const ll=document.getElementById("lotLayer"); if(ll) ll.style.display=parking?"":"none"; }
function toggleParking(){
  if(!parking&&mode) setMode(null);
  parking=!parking; setParkingUI();
  closeSheet();
  document.querySelectorAll('.poi[data-k="park"]').forEach(el=>el.style.display=parking?"":"none");
  applyView();
}
/* focus modes: Restrooms and Camping work like Parking: only the relevant badges show */
let mode=null, modeAt=0;
/* modes that just filter the map to one kind and highlight the closest one, no popup card */
const QUIET_MODES=["rest","food","merch","view"];
function setMode(m){
  clearNear(); mode=m; const w=document.getElementById("mapWrap"); if(!w) return;
  w.classList.toggle("m-rest",m==="rest"); w.classList.toggle("m-camp",m==="camp"); w.classList.toggle("m-food",m==="food"); w.classList.toggle("m-merch",m==="merch"); w.classList.toggle("m-view",m==="view");
  document.getElementById("restBtn").classList.toggle("on",m==="rest");
  document.getElementById("foodBtn").classList.toggle("on",m==="food");
  /* Merch and Best views have no button on the map (they open from the hub), so while one is on, a small chip says so and clears it */
  const chip=document.getElementById("modeChip"); if(chip){ const lab={merch:"Merch",view:"Best views"}[m]; chip.hidden=!lab; if(lab) chip.firstElementChild.textContent=lab; }
}
function clearMode(){ setMode(null); closeSheet(); applyView(); }
function toggleMode(m){
  if(mode===m){ setMode(null); closeSheet(); applyView(); return; }
  if(parking) toggleParking();
  setMode(m); closeSheet(); refreshMode(!QUIET_MODES.includes(m));
}
function clearNear(){
  document.querySelectorAll(".poi.near").forEach(el=>{ el.classList.remove("near"); const lab=el.querySelector(".plabel"); if(lab&&lab.dataset.orig){ lab.textContent=lab.dataset.orig; delete lab.dataset.orig; } });
}
function refreshMode(show){
  if(!mode) return; clearNear();
  const kind=mode, quiet=QUIET_MODES.includes(mode), o=walkOrigin(), ov=layoutOverrides(), mins=m=>Math.max(1,Math.round(m/80));
  const items=cur.pois.map(p=>applyOv(p,ov[pid(p)])).map((p,i)=>({p,i})).filter(c=>!c.p.del&&c.p.k===kind)
    .map(c=>({...c,m:(o&&cur.route)?walkMetresTo(c.p.x,c.p.y):null}));
  items.sort((a,b)=>((a.m===null)-(b.m===null))||(a.m-b.m));
  const best=items.length&&items[0].m!==null?items[0]:null;
  if(quiet&&best){ const el=document.querySelector(`.poi[data-i="${best.i}"]`); if(el){ el.classList.add("near"); const lab=el.querySelector(".plabel"); lab.dataset.orig=lab.textContent; lab.textContent+=` · ${mins(best.m)} min`; } }
  const noWhere=!o&&(watchId!==null?"Location is on, but you're not at the track. Save your spot to see walk times.":"Turn on location or save your spot to see walk times.");
  const modeLabel={rest:"Restrooms",food:"Concessions",merch:"Merchandise",view:"Best views",camp:"Camping"}[mode];
  document.getElementById("modeDot").style.setProperty("--c",KINDS[kind].c);
  document.getElementById("modeTitle").textContent=modeLabel;
  document.getElementById("modeNote").textContent=quiet
    ? (best?`Closest: ${best.p.n}, ${mins(best.m)} min walk (${walkLabel(best.m)}) from ${o.l}.`:(noWhere||"No walking route found from here."))
    : mode==="view" ? `Good places to watch from. Tap one for details and directions.${o?"":" "+noWhere}`
    : `Camp areas and restrooms.${showersAvailable()?" The blue shower icon marks restrooms with showers.":""}${o?"":" "+noWhere}`;
  const btn=document.getElementById("modeBtn"), go=document.getElementById("modeGo");
  if(quiet&&best){ go.hidden=false; btn.textContent="Directions to closest"; btn.onclick=()=>{ selectPoi(best.i); startDirections(); }; }
  else if(!o&&watchId===null){ go.hidden=false; btn.textContent="Use my location"; btn.onclick=()=>startGps(true); }
  else go.hidden=true;
  document.getElementById("modeList").innerHTML=items.map(c=>`<button class="lotrow" style="--c:${KINDS[kind].c}" onclick="selectPoi(${c.i})"><i></i>${kind==="camp"?(c.p.d||c.p.n):c.p.n}${c.m!==null?`<small>${mins(c.m)} min</small>`:""}</button>`).join("")||`<div class="empty">Nothing mapped here yet.</div>`;
  if(show) showSheet("shMode");
  applyView();
}
/* save my spot */
let placing=false;
function getSpot(){ try{ return JSON.parse(localStorage.getItem(K.spot+cur.id)||"null"); }catch(e){ return null; } }
function setSpot(x,y){ fieldCache=null; const s={x:Math.round(x),y:Math.round(y),t:Date.now()}; try{ localStorage.setItem(K.spot+cur.id, JSON.stringify(s)); }catch(e){} renderSpot(); if(mode) refreshMode(false); showSpot(); }
function renderSpot(){ const s=getSpot(); const btn=document.getElementById("spotBtn"); btn.classList.toggle("set",!!s); btn.classList.toggle("placing",placing); document.getElementById("mapWrap").classList.toggle("placing",placing);
  let layer=document.getElementById("spotLayer"); if(!layer) return; layer.innerHTML=s?`<g id="spotPin" transform="translate(${s.x},${s.y})"><g class="sc"><path d="M0,2 C-7,-7 -9,-11 -9,-15 a9,9 0 0 1 18,0 c0,4 -2,8 -9,17z" fill="var(--accent)" stroke="#fff" stroke-width="1.8"/><circle cy="-15" r="3.2" fill="#fff"/><text y="10" text-anchor="middle" font-size="10" font-weight="600" fill="var(--ink)" stroke="var(--paper)" stroke-width="2.5" paint-order="stroke">My spot</text></g></g>`:""; applyView(); }
function showSpot(){ const s=getSpot(); if(!s) return; const when=new Date(s.t); document.getElementById("spotText").textContent=`Saved ${when.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}. Your car, campsite, or seat, so you can find your way back.`; showSheet("shSpot"); }
function saveSpot(){
  if(placing){ placing=false; renderSpot(); toast("Cancelled."); return; }
  if(getSpot()&&!placing){ showSpot(); return; }
  if(userPos&&userPos.inside){ setSpot(userPos.x,userPos.y); toast("Spot saved where you're standing."); return; }
  placing=true; renderSpot(); closeSheet(); toast("Tap the map where your car, campsite, or seat is.");
}
function forgetSpot(){
  fieldCache=null; try{ localStorage.removeItem(K.spot+cur.id); }catch(e){}
  /* the active route can have the spot as either end -- routing TO it (routeDest==="spot") or FROM it
     (the "From" picker set to "spot"); forgetting the spot should drop the drawn line either way. */
  const fromSel=document.getElementById("dirFrom");
  if(routeDest==="spot"||(fromSel&&fromSel.value==="spot")) clearRoute();
  closeSheet(); renderSpot(); if(mode) refreshMode(false); toast("Spot forgotten.");
}
function routeToSpot(){ if(!getSpot()||!cur.route){ toast("Directions aren\'t available on this track yet."); return; } routeDest="spot"; following=false; devHeading=null; const sel=document.getElementById("dirFrom"); const os=routeOrigins(); sel.innerHTML=os.map(o=>`<option value="${o.v}">${o.l}</option>`).join(""); sel.value=os[0].v; const w=document.getElementById("dirWalk"); if(w) w.textContent="Start walking"; showSheet("shDir"); computeRoute(); }
/* developer unlock (prototype stand-in for an editor role) */
let devTaps=0, devTimer=null;
function isDev(){ try{ return localStorage.getItem(K.dev)==="1"||location.hash==="#dev"; }catch(e){ return location.hash==="#dev"; } }
function applyDev(){ const on=isDev(); const b=document.getElementById("editBtn"); if(b) b.hidden=!on; if(!on&&editing) toggleEdit(); const hb=document.getElementById("hubPreviewBtn"); if(hb) hb.hidden=!on; }
function devTap(){ devTaps++; clearTimeout(devTimer); devTimer=setTimeout(()=>devTaps=0,1500);
  if(devTaps>=7){ devTaps=0; const on=!isDev(); try{ localStorage.setItem(K.dev,on?"1":"0"); }catch(e){} applyDev(); toast(on?"Developer tools unlocked.":"Developer tools hidden."); } }
/* edit mode: drag badges */
let editing=false;
document.getElementById("peKind").innerHTML=Object.entries(KINDS).filter(([k])=>k!=="shower").map(([k,v])=>`<option value="${k}">Icon: ${v.label}</option>`).join("");
function layoutOverrides(){ try{ return JSON.parse(localStorage.getItem(K.layout+cur.id)||"{}"); }catch(e){ return {}; } }
function pid(p){ return p.id||p.n; }  /* stable key for edits, so badges can share a display name */
function applyOv(p,o){ if(!o) return p; if(Array.isArray(o)) return {...p,x:o[0],y:o[1]}; const q={...p}; if(o.x!==undefined){q.x=o.x;q.y=o.y;} if(o.n) q.n=o.n; if(o.d!==undefined) q.d=o.d; if(o.k&&KINDS[o.k]) q.k=o.k; if(o.del) q.del=true; if(o.shower!==undefined) q.shower=!!o.shower; return q; }
function getOv(name){ const o=layoutOverrides()[name]; if(!o) return {}; return Array.isArray(o)?{x:o[0],y:o[1]}:o; }
function putOv(name,patch){ const all=layoutOverrides(); const cur_=getOv(name); const merged={...cur_,...patch}; all[name]=merged; try{ localStorage.setItem(K.layout+cur.id, JSON.stringify(all)); }catch(e){} }
function saveOverride(name,x,y){ putOv(name,{x:Math.round(x),y:Math.round(y)}); }
function savePoiEdit(){ if(popI===null||popI>=cur.pois.length) return; const orig=cur.pois[popI]; const n=document.getElementById("peName").value.trim(); if(!n){ toast("Name can\'t be empty."); return; } const kind=document.getElementById("peKind").value; putOv(pid(orig),{n,d:document.getElementById("peDesc").value.trim(),k:kind,shower:kind==="rest"?document.getElementById("peShower").checked:undefined}); renderMap(); renderSpot(); renderFood(); computeRoute(); selectPoi(popI); applyView(); toast("Saved."); }
/* dev mode: add a badge (saved on this device; "Copy layout" exports it so it can be baked into the data) */
let addingBadge=false;
function loadAdded(){ try{ return JSON.parse(localStorage.getItem(K.added+cur.id)||"[]"); }catch(e){ return []; } }
function saveAdded(list){ try{ localStorage.setItem(K.added+cur.id, JSON.stringify(list)); }catch(e){} }
function syncPois(){ if(!cur._base) cur._base=cur.pois; cur.pois=cur._base.concat(loadAdded().map(a=>({...a,added:true}))); }
function startAddBadge(){
  addingBadge=!addingBadge; document.getElementById("mapWrap").classList.toggle("adding",addingBadge);
  const b=document.getElementById("addBadgeBtn"); b.classList.toggle("on",addingBadge); b.textContent=addingBadge?"Cancel adding":"Add badge";
  if(addingBadge){ closeSheet(); toast("Tap the map where the new badge goes."); }
}
function createBadge(x,y){
  const id="new-"+Date.now().toString(36), list=loadAdded(); list.push({id,k:"info",n:"New badge",d:"",x:Math.round(x),y:Math.round(y)}); saveAdded(list);
  startAddBadge(); if(!layers.has("info")){ layers.add("info"); renderLegend(); }
  syncPois(); renderMap(); renderSpot(); applyView(); selectPoi(cur.pois.findIndex(p=>p.id===id)); toast("Badge added. Give it a name and an icon below.");
}
function deletePoi(){
  if(popI===null||popI>=cur.pois.length) return; const orig=cur.pois[popI], name=document.getElementById("pcName").textContent;
  if(!confirm(`Delete "${name}" from the map?\n\n"Reset badges" brings deleted badges back.`)) return;
  if(orig.added){ saveAdded(loadAdded().filter(a=>a.id!==orig.id)); const all=layoutOverrides(); delete all[orig.id]; try{ localStorage.setItem(K.layout+cur.id, JSON.stringify(all)); }catch(e){} syncPois(); } else putOv(pid(orig),{del:true});
  if(routeDest===popI) clearRoute(); closeSheet(); renderMap(); renderSpot(); renderFood(); redrawLots(); applyView(); toast("Deleted.");
}
function revertPoiEdit(){ if(popI===null||popI>=cur.pois.length) return; const orig=cur.pois[popI]; const o=getOv(pid(orig)); delete o.n; delete o.d; delete o.k; delete o.shower; const all=layoutOverrides(); if(Object.keys(o).length) all[pid(orig)]=o; else delete all[pid(orig)]; try{ localStorage.setItem(K.layout+cur.id, JSON.stringify(all)); }catch(e){} renderMap(); renderFood(); applyView(); selectPoi(popI); toast("Name, icon and description reverted."); }
function toggleEdit(){ editing=!editing; if(!editing&&addingBadge) startAddBadge(); setTimeout(redrawLots,0); document.getElementById("editBtn").classList.toggle("on",editing); document.getElementById("editBar").hidden=!editing; document.getElementById("mapWrap").classList.toggle("editing",editing); document.getElementById("layoutOut").hidden=true; if(editing) toast("Drag badges to move them. Tap one to rename."); }
function exportLayout(){ const o=layoutOverrides(); const ta=document.getElementById("layoutOut"); ta.hidden=false; ta.value=JSON.stringify({track:cur.id,moved:o,lots:lotOverrides(),added:loadAdded()},null,1); ta.select(); try{ navigator.clipboard&&navigator.clipboard.writeText(ta.value).then(()=>toast("Layout copied. Paste it to me in the chat.")); }catch(e){} }
function resetLayout(){ if(!confirm("Reset all badge edits on this device?\n\nThis also removes badges you added.")) return; try{ localStorage.removeItem(K.layout+cur.id); localStorage.removeItem(K.lots+cur.id); localStorage.removeItem(K.added+cur.id); }catch(e){} syncPois(); renderMap(); renderSpot(); renderFood(); redrawLots(); applyView(); toast("Badges reset to the original layout."); }

let view=null;
let lastZ=0;
window.addEventListener("resize",()=>{ clearTimeout(window._rz); window._rz=setTimeout(()=>{
  if(!cur||!document.getElementById("detail").classList.contains("on")) return; const w=document.getElementById("mapWrap"), sz=w.clientWidth+"x"+w.clientHeight; if(sz===lastSize) return; lastSize=sz;
  limits=null; if(view&&view===fitted){ view=fitted=fitView(); } else if(view){ view=clampView(view); } applyView(); },150); });
function applyView(light){       /* light: only move/scale during a gesture; the label layout runs when it ends */
  const svg=document.getElementById("mapSvg"); if(!svg) return;
  if(view) svg.setAttribute("viewBox",view.map(n=>+n.toFixed(2)).join(" "));
  const v=view||cur.vb, z=cur.vb[2]/v[2];
  if(light===true&&Math.abs(z-lastZ)<1e-9) return;     /* a plain pan changes nothing else */
  lastZ=z;
  const k=Math.pow(1/z,0.85);
  svg.querySelectorAll(".sc").forEach(el=>el.setAttribute("transform",(el.classList.contains("noturn")?"":`rotate(${heading}) `)+`scale(${k})`));
  if(light===true) return;
  positionPop();
  const shown=[]; const tierMin={1:1.25,2:2.1,3:3.2};
  const inMode=el=>mode==="rest"?el.dataset.k==="rest":mode==="camp"?(el.dataset.k==="camp"||el.dataset.k==="rest"):false;
  const isNear=el=>el.classList.contains("near");
  const pois=[...svg.querySelectorAll(".poi")].filter(el=>mode?inMode(el):el.style.display!=="none").sort((a,b)=>(isNear(b)-isNear(a))||(a.dataset.tier-b.dataset.tier));
  const r=svg.getBoundingClientRect(); const px=r.width/v[2];
  pois.forEach(el=>{
    const lab=el.querySelector(".plabel"); const tier=+el.dataset.tier;
    let on = ((parking&&el.dataset.k==="park")||inMode(el)||isNear(el)) ? true : z>=tierMin[tier];
    if(on){
      const x=(+el.dataset.x-v[0])*px, y=(+el.dataset.y-v[1])*px;
      const w=lab.textContent.length*5.6+8, hgt=14; const box={x:x-w/2,y:y+8,w,h:hgt};
      if(shown.some(b=>!(box.x>b.x+b.w||box.x+box.w<b.x||box.y>b.y+b.h||box.y+box.h<b.y))) on=false; else shown.push(box);
    }
    lab.classList.toggle("on",on);
  });
  declutter(svg,pois,k*px);
}
/* Zoomed out, badges that would sit on top of each other collapse into the most important one, which wears a
   "+N" bubble; zooming in separates them. The selected badge, the one you're heading to and anything in a
   finder mode (restrooms, camping, parking) always stay. unit = on-screen pixels per badge-size unit. */
const CROWD_MIN=4;   /* a group of overlapping badges only collapses once it holds this many; smaller groups stay as they are */
function declutter(svg,pois,unit){
  svg.querySelectorAll(".poi.decl").forEach(el=>el.classList.remove("decl"));
  svg.querySelectorAll(".poi .cnt").forEach(g=>{ g.style.display="none"; });
  if(mode||parking) return;
  const gap=18*unit*1.4, r=svg.getBoundingClientRect(), v=view||cur.vb, px=r.width/v[2];
  const sel=el=>el.classList.contains("sel")||isNearEl(el);
  const els=pois.filter(el=>el.style.display!=="none").map(el=>({el,x:(+el.dataset.x-v[0])*px,y:(+el.dataset.y-v[1])*px}));
  /* group badges that overlap (directly or through a neighbour) */
  const grp=els.map((_,i)=>i), find=i=>grp[i]===i?i:(grp[i]=find(grp[i]));
  for(let i=0;i<els.length;i++) for(let j=i+1;j<els.length;j++) if(Math.hypot(els[i].x-els[j].x,els[i].y-els[j].y)<gap) grp[find(j)]=find(i);
  const groups={}; els.forEach((e,i)=>(groups[find(i)]=groups[find(i)]||[]).push(e));
  Object.values(groups).forEach(g=>{
    if(g.length<CROWD_MIN) return;
    const order=g.slice().sort((a,b)=>(sel(b.el)-sel(a.el))||(a.el.dataset.tier-b.el.dataset.tier)||((KEEP[a.el.dataset.k]??9)-(KEEP[b.el.dataset.k]??9)));
    const kept=[];
    order.forEach(e=>{ const host=sel(e.el)?null:kept.find(q=>Math.hypot(q.x-e.x,q.y-e.y)<gap);
      if(host){ e.el.classList.add("decl"); host.n++; } else kept.push({el:e.el,x:e.x,y:e.y,n:0}); });
    kept.forEach(q=>{ if(q.n){ const c=q.el.querySelector(".cnt"); c.querySelector("text").textContent="+"+q.n; c.style.display=""; } });
  });
}
/* who wins a spot when badges collide: safety first, then getting around, then the rest */
const KEEP={med:0,gate:1,cross:2,screen:3,view:3,stand:4,food:5,rest:5,merch:6,info:6,camp:7};
const isNearEl=el=>el.classList.contains("near");
/* bottom sheet */
let sheetState=null;
function showSheet(id){ sheetState=id; const s=document.getElementById("sheet"); s.hidden=false; document.getElementById("nearBar").hidden=true; const bd=document.getElementById("sheetBackdrop"); if(bd) bd.hidden=false; s.querySelectorAll(".sv").forEach(v=>v.hidden=(v.id!==id)); s.scrollTop=0; }
function closeSheet(){ sheetState=null; const wasPoi=popI!==null; const s=document.getElementById("sheet"); if(s) s.hidden=true; const bd=document.getElementById("sheetBackdrop"); if(bd) bd.hidden=true; const nb=document.getElementById("nearBar"); if(nb) nb.hidden=false; popI=null; document.querySelectorAll(".poi.sel").forEach(el=>el.classList.remove("sel")); if(wasPoi) setTimeout(updateHeading,0); const lf=document.getElementById("liveFrame"); if(lf) lf.src=""; closeRadar(); }
function openLayers(){ if(sheetState==="shLayers") closeSheet(); else showSheet("shLayers"); }
let popI=null;
function selectPoi(i){
  const ov=layoutOverrides(); const all=cur.pois.map(p=>applyOv(p,ov[pid(p)])).concat(userStands().map(s=>({k:"food",n:s.n,d:s.w,p:s.p,h:"Added by you",x:s.x,y:s.y}))); const p=all[i]; if(!p) return;
  popI=i; popPoi=p; document.querySelectorAll(".poi").forEach(el=>el.classList.toggle("sel",el.dataset.i==i));
  document.getElementById("pcDot").style.setProperty("--c",KINDS[p.k].c);
  document.getElementById("pcName").textContent=p.n; document.getElementById("pcDesc").textContent=p.d||"";
  const wm=walkMetresTo(p.x,p.y); const wo=walkOrigin(); const walk=wm!==null?`${Math.max(1,Math.round(wm/80))} min walk from ${wo.l} (${walkLabel(wm)})`:null;
  document.getElementById("pcMeta").innerHTML=[walk,KINDS[p.k].label,(p.k==="rest"&&hasShower(p))?"Showers":null,p.p,p.h].filter(Boolean).map(x=>`<span>${x}</span>`).join("");
  const ed=document.getElementById("pcEdit"); const canEdit=editing&&i<cur.pois.length; ed.hidden=!canEdit; document.getElementById("pcGo").hidden=editing||!cur.route;
  document.getElementById("pcMaps").hidden=editing||!cur.geo||!(p.k==="gate"||p.k==="park");
  if(canEdit){ document.getElementById("peName").value=p.n; document.getElementById("peDesc").value=p.d||""; document.getElementById("peKind").value=p.k; document.getElementById("peShower").checked=hasShower(p); syncShowerRow(); }
  showSheet("shPoi"); updateHeading();
}
/* real-world driving directions to a gate or a parking lot, for the drive in -- separate from the in-app
   walking "Directions" above, which only makes sense once you are already inside the venue on foot. Asks
   which maps app, since Apple Maps has nothing to open on an Android phone. */
let popPoi=null;
function openPoiInMaps(provider){
  if(!popPoi||!cur.geo) return;
  const g=xyToGeo(popPoi.x,popPoi.y), lat=g.lat.toFixed(6), lng=g.lng.toFixed(6);
  const url=provider==="google"?`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`:`https://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
  window.open(url,"_blank");
}
function closePoi(){ if(sheetState==="shPoi") closeSheet(); else { popI=null; document.querySelectorAll(".poi.sel").forEach(el=>el.classList.remove("sel")); } }
function positionPop(){}
/* The map holder is 150% of the screen (centred), so the visible part is its middle two thirds.
   frame() measures the free band between the floating controls (top pill / back button above, buttons and tab bar below);
   viewFor() picks the view that puts a map box in the middle of that band. */
function frame(){
  const wrap=document.getElementById("mapWrap"); if(!wrap) return null;
  const cw=wrap.clientWidth, ch=wrap.clientHeight; if(!cw||!ch) return null;
  const wr=wrap.getBoundingClientRect(); let top=0, bot=ch, seen=false;
  const shown=e=>e&&!e.hidden&&e.getClientRects().length;
  [document.getElementById("nowPill"),document.querySelector(".fl-tl .fab")].forEach(e=>{ if(shown(e)){ top=Math.max(top,e.getBoundingClientRect().bottom-wr.top); seen=true; } });
  [document.getElementById("nearBar"),document.querySelector(".tabs")].forEach(e=>{ if(shown(e)){ bot=Math.min(bot,e.getBoundingClientRect().top-wr.top); } });
  top=seen?top+28:104; bot=ch-bot+22; if(bot<90) bot=176;
  return {cw,ch,top:Math.min(top,ch*.3),bot:Math.min(bot,ch*.4),padX:Math.min(24,cw*.06)};
}
function viewFor(f,x0,y0,x1,y1){
  const bw=Math.max(1,x1-x0), bh=Math.max(1,y1-y0), s=Math.min((f.cw-f.padX*2)/bw,Math.max(f.ch*.3,f.ch-f.top-f.bot)/bh);   /* screen px per map unit */
  const vw=1.5*f.cw/s, vh=1.5*f.ch/s, cx=(x0+x1)/2, cy=(y0+y1)/2+(f.bot-f.top)/2/s;                                       /* nudge into the free band */
  return [cx-vw/2,cy-vh/2,vw,vh];
}
function circuitBox(){ const path=document.getElementById("trackPath"); if(!path) return null; try{ const b=path.getBBox(); return b.width&&b.height?[b.x,b.y,b.x+b.width,b.y+b.height]:null; }catch(e){ return null; } }
function fitView(){ const f=frame(), c=circuitBox(); return f&&c?viewFor(f,...c):[...cur.vb]; }
/* the venue = circuit plus every badge; you can look anywhere in it, but not drift off the map */
let limits=null;
function computeLimits(){
  const f=frame(), c=circuitBox(); if(!f||!c){ limits=null; return; }
  let [x0,y0,x1,y1]=c; const ov=layoutOverrides();
  cur.pois.map(p=>applyOv(p,ov[pid(p)])).concat(userStands()).forEach(p=>{ if(p.del) return; x0=Math.min(x0,p.x); y0=Math.min(y0,p.y); x1=Math.max(x1,p.x); y1=Math.max(y1,p.y); });
  const px=(x1-x0)*.06, py=(y1-y0)*.06, v=cur.vb; x0=Math.max(v[0],x0-px); y0=Math.max(v[1],y0-py); x1=Math.min(v[0]+v[2],x1+px); y1=Math.min(v[1]+v[3],y1+py);
  limits={B:{x:x0,y:y0,w:x1-x0,h:y1-y0},maxW:Math.min(Math.max(viewFor(f,x0,y0,x1,y1)[2],viewFor(f,...c)[2]*1.12),viewFor(f,...c)[2]*1.25)}   /* zoom-out stops at 1.25x the fitted circuit: further out just shrinks the track to a speck */;
}
function clampView(v){
  if(!limits) computeLimits(); if(!limits) return v;
  let [x,y,w,h]=v; const nw=Math.max(cur.vb[2]/8,Math.min(limits.maxW,w));
  if(nw!==w){ const r=nw/w, cx=x+w/2, cy=y+h/2; w=nw; h*=r; x=cx-w/2; y=cy-h/2; }
  const B=limits.B, cx=Math.min(B.x+B.w,Math.max(B.x,x+w/2)), cy=Math.min(B.y+B.h,Math.max(B.y,y+h/2));
  return [cx-w/2,cy-h/2,w,h];
}
let anim=0, settleT=0, zRaf=0, panRaf=0, fitted=null, lastSize="";
function cancelAnim(){ if(anim){ cancelAnimationFrame(anim); anim=0; } }
function settle(){ clearTimeout(settleT); settleT=setTimeout(()=>applyView(),140); }     /* labels re-arranged once the gesture pauses */
/* glide to a view: size eases in log space (so zooming feels even), centre moves in a straight line */
function animateView(to,ms=300,isFit){
  cancelAnim(); to=clampView(to); fitted=null; const from=[...(view||cur.vb)], t0=performance.now();
  const fcx=from[0]+from[2]/2, fcy=from[1]+from[3]/2, tcx=to[0]+to[2]/2, tcy=to[1]+to[3]/2;
  const step=now=>{ const u=Math.min(1,(now-t0)/ms), e=1-Math.pow(1-u,3), w=from[2]*Math.pow(to[2]/from[2],e), h=from[3]*Math.pow(to[3]/from[3],e);
    const cx=fcx+(tcx-fcx)*e, cy=fcy+(tcy-fcy)*e; view=[cx-w/2,cy-h/2,w,h]; if(u<1){ applyView(true); anim=requestAnimationFrame(step); } else { anim=0; view=to; if(isFit) fitted=view; applyView(); } };
  anim=requestAnimationFrame(step);
}
function resetView(){ animateView(fitView(),380,true); }
function zoom(f,cx,cy,instant){        /* buttons glide; wheel and pinch pass instant=true and are smoothed by frame */
  if(!view) view=[...cur.vb];
  const [x,y,w,h]=view; cx=cx??x+w/2; cy=cy??y+h/2;
  const nv=clampView([cx-(cx-x)/f, cy-(cy-y)/f, w/f, h/f]);
  if(instant){ view=nv; fitted=null; if(!zRaf) zRaf=requestAnimationFrame(()=>{ zRaf=0; applyView(true); settle(); }); } else animateView(nv,260);
}
function panTo(v){ view=clampView(v); fitted=null; if(!panRaf) panRaf=requestAnimationFrame(()=>{ panRaf=0; applyView(true); }); }
(function(){
  const wrap=document.getElementById("mapWrap"); let drag=null, pinch=null;
  const toUnits=(dx,dy)=>{ const svg=document.getElementById("mapSvg"); const r=svg.getBoundingClientRect(); const k=view[2]/r.width; const a=heading*Math.PI/180, c=Math.cos(a), s=Math.sin(a); return [(dx*c-dy*s)*k,(dx*s+dy*c)*k]; };
  wrap.addEventListener("pointerdown",e=>{ if(e.target.closest(".sheet")) return; cancelAnim(); if(!view) view=[...cur.vb]; drag={x:e.clientX,y:e.clientY,v:[...view],poi:e.target.closest(".poi")};
    if(editing&&parking){ const v=e.target.closest(".vtx"), m=e.target.closest(".mid"), sh=e.target.closest(".lotshape"); if(v){ drag.vtx={lot:+v.dataset.lot,i:+v.dataset.i}; } else if(m){ drag.mid={lot:+m.dataset.lot,i:+m.dataset.i}; } else if(sh){ drag.shape=+sh.dataset.lot; } } try{ wrap.setPointerCapture(e.pointerId);}catch(_){} });
  wrap.addEventListener("pointermove",e=>{ if(!drag||pinch) return; const [dx,dy]=toUnits(e.clientX-drag.x,e.clientY-drag.y); if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>4) drag.moved=true;
    if(editing&&parking&&(drag.vtx||drag.shape!==undefined)){ if(!drag.moved) return; const lot=cur.lots[drag.vtx?drag.vtx.lot:drag.shape]; if(!drag.pts0) drag.pts0=lotPoints(lot).map(p=>[...p]);
      let pts; if(drag.vtx){ pts=drag.pts0.map(p=>[...p]); pts[drag.vtx.i]=[drag.pts0[drag.vtx.i][0]+dx,drag.pts0[drag.vtx.i][1]+dy]; } else { pts=drag.pts0.map(p=>[p[0]+dx,p[1]+dy]); }
      drag.ptsNow=pts; const g=document.querySelector(`#lotLayer g[data-lot="${drag.vtx?drag.vtx.lot:drag.shape}"]`); if(g){ g.querySelector(".lotshape").setAttribute("d",ptsPath(pts)); g.querySelectorAll(".vtx").forEach((c,i)=>{ c.setAttribute("cx",pts[i][0]); c.setAttribute("cy",pts[i][1]); }); g.querySelectorAll(".mid").forEach((c,i)=>{ const q=pts[(i+1)%pts.length]; c.setAttribute("cx",(pts[i][0]+q[0])/2); c.setAttribute("cy",(pts[i][1]+q[1])/2); }); }
      return; }
    if(editing&&drag.poi){ if(!drag.moved) return; const el=drag.poi; if(drag.ox===undefined){ drag.ox=+el.dataset.x; drag.oy=+el.dataset.y; } const nx=drag.ox+dx, ny=drag.oy+dy; el.dataset.x=nx; el.dataset.y=ny; el.setAttribute("transform",`translate(${nx},${ny})`); closePoi(); return; }
    panTo([drag.v[0]-dx,drag.v[1]-dy,drag.v[2],drag.v[3]]); });
  window.addEventListener("resize",positionPop);
  wrap.addEventListener("pointerup",e=>{
    if(drag&&editing&&parking){
      if(drag.moved&&drag.ptsNow){ const li=drag.vtx?drag.vtx.lot:drag.shape; const lot=cur.lots[li]; saveLot(lot.n,drag.ptsNow); if(drag.shape!==undefined){ const p=cur.pois.find(q=>q.n===lot.n); if(p){ const ov=getOv(pid(p)); const bx=(ov.x??p.x), by=(ov.y??p.y); const [ddx,ddy]=toUnits(e.clientX-drag.x,e.clientY-drag.y); saveOverride(pid(p),bx+ddx,by+ddy); renderMap(); renderSpot(); } } redrawLots(); applyView(); toast(`Updated ${lot.n}`); drag=null; return; }
      if(!drag.moved&&drag.mid){ const lot=cur.lots[drag.mid.lot]; const pts=lotPoints(lot).map(p=>[...p]); const i=drag.mid.i, q=pts[(i+1)%pts.length]; pts.splice(i+1,0,[(pts[i][0]+q[0])/2,(pts[i][1]+q[1])/2]); saveLot(lot.n,pts); redrawLots(); toast("Corner added. Drag it into place."); drag=null; return; }
      if(!drag.moved&&drag.vtx){ const key=drag.vtx.lot+":"+drag.vtx.i; if(lastVtxTap&&lastVtxTap.key===key&&Date.now()-lastVtxTap.t<700){ const lot=cur.lots[drag.vtx.lot]; const pts=lotPoints(lot).map(p=>[...p]); if(pts.length>3){ pts.splice(drag.vtx.i,1); saveLot(lot.n,pts); redrawLots(); toast("Corner removed."); } lastVtxTap=null; } else { lastVtxTap={key,t:Date.now()}; toast("Tap again to remove this corner."); } drag=null; return; }
    }
    if(drag&&!drag.moved&&!pinch){ if(placing){ const svg=document.getElementById("mapSvg"); const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const m=pt.matrixTransform(svg.getScreenCTM().inverse()); placing=false; setSpot(m.x,m.y); toast("Spot saved."); } else if(addingBadge){ const svg=document.getElementById("mapSvg"); const pt=svg.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; const m=pt.matrixTransform(svg.getScreenCTM().inverse()); createBadge(m.x,m.y); } else if(e.target.closest("#spotPin")) showSpot(); else if(drag.poi) selectPoi(+drag.poi.dataset.i); else closeSheet(); }
    else if(drag&&drag.moved&&editing&&drag.poi&&drag.ox!==undefined){ const i=+drag.poi.dataset.i; const p=cur.pois[i]; if(p){ saveOverride(pid(p),+drag.poi.dataset.x,+drag.poi.dataset.y); toast(`Moved: ${p.n}`); } applyView(); }
    drag=null; }); wrap.addEventListener("pointercancel",()=>drag=null);
  const anchorAt=(cx,cy)=>{ const svg=document.getElementById("mapSvg"), m=svg.getScreenCTM(); if(!m) return null; const pt=svg.createSVGPoint(); pt.x=cx; pt.y=cy; const p=pt.matrixTransform(m.inverse()); return [p.x,p.y]; };
  wrap.addEventListener("wheel",e=>{ e.preventDefault(); cancelAnim(); if(!view) view=[...cur.vb]; const a=anchorAt(e.clientX,e.clientY); if(!a) return; zoom(Math.exp(-Math.max(-120,Math.min(120,e.deltaY))*(e.ctrlKey?0.012:0.0022)), a[0], a[1], true); },{passive:false});
  const mid=e=>[(e.touches[0].clientX+e.touches[1].clientX)/2,(e.touches[0].clientY+e.touches[1].clientY)/2], gap=e=>Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
  wrap.addEventListener("touchstart",e=>{ if(e.touches.length===2){ cancelAnim(); if(!view) view=[...cur.vb]; const m=mid(e); pinch={d:gap(e),v:[...view],m,a:anchorAt(m[0],m[1])}; } },{passive:true});
  wrap.addEventListener("touchmove",e=>{ if(pinch&&e.touches.length===2&&pinch.a){                 /* zoom about the fingers, and follow them if they drift */
    const f=gap(e)/pinch.d, [x,y,w,h]=pinch.v, [ax,ay]=pinch.a; let nv=clampView([ax-(ax-x)/f, ay-(ay-y)/f, w/f, h/f]);
    const m=mid(e), svg=document.getElementById("mapSvg"), k=nv[2]/svg.getBoundingClientRect().width, a=heading*Math.PI/180, c=Math.cos(a), s2=Math.sin(a), dx=m[0]-pinch.m[0], dy=m[1]-pinch.m[1];
    nv=[nv[0]-(dx*c-dy*s2)*k, nv[1]-(dx*s2+dy*c)*k, nv[2], nv[3]]; view=nv; fitted=null; if(!zRaf) zRaf=requestAnimationFrame(()=>{ zRaf=0; applyView(true); settle(); }); } },{passive:true});
  wrap.addEventListener("touchend",e=>{ if(e.touches.length<2&&pinch){ pinch=null; drag=null; settle(); } },{passive:true});
})();

renderHome();
checkRaceWeek();

/* ---- open straight at the track when you are there ----
   A web app cannot wake itself or run in the background, so this happens when you open it (or come back after a while).
   It uses one coarse, cached location fix, not continuous tracking, so it costs almost no battery. */
const AUTO_KEY=K.auto;
function autoOn(){ try{ return localStorage.getItem(AUTO_KEY)==="1"; }catch(e){ return false; } }
function trackAt(lat,lng,acc){
  if(acc>2500) return null; const pad=0.004;
  const hit=TRACKS.filter(t=>t.geo&&lat<=t.geo.n+pad&&lat>=t.geo.s-pad&&lng>=t.geo.w-pad&&lng<=t.geo.e+pad);
  return hit.length ? hit.map(t=>({t,d:haversine(lat,lng,(t.geo.n+t.geo.s)/2,(t.geo.w+t.geo.e)/2)})).sort((a,b)=>a.d-b.d)[0].t : null;
}
function whereAmI(wait){        /* resolves to a track, null (not at one) or undefined (no location) */
  return new Promise(res=>{ if(!navigator.geolocation){ res(undefined); return; }
    navigator.geolocation.getCurrentPosition(p=>res(trackAt(p.coords.latitude,p.coords.longitude,p.coords.accuracy)), ()=>res(undefined), {enableHighAccuracy:false,maximumAge:600000,timeout:wait}); });
}
function inDetail(){ return document.getElementById("detail").classList.contains("on"); }
let autoBusy=false;
async function autoOpen(){
  if(!autoOn()||autoBusy||inDetail()) return; autoBusy=true;
  try{
    try{ const p=navigator.permissions&&await navigator.permissions.query({name:"geolocation"}); if(p&&p.state==="denied") return; }catch(e){}
    const t=await whereAmI(9000);
    if(t&&!inDetail()){ openTrack(t.id,"home"); toast(`You're at ${t.short}. Opened its Race Day hub.`); }
  } finally { autoBusy=false; }
}
function renderAutoSw(){ const b=document.getElementById("autoSw"); if(!b) return; const on=autoOn(); b.classList.toggle("on",on); b.setAttribute("aria-checked",on); }
async function toggleAuto(){
  if(autoOn()){ try{ localStorage.setItem(AUTO_KEY,"0"); }catch(e){} renderAutoSw(); toast("Off. The app will open on the home screen."); return; }
  toast("Checking your location…");
  const t=await whereAmI(15000);
  if(t===undefined){ toast("Location is blocked. Allow it for this app in your phone's settings, then try again."); return; }
  try{ localStorage.setItem(AUTO_KEY,"1"); }catch(e){} renderAutoSw();
  if(t){ openTrack(t.id,"home"); toast(`You're at ${t.short}. Opened its Race Day hub.`); } else toast("On. It checks each time you open the app.");
}
renderAutoSw(); renderUnitsUI(); renderAccessUI(); autoOpen();

/* ---- on-track alerts: a card pops up, like a live sports score alert, when a session goes on track while you
   are physically at the venue. Reuses the same coarse "where am I" one-shot location check as auto-open and
   passport check-in above, and the same live-session logic that drives the top pill in renderNow(). Only ever
   checked while the app is open (on load, on resume, and every 60s) -- a web app cannot wake itself up from a
   locked phone the way a native app's push notifications can. */
const ALERT_KEY=K.alerts, ALERT_SEEN_KEY=K.alertsSeen;
function alertsOn(){ try{ return localStorage.getItem(ALERT_KEY)==="1"; }catch(e){ return false; } }
function alertsSeen(){ try{ return JSON.parse(localStorage.getItem(ALERT_SEEN_KEY)||"[]"); }catch(e){ return []; } }
function markAlertSeen(id){ try{ const s=alertsSeen(); if(!s.includes(id)) localStorage.setItem(ALERT_SEEN_KEY,JSON.stringify(s.concat(id).slice(-40))); }catch(e){} }
function renderAlertSw(){ const b=document.getElementById("alertSw"); if(!b) return; const on=alertsOn(); b.classList.toggle("on",on); b.setAttribute("aria-checked",on); }
async function toggleAlerts(){
  if(alertsOn()){ try{ localStorage.setItem(ALERT_KEY,"0"); }catch(e){} renderAlertSw(); hideAlertCard(); toast("Off."); return; }
  toast("Checking your location…"); const t=await whereAmI(15000);
  if(t===undefined){ toast("Location is blocked. Allow it for this app in your phone's settings, then try again."); return; }
  try{ localStorage.setItem(ALERT_KEY,"1"); }catch(e){} renderAlertSw();
  toast(t?`You're at ${t.short}. It'll pop up when a session is on track.`:"On. It checks whenever you have the app open at a track.");
  checkAlerts();
}
function sessionsAt(t){ const f=focusAt(t); return f?sessionsOf(t).filter(x=>x.d>=f.d&&x.d<=f.end):[]; }
function liveSessionAt(t){ const now=new Date(); return sessionsAt(t).find(s=>s.start<=now&&now<s.end)||null; }
let alertShown=null, alertBusy=false;
async function checkAlerts(){
  if(!alertsOn()||alertBusy) return; alertBusy=true;
  try{
    try{ const p=navigator.permissions&&await navigator.permissions.query({name:"geolocation"}); if(p&&p.state==="denied") return; }catch(e){}
    const t=await whereAmI(8000);
    const live=t?liveSessionAt(t):null;
    if(!live){ hideAlertCard(); return; }
    const id=t.id+"|"+live.start.getTime();
    if(alertShown&&alertShown.id===id) return;
    if(alertsSeen().includes(id)){ hideAlertCard(); return; }
    showAlertCard(t,live,id);
  } finally { alertBusy=false; }
}
function showAlertCard(t,live,id){
  alertShown={id,t};
  const el=document.getElementById("alertCard");
  document.getElementById("acTrack").textContent=t.short;
  document.getElementById("acTxt").textContent=shortName(live.n);
  el.hidden=false; el.style.transform=""; el.style.transition="";
  requestAnimationFrame(()=>el.classList.add("show"));
}
function hideAlertCard(dismiss){
  if(dismiss&&alertShown) markAlertSeen(alertShown.id);
  alertShown=null;
  const el=document.getElementById("alertCard"); if(!el||el.hidden) return;
  el.classList.remove("show"); setTimeout(()=>{ if(!alertShown) el.hidden=true; },260);
}
function dismissAlert(){ hideAlertCard(true); }
function openAlertTarget(){
  if(!alertShown) return; const t=alertShown.t; hideAlertCard(true);
  openTrack(t.id,"home").then(()=>setTimeout(showNowSession,0));
}
/* swipe up, or sideways, to dismiss -- like an OS notification banner */
(function(){ let sx=0,sy=0,dx=0,dy=0,drag=false;
  const el=()=>document.getElementById("alertCard");
  document.addEventListener("touchstart",e=>{ const c=el(); if(!c||c.hidden||!e.target.closest("#alertCard")) return; drag=true; sx=e.touches[0].clientX; sy=e.touches[0].clientY; dx=dy=0; c.style.transition="none"; },{passive:true});
  document.addEventListener("touchmove",e=>{ if(!drag) return; dx=e.touches[0].clientX-sx; dy=e.touches[0].clientY-sy; const c=el(); if(dy<0||Math.abs(dx)>Math.abs(dy)) c.style.transform=`translate(${dx}px,${Math.min(0,dy)}px)`; },{passive:true});
  document.addEventListener("touchend",()=>{ if(!drag) return; drag=false; const c=el(); c.style.transition=""; if(dy<-30||Math.abs(dx)>60) hideAlertCard(true); else c.style.transform=""; });
})();
setInterval(checkAlerts,60000);
document.addEventListener("visibilitychange",()=>{ if(!document.hidden) { checkAlerts(); scheduleSessionAlerts(); } });
checkAlerts();

/* Session alerts (native iOS app only): a local notification 10 minutes before every session of the next event
   at the track you're standing at. Unlike the on-track card above, iOS keeps these and fires them with the app
   closed -- no server needed. They're rebuilt each time the app opens (or comes back to the foreground), so a
   schedule change shows up the next time you open the app, not on its own. iOS allows about 64 pending
   notifications per app, so this is capped there. */
const SESSION_ALERT_LEAD_MIN=10, SESSION_ALERT_MAX=60;
function nativeNotifier(){ const c=window.Capacitor; return (c&&c.isNativePlatform&&c.isNativePlatform()&&c.Plugins&&c.Plugins.LocalNotifications)||null; }
/* The track is picked by where the phone is, not one global "next event", so each person's phone alerts for the
   race they're actually at. Not at a track (or no location) leaves the current schedule alone -- so alerts set
   at the venue keep working after you leave it. Location is only read if it's already allowed (same consent
   rule as the on-track card), so this never throws a surprise prompt. */
async function scheduleSessionAlerts(forcedTrack){
  const LN=nativeNotifier(); if(!LN) return;
  let t=forcedTrack||null;
  if(!t){
    try{ const p=navigator.permissions&&await navigator.permissions.query({name:"geolocation"}); if(p&&p.state==="denied") return; }catch(e){}
    t=await whereAmI(10000);
  }
  if(!t) return;
  const e=nextEventAt(t);
  if(!e) return;
  let display=(await LN.checkPermissions()).display;
  if(display!=="granted") display=(await LN.requestPermissions()).display;
  if(display!=="granted") return;
  const now=Date.now(), leadMs=SESSION_ALERT_LEAD_MIN*60000, end=eventEnd(e);
  const sessions=sessionsOf(t).filter(s=>s.d>=e.d&&s.d<=end&&s.start.getTime()-leadMs>now&&!isStarred(t,s));   /* starred ones already have their own alert */
  const pending=await LN.getPending(), mine=pending.notifications.filter(n=>n.id<REMINDER_ID_BASE);   /* leave the going-race reminders alone */
  if(mine.length) await LN.cancel({notifications:mine.map(n=>({id:n.id}))});
  if(!sessions.length) return;
  await LN.schedule({notifications:sessions.slice(0,SESSION_ALERT_MAX).map((s,i)=>({
    id:i+1,
    title:shortName(s.n),
    body:`${t.short} · starts in ${SESSION_ALERT_LEAD_MIN} minutes`,
    sound:"racecar.caf",   /* bundled in the iOS app (ios/App/App/racecar.caf); iOS falls back to the default tone if it's missing */
    schedule:{at:new Date(s.start.getTime()-leadMs)},
    extra:{track:t.id}
  }))});
}
scheduleSessionAlerts();
/* ---- reminders for races you marked "I'm going": a week before and the evening before --------------------------
   Separate from the at-track session alerts above: those follow where the phone IS and only cover that track; these
   follow what you CHOSE, so an event you didn't mark never reminds you, and two events on one weekend both remind only
   if you marked both. Own notification ids (REMINDER_ID_BASE and up) so neither kind cancels the other. */
const REM_KEY=K.remind, REMINDER_ID_BASE=1000;
function remindersOn(){ try{ return localStorage.getItem(REM_KEY)!=="0"; }catch(e){ return true; } }
function renderRemSw(){ const b=document.getElementById("remSw"); if(!b) return; const on=remindersOn(); b.classList.toggle("on",on); b.setAttribute("aria-checked",on); }
async function toggleReminders(){
  const on=!remindersOn(); try{ localStorage.setItem(REM_KEY,on?"1":"0"); }catch(e){} renderRemSw();
  if(!nativeNotifier()){ toast(on?"Reminders work in the iPhone app.":"Off."); return; }
  await scheduleGoingReminders(on); toast(on?"Reminders on for the races you're going to.":"Reminders off.");
}
async function scheduleGoingReminders(ask){
  const LN=nativeNotifier(); if(!LN) return;
  const pending=await LN.getPending(), old=pending.notifications.filter(n=>n.id>=REMINDER_ID_BASE&&n.id<STAR_ID_BASE);
  if(old.length) await LN.cancel({notifications:old.map(n=>({id:n.id}))});
  if(!remindersOn()) return;
  const evs=[]; goingList().forEach(k=>{ const [tid,d,...nm]=k.split("|"), t=TRACKS.find(x=>x.id===tid), e=t&&t.events.find(x=>x.d===d&&x.e===nm.join("|")); if(t&&e&&!eventDone(t,e)) evs.push({t,e}); });
  if(!evs.length) return;
  let display=(await LN.checkPermissions()).display; if(display!=="granted"&&ask) display=(await LN.requestPermissions()).display; if(display!=="granted") return;
  const now=Date.now(), out=[]; let id=REMINDER_ID_BASE;
  const at=(dStr,days,h)=>{ const [y,m,dd]=dStr.split("-").map(Number); return new Date(y,m-1,dd-days,h,0,0); };   /* the phone's own clock */
  evs.sort((a,b)=>a.e.d.localeCompare(b.e.d)).slice(0,10).forEach(({t,e})=>{
    const first=sessionsOf(t).filter(x=>x.d>=e.d&&x.d<=eventEnd(e)).sort((a,b)=>a.start-b.start)[0], extra={track:t.id};
    const wk=at(e.d,7,9), eve=at(e.d,1,18);
    if(wk.getTime()>now) out.push({id:id++,title:`${t.short} is in a week`,body:`${e.e} · ${fmtRange(e)}. Tap for the plan.`,schedule:{at:wk},extra});
    if(eve.getTime()>now) out.push({id:id++,title:`Tomorrow: ${t.short}`,body:first?`First session ${fmtWhen(first.start,t.tz)} (track time). Gates, parking and the schedule are in the app.`:`${e.e}. Session times aren't published yet.`,schedule:{at:eve},extra});
  });
  if(out.length) await LN.schedule({notifications:out});
}
(function(){ const LN=nativeNotifier(); if(LN&&LN.addListener) LN.addListener("localNotificationActionPerformed",a=>{ const x=a&&a.notification&&a.notification.extra; if(x&&x.track) openTrack(x.track,"home"); }); })();
scheduleGoingReminders(false); scheduleStarAlerts(false);
function toggleSettingsGroup(i){ const g=document.getElementById("sg"+i); const on=!g.classList.contains("open"); g.classList.toggle("open",on); g.querySelector(".sgh").setAttribute("aria-expanded",on);
  if(on) setTimeout(()=>g.scrollIntoView({block:"nearest",behavior:"smooth"}),30); }
function openSettings(){
 renderAutoSw(); renderRemSw(); renderStyleUI(); renderThemeUI(); renderUnitsUI(); renderAccessUI(); renderAlertSw(); renderSettingsMore(); renderMyRaces(); renderAbout(); showScreen("settings"); }

/* ---- day and night: Auto follows sunrise and sunset, or match the phone, or force Day / Night ----
   Sun times are worked out on the phone (no signal needed). At a track in the phone's own time zone it uses the
   track's position, otherwise a rough position from the time zone (good to about half an hour). */
const THEME_KEY=K.theme, THEMES=[["auto","Auto"],["day","Day"],["night","Night"]];
function themePref(){ try{ const v=localStorage.getItem(THEME_KEY)||"auto"; return v==="phone"?"auto":v; }catch(e){ return "auto"; } }   /* "phone" was a removed option; treat anyone who had it saved as Auto */
function sunSpot(){
  const t=(cur&&inDetail())?cur:(nextAny()||{}).t, phoneOff=-new Date().getTimezoneOffset()*60000;
  if(t&&t.geo&&t.tz&&Math.abs(tzOffsetMs(new Date(),t.tz)-phoneOff)<1000) return [(t.geo.n+t.geo.s)/2,(t.geo.w+t.geo.e)/2];
  const y=new Date().getFullYear(), std=Math.max(new Date(y,0,1).getTimezoneOffset(),new Date(y,6,1).getTimezoneOffset());
  return [38,-std/60*15];
}
function sunEvents(ms,lat,lon){       /* sunrise and sunset (ms) of the solar day nearest ms */
  const r=Math.PI/180, J=ms/864e5+2440587.5, n=Math.round(J-2451545+0.0008), Js=n-lon/360, M=((357.5291+0.98560028*Js)%360)*r;
  const C=1.9148*Math.sin(M)+0.02*Math.sin(2*M)+0.0003*Math.sin(3*M), lam=(((M/r)+C+180+102.9372)%360)*r;
  const Jt=2451545+Js+0.0053*Math.sin(M)-0.0069*Math.sin(2*lam), sd=Math.sin(lam)*Math.sin(23.4397*r), cd=Math.cos(Math.asin(sd));
  const co=(Math.sin(-0.833*r)-Math.sin(lat*r)*sd)/(Math.cos(lat*r)*cd); if(co<-1||co>1) return [];
  const w=Math.acos(co)/(2*Math.PI), ms2=j=>(j-2440587.5)*864e5; return [{t:ms2(Jt-w),k:"rise"},{t:ms2(Jt+w),k:"set"}];
}
function sunState(){          /* {night, next:{t,k}} for right now */
  const now=Date.now(), [lat,lon]=sunSpot(), ev=[]; for(let d=-2;d<=2;d++) ev.push(...sunEvents(now+d*864e5,lat,lon));
  ev.sort((a,b)=>a.t-b.t); const past=ev.filter(e=>e.t<=now), last=past[past.length-1], next=ev.find(e=>e.t>now);
  return {night:last?last.k==="set":false,next};
}
function applyTheme(){
  const p=themePref(), root=document.documentElement; let t=null;
  if(p==="day") t="light"; else if(p==="night") t="dark"; else if(p==="auto") t=sunState().night?"dark":"light";
  if(t) root.setAttribute("data-theme",t); else root.removeAttribute("data-theme");
  const dark=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches, m=document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute("content",dark?"#151A18":"#F0EEE8");
  renderThemeUI(p);
}
function renderThemeUI(p){
  p=p||themePref();
  const hm=ms=>new Date(ms).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}).replace(" "," ");
  let note={day:"Always light.",night:"Always dark."}[p];
  if(p==="auto"){ const s=sunState(); note=s.next?`${s.night?"Night":"Day"} until about ${hm(s.next.t)}. Switches at sunrise and sunset.`:"Switches at sunrise and sunset."; }
  document.querySelectorAll(".themeSeg").forEach(el=>{ el.innerHTML=THEMES.map(([k,l])=>`<button class="${k===p?"on":""}" onclick="setTheme('${k}')">${l}</button>`).join(""); });
  document.querySelectorAll(".themeNote").forEach(el=>el.textContent=note);
}
/* Style: "classic" (the original soft look) or "race" (Race Control: bold type, black header, orange accent). Saved on the phone;
   index.html applies it before first paint so there is no flash. */
const STYLE_KEY=K.style, STYLES=[["classic","Classic"],["race","Race Control"]];
function stylePref(){ try{ return localStorage.getItem(STYLE_KEY)==="race"?"race":"classic"; }catch(e){ return "classic"; } }
function applyStyle(){ const r=document.documentElement; if(stylePref()==="race") r.setAttribute("data-style","race"); else r.removeAttribute("data-style"); renderStyleUI(); if(typeof cur!=="undefined"&&cur&&document.getElementById("mapSvg")){ const v=view; renderMap(); view=v; applyView(); } }
function renderStyleUI(){ const p=stylePref();
  document.querySelectorAll(".styleSeg").forEach(el=>{ el.innerHTML=STYLES.map(([k,l])=>`<button class="${k===p?"on":""}" onclick="setStyle('${k}')">${l}</button>`).join(""); });
  document.querySelectorAll(".styleNote").forEach(el=>el.textContent=p==="race"?"Bold condensed type, a black header with a checkered strip, orange accents.":"The original soft look."); }
function setStyle(k){ try{ localStorage.setItem(STYLE_KEY,k); }catch(e){} applyStyle(); }
function setTheme(k){ try{ localStorage.setItem(THEME_KEY,k); }catch(e){} applyTheme(); }
applyTheme(); setInterval(applyTheme,60000);
document.addEventListener("visibilitychange",()=>{ if(!document.hidden) applyTheme(); });
let hiddenAt=0;
document.addEventListener("visibilitychange",()=>{ if(document.hidden) hiddenAt=Date.now(); else if(hiddenAt&&Date.now()-hiddenAt>20*60000){ hiddenAt=0; autoOpen(); } });

/* ---------------- WEATHER: Open-Meteo (free, no key). The last answer is kept on the phone for when there is no signal. ---------------- */
const WX_TTL=10*60000;
let wx=null, wxReq=0;
const WMO={0:["Clear","clear"],1:["Mostly clear","clear"],2:["Partly cloudy","pc"],3:["Overcast","cloud"],45:["Fog","fog"],48:["Fog","fog"],51:["Light drizzle","rain"],53:["Drizzle","rain"],55:["Heavy drizzle","rain"],56:["Freezing drizzle","rain"],57:["Freezing drizzle","rain"],61:["Light rain","rain"],63:["Rain","rain"],65:["Heavy rain","rain"],66:["Freezing rain","rain"],67:["Freezing rain","rain"],71:["Light snow","snow"],73:["Snow","snow"],75:["Heavy snow","snow"],77:["Snow grains","snow"],80:["Light showers","rain"],81:["Showers","rain"],82:["Heavy showers","rain"],85:["Snow showers","snow"],86:["Snow showers","snow"],95:["Thunderstorm","storm"],96:["Thunderstorm, hail","storm"],99:["Thunderstorm, hail","storm"]};
const WXI={
  clear:d=>d?'<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.3M12 19.2v2.3M2.5 12h2.3M19.2 12h2.3M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>':'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  pc:d=>(d?'<circle cx="8" cy="8" r="2.8"/><path d="M8 2.2v1.4M2.2 8h1.4M3.9 3.9l1 1M12.1 3.9l-1 1"/>':'<path d="M9 3.5a4.5 4.5 0 1 0 4.2 6A3.5 3.5 0 0 1 9 3.5z"/>')+'<path d="M9.5 20h8a3.5 3.5 0 0 0 .4-6.98A5 5 0 0 0 8.4 13.1 3.5 3.5 0 0 0 9.5 20z"/>',
  cloud:()=>'<path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.6 4.2 4.2 0 0 0 7 18z"/>',
  rain:()=>'<path d="M7 14h10a3.6 3.6 0 0 0 .5-7.15A5.5 5.5 0 0 0 6.3 6.4 3.9 3.9 0 0 0 7 14z"/><path d="M8 17.5l-1 2.5M12 17.5l-1 2.5M16 17.5l-1 2.5"/>',
  storm:()=>'<path d="M7 14h10a3.6 3.6 0 0 0 .5-7.15A5.5 5.5 0 0 0 6.3 6.4 3.9 3.9 0 0 0 7 14z"/><path d="M12.5 14.5l-2.2 3.3h3l-2 3.2"/>',
  snow:()=>'<path d="M7 14h10a3.6 3.6 0 0 0 .5-7.15A5.5 5.5 0 0 0 6.3 6.4 3.9 3.9 0 0 0 7 14z"/><path d="M8 18h.01M12 20h.01M16 18h.01" stroke-width="2.6"/>',
  fog:()=>'<path d="M4 8h16M6 12h12M4 16h16M8 20h8"/>'
};
/* Weather units and distance units are separate choices (someone might want °F with km, or °C with
   miles) but both used to be one combined toggle -- LEGACY_UNITS_KEY is read as the fallback default
   for whichever of the two a person hasn't touched yet, so nobody's existing choice gets reset. */
const WX_UNITS_KEY=K.wxUnits, DIST_UNITS_KEY=K.distUnits, LEGACY_UNITS_KEY=K.units;
function wxUnits(){ try{ const v=localStorage.getItem(WX_UNITS_KEY)??localStorage.getItem(LEGACY_UNITS_KEY); return v==="metric"?"metric":"us"; }catch(e){ return "us"; } }
function distUnits(){ try{ const v=localStorage.getItem(DIST_UNITS_KEY)??localStorage.getItem(LEGACY_UNITS_KEY); return v==="metric"?"metric":"us"; }catch(e){ return "us"; } }
const tv=f=>Math.round(wxUnits()==="metric"?(f-32)*5/9:f), wv=m=>Math.round(wxUnits()==="metric"?m*1.609:m), wu=()=>wxUnits()==="metric"?"km/h":"mph";
/* distance: short on-site distances (feet/metres, switching to mi/km past ~1000 of either) and the
   longer "how far from the track" figure and GPS accuracy, all following the distance units choice. */
function distLabel(m){ if(distUnits()==="metric") return m<1000?Math.round(m/10)*10+" m":(m/1000).toFixed(1)+" km"; const ft=m*3.28084; return ft<1000?Math.round(ft/10)*10+" ft":(m/1609.344).toFixed(1)+" mi"; }
function distKmLabel(km){ if(distUnits()==="metric") return (km<10?km.toFixed(1):Math.round(km))+" km"; const mi=km*0.621371; return (mi<10?mi.toFixed(1):Math.round(mi))+" mi"; }
function accLabel(m){ return distUnits()==="metric"?Math.round(m)+" m":Math.round(m*3.28084/10)*10+" ft"; }
function setWxUnits(u){ try{ localStorage.setItem(WX_UNITS_KEY,u); }catch(e){} renderUnitsUI(); renderWx(); }
function setDistUnits(u){ try{ localStorage.setItem(DIST_UNITS_KEY,u); }catch(e){} renderUnitsUI(); }
function renderUnitsUI(){
  const wu2=wxUnits(); document.querySelectorAll(".wxUnitSeg").forEach(el=>{ el.innerHTML=[["us","°F · mph"],["metric","°C · km/h"]].map(([k,l])=>`<button class="${k===wu2?"on":""}" onclick="setWxUnits('${k}')">${l}</button>`).join(""); });
  const du=distUnits(); document.querySelectorAll(".distUnitSeg").forEach(el=>{ el.innerHTML=[["us","Feet · miles"],["metric","Metres · km"]].map(([k,l])=>`<button class="${k===du?"on":""}" onclick="setDistUnits('${k}')">${l}</button>`).join(""); });
}
function wxInfo(code){ return WMO[code]||["Weather","cloud"]; }
function wxIcon(code,day){ const k=wxInfo(code)[1]; return `<svg viewBox="0 0 24 24" aria-hidden="true">${WXI[k](day!==0&&day!==false)}</svg>`; }
const compass=d=>["N","NE","E","SE","S","SW","W","NW"][Math.round(d/45)%8];
const hr12=t=>{ const h=+t.slice(11,13); return (h%12||12)+(h<12?" AM":" PM"); };
const tm12=t=>{ const h=+t.slice(11,13), m=t.slice(14,16); return (h%12||12)+":"+m+(h<12?" AM":" PM"); };
function wxUrl(t){
  t=t||cur; const g=t.geo, lat=((g.n+g.s)/2).toFixed(3), lon=((g.w+g.e)/2).toFixed(3);
  return "https://api.open-meteo.com/v1/forecast?latitude="+lat+"&longitude="+lon+"&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,precipitation,wind_speed_10m,wind_gusts_10m,wind_direction_10m,is_day"
   +"&hourly=temperature_2m,precipitation_probability,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,sunrise,sunset"
   +"&minutely_15=precipitation&forecast_minutely_15=16&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone="+encodeURIComponent(t.tz||"auto")+"&forecast_days=16";
}
async function wxFetch(t){        /* download and remember one track's forecast */
  const ctl=new AbortController(), to=setTimeout(()=>ctl.abort(),10000);
  try{ const res=await fetch(wxUrl(t),{signal:ctl.signal}); if(!res.ok) throw new Error("weather "+res.status); const data=await res.json(), at=Date.now();
    try{ localStorage.setItem(K.wx+t.id,JSON.stringify({at,data})); }catch(e){}
    return {at,data,live:true}; } finally { clearTimeout(to); }
}
let wxFailed=false;
async function loadWeather(force){
  if(!cur) return; const id=cur.id, my=++wxReq; let cached=null; wxFailed=false;
  try{ cached=JSON.parse(localStorage.getItem(K.wx+id)||"null"); }catch(e){}
  if(cached&&cached.data&&cached.data.current){ wx=cached; renderWx(); if(!force&&Date.now()-cached.at<WX_TTL) return; }
  try{ const fresh=await wxFetch(cur); if(my!==wxReq||!cur||cur.id!==id) return; wx=fresh; renderWx(); }
  catch(e){ if(my!==wxReq||!cur||cur.id!==id) return; if(wx&&wx.data){ wx.live=false; } else wxFailed=true; renderWx(); }
}
/* while there is signal (at home, at the hotel), quietly save the forecast for the next race so it is there at the track */
function wxPrefetch(){
  const c=nextAny(); if(!c||navigator.onLine===false) return; const t=c.t;
  try{ const k=JSON.parse(localStorage.getItem(K.wx+t.id)||"null"); if(k&&Date.now()-k.at<30*60000) return; }catch(e){}
  wxFetch(t).catch(()=>{});
}
/* ---- rain nowcast: the next 4 hours in 15-minute steps (each value is the rain that fell in the 15 minutes before its time) ---- */
function localMin(ms){ return Date.parse(new Date(ms).toLocaleString("sv-SE",{timeZone:cur.tz||undefined}).replace(" ","T")+"Z")/60000; }
function fmtMins(m){ m=Math.max(5,Math.round(m/5)*5); return m<60?`${m} min`:`${Math.floor(m/60)} hr${m%60?" "+m%60+" min":""}`; }
function rainOutlook(){        /* {state:"now"|"soon"|"none", mins, text, level} or null when there is no short-range data */
  const M=wx&&wx.data&&wx.data.minutely_15; if(!M||!M.time||!M.precipitation||M.precipitation.every(v=>v===null)) return null;
  const now=localMin(Date.now()), THR=0.1;
  const slots=M.time.map((t,i)=>({s:Date.parse(t+":00Z")/60000-15,e:Date.parse(t+":00Z")/60000,p:M.precipitation[i]||0})).filter(x=>x.e>now);
  if(!slots.length) return null;
  /* the forecast model's own live reading for right now -- folded into the current slot as a floor, so an
     actual-rain-falling instant isn't missed just because the minutely_15 bucket it falls in rounded low.
     This can't catch a storm the model's forecast run simply didn't see coming (that needs real radar, which
     this free, keyless forecast API doesn't provide) -- only ones the model agrees are happening right now. */
  const curP=wx.data.current&&typeof wx.data.current.precipitation==="number"?wx.data.current.precipitation:null;
  if(curP!==null&&curP>slots[0].p) slots[0].p=curP;
  const level=p=>{ const r=p*4; return r>=7.6?"heavy":r>=2.5?"moderate":"light"; };
  if(slots[0].p>=THR&&slots[0].s<=now+2){
    let k=0; while(k<slots.length&&slots[k].p>=THR) k++;
    const peak=Math.max(...slots.slice(0,k).map(x=>x.p)), lv=level(peak);
    if(k>=slots.length) return {state:"now",mins:0,level:lv,text:`Raining now, and it looks set to last at least ${fmtMins(slots[slots.length-1].e-now)}.`};
    return {state:"now",mins:0,level:lv,text:`Raining now. It looks like it eases in about ${fmtMins(slots[k].s-now)}.`};
  }
  const i=slots.findIndex(x=>x.p>=THR);
  if(i<0) return {state:"none",text:(()=>{ const span=slots[slots.length-1].e-now; return span>=120?`No rain expected in the next ${Math.floor(span/60)} hours.`:`No rain expected in the next ${fmtMins(span)}.`; })()};
  const mins=Math.max(0,slots[i].s-now), lv=level(Math.max(slots[i].p,(slots[i+1]||{p:0}).p));
  return {state:"soon",mins,level:lv,text:mins<=5?`${lv[0].toUpperCase()+lv.slice(1)} rain starting in a few minutes.`:`Rain expected in about ${fmtMins(mins)} (${lv}).`};
}
function renderWx(){
  const b=document.getElementById("wxBtn"); if(!b) return;
  if(!wx||!wx.data||!wx.data.current){
    if(wxFailed){ b.hidden=false; b.classList.add("off"); b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.6 4.2 4.2 0 0 0 7 18z"/><path d="M4 4l16 16"/></svg><span>--</span>'; b.setAttribute("aria-label","Weather not available offline"); } else b.hidden=true;
    if(sheetState==="shWx") renderWxSheet(); return; }
  b.classList.remove("off");
  const c=wx.data.current, ro=rainOutlook(), wet=ro&&(ro.state==="now"||(ro.state==="soon"&&ro.mins<=60)); b.hidden=false; b.innerHTML=wxIcon(c.weather_code,c.is_day)+`<span>${tv(c.temperature_2m)}°</span>`+(wet?'<i class="raindot"></i>':""); b.setAttribute("aria-label",`Weather: ${tv(c.temperature_2m)} degrees, ${wxInfo(c.weather_code)[0]}`);
  if(sheetState==="shWx") renderWxSheet();
  if(ro&&ro.state==="soon"&&ro.mins<=30&&wx.live&&wxToast!==cur.id){ wxToast=cur.id; toast(ro.text); }
  if(hubMode) renderHub();
}
let wxToast=null;
function wxEventDays(){       /* the days of the race weekend (or the next event) as YYYY-MM-DD */
  const e=nextAt(cur); if(!e) return [];
  return Array.from({length:e.t||1},(_,i)=>addDays(e.d,i));
}
function renderWxSheet(){
  const el=document.getElementById("shWx"); if(!el) return;
  if(!wx||!wx.data){ el.innerHTML=`<div class="ptitle"><strong>Weather at ${esc(cur.short)}</strong></div><small style="margin-top:8px">No signal, and no forecast is saved on this phone for ${esc(cur.short)} yet. Open this track once with a connection, for example on hotel Wi-Fi, and its forecast is kept for when you are offline.</small>`; return; } const d=wx.data, c=d.current, h=d.hourly, dl=d.daily;
  const ro=rainOutlook(), cond=wxInfo(c.weather_code)[0], i0=Math.max(0,h.time.findIndex(t=>t>=c.time.slice(0,13)+":00"));
  const nextRain=Math.max(0,...h.precipitation_probability.slice(i0,i0+3).map(v=>v||0));
  const today=dl.time.indexOf(c.time.slice(0,10));
  const stats=[`Wind ${wv(c.wind_speed_10m)} ${wu()} ${compass(c.wind_direction_10m)}${c.wind_gusts_10m>c.wind_speed_10m+4?`, gusts ${wv(c.wind_gusts_10m)}`:""}`,`Humidity ${Math.round(c.relative_humidity_2m)}%`,`Rain chance ${nextRain}% next 3 hrs`,today>=0?`Sunset ${tm12(dl.sunset[today])}`:null].filter(Boolean);
  const hours=h.time.slice(i0,i0+13).map((t,k)=>{ const j=i0+k, p=h.precipitation_probability[j]||0;
    return `<div class="wh"><small>${k===0?"Now":hr12(t)}</small>${wxIcon(h.weather_code[j],h.is_day[j])}<b>${tv(h.temperature_2m[j])}°</b><em>${p>=10?p+"%":""}</em></div>`; }).join("");
  const days=wxEventDays(), evDays=days.map(x=>({x,i:dl.time.indexOf(x)})).filter(z=>z.i>=0);
  let wk="";
  if(evDays.length){ wk=`<h4 class="mh">${esc(cur.eventName||"Race weekend")}</h4><div class="wdays">`+evDays.map(({x,i})=>{ const wd=new Date(x+"T12:00:00").toLocaleDateString("en-US",{weekday:"short"}), p=dl.precipitation_probability_max[i]||0;
      return `<div class="wd"><small>${wd} ${+x.slice(8)}</small>${wxIcon(dl.weather_code[i],true)}<b>${tv(dl.temperature_2m_max[i])}° <span>${tv(dl.temperature_2m_min[i])}°</span></b><em>${p}% rain</em><em>Wind ${wv(dl.wind_speed_10m_max[i])} ${wu()}</em></div>`; }).join("")+`</div>`; }
  else if(days.length&&days[0]>dl.time[dl.time.length-1]) wk=`<small class="fine">The race weekend is more than two weeks away. Its forecast appears here once it is in range.</small>`;
  const when=new Date(wx.at).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"}).replace(" "," ");
  el.innerHTML=`<div class="ptitle"><strong>Weather at ${esc(cur.short)}</strong></div>
    ${ro?`<div class="rainline ${ro.state}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s6 6.2 6 10.2A6 6 0 0 1 6 13.2C6 9.2 12 3 12 3z"/></svg><div>${ro.text}</div></div>`:""}
    <button class="btn quiet radarBtn" onclick="openRadar()"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="2"/><path d="M12 12 A5 5 0 0 1 17 17 M12 12 A8 8 0 0 1 20 20"/></svg>See the actual rain radar</button>
    <div class="wnow"><span class="wbig">${wxIcon(c.weather_code,c.is_day)}</span><div><div class="wt">${tv(c.temperature_2m)}°</div><small>${cond}. Feels like ${tv(c.apparent_temperature)}°</small></div></div>
    <div class="pmeta">${stats.map(s=>`<span>${s}</span>`).join("")}</div>
    <h4 class="mh">Next 12 hours</h4><div class="whours">${hours}</div>${wk}
    <small class="fine">${wx.live===false?`No signal. Showing the forecast from ${when}.`:`Updated ${when}.`} Forecast by Open-Meteo, at the track's location. The rain line is a short-range estimate, so keep an eye on the sky.</small>`;
}
function openWeather(){ if(!wx&&!wxFailed) return; if(sheetState==="shWx"){ closeSheet(); return; } renderWxSheet(); showSheet("shWx"); if(!wx||Date.now()-wx.at>WX_TTL) loadWeather(true); }
setInterval(()=>{ if(cur&&inDetail()&&(!wx||Date.now()-wx.at>WX_TTL)) loadWeather(true); },60000);
window.addEventListener("online",()=>{ if(cur&&inDetail()) loadWeather(true); wxPrefetch(); });
wxPrefetch(); document.addEventListener("visibilitychange",()=>{ if(!document.hidden) wxPrefetch(); });

/* ---- Settings > Screen check: what the phone reports about its screen (handy when a layout looks off).
   The old stretch-to-fit test was removed: on iPhone the strip below the window cannot be drawn into. ---- */
function isApp(){ return !!(navigator.standalone||matchMedia("(display-mode: standalone)").matches); }
function gapSize(){ return (innerHeight>innerWidth&&screen.height>screen.width)?Math.round(screen.height-innerHeight):0; }
function probeH(css){ const d=document.createElement("div"); d.style.cssText="position:fixed;left:0;top:0;width:1px;visibility:hidden;pointer-events:none;"+css; document.body.appendChild(d); const h=Math.round(d.getBoundingClientRect().height); d.remove(); return h; }
function screenInfo(){
  const el=document.getElementById("scrInfo"); if(!el) return;
  const sa=(s)=>probeH("height:0;padding-top:env("+s+")"), vv=window.visualViewport?`${Math.round(visualViewport.width)}×${Math.round(visualViewport.height)}`:"n/a";
  el.textContent=`Screen ${screen.width}×${screen.height} · Window ${innerWidth}×${innerHeight} · Visual ${vv} · Gap ${gapSize()} px\nMode: ${isApp()?"home-screen app":"browser tab"}\nheight 100vh ${probeH("height:100vh")} · dvh ${probeH("height:100dvh")} · lvh ${probeH("height:100lvh")} · svh ${probeH("height:100svh")}\nSafe area top ${sa("safe-area-inset-top")} · bottom ${sa("safe-area-inset-bottom")}`;
}
try{ K_RETIRED.forEach(k=>localStorage.removeItem(k)); }catch(e){}
const _openSettings=openSettings; openSettings=function(){ _openSettings(); screenInfo(); };

/* offline support: the service worker (sw.js) saves the app on the phone; needs https or localhost */
if("serviceWorker" in navigator){
  navigator.serviceWorker.addEventListener("message",e=>{
    if(e.data&&e.data.type==="offline-ready"){ try{ if(localStorage.getItem(K.offline)) return; localStorage.setItem(K.offline,"1"); }catch(_){} toast("Saved. Trackside Pass now works with no signal."); }
  });
  navigator.serviceWorker.register("sw.js").catch(()=>{});
  /* a first visit that lost signal part-way saves the maps it missed the next time the app opens online */
  navigator.serviceWorker.ready.then(r=>{ if(navigator.onLine&&r.active) r.active.postMessage({type:"topup"}); }).catch(()=>{});
}

/* swipe back: drag from the left edge of the screen (an installed web app has no browser back gesture) */
function swipeBack(){
  const im=document.getElementById("infoModal"); if(im&&!im.hidden){ closeInfo(); return; }
  if(hubBack()) return;
  const sh=document.getElementById("sheet"); if(sh&&!sh.hidden){ closeSheet(); return; }
  const sc=document.querySelector(".screen.on"); if(!sc||sc.id==="home") return;
  /* the detail screen's tabs are Hub/Map/Events/Info: one swipe from Map/Events/Info goes back to the hub, and a
     second swipe from the hub exits to the track list (goHome does both). */
  if(sc.id==="detail"){ goHome(); return; }
  const b=sc.querySelector('button[aria-label^="Back"]'); if(b) b.click();
}
function swipeTarget(){
  if(document.getElementById("infoModal")&&!document.getElementById("infoModal").hidden) return null;
  if(document.getElementById("sheet")&&!document.getElementById("sheet").hidden&&!hubReturn) return null;
  const sc=document.querySelector(".screen.on"); if(!sc||sc.id==="home") return null;
  return sc.id==="detail"?(sc.querySelector(".panel.on")||sc):sc;
}
/* drag the current screen out from under your thumb, like flipping to the page behind it; let go past the point of no return and it finishes the trip */
(function(){
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let sx=0,sy=0,t0=0,armed=false,dragging=false,el=null;
  const reset=()=>{ if(el){ el.style.transition=""; el.style.transform=""; el.style.boxShadow=""; } el=null; dragging=false; };
  document.addEventListener("touchstart",e=>{
    const t=e.touches[0]; armed=e.touches.length===1&&t.clientX<=22; sx=t.clientX; sy=t.clientY; t0=Date.now();
    if(armed){ el=swipeTarget(); if(!el) armed=false; }
  },{passive:true});
  document.addEventListener("touchmove",e=>{
    if(!armed||!el) return; const t=e.touches[0], dx=t.clientX-sx, dy=t.clientY-sy;
    if(!dragging){ if(Math.hypot(dx,dy)<6) return; if(dx<0||Math.abs(dy)>Math.abs(dx)*1.2){ armed=false; return; } dragging=true; el.style.transition="none"; el.style.willChange="transform"; }
    const x=Math.max(0,Math.min(dx,innerWidth));
    if(reduced){ return; }   /* still tracks the gesture; just skips the visual drag */
    el.style.transform=`translateX(${x}px)`; el.style.boxShadow="-14px 0 34px rgba(0,0,0,.16)";
  },{passive:true});
  document.addEventListener("touchend",e=>{
    if(!armed){ reset(); return; } armed=false;
    const t=e.changedTouches[0], dx=t.clientX-sx, dy=Math.abs(t.clientY-sy), fast=Date.now()-t0<250;
    const commit=dragging?(dx>innerWidth*0.3||(fast&&dx>60)):(dx>80&&dy<70&&dx>dy*1.6&&Date.now()-t0<900);
    if(!dragging){ if(commit) swipeBack(); return; }
    if(reduced){ const e2=el; reset(); if(commit) swipeBack(); return; }
    const e2=el; e2.style.transition="transform .26s cubic-bezier(.22,.61,.36,1)";
    if(commit){ e2.style.transform=`translateX(${innerWidth}px)`; e2.addEventListener("transitionend",function done(){ e2.removeEventListener("transitionend",done); e2.style.transition=""; e2.style.transform=""; e2.style.boxShadow=""; e2.style.willChange=""; swipeBack(); },{once:true}); }
    else{ e2.style.transform="translateX(0px)"; e2.addEventListener("transitionend",function done(){ e2.removeEventListener("transitionend",done); e2.style.transition=""; e2.style.boxShadow=""; e2.style.willChange=""; },{once:true}); }
    el=null; dragging=false;
  },{passive:true});
  document.addEventListener("touchcancel",()=>{ armed=false; reset(); },{passive:true});
})();

/* ---------------- more settings ---------------- */
function LSget(k,d){ try{ const v=localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } }
function LSset(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
function goDays(){ return +LSget(K.goDays,"14")||14; }         /* how early the home tile and the watch list switch to your race */
function timesPref(){ return LSget(K.times,"track"); }        /* "track" or "mine" */
function hiddenSeries(){ try{ return JSON.parse(LSget(K.unfollow,"[]")); }catch(e){ return []; } }
function followedSub(){ try{ return JSON.parse(LSget(K.followSub,"[]")); }catch(e){ return []; } }
/* a support series (optIn) is off unless explicitly turned on; a main series is on unless explicitly turned off */
function followed(c){
  if(c.optIn) return followedSub().includes(c.id);
  const h=hiddenSeries(), mainCount=CHAMPS.filter(x=>!x.optIn).length;
  return !h.includes(c.id)||h.length>=mainCount;
}
const segHtml=(now,opts,fn)=>opts.map(([k,l])=>`<button class="${String(k)===String(now)?"on":""}" onclick="${fn}('${k}')">${l}</button>`).join("");
function setGoDays(v){ LSset(K.goDays,v); renderSettingsMore(); renderHero(); if(cur) renderWatch(); }
function setTimes(v){ LSset(K.times,v); renderSettingsMore(); if(cur){ renderNow(); renderSchedule(); } }
function toggleFollow(id){
  const c=champ(id); if(!c) return;
  if(c.optIn){ let s=followedSub(); s=s.includes(id)?s.filter(x=>x!==id):s.concat(id); LSset(K.followSub,JSON.stringify(s)); renderSettingsMore(); renderHome(); return; }
  let h=hiddenSeries(); const mainCount=CHAMPS.filter(x=>!x.optIn).length;
  if(h.includes(id)) h=h.filter(x=>x!==id); else{ if(h.length>=mainCount-1){ toast("Keep at least one series"); return; } h.push(id); }
  LSset(K.unfollow,JSON.stringify(h)); renderSettingsMore(); renderHome();
}
function toggleAwake(){ LSset(K.awake,LSget(K.awake,"0")==="1"?"0":"1"); renderSettingsMore(); updateWake(); }
function toggleHaptics(){ LSset(K.haptics,LSget(K.haptics,"1")==="1"?"0":"1"); renderSettingsMore(); if(LSget(K.haptics,"1")==="1"){ try{ navigator.vibrate&&navigator.vibrate(30); }catch(e){} } }
function renderSettingsMore(){
  const q=s=>document.querySelectorAll(s), on=(id,v)=>{ const b=document.getElementById(id); if(b){ b.classList.toggle("on",v); b.setAttribute("aria-checked",v); } };
  q(".goSeg").forEach(el=>{ el.innerHTML=segHtml(goDays(),[[7,"1 week"],[14,"2 weeks"],[30,"1 month"]],"setGoDays"); });
  q(".timeSeg").forEach(el=>{ el.innerHTML=segHtml(timesPref(),[["track","Track time"],["mine","My time"]],"setTimes"); });
  const fl=document.getElementById("followList"); if(fl) fl.innerHTML=orderedChamps().map(c=>`<div class="frow" data-id="${c.id}"><button class="fhandle" aria-label="Drag to reorder ${esc(c.name)}"><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><span>${esc(c.name)}</span><button class="sw${followed(c)?" on":""}" role="switch" aria-checked="${followed(c)}" aria-label="Show ${esc(c.name)}" onclick="toggleFollow('${c.id}')"><i></i></button></div>`).join("");
  on("awakeSw",LSget(K.awake,"0")==="1"); on("hapSw",LSget(K.haptics,"1")==="1");
}
/* drag the handle in "Series I follow" to set the order series appear everywhere: siblings slide out of the way
   as you drag past them (transform only, no DOM move yet), and the real reorder + save happens once on release. */
(function(){
  let dragEl=null, rowH=0, startIdx=0, slots=0, order=[];
  document.addEventListener("touchstart",e=>{
    const h=e.target.closest(".fhandle"); if(!h) return; const row=h.closest(".frow"); if(!row) return;
    order=[...row.parentElement.children]; dragEl=row; startIdx=order.indexOf(row); slots=0; rowH=row.offsetHeight;
    dragEl.dataset.sy=e.touches[0].clientY; dragEl.style.transition="none"; dragEl.classList.add("dragging");
  },{passive:true});
  document.addEventListener("touchmove",e=>{
    if(!dragEl) return; const dy=e.touches[0].clientY-dragEl.dataset.sy;
    dragEl.style.transform=`translateY(${dy}px)`;
    const newSlots=Math.max(-startIdx,Math.min(order.length-1-startIdx,Math.round(dy/rowH)));
    if(newSlots!==slots){
      slots=newSlots; const targetIdx=startIdx+slots;
      order.forEach((r,i)=>{ if(r===dragEl) return;
        let shift=0;
        if(startIdx<targetIdx&&i>startIdx&&i<=targetIdx) shift=-1;
        else if(startIdx>targetIdx&&i<startIdx&&i>=targetIdx) shift=1;
        r.style.transition="transform .15s"; r.style.transform=shift?`translateY(${shift*rowH}px)`:"";
      });
    }
  },{passive:true});
  document.addEventListener("touchend",()=>{
    if(!dragEl) return;
    const finalIdx=startIdx+slots;
    order.forEach(r=>{ r.style.transition=""; r.style.transform=""; });
    dragEl.classList.remove("dragging"); dragEl.style.transition="";
    if(finalIdx!==startIdx){
      const ids=order.map(r=>r.dataset.id); const [moved]=ids.splice(startIdx,1); ids.splice(finalIdx,0,moved);
      setSeriesOrderIds(ids); renderSettingsMore(); renderHome();
    }
    dragEl=null;
  });
})();
let myRows=[];
function renderMyRaces(){
  const el=document.getElementById("myRaces"); if(!el) return; myRows=[];
  goingList().forEach(k=>{ const [tid,d,...nm]=k.split("|"), t=TRACKS.find(x=>x.id===tid), e=t&&t.events.find(x=>x.d===d&&x.e===nm.join("|")); if(t&&e&&!eventDone(t,e)) myRows.push({t,e}); });
  myRows.sort((x,y)=>x.e.d.localeCompare(y.e.d));
  el.innerHTML=myRows.length?myRows.map((r,i)=>`<div class="myrace"><button class="mrmain" onclick="openTrack('${r.t.id}','home')"><b>${esc(r.t.short)}</b><span>${esc(r.e.e)}</span><small>${esc(fmtRange(r.e))}</small></button><button class="mrx" aria-label="Remove ${esc(r.t.short)} from my races" onclick="removeMyRace(${i})">&times;</button></div>`).join(""):`<small>None yet. Tap the ticket on any race, in a series list or a track's Events tab.</small>`;
}
function removeMyRace(i){ const r=myRows[i]; if(!r) return; setGoing(r.t,r.e,false); renderMyRaces(); renderHero(); if(curChamp) renderSeries(); }
function tzNote(){
  const el=document.getElementById("schedNote"); if(!el) return; const phone=Intl.DateTimeFormat().resolvedOptions().timeZone;
  if(!cur||!cur.tz||Math.abs(tzOffsetMs(new Date(),cur.tz)-tzOffsetMs(new Date(),phone))<60000){ el.hidden=true; return; }
  const ab=new Date().toLocaleTimeString("en-US",{timeZone:cur.tz,timeZoneName:"short"}).split(" ").pop();
  el.hidden=false; el.textContent=timesPref()==="mine"?"Times are in your time zone. Days follow the track's calendar.":`Times are track time (${ab}).`;
}
/* keep the screen awake while the map is open (only if you turned it on and the phone supports it) */
var wakeLock=null;
async function updateWake(){
  const want=LSget(K.awake,"0")==="1"&&document.visibilityState==="visible"&&document.body.classList.contains("mapmode");
  try{ if(want&&!wakeLock&&navigator.wakeLock){ wakeLock=await navigator.wakeLock.request("screen"); wakeLock.addEventListener("release",()=>{ wakeLock=null; }); }
       else if(!want&&wakeLock){ const w=wakeLock; wakeLock=null; await w.release(); } }catch(e){ wakeLock=null; }
}
document.addEventListener("visibilitychange",updateWake);
/* about, and a way to fetch the newest version without deleting the app */
function renderAbout(){
  const v=document.getElementById("abVer"), d=document.getElementById("abData");
  if(d&&typeof DATA_UPDATED!=="undefined") d.textContent=new Date(DATA_UPDATED+"T12:00:00").toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"});
  if(v){ v.textContent="…"; (window.caches?caches.keys():Promise.resolve([])).then(ks=>{ const k=ks.find(x=>/^paddock-v\d+/.test(x)); v.textContent=k?k.replace("paddock-",""):"not installed on this phone yet"; }).catch(()=>{ v.textContent="unknown"; }); }
}
async function refreshApp(){
  toast("Getting the latest version…");
  try{ const rs=await navigator.serviceWorker.getRegistrations(); for(const r of rs) await r.unregister(); for(const k of await caches.keys()) if(k.startsWith("paddock-")&&k!=="paddock-fonts") await caches.delete(k); }catch(e){}
  location.reload();
}
