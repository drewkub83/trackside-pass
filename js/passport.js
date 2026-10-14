/* Trackside Pass: passport, stamps and badges.
   Everything is kept on this phone (no account yet). A stamp is only earned at a track, on a day inside one of its race weekends. */
const PP_KEY="paddock:passport", PP_ON_KEY="paddock:pp";
function ppOn(){ try{ return localStorage.getItem(PP_ON_KEY)==="1"; }catch(e){ return false; } }
function ppLoad(){ try{ const j=JSON.parse(localStorage.getItem(PP_KEY)||"null"); if(j&&Array.isArray(j.stamps)) return {stamps:j.stamps,unlocked:j.unlocked||{}}; }catch(e){} return {stamps:[],unlocked:{}}; }
function ppSave(p){ try{ localStorage.setItem(PP_KEY,JSON.stringify(p)); }catch(e){} }
function ppTracks(){ const o=anyOrder().map(x=>x.t); return o.concat(TRACKS.filter(t=>!o.includes(t))); }

/* ---------------- what counts ---------------- */
function trackToday(t){ return new Date().toLocaleDateString("en-CA",{timeZone:t.tz}); }
function activeEvent(t){ const today=trackToday(t); return t.events.find(e=>!/test/i.test(e.s||"")&&e.d<=today&&today<=eventEnd(e))||null; }
/* an IMSA Endurance Cup round: the WeatherTech Championship races of six hours or more (Rolex 24, Sebring 12, the Glen 6, Road America 6, Petit Le Mans 10) */
const ppIsEndu=(e,min)=>{ const m=/IMSA WeatherTech, (\d+) hours/.exec(e.s||""); return !!m&&+m[1]>=(min||6); };
function ppStats(p){
  const ids=new Set(TRACKS.map(t=>t.id)), by={}; p.stamps.forEach(s=>{ if(ids.has(s.t)) (by[s.t]=by[s.t]||[]).push(s); });
  const visits={}; let full=false;
  Object.keys(by).forEach(id=>{ const t=TRACKS.find(x=>x.id===id), evs=new Set(by[id].map(s=>s.ev)); visits[id]=evs.size;
    evs.forEach(ev=>{ const e=t.events.find(x=>x.d===ev), n=e?(e.t||1):1; if(n>=2&&new Set(by[id].filter(s=>s.ev===ev).map(s=>s.day)).size>=n) full=true; }); });
  /* which series raced on the days you checked in, and how far you have travelled */
  const series=new Set(); let bill=false, marathon=false, endu=false; const endLong=new Set(); const zones=new Set(), zoneOf=tz=>/^Europe\//.test(tz)?"EU":/Los_Angeles/.test(tz)?"PT":/Phoenix|Denver/.test(tz)?"MT":/Chicago/.test(tz)?"CT":"ET";
  Object.keys(by).forEach(id=>{ const t=TRACKS.find(x=>x.id===id); zones.add(zoneOf(t.tz||""));
    by[id].forEach(s=>{ const ids=new Set(); t.events.filter(e=>!/test/i.test(e.s||"")&&e.d<=s.day&&s.day<=eventEnd(e)).forEach(e=>{ CHAMPS.forEach(c=>{ if(inChamp(c,e)) ids.add(c.id); }); if(/NASCAR/i.test(e.s||"")) ids.add("nascar"); if(/Formula 1/i.test(e.s||"")) ids.add("f1"); if(ppIsEndu(e)) endu=true; if(ppIsEndu(e,10)) endLong.add(id); });
      ids.forEach(i=>series.add(i)); if(ids.size>=2) bill=true; });
    new Set(by[id].map(s=>s.ev)).forEach(ev=>{ const e=t.events.find(x=>x.d===ev); if(e&&(e.t||1)>=4&&new Set(by[id].filter(s=>s.ev===ev).map(s=>s.day)).size>=e.t) marathon=true; }); });
  const imsa=TRACKS.filter(t=>t.events.some(e=>isImsa(e))); return {by,visits,full,series,bill,marathon,endu,endLong,zones:zones.size,weekends:Object.values(visits).reduce((a,b)=>a+b,0),tracks:Object.keys(by).length,total:TRACKS.length,imsaTotal:imsa.length,imsaVisited:imsa.filter(t=>visits[t.id]>0).length};
}
const PP_GLOBAL=[
  {id:"first",name:"First Stamp",desc:"Check in at your first race weekend.",icon:"star",tier:"x",test:s=>s.tracks>=1},
  {id:"hopper",name:"Track Hopper",desc:"Visit 3 different tracks.",icon:"hop",tier:"b",sty:"hopper",test:s=>s.tracks>=3},
  {id:"tripper",name:"Road Tripper",desc:"Visit 6 different tracks.",icon:"sign",tier:"s",sty:"tripper",test:s=>s.tracks>=6},
  {id:"weekend",name:"Full Weekend",desc:"Check in every day of one race weekend.",icon:"cal",tier:"s",sty:"wkend",test:s=>s.full},
  {id:"street",name:"Street Fighter",desc:"Visit two street circuits: Long Beach, Detroit, St. Petersburg or Arlington.",icon:"wall",tier:"s",sty:"street",test:s=>["long-beach","detroit","st-petersburg","arlington"].filter(i=>s.visits[i]>0).length>=2},
  {id:"jungle",name:"Concrete Jungle",desc:"Visit all four street circuits: Long Beach, Detroit, St. Petersburg and Arlington.",icon:"city",tier:"g",sty:"jungle",test:s=>["long-beach","detroit","st-petersburg","arlington"].every(i=>s.visits[i]>0)},
  {id:"endurance",name:"Endurance Triple",desc:"Check in at the Rolex 24, the Sebring 12 Hours and Petit Le Mans: IMSA's three races of 10 hours or more.",icon:"moon",tier:"g",sty:"triple",test:s=>["daytona","sebring","road-atlanta"].every(i=>s.endLong.has(i))},
  {id:"endcup",name:"Endurance Cup",desc:"Check in at an IMSA Endurance Cup weekend: the Rolex 24, Sebring 12 Hours, Six Hours of the Glen, Road America six-hour or Petit Le Mans.",icon:"moon",tier:"s",sty:"endcup",test:s=>s.endu},
  {id:"tour",name:"IMSA Grand Tour",desc:"Visit every venue on the IMSA schedule.",icon:"cup",tier:"g",sty:"imsa",test:s=>s.imsaVisited>=s.imsaTotal},
  /* by series */
  {id:"sportscar",name:"Sports Car Fan",desc:"Check in at an IMSA WeatherTech weekend.",icon:"car",tier:"x",sty:"sportscar",test:s=>s.series.has("imsa")},
  {id:"openwheel",name:"Open Wheel",desc:"Check in at an IndyCar weekend.",icon:"wheel",tier:"x",sty:"openwheel",test:s=>s.series.has("indycar")},
  {id:"gtfan",name:"GT Fan",desc:"Check in at a GT World Challenge America weekend.",icon:"gt",tier:"x",sty:"gtwca",test:s=>s.series.has("gtwca")},
  {id:"stock",name:"Stock Car",desc:"Check in at a NASCAR weekend.",icon:"stockcar",tier:"x",sty:"nascar",test:s=>s.series.has("nascar")},
  {id:"grandprix",name:"Grand Prix",desc:"Check in at a Formula 1 weekend.",icon:"flag",tier:"s",sty:"f1",test:s=>s.series.has("f1")},
  {id:"double",name:"Double Bill",desc:"Check in on a day when two series raced at the same track.",icon:"two",tier:"s",test:s=>s.bill},
  {id:"trifecta",name:"Series Trifecta",desc:"Check in at IMSA, IndyCar and GT World weekends.",icon:"three",tier:"g",test:s=>["imsa","indycar","gtwca"].every(i=>s.series.has(i))},
  /* places */
  {id:"zones",name:"Time Zone Traveler",desc:"Check in at tracks in three different time zones.",icon:"globe2",tier:"s",test:s=>s.zones>=3},
  {id:"border",name:"Border Crosser",desc:"Visit Canadian Tire Motorsport Park in Canada.",icon:"leaf",tier:"s",test:s=>s.visits["canadian-tire-motorsport-park"]>0},
  {id:"sunshine",name:"Sunshine State",desc:"Visit Daytona, Sebring and St. Petersburg.",icon:"fl",tier:"s",test:s=>["daytona","sebring","st-petersburg"].every(i=>s.visits[i]>0)},
  {id:"lonestar",name:"Lone Star",desc:"Visit Circuit of the Americas and Arlington.",icon:"tx",tier:"s",test:s=>s.visits["cota"]>0&&s.visits["arlington"]>0},
  {id:"lakes",name:"Great Lakes Loop",desc:"Visit Road America, Mid-Ohio and Detroit.",icon:"waves",tier:"s",test:s=>["road-america","mid-ohio","detroit"].every(i=>s.visits[i]>0)},
  {id:"golden",name:"Golden State",desc:"Visit Long Beach, Laguna Seca and Sonoma.",icon:"ca",tier:"s",test:s=>["long-beach","laguna-seca","sonoma"].every(i=>s.visits[i]>0)},
  {id:"peach",name:"Peach and Bama",desc:"Visit Road Atlanta and Barber.",icon:"peach",tier:"b",test:s=>s.visits["road-atlanta"]>0&&s.visits["barber"]>0},
  {id:"banks",name:"High Banks",desc:"Visit an oval: Daytona or Phoenix.",icon:"tri",tier:"b",test:s=>s.visits["daytona"]>0||s.visits["phoenix"]>0},
  /* how much */
  {id:"marathon",name:"Marathon",desc:"Check in every day of a four-day race weekend.",icon:"clock",tier:"g",test:s=>s.marathon},
  {id:"ten",name:"Ten Weekends",desc:"Check in at 10 race weekends.",icon:"cal",tier:"s",test:s=>s.weekends>=10},
  {id:"season",name:"Season Ticket",desc:"Check in at 25 race weekends.",icon:"cup",tier:"g",test:s=>s.weekends>=25},
  {id:"grand",name:"Grand Tourer",desc:"Visit 10 different tracks.",icon:"van",tier:"g",sty:"grand",test:s=>s.tracks>=10},
  {id:"fullgrid",name:"Full Grid",desc:"Visit every track in the app. The rarest stamp of all.",icon:"grid",tier:"z",test:s=>s.tracks>=s.total}
];
const PP_TIERS=[["First Visit","b","Check in at %s during a race weekend."],["Return Visit","s","Come back for a second race weekend at %s."],["Regular","g","Three race weekends at %s."]];
function ppTrackDefs(){ return TRACKS.flatMap(t=>PP_TIERS.map(([n,tier,d],i)=>({id:`t:${t.id}:${i+1}`,name:`${t.short} · ${n}`,desc:d.replace("%s",t.short),tier,track:t,test:s=>(s.visits[t.id]||0)>=i+1}))); }
function ppEvaluate(p){       /* unlock anything newly earned; returns the new badges (track badges first) */
  const st=ppStats(p), fresh=[]; ppTrackDefs().concat(PP_GLOBAL).forEach(d=>{ if(!p.unlocked[d.id]&&d.test(st)){ p.unlocked[d.id]=Date.now(); fresh.push(d); } }); return fresh;
}

/* ---------------- stamping ---------------- */
function ppMsg(t,ev){ return ev?`${t.short}: ${ev.e}`:`${t.short}`; }
function passportStamp(t){       /* {ok, why, fresh, already, ev} */
  const ev=activeEvent(t); if(!ev) return {ok:false,why:"no-event"};
  const day=trackToday(t), p=ppLoad();
  if(p.stamps.some(s=>s.t===t.id&&s.day===day)) return {ok:true,already:true,ev};
  p.stamps.push({t:t.id,ev:ev.d,day,at:Date.now()}); const fresh=ppEvaluate(p); ppSave(p); renderPassportCard(); if(document.getElementById("passport").classList.contains("on")) renderPassport();
  if(fresh.length) setTimeout(()=>ppEnqueue(fresh),900); else toast(`Stamped: ${ppMsg(t,ev)}`);
  return {ok:true,fresh,ev};
}
let ppBusy=false;
async function passportLaunch(){       /* on launch and after a long break: one cached location fix, no continuous tracking */
  if(!ppOn()||ppBusy) return; ppBusy=true;
  try{ try{ const q=navigator.permissions&&await navigator.permissions.query({name:"geolocation"}); if(q&&q.state==="denied") return; }catch(e){}
    const t=await whereAmI(9000); if(t) passportStamp(t);
  } finally { ppBusy=false; }
}
async function passportManual(){
  const st=document.getElementById("ppStatus"); st.textContent="Checking your location…";
  const t=await whereAmI(15000);
  if(t===undefined){ st.textContent="Location is blocked. Allow it for this app in your phone's settings, then try again."; return; }
  if(!t){ st.textContent="You're not at a track right now."; return; }
  const r=passportStamp(t);
  st.textContent=!r.ok?`You're at ${t.short}, but there's no race weekend today. Stamps only count during a race weekend.`:r.already?`You're already stamped for today at ${t.short}.`:`Stamped: ${ppMsg(t,r.ev)}`;
}
async function togglePassportAuto(){
  if(ppOn()){ try{ localStorage.setItem(PP_ON_KEY,"0"); }catch(e){} renderPpSw(); toast("Off. Use Check in here on the passport page."); return; }
  toast("Checking your location…"); const t=await whereAmI(15000);
  if(t===undefined){ toast("Location is blocked. Allow it for this app in your phone's settings, then try again."); return; }
  try{ localStorage.setItem(PP_ON_KEY,"1"); }catch(e){} renderPpSw();
  if(t){ const r=passportStamp(t); if(!r.ok) toast(`On. No race weekend at ${t.short} today.`); } else toast("On. It checks when you open the app at a race weekend.");
}
function renderPpSw(){ const b=document.getElementById("ppSw"); if(!b) return; const on=ppOn(); b.classList.toggle("on",on); b.setAttribute("aria-checked",on); }
/* tapping locate at a track during a race weekend also stamps (only when the switch is on) */
{ const _pp=placeYou; let last=0; placeYou=function(x,y,l){ _pp(x,y,l); if(ppOn()&&userPos&&userPos.inside&&cur&&Date.now()-last>60000){ last=Date.now(); passportStamp(cur); } }; }
passportLaunch();
let ppHidden=0; document.addEventListener("visibilitychange",()=>{ if(document.hidden) ppHidden=Date.now(); else if(ppHidden&&Date.now()-ppHidden>20*60000){ ppHidden=0; passportLaunch(); } });

/* ---------------- badge art ---------------- */
const PP_ICON={
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  hop:'<path d="M4.6 20.5s-2.6-2.6-2.6-4.7a2.6 2.6 0 0 1 5.2 0c0 2.1-2.6 4.7-2.6 4.7zM12 20.5s-2.6-2.6-2.6-4.7a2.6 2.6 0 0 1 5.2 0c0 2.1-2.6 4.7-2.6 4.7zM19.4 20.5s-2.6-2.6-2.6-4.7a2.6 2.6 0 0 1 5.2 0c0 2.1-2.6 4.7-2.6 4.7z"/><circle cx="4.6" cy="15.8" r=".7"/><circle cx="12" cy="15.8" r=".7"/><circle cx="19.4" cy="15.8" r=".7"/><path d="M5 11.2C6.5 5.5 10 5.5 11.6 11.2M12.4 11.2C14 5.5 17.5 5.5 19 11.2" stroke-dasharray="1.5 2"/>',
  sign:'<path d="M4 21l6.2-13h3.6L20 21z"/><path d="M12 10.5v2M12 15v2M12 19v1.5"/><circle cx="18" cy="5" r="2.2"/><path d="M3 21h18"/>',
  cup:'<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 20h8"/>',
  city:'<path d="M3 21V11h5v10M8 21V4h7v17M15 21v-8h6v8M3 21h18"/><path d="M10.5 8h2M10.5 12h2M10.5 16h2"/>',
  moon:'<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/><path d="M15 5v3M13.5 6.5h3"/>',
  cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M8 3v4M16 3v4M9 15l2 2 4-4"/>',
  wall:'<g stroke-width="2.5"><rect x="1.6" y="9.6" width="4.6" height="5.4" rx="2"/><path d="M5.6 6.3c0-1.8 1.4-3.1 3.1-3.1h1.6c2.1 0 3.7 1.8 3.7 4v3.6c0 2.1-1.7 3.9-3.7 3.9H8.7a3.1 3.1 0 0 1-3.1-3.1z"/><rect x="17.8" y="9.6" width="4.6" height="5.4" rx="2"/><path d="M18.4 6.3c0-1.8-1.4-3.1-3.1-3.1h-1.6c-2.1 0-3.7 1.8-3.7 4v3.6c0 2.1 1.7 3.9 3.7 3.9h1.6a3.1 3.1 0 0 0 3.1-3.1z"/></g>',
  car:'<path d="M2 17c0-1.5 1.3-2.4 3.2-3l5.4-1.6 2.6-3.1h3l1.6 3.2 3.4.8c1.2.3 1.8 1.1 1.8 2.5V17z"/><path d="M18.4 12.7l1.3-4.3h1.9"/><path d="M2 17h2.6M9.6 17h5M19.4 17H22"/><circle cx="7.2" cy="17.4" r="2.1"/><circle cx="17" cy="17.4" r="2.1"/>',
  wheel:'<rect x="4" y="2.6" width="16" height="2.4" rx=".9"/><path d="M11 5h2l.8 6c1.2.5 1.7 1.6 1.7 3.4V18h-7v-3.6c0-1.8.5-2.9 1.7-3.4z"/><rect x="4.4" y="6.6" width="3.2" height="5" rx=".9"/><rect x="16.4" y="6.6" width="3.2" height="5" rx=".9"/><rect x="3.9" y="13.6" width="3.8" height="5.8" rx="1"/><rect x="16.3" y="13.6" width="3.8" height="5.8" rx="1"/><path d="M7.6 9h3.6M12.8 9h3.6M7.7 16.5h1.6M14.7 16.5h1.6"/><rect x="5" y="20.4" width="14" height="2" rx=".9"/><circle cx="12" cy="13.6" r="1.3"/>',
  gt:'<path d="M2.5 4.8h19M2.5 3.6v3.6M21.5 3.6v3.6M8 4.8v3.4M16 4.8v3.4"/><path d="M6.5 8.6h11l1.8 4H4.7z"/><path d="M3 12.6h18l.5 5.4H2.5z"/><path d="M5 15.2h3.6M15.4 15.2H19"/><rect x="1.5" y="13.6" width="2.4" height="6" rx=".8"/><rect x="20.1" y="13.6" width="2.4" height="6" rx=".8"/><path d="M8.5 20.5h7"/>',
  oval:'<ellipse cx="12" cy="12" rx="9" ry="5.5"/><ellipse cx="12" cy="12" rx="4.6" ry="2.1"/>',
  flag:'<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M12 14v4M8 20h8"/><path d="M3.2 2.4l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9z"/><path d="M20.3 8l.7 1.7 1.7.7-1.7.7-.7 1.7-.7-1.7-1.7-.7 1.7-.7z"/><circle cx="4.6" cy="18.6" r=".9"/><circle cx="19.4" cy="18.6" r=".9"/>',
  three:'<circle cx="9" cy="10" r="4.5"/><circle cx="15" cy="10" r="4.5"/><circle cx="12" cy="15" r="4.5"/>',
  two:'<circle cx="9" cy="12" r="5"/><circle cx="15" cy="12" r="5"/>',
  globe:'<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17"/>',
  leaf:'<g stroke-width="2.3"><rect x="2.2" y="9.6" width="19.6" height="3" rx="1.3"/><path d="M4 12.6V20M20 12.6V20"/></g><path d="M2 20h20" stroke-width="1.6"/><path d="M6.3 9.6v3M11 9.6v3M15.7 9.6v3" stroke-width="1.3"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
  waves:'<path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>',
  hills:'<path d="M2 19l6-9 4 5 3-4 7 8z"/><circle cx="16" cy="6" r="2"/>',
  grid:'<rect x="4" y="4" width="16" height="16"/><path d="M4 9.3h16M4 14.7h16M9.3 4v16M14.7 4v16"/>',
  stockcar:'<path d="M2 16.6V14l2.6-1.3 3.6-.5 1.9-3.6h6.2l2.3 3.6 3.4.8v3.6z"/><path d="M11.1 9.9L9.7 12.2H17l-1.4-2.3z"/><path d="M20.2 12.6V10h1.8"/><path d="M2 16.6h2.6M9.6 16.6h5.2M19.2 16.6H22"/><circle cx="7" cy="17" r="2.1"/><circle cx="17" cy="17" r="2.1"/>',
  globe2:'<g transform="rotate(20 12 12)"><circle cx="12" cy="12" r="8.6"/><path d="M12 3.4c-3.6 3-3.6 14.2 0 17.2M12 3.4c3.6 3 3.6 14.2 0 17.2M3.4 12h17.2M4.9 7.7c4.6 2 9.6 2 14.2 0M4.9 16.3c4.6-2 9.6-2 14.2 0"/></g><path d="M8 22h8"/>',
  fl:'<circle cx="12" cy="12" r="5.2"/><path d="M20.4 12.0L23.6 12.0M17.94 17.94L20.2 20.2M12.0 20.4L12.0 23.6M6.06 17.94L3.8 20.2M3.6 12.0L0.4 12.0M6.06 6.06L3.8 3.8M12.0 3.6L12.0 0.4M17.94 6.06L20.2 3.8"/>',
  tx:'<path d="M2.5,17 C4.5,15.8 6,14.9 7.5,14.5 C8,8.5 10,6.2 12.1,6.1 C14.3,6 16.3,8.3 16.8,14 C18.5,12.8 20.2,11.3 21.7,9.3"/><path d="M2.5,17 C5,18.6 9,18.6 13,17.6 C16,16.8 18.5,15 21.7,9.3"/><path d="M13.2,8.3 C14.8,9.3 14.6,11.5 12.9,12.1"/>',
  ca:'<path d="M4.2 2.8H11.6V8.6L20.6 17.4L19.6 20.6L15.6 21.6L12.6 20L10.4 18.2L8.4 15.4L6.6 12L5.2 8.4L4.2 5.2Z"/>',
  peach:'<path d="M6.2 9.6c-3.2 0-5.1 2.5-5.1 5.2 0 2.6 2 4.5 5.1 4.5s5.1-1.9 5.1-4.5c0-2.7-1.9-5.2-5.1-5.2z"/><path d="M6.2 9.6c-.7 2.4 0 6.4 0 9.7"/><path d="M6.2 9.4c.3-1.6 1.5-2.6 3.1-2.8-.1 1.5-1.2 2.7-3.1 2.8z"/><path d="M12.5 3H19.6L21 10L21.6 15L20.9 19.4H17.2L17.4 22H16.2L15.8 20.4L14.6 20.6L14.5 21.9L13.3 21.6L12.9 19.6Z"/><path d="M16.4 7.5L16.81 8.63L18.02 8.67L17.07 9.42L17.4 10.58L16.4 9.9L15.4 10.58L15.73 9.42L14.78 8.67L15.99 8.63Z"/>',
  tri:'<path d="M3 11.5c0-3.4 3.2-5.6 7.4-5.6h6.2c3 0 5.4 1.9 5.4 4.7 0 2.2-1.3 3.7-3.4 4.6l-3.6 1.6c-1.7.7-3.6.7-5.3 0L6 16C4 15.1 3 13.7 3 11.5z"/><g transform="translate(12 11.2) scale(.55) translate(-12 -11.2)"><path d="M3 11.5c0-3.4 3.2-5.6 7.4-5.6h6.2c3 0 5.4 1.9 5.4 4.7 0 2.2-1.3 3.7-3.4 4.6l-3.6 1.6c-1.7.7-3.6.7-5.3 0L6 16C4 15.1 3 13.7 3 11.5z"/></g><path d="M8 20.5h8"/>',
  van:'<g transform="rotate(-20 12 12)"><ellipse cx="12" cy="8" rx="5" ry="4.3"/><path d="M9.2 8.9c.7-1.6 2.5-2.6 4.4-2.3" stroke-width="1.4"/><path d="M12 12.1v9.3" stroke-width="2.4"/></g>',
  clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>'
};
/* stamps are ink on paper: blue for a first visit, red for a return, violet for a regular, teal for the specials */
const PP_INK={b:"#2F5FA8",s:"#B23A32",g:"#6A3FA0",x:"#1D6B73",z:"#A87712"};
const PP_MON=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const ppDate=ms=>{ const d=new Date(ms); return d.getDate()+" "+PP_MON[d.getMonth()]+" "+d.getFullYear(); };
function ppRot(id){ let h=7; for(const c of String(id)) h=(h*31+c.charCodeAt(0))%997; return (h%17)-8; }      /* the same slight tilt every time, like a hand stamp */
const ppFs=(txt,len)=>Math.max(6.4,Math.min(12.5,len/(txt.length*0.74)));
function ppOutline(t,size,sw){ const b=trackBox(t), sc=Math.min(size/b[2],size/b[3]); return `viewBox="${b.join(" ")}"><path d="${t.path}" fill="none" stroke="${sw.c}" stroke-width="${(sw.w/sc).toFixed(1)}" stroke-linejoin="round" stroke-linecap="round"/>`; }
let ppUid=0;
function ppFilter(u,rough){ return rough?`<filter id="st${u}f" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="1" seed="${(u%37)+2}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -4 3.25" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="c"/><feDisplacementMap in="c" in2="n" scale="1.5" xChannelSelector="R" yChannelSelector="G"/></filter>`:""; }
/* ---------------- series stamps: a two-colour bezel stamp per series (IMSA first) ----------------
   The centre is a halftone map of North America with a dot on every venue of the series; a venue you have checked
   in at is filled amber, so the stamp doubles as a progress map. Coastlines: Natural Earth (public domain),
   simplified, as [lon,lat] rings (mainland United States, then southern Canada). */
const PP_SERIES={
  imsa:{champ:"imsa",ink:"#22272E",acc:"#C98400",top:"IMSA",bot:"GRAND TOUR"},
  sportscar:{kind:"flags",band:true,ink:"#22272E",acc:"#C98400",top:"SPORTS CAR FAN",bot:"IMSA WEEKEND",size:9.2,space:2.2},
  openwheel:{kind:"ofcar",band:true,bandInk:"#17402F",ink:"#17402F",acc:"#C23B22",top:"OPEN WHEEL",bot:"INDYCAR WEEKEND",size:9.2,space:2.2},
  gtwca:{champ:"gtwca",ink:"#1B2A6B",acc:"#C8202A",top:"GT WORLD",bot:"GT FAN",size:10,space:2},
  nascar:{match:/NASCAR/i,ink:"#6E1822",acc:"#C28A00",top:"NASCAR",bot:"STOCK CAR",size:11.5,space:3},
  endcup:{endu:6,route:true,band:true,ink:"#1E2238",acc:"#C98400",top:"IMSA ENDURANCE CUP",bot:"6 TO 24 HOURS",size:9.2,space:1.9},
  triple:{endu:10,route:true,band:true,bandInk:"#C98400",bandText:"#1E2238",ink:"#1E2238",acc:"#C98400",top:"ENDURANCE TRIPLE",bot:"10 TO 24 HOURS",size:9.2,space:1.9},
  hopper:{kind:"tracks",band:true,bandInk:"#23406B",ink:"#1B2F52",acc:"#C28A00",top:"TRACK HOPPER",bot:"3 TRACKS",size:9.2,space:2.2},
  tripper:{kind:"tracks",route:"visited",band:true,bandInk:"#8A2B22",ink:"#6E2019",acc:"#C28A00",top:"ROAD TRIPPER",bot:"6 TRACKS",size:9.2,space:2.2},
  grand:{kind:"tracks",route:"visited",band:true,bandInk:"#C28A00",bandText:"#1E2238",ink:"#1E2238",acc:"#C28A00",top:"GRAND TOURER",bot:"10 TRACKS",size:9.2,space:2.2},
  wkend:{kind:"days",band:true,bandInk:"#1B5E5A",ink:"#134B48",acc:"#C28A00",top:"FULL WEEKEND",bot:"EVERY DAY",size:9.2,space:2.2},
  street:{kind:"outlines",ids:["long-beach","detroit","st-petersburg","arlington"],band:true,bandInk:"#2F3A45",ink:"#2F3A45",acc:"#D9622B",top:"STREET FIGHTER",bot:"2 STREET CIRCUITS",size:8.6,space:1.7},
  jungle:{kind:"outlines",ids:["long-beach","detroit","st-petersburg","arlington"],band:true,bandInk:"#C28A00",bandText:"#2F3A45",ink:"#2F3A45",acc:"#D9622B",top:"CONCRETE JUNGLE",bot:"ALL FOUR CIRCUITS",size:8.6,space:1.7},
  f1:{match:/Formula 1/i,ink:"#1D1D22",acc:"#D0202A",top:"FORMULA 1",bot:"GRAND PRIX",size:9.5,space:1.6}
};
const PP_LAND=[[[-122.8,49],[-95.2,49],[-95.2,49.4],[-94.8,49.4],[-94.6,48.8],[-94.3,48.7],[-92.6,48.5],[-91.6,48.1],[-90.8,48.3],[-89.3,48.0],[-88.4,48.3],[-84.9,46.9],[-84.8,46.6],[-84.5,46.5],[-84.6,46.4],[-84.1,46.5],[-83.9,46.1],[-83.5,46.0],[-83.6,45.8],[-82.6,45.3],[-82.1,43.6],[-83.1,42.1],[-83.0,41.8],[-82.7,41.7],[-78.9,42.9],[-79.2,43.5],[-78.7,43.6],[-76.8,43.6],[-76.5,44.0],[-74.9,45.0],[-71.5,45.0],[-71.4,45.3],[-70.7,45.5],[-70.0,46.7],[-69.2,47.4],[-68.9,47.2],[-68.2,47.4],[-67.8,47.1],[-67.8,45.7],[-67.0,44.8],[-70.1,43.7],[-70.8,42.9],[-70.8,42.3],[-70.5,41.8],[-70.1,41.8],[-70.2,42.1],[-69.9,41.9],[-70.0,41.6],[-72.9,41.2],[-73.7,40.9],[-72.2,41.1],[-71.9,40.9],[-73.3,40.6],[-74.0,40.6],[-74.0,40.8],[-74.3,40.5],[-74.0,40.4],[-74.2,39.7],[-74.9,38.9],[-75.0,39.2],[-75.5,39.5],[-75.3,39.0],[-75.1,38.8],[-75.1,38.4],[-75.9,37.2],[-75.7,37.9],[-76.2,38.3],[-76.3,39.1],[-76.5,38.7],[-76.3,38.1],[-77.0,38.2],[-76.3,37.9],[-76.3,37.0],[-76.0,36.9],[-75.7,35.6],[-76.4,34.8],[-77.4,34.5],[-78.1,33.9],[-78.6,33.9],[-79.1,33.5],[-79.2,33.2],[-80.9,32.0],[-81.3,31.4],[-81.5,30.7],[-81.3,30.0],[-80.5,28.5],[-80.5,28.0],[-80.1,26.9],[-80.1,25.8],[-80.4,25.2],[-80.7,25.1],[-81.2,25.2],[-81.3,25.6],[-81.7,25.9],[-82.9,27.9],[-82.7,28.6],[-82.9,29.1],[-83.7,29.9],[-84.1,30.1],[-85.1,29.6],[-85.8,30.2],[-86.4,30.4],[-87.5,30.3],[-88.4,30.4],[-89.6,30.2],[-89.4,29.9],[-89.4,29.5],[-89.2,29.3],[-89.4,29.2],[-89.8,29.3],[-90.2,29.1],[-90.9,29.1],[-91.6,29.7],[-92.5,29.6],[-93.2,29.8],[-94.7,29.5],[-95.6,28.7],[-96.6,28.3],[-97.1,27.8],[-97.4,27.4],[-97.4,26.7],[-97.1,25.9],[-97.5,25.8],[-99.0,26.4],[-99.5,27.5],[-100.1,28.1],[-101.0,29.4],[-101.7,29.8],[-102.5,29.8],[-103.1,29.0],[-103.9,29.3],[-104.5,29.6],[-105.0,30.6],[-106.5,31.8],[-108.2,31.8],[-108.2,31.3],[-111.0,31.3],[-114.8,32.5],[-114.7,32.7],[-117.1,32.5],[-117.3,33.0],[-117.9,33.6],[-118.4,33.7],[-118.5,34.0],[-119.1,34.1],[-119.4,34.3],[-120.4,34.4],[-120.6,34.6],[-120.7,35.2],[-121.7,36.2],[-122.5,37.6],[-122.5,37.8],[-123.7,39.0],[-123.9,39.8],[-124.4,40.3],[-124.2,41.1],[-124.2,42.0],[-124.5,42.8],[-124.1,43.7],[-123.9,45.5],[-124.1,46.9],[-124.7,48.2],[-124.6,48.4],[-123.1,48.0],[-122.6,47.1],[-122.3,47.4]],[[-122.8,49],[-125.6,50.4],[-127.4,50.8],[-128.0,51.7],[-127.9,52],[-81.2,52],[-79.9,51.2],[-79.1,51.5],[-78.9,52],[-56.0,52],[-57.1,51.4],[-58.8,51.1],[-60.0,50.2],[-61.7,50.1],[-63.9,50.3],[-66.4,50.2],[-67.2,49.5],[-68.5,49.1],[-71.1,46.8],[-70.3,47.0],[-68.7,48.3],[-66.6,49.1],[-65.1,49.2],[-64.2,48.7],[-65.1,48.1],[-64.5,46.2],[-63.2,45.7],[-61.5,45.9],[-60.5,47.0],[-60.4,46.3],[-59.8,45.9],[-61.0,45.3],[-64.2,44.3],[-65.4,43.5],[-66.1,43.6],[-66.2,44.5],[-64.4,45.3],[-67.1,45.1],[-67.8,45.7],[-67.8,47.1],[-68.2,47.4],[-68.9,47.2],[-69.2,47.4],[-70.0,46.7],[-70.7,45.5],[-71.4,45.3],[-71.5,45.0],[-74.9,45.0],[-76.5,44.0],[-76.8,43.6],[-78.7,43.6],[-79.2,43.5],[-78.9,42.9],[-82.7,41.7],[-83.0,41.8],[-83.1,42.1],[-82.1,43.6],[-82.6,45.3],[-83.6,45.8],[-83.5,46.0],[-83.9,46.1],[-84.1,46.5],[-84.6,46.4],[-84.5,46.5],[-84.8,46.6],[-84.9,46.9],[-88.4,48.3],[-89.3,48.0],[-90.8,48.3],[-91.6,48.1],[-92.6,48.5],[-94.3,48.7],[-94.6,48.8],[-94.8,49.4],[-95.2,49.4],[-95.2,49]]];
/* Albers equal-area conic, the usual projection for maps of the United States; returns screen-oriented x,y */
function ppAlbers(lon,lat){
  const R=Math.PI/180, p1=29.5*R, p2=45.5*R, p0=37.5*R, n=(Math.sin(p1)+Math.sin(p2))/2, C=Math.cos(p1)**2+2*n*Math.sin(p1), r0=Math.sqrt(C-2*n*Math.sin(p0))/n;
  const r=Math.sqrt(C-2*n*Math.sin(lat*R))/n, th=n*(lon+96)*R; return [r*Math.sin(th),r*Math.cos(th)-r0];
}
let ppMapFit=null;
function ppMapProj(){      /* fits the lower 48 into a box 98 x 57, centred on (80,72.5) */
  if(ppMapFit) return ppMapFit;
  const pts=PP_LAND[0].map(([x,y])=>ppAlbers(x,y)), xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]), x0=Math.min(...xs), x1=Math.max(...xs), y0=Math.min(...ys), y1=Math.max(...ys), k=Math.min(98/(x1-x0),57/(y1-y0));
  return ppMapFit=(lon,lat)=>{ const p=ppAlbers(lon,lat); return [80+(p[0]-(x0+x1)/2)*k,72.5+(p[1]-(y0+y1)/2)*k]; };
}
/* the series' mapped venues, one dot per place: layouts that share a site (Indianapolis road course and oval) merge */
function ppVenues(sp){
  const c=sp.champ&&champ(sp.champ), hit=e=>c?inChamp(c,e):sp.endu?ppIsEndu(e,sp.endu):sp.match&&(sp.match.test(e.s||"")||(e.support||[]).some(x=>sp.match.test(x))), out=[];
  const inUS=t=>{ const la=(t.geo.n+t.geo.s)/2, lo=(t.geo.w+t.geo.e)/2; return la>24&&la<50&&lo>-126&&lo<-66; };
  (sp.all||sp.kind==="tracks"?TRACKS.filter(inUS):TRACKS.filter(t=>t.events.some(hit))).forEach(t=>{ const lat=(t.geo.n+t.geo.s)/2, lon=(t.geo.w+t.geo.e)/2, key=(t.events.filter(hit).map(e=>e.d.slice(5)).sort()[0])||"", g=out.find(v=>Math.abs(v.lat-lat)<.05&&Math.abs(v.lon-lon)<.05); if(g) g.ids.push(t.id); else out.push({ids:[t.id],lat,lon,key}); });
  if(sp.route) out.sort((a,b)=>a.key.localeCompare(b.key));      /* calendar order, for the dotted route between venues */
  return out;
}
/* Crossed chequered flags, generated: each flag is a grid of squares pushed through a wave, hung from a staff; the two
   staffs cross below the flags. Everything is centred on x=80 and sits between y=40 and y=104. */
function ppFlags(ink,acc,skin){
  const COLS=7, ROWS=4; let out="";
  const flag=sd=>{      /* sd -1: the left flag, 1: the right flag (a mirror image) */
    const T=[80+sd*16,47], B=[80-sd*17,101], H=0.48;
    const P=(u,v)=>{ const a=[T[0]+(B[0]-T[0])*H*v/ROWS, T[1]+(B[1]-T[1])*H*v/ROWS], t=u/COLS, w=Math.sin(Math.PI*2*(0.95*t)+0.5)*t;
      return [a[0]+sd*(36*t-2.2*Math.sin(Math.PI*2*(0.95*t)+0.5)*t), a[1]-3*t+5.2*w+2.6*t*t+(v/ROWS)*1.5*t]; };
    const f=n=>n.toFixed(1); let cells="", edge="";
    for(let i=0;i<COLS;i++) for(let j=0;j<ROWS;j++){ const c=[P(i,j),P(i+1,j),P(i+1,j+1),P(i,j+1)], on=(i+j)%2===0;
      cells+=`<path d="M${c.map(q=>f(q[0])+" "+f(q[1])).join("L")}Z" fill="${on?ink:skin}" stroke="${on?ink:skin}" stroke-width=".35" stroke-linejoin="round"/>`; }
    const ring=[]; for(let i=0;i<=COLS;i++) ring.push(P(i,0)); for(let j=1;j<=ROWS;j++) ring.push(P(COLS,j)); for(let i=COLS-1;i>=0;i--) ring.push(P(i,ROWS)); for(let j=ROWS-1;j>0;j--) ring.push(P(0,j));
    edge=`<path d="M${ring.map(q=>f(q[0])+" "+f(q[1])).join("L")}Z" fill="none" stroke="${ink}" stroke-width="1.15" stroke-linejoin="round"/>`;
    const dx=T[0]-B[0], dy=T[1]-B[1], L=Math.hypot(dx,dy), tip=[T[0]+dx/L*5,T[1]+dy/L*5];
    return {staff:`<path d="M${f(B[0])} ${f(B[1])}L${f(tip[0])} ${f(tip[1])}" stroke="${ink}" stroke-width="2.3" stroke-linecap="round"/><circle cx="${f(tip[0])}" cy="${f(tip[1])}" r="2" fill="${acc}" stroke="${ink}" stroke-width=".7"/>`,flag:cells+edge};
  };
  const l=flag(-1), r=flag(1);
  return l.staff+r.staff+l.flag+r.flag;
}
/* A generic open-wheel (IndyCar-style) race car, built as a small 3D model (about 4.9 m long, 3.04 m wheelbase, 1.9 m wide over
   the wheels) and projected to flat-shaded polygons, painter's algorithm. Geometry is built once; colours are applied per stamp. */
const PP_OF=(function(){
  const lerp=(a,b,t)=>a+(b-a)*t, clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const pw=(pts,x)=>{ if(x<=pts[0][0]) return pts[0][1]; for(let i=1;i<pts.length;i++){ if(x<=pts[i][0]){ const [x0,y0]=pts[i-1],[x1,y1]=pts[i]; const t=(x-x0)/(x1-x0); const s=t*t*(3-2*t)*.4+t*.6; return lerp(y0,y1,s); } } return pts[pts.length-1][1]; };
  const TOP=[[0,470],[300,500],[900,610],[1500,650],[2100,665],[2600,650],[3100,640],[3500,590],[4000,470],[4500,380],[4890,300]];
  const BOT=[[0,200],[500,120],[1300,70],[4200,70],[4600,110],[4890,170]];
  const HW =[[0,230],[500,300],[1000,340],[1500,470],[2100,530],[2700,490],[3100,330],[3500,290],[4200,210],[4890,100]];
  const T=x=>pw(TOP,x), B=x=>pw(BOT,x), W=x=>pw(HW,x);
  const section=x=>{ const t=T(x), b=B(x), w=W(x), h=t-b; return [[0,b],[w*.78,b],[w,b+h*.2],[w,b+h*.62],[w*.7,t-h*.07],[w*.3,t],[0,t]]; };
  function build(opt){
    const φ=(opt.yaw||40)*Math.PI/180, θ=(opt.pitch||11)*Math.PI/180, cx=2450;
    const proj=(x,y,z)=>{ const sx=(x-cx)*Math.cos(φ)-z*Math.sin(φ), t=(x-cx)*Math.sin(φ)+z*Math.cos(φ), su=y*Math.cos(θ)-t*Math.sin(θ), d=t*Math.cos(θ)+y*Math.sin(θ); return [sx,-su,d]; };
    const view=[Math.sin(φ)*Math.cos(θ),Math.sin(θ),Math.cos(φ)*Math.cos(θ)];
    const light=(()=>{ const v=[0.5,0.85,0.5]; const n=Math.hypot(...v); return v.map(a=>a/n); })();
    const polys=[], dec=[];
    const add=(pts,kind,axis,both)=>{
      const a=pts[0],b=pts[1],c=pts[2]; const u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]]; let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]; const nl=Math.hypot(...n)||1; n=n.map(q=>q/nl);
      if(axis){ const cc=[0,1,2].map(k=>pts.reduce((s,p)=>s+p[k],0)/pts.length); if(n[0]*(cc[0]-axis[0])+n[1]*(cc[1]-axis[1])+n[2]*(cc[2]-axis[2])<0) n=n.map(q=>-q); }
      const facing=n[0]*view[0]+n[1]*view[1]+n[2]*view[2]; if(!both&&facing<=0.001) return;
      const lam=Math.max(0,n[0]*light[0]+n[1]*light[1]+n[2]*light[2]);
      const pp=pts.map(p=>proj(p[0],p[1],p[2])); polys.push({pp,depth:pp.reduce((s,q)=>s+q[2],0)/pp.length,kind,lam});
    };
    // tub / nose / engine cover loft
    const xs=[]; for(let x=0;x<4890;x+=120) xs.push(x); xs.push(4890);
    const secs=xs.map(x=>({x,s:section(x)}));
    for(let i=0;i<secs.length-1;i++){ const A=secs[i], Bs=secs[i+1], xm=(A.x+Bs.x)/2, ax=[xm,(T(xm)+B(xm))/2,0];
      for(const sd of [1,-1]) for(let j=0;j<A.s.length-1;j++){ const P=(p,x)=>[x,p[1],p[0]*sd]; const q=[P(A.s[j],A.x),P(A.s[j+1],A.x),P(Bs.s[j+1],Bs.x),P(Bs.s[j],Bs.x)]; add(q,j===0?"under":"body",ax); } }
    const cap=(sec,x)=>{ const r=sec.s.map(([hw,y])=>[x,y,hw]), l=sec.s.slice().reverse().map(([hw,y])=>[x,y,-hw]); const pts=r.concat(l); for(let i=1;i<pts.length-1;i++) add([pts[0],pts[i],pts[i+1]],"body",[2450,300,0]); };
    cap(secs[0],0); cap(secs[secs.length-1],4890);
    // helpers
    const prism=(prof,z0,z1,kind)=>{ const ax=[prof.reduce((s,p)=>s+p[0],0)/prof.length,prof.reduce((s,p)=>s+p[1],0)/prof.length,(z0+z1)/2];
      add(prof.map(([x,y])=>[x,y,z0]),kind,ax); add(prof.map(([x,y])=>[x,y,z1]),kind,ax);
      for(let i=0;i<prof.length;i++){ const a=prof[i], b=prof[(i+1)%prof.length]; add([[a[0],a[1],z0],[b[0],b[1],z0],[b[0],b[1],z1],[a[0],a[1],z1]],kind,ax); } };
    const box=(x0,x1,y0,y1,z0,z1,kind)=>prism([[x0,y0],[x1,y0],[x1,y1],[x0,y1]],z0,z1,kind);
    // airbox / roll structure behind the driver
    prism([[1750,640],[2000,1000],[2380,1010],[2560,700]],-190,190,"body");
    // cockpit opening (dark) on the top deck
    { const y=T(2800)+4, o=[]; for(let i=0;i<20;i++){ const a=i/20*Math.PI*2; o.push(proj(2800+380*Math.cos(a),y,230*Math.sin(a))); } dec.push({pp:o,fill:"cockpit"}); }
    // helmet (sphere) and visor
    { const cxh=2760, cyh=790, r=172, rows=7, cols=14, pt=(la,lo)=>[cxh+r*Math.cos(la)*Math.cos(lo), cyh+r*Math.sin(la), r*Math.cos(la)*Math.sin(lo)];
      for(let i=0;i<rows;i++){ const la0=-Math.PI/2+i/rows*Math.PI, la1=-Math.PI/2+(i+1)/rows*Math.PI;
        for(let j=0;j<cols;j++){ const lo0=j/cols*Math.PI*2, lo1=(j+1)/cols*Math.PI*2; const q=[pt(la0,lo0),pt(la0,lo1),pt(la1,lo1),pt(la1,lo0)]; const mid=(lo0+lo1)/2, mla=(la0+la1)/2;
          let kind="helmet"; if(Math.abs(Math.cos(mid))>0.2&&Math.cos(mid)>0&&mla>-0.45&&mla<0.28) kind="visor"; if(Math.abs(Math.sin(mid))<0.3&&mla>0.2&&Math.cos(mid)>-0.2&&kind==="helmet") kind="hstripe";
          add(q,kind,[cxh,cyh,0]); } } }
    // sidepod inlet (dark) and a stripe on each side of the tub
    for(const sd of [1,-1]){ const zz=x=>sd*(W(x)+4); dec.push({pp:[[2620,175],[2980,215],[2980,400],[2620,410]].map(([x,y])=>proj(x,y,zz(x))),fill:"cockpit"}); }
    // front wing + nose pylon
    box(4640,4900,70,105,-900,900,"wing"); box(4560,4790,125,155,-850,850,"wing"); box(4700,4770,100,270,-45,45,"wing");
    for(const sd of [1,-1]) prism([[4520,40],[4960,40],[4960,330],[4720,270],[4520,200]],sd>0?880:-905,sd>0?905:-880,"plate");
    // rear wing + pylon
    box(100,620,830,875,-650,650,"wing"); box(40,400,935,975,-650,650,"wing"); box(380,460,520,835,-70,70,"wing");
    for(const sd of [1,-1]) prism([[-20,540],[740,540],[740,790],[640,1040],[-20,1050]],sd>0?650:-675,sd>0?675:-650,"plate");
    dec.push({pp:[[60,900],[640,915],[650,985],[50,975]].map(([x,y])=>proj(x,y,678)),fill:"acc"});
    // wheels and suspension
    const ell=(xc,yc,zc,r,n)=>{ const o=[]; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; o.push(proj(xc+r*Math.cos(a),yc+r*Math.sin(a),zc)); } return o; };
    const WH=[{x:4090,r:330,zi:670,zo:980},{x:1050,r:350,zi:610,zo:990}];
    const wheels=[];
    for(const sd of [1,-1]) WH.forEach(w=>{
      const zin=sd*w.zi, zout=sd*w.zo, yc=w.r, grp=[]; const dep=proj(w.x,yc,(zin+zout)/2)[2];
      for(let k=0;k<=5;k++){ const z=zin+(zout-zin)*k/5; grp.push({pp:ell(w.x,yc,z,w.r,26),fill:"tire"}); }
      if(sd>0){ grp.push({pp:ell(w.x,yc,zout+4,w.r-14,26),fill:"tire2"}); grp.push({pp:ell(w.x,yc,zout+8,w.r-70,26),fill:"cover"}); grp.push({pp:ell(w.x,yc,zout+10,w.r-82,26),fill:"coverIn"}); grp.push({pp:ell(w.x,yc,zout+14,w.r-190,18),fill:"cover"}); grp.push({pp:ell(w.x,yc,zout+18,34,12),fill:"acc"}); }
      else { grp.push({pp:ell(w.x,yc,zin-4,w.r-30,26),fill:"tire2"}); }
      wheels.push({dep,grp,sd}); });
    // suspension arms: thin quads from tub to hub
    const arm=(p0,p1,wd)=>{ const a=proj(...p0), b=proj(...p1), dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy)||1, nx=-dy/L*wd, ny=dx/L*wd; return {pp:[[a[0]+nx,a[1]+ny,0],[b[0]+nx,b[1]+ny,0],[b[0]-nx,b[1]-ny,0],[a[0]-nx,a[1]-ny,0]],fill:"arm",dep:(a[2]+b[2])/2}; };
    const arms=[]; for(const sd of [1,-1]) for(const [x,w] of [[4090,WH[0]],[1050,WH[1]]]){ const yc=w.r, zb=sd*Math.min(W(x)*.9,520), zh=sd*w.zi;
      for(const [y0,y1] of [[170,yc-60],[420,yc+90]]) for(const dx of [-200,200]) arms.push(arm([x+dx*0.55,y0,zb],[x,y1,zh],24)); }
    // decals: amber stripe down the nose and tub
    const stripe=[]; for(let x=1500;x<=4800;x+=150){ const t=T(x)+3; stripe.push([x,t,34]); }
    const top=stripe.map(([x,t,z])=>proj(x,t,z)), bot=stripe.slice().reverse().map(([x,t,z])=>proj(x,t,-z)); dec.push({pp:top.concat(bot),fill:"acc"});
    return {polys,dec,wheels,arms};
  }
  return {build};
})();
let ppOfMesh=null;
function ppOfShapes(){
  if(ppOfMesh) return ppOfMesh;
  const m=PP_OF.build({yaw:40,pitch:11}); m.polys.sort((a,b)=>a.depth-b.depth); const list=[];
  const bk=p=>p.kind==="body"?(p.lam>.62?"b3":p.lam>.4?"b2":p.lam>.2?"b1":"b0"):p.kind;
  m.wheels.filter(w=>w.sd<0).forEach(w=>w.grp.forEach(g=>list.push({pp:g.pp,k:g.fill})));
  m.polys.forEach(p=>list.push({pp:p.pp,k:bk(p)})); m.arms.forEach(a=>list.push({pp:a.pp,k:"arm"})); m.dec.forEach(d=>list.push({pp:d.pp,k:d.fill}));
  m.wheels.filter(w=>w.sd>0).sort((a,b)=>a.dep-b.dep).forEach(w=>w.grp.forEach(g=>list.push({pp:g.pp,k:g.fill})));
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9; list.forEach(p=>p.pp.forEach(q=>{ x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); y0=Math.min(y0,q[1]); y1=Math.max(y1,q[1]); }));
  return ppOfMesh={list,x0,x1,y0,y1};
}
const ppMix=(a,b,t)=>{ const h=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)); const A=h(a),B=h(b); return "#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join(""); };
/* the car as an svg group: width w, centred on cx, wheels resting on y=ground */
function ppOfCar(ink,acc,skin,w,cx,ground){
  const m=ppOfShapes(), s=w/(m.x1-m.x0), n=v=>v.toFixed(1).replace(/\.0$/,""), P=q=>`${n((q[0]-m.x0)*s)} ${n((q[1]-m.y1)*s)}`, lt="#C9D6CC", blk="#000000";
  const col={b3:ppMix(ink,lt,.5),b2:ppMix(ink,lt,.22),b1:ink,b0:ppMix(ink,blk,.3),under:ppMix(ink,blk,.45),plate:ppMix(ink,lt,.06),wing:ppMix(ink,lt,.12),helmet:skin,visor:ppMix(ink,blk,.6),hstripe:acc,cockpit:ppMix(ink,blk,.55),tire:"#13181A",tire2:"#232A2C",cover:ppMix(skin,ink,.12),coverIn:ink,acc:acc,arm:ppMix(ink,blk,.35)};
  return `<ellipse cx="${n(cx+w*.02)}" cy="${n(ground-w*.05)}" rx="${n(w*.4)}" ry="${n(w*.03)}" fill="${ink}" opacity=".18"/><g transform="translate(${n(cx-w/2)} ${n(ground)})" stroke-linejoin="round" stroke-width=".4">`+m.list.map(p=>{ const c=col[p.k]||ink; return `<path d="M${p.pp.map(P).join("L")}Z" fill="${c}" stroke="${c}"/>`; }).join("")+`</g>`;
}
/* track ids in the order you first checked in at them (for the Road Tripper route) */
function ppVisitOrder(){ const seen=[]; ppLoad().stamps.slice().sort((a,b)=>(a.at||0)-(b.at||0)).forEach(x=>{ if(!seen.includes(x.t)) seen.push(x.t); }); return seen; }
function seriesStamp(d,o){
  o=o||{}; const sp=PP_SERIES[d.sty], locked=!!o.locked, ink=locked?"rgba(110,98,72,.55)":sp.ink, acc=locked?"rgba(110,98,72,.55)":sp.acc, u=++ppUid;
  const top=sp.top, bot=sp.bot, rough=!locked&&o.rough!==false, proj=ppMapProj();
  const visits=o.visits||(locked?{}:ppStats(ppLoad()).visits), path=r=>"M"+r.map(([x,y])=>proj(x,y).map(v=>v.toFixed(1)).join(" ")).join("L")+"Z";
  let ticks=""; for(let i=0;i<72;i++){ const a=i*Math.PI/36, r0=i%6===0?65:66.5, r1=69; ticks+=`M${(80+r0*Math.cos(a)).toFixed(2)} ${(80+r0*Math.sin(a)).toFixed(2)}L${(80+r1*Math.cos(a)).toFixed(2)} ${(80+r1*Math.sin(a)).toFixed(2)}`; }
  const venues=sp.kind&&sp.kind!=="tracks"?[]:ppVenues(sp), at=v=>proj(v.lon,v.lat).map(n=>n.toFixed(1)).join(" ");
  const stops=sp.route==="visited"?(o.order||(locked?[]:ppVisitOrder())).map(id=>venues.find(v=>v.ids.includes(id))).filter(v=>v&&v.ids.some(i=>visits[i]>0)):(sp.route?venues:[]);
  const route=stops.length>1?`<path d="M${stops.map(at).join("L")}" fill="none" stroke="${acc}" stroke-width="1.1" stroke-dasharray="2.6 2" stroke-linecap="round" stroke-linejoin="round"/>`:"";
  const dots=venues.map(v=>{ const [x,y]=proj(v.lon,v.lat).map(n=>n.toFixed(1)), on=v.ids.some(i=>visits[i]>0);
    return on?`<circle cx="${x}" cy="${y}" r="4" fill="#F3EAD2" stroke="${acc}" stroke-width="1.1"/><circle cx="${x}" cy="${y}" r="2.2" fill="${acc}" stroke="${ink}" stroke-width=".8"/>`
      :`<circle cx="${x}" cy="${y}" r="1.5" fill="#F3EAD2" stroke="${ink}" stroke-width=".6" opacity=".9"/>`; }).join("");
  const map=`<g clip-path="url(#st${u}k)"><path d="${path(PP_LAND[1])}" fill="url(#st${u}hl)"/></g><g clip-path="url(#st${u}c)"><path d="${path(PP_LAND[0])}" fill="url(#st${u}h)" stroke="${ink}" stroke-width=".6" stroke-linejoin="round"/></g>${route}${dots}`;
  const abroad=sp.kind==="tracks"?Object.keys(visits).filter(id=>visits[id]>0&&!venues.some(v=>v.ids.includes(id))).length:0;
  const cells=[[42,36],[80,36],[42,69],[80,69]], vis4=id=>visits[id]>0;
  const centre=sp.kind==="flags"?ppFlags(ink,acc,"#F3EAD2")
    :sp.kind==="ofcar"?(locked?`<g opacity=".5">${ppOfCar("#8E8670","#8E8670","#F3EAD2",104,80,92)}</g>`:ppOfCar(ink,acc,"#F3EAD2",104,80,92))
    :sp.kind==="outlines"?`<path d="M80,38V102M42,70H118" stroke="${ink}" stroke-width=".6" opacity=".3"/>`+sp.ids.map((id,i)=>{ const t=TRACKS.find(x=>x.id===id); if(!t) return ""; const on=vis4(id);
        return `<g opacity="${on||locked?1:.3}"><svg x="${cells[i][0]}" y="${cells[i][1]}" width="38" height="31" ${ppOutline(t,31,{c:ink,w:on?1.9:1.4})}</svg></g>`; }).join("")
    :sp.kind==="days"?["FRI","SAT","SUN"].map((dn,i)=>{ const x=44+i*25; return `<rect x="${x}" y="50" width="22" height="34" rx="3.5" fill="none" stroke="${ink}" stroke-width="1.5"/><path d="M${x},50.5h22v8.5h-22z" fill="${ink}"/><text x="${x+11}" y="57" font-size="5.6" font-weight="800" letter-spacing=".6" text-anchor="middle" fill="#F3EAD2">${dn}</text><path d="M${x+5.5},70.5l4.6,4.8l7-8.6" fill="none" stroke="${acc}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`; }).join("")
    :map+(abroad?`<text x="36" y="104" font-size="5.2" font-weight="800" letter-spacing=".4" fill="${acc}">+${abroad} ABROAD</text>`:"");
  const defs=`<path id="st${u}t" d="M 30,80 A 50,50 0 0 1 130,80"/><path id="st${u}bt" d="M 13.8,80 A 66.2,66.2 0 0 1 146.2,80"/><path id="st${u}bb" d="M 6.2,80 A 73.8,73.8 0 0 0 153.8,80"/><path id="st${u}b" d="M 20,80 A 60,60 0 0 0 140,80"/><clipPath id="st${u}c"><circle cx="80" cy="80" r="58"/></clipPath><clipPath id="st${u}k"><circle cx="80" cy="80" r="49"/></clipPath>
    <pattern id="st${u}h" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><circle cx="1.3" cy="1.3" r=".6" fill="${ink}"/></pattern><pattern id="st${u}hl" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><circle cx="1.3" cy="1.3" r=".26" fill="${ink}" opacity=".5"/></pattern>`;
  if(locked) return `<svg class="stamp locked" viewBox="0 0 160 160" aria-hidden="true"><defs>${defs}</defs><circle cx="80" cy="80" r="76" fill="none" stroke="${ink}" stroke-width="2.4" stroke-dasharray="5 5"/><g opacity=".85">${centre}</g></svg>`;
  return `<svg class="stamp" viewBox="0 0 160 160" aria-hidden="true"><defs>${defs}${rough?`<filter id="st${u}f" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="${(u%37)+2}" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -4 3.75" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="c"/><feDisplacementMap in="c" in2="n" scale="1" xChannelSelector="R" yChannelSelector="G"/></filter>`:""}</defs>
    <g${rough?` filter="url(#st${u}f)"`:""} opacity=".94">
      ${sp.band?`<circle cx="80" cy="80" r="70" fill="none" stroke="${sp.bandInk||ink}" stroke-width="12"/><circle cx="80" cy="80" r="78" fill="none" stroke="${sp.bandInk?ink:acc}" stroke-width="1.5"/><circle cx="80" cy="80" r="63" fill="none" stroke="${ink}" stroke-width="1"/>
      <text font-size="${sp.size}" font-weight="800" letter-spacing="${sp.space}" fill="${sp.bandText||'#F3EAD2'}"><textPath href="#st${u}bt" startOffset="50%" text-anchor="middle">${top}</textPath></text>
      <text font-size="${sp.size}" font-weight="800" letter-spacing="${sp.space}" fill="${sp.bandText||'#F3EAD2'}"><textPath href="#st${u}bb" startOffset="50%" text-anchor="middle">${bot}</textPath></text>`
      :`      <circle cx="80" cy="80" r="76" fill="none" stroke="${ink}" stroke-width="3.4"/>
      <circle cx="80" cy="80" r="71.5" fill="none" stroke="${acc}" stroke-width="1.6"/>
      <path d="${ticks}" fill="none" stroke="${ink}" stroke-width=".9"/>
      <circle cx="80" cy="80" r="63" fill="none" stroke="${ink}" stroke-width="1"/>
      <text font-size="${sp.size||14}" font-weight="800" letter-spacing="${sp.space||5}" fill="${ink}"><textPath href="#st${u}t" startOffset="50%" text-anchor="middle">${top}</textPath></text>
      <text font-size="9.6" font-weight="800" letter-spacing="1.8" fill="${ink}"><textPath href="#st${u}b" startOffset="50%" text-anchor="middle">${bot}</textPath></text>
`}
      ${centre}
      ${o.date?`<text x="80" y="114" font-size="9.6" font-weight="800" letter-spacing=".9" text-anchor="middle" fill="${ink}">${ppDate(o.date)}</text><path d="M35,110.6H46M114,110.6H125" stroke="${acc}" stroke-width="1.2"/>`:""}
    </g></svg>`;
}
/* ---------------- series logos ----------------
   Where a series logo goes (home tile, series page, About sheet, hub labels). Until a logo is licensed there is
   nothing here and each spot just shows the series name as text. When a licence arrives, put the file in logos/ and
   add it to SERIES_LOGOS: those spots then show the logo (read the licence for size and placement rules first). */
const SERIES_LOGOS={ /* imsa:"logos/imsa.svg", pilot:"logos/pilot.svg", vp:"logos/vp.svg" */ };
const MARK_KEY={imsa:"imsa",weathertech:"imsa",pilotchallenge:"pilot",pilot:"pilot",vp:"vp"};
function seriesMark(id,px){
  const k=MARK_KEY[id], f=k&&SERIES_LOGOS[k]; if(!f) return "";
  return `<span class="smark logo" style="--sz:${px||44}px"><img src="${f}" alt="" loading="lazy"></span>`;
}
function stampSvg(d,o){
  if(d.sty) return seriesStamp(d,o);
  if(d.tier==="z") return legendStamp(d,o);
  o=o||{}; const locked=!!o.locked, ink=locked?"rgba(110,98,72,.5)":(PP_INK[d.tier]||PP_INK.x), u=++ppUid, isT=!!d.track;
  const top=(isT?d.track.name:d.name).toUpperCase(), bot=isT?PP_TIERS[+String(d.id).split(":")[2]-1][0].toUpperCase():"TRACKSIDE PASS";
  const ft=ppFs(top,150), fb=ppFs(bot,168), tier=d.tier, esc2=s=>s.replace(/&/g,"&amp;");
  const centre=isT?`<svg x="45" y="40" width="70" height="54" ${ppOutline(d.track,70,{c:ink,w:2.3})}</svg>`
    :`<g transform="translate(50,35) scale(2.5)" fill="none" stroke="${ink}" stroke-width="1.45" stroke-linecap="round" stroke-linejoin="round">${PP_ICON[d.icon]||""}</g>`;
  const rings=locked?`<circle cx="80" cy="80" r="76" fill="none" stroke="${ink}" stroke-width="2.4" stroke-dasharray="5 5"/>`
    :`<circle cx="80" cy="80" r="76" fill="none" stroke="${ink}" stroke-width="3.2"/>`+(tier==="b"||tier==="x"?`<circle cx="80" cy="80" r="69.5" fill="none" stroke="${ink}" stroke-width="1.1"/>`:`<circle cx="80" cy="80" r="72" fill="none" stroke="${ink}" stroke-width="1"/><circle cx="80" cy="80" r="68" fill="none" stroke="${ink}" stroke-width="1"/>`)+`<circle cx="80" cy="80" r="46" fill="none" stroke="${ink}" stroke-width="1.3"/>`;
  const stars=locked?"":(tier==="g"?`<text x="21" y="84.5" font-size="11" text-anchor="middle" fill="${ink}">★</text><text x="139" y="84.5" font-size="11" text-anchor="middle" fill="${ink}">★</text>`:`<circle cx="21" cy="80" r="2" fill="${ink}"/><circle cx="139" cy="80" r="2" fill="${ink}"/>`);
  const text=locked?"":`<text font-size="${ft.toFixed(1)}" font-weight="700" letter-spacing="1.2" fill="${ink}"><textPath href="#st${u}t" startOffset="50%" text-anchor="middle">${esc2(top)}</textPath></text>
     <text font-size="${fb.toFixed(1)}" font-weight="700" letter-spacing="1.2" fill="${ink}"><textPath href="#st${u}b" startOffset="50%" text-anchor="middle">${esc2(bot)}</textPath></text>`;
  const date=(!locked&&o.date)?`<line x1="50" y1="101.5" x2="110" y2="101.5" stroke="${ink}" stroke-width="1"/><text x="80" y="114" font-size="9.6" font-weight="700" letter-spacing=".9" text-anchor="middle" fill="${ink}">${ppDate(o.date)}</text>`:"";
  const rough=!locked&&o.rough!==false;
  const filt=ppFilter(u,rough);
  return `<svg class="stamp${locked?" locked":""}" viewBox="0 0 160 160" aria-hidden="true"><defs><path id="st${u}t" d="M 28,80 A 52,52 0 0 1 132,80"/><path id="st${u}b" d="M 18,80 A 62,62 0 0 0 142,80"/>${filt}</defs>
    <g${rough?` filter="url(#st${u}f)"`:""} opacity="${locked?1:.93}">${rings}${text}${stars}${centre}${date}</g></svg>`;
}
const medalSvg=(d,locked)=>stampSvg(d,{locked});
/* Full Grid: a scalloped gold seal with a chequered band, the trophy and the number of tracks */
function legendStamp(d,o){
  o=o||{}; const locked=!!o.locked, ink=locked?"rgba(110,98,72,.5)":PP_INK.z, u=++ppUid, n=TRACKS.length, pt=(r,a)=>`${(80+r*Math.cos(a)).toFixed(2)} ${(80+r*Math.sin(a)).toFixed(2)}`;
  let edge="M", band=""; const N=40, M=48;
  for(let i=0;i<N*2;i++) edge+=(i?"L":"")+pt(i%2?73.5:78.5,i*Math.PI/N); edge+="Z";
  for(let i=0;i<M;i+=2){ const a0=i*2*Math.PI/M, a1=(i+1)*2*Math.PI/M; band+=`M${pt(55.5,a0)}L${pt(63.5,a0)}A63.5 63.5 0 0 1 ${pt(63.5,a1)}L${pt(55.5,a1)}A55.5 55.5 0 0 0 ${pt(55.5,a0)}Z`; }
  const rough=!locked&&o.rough!==false, filt=ppFilter(u,rough);
  const frame=locked?`<path d="${edge}" fill="none" stroke="${ink}" stroke-width="2.2" stroke-dasharray="5 4"/><circle cx="80" cy="80" r="55" fill="none" stroke="${ink}" stroke-width="1.6" stroke-dasharray="3 4"/>`
    :`<path d="${edge}" fill="none" stroke="${ink}" stroke-width="2.6" stroke-linejoin="round"/><circle cx="80" cy="80" r="68.5" fill="none" stroke="${ink}" stroke-width="1.6"/><path d="${band}" fill="${ink}"/><circle cx="80" cy="80" r="55.5" fill="none" stroke="${ink}" stroke-width="1.6"/><circle cx="80" cy="80" r="52" fill="none" stroke="${ink}" stroke-width=".8"/>`;
  const trophy=`<g transform="translate(51.5,44) scale(2.4)" fill="none" stroke="${ink}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${PP_ICON.cup}</g>`;
  const text=locked?"":`<text font-size="10.5" font-weight="700" letter-spacing="1.6" fill="${ink}"><textPath href="#st${u}t" startOffset="50%" text-anchor="middle">FULL GRID</textPath></text><text font-size="8.4" font-weight="700" letter-spacing="1.1" fill="${ink}"><textPath href="#st${u}b" startOffset="50%" text-anchor="middle">ALL ${n} TRACKS</textPath></text>`;
  const date="";
  return `<svg class="stamp legend${locked?" locked":""}" viewBox="0 0 160 160" aria-hidden="true"><defs><path id="st${u}t" d="M 41,80 A 39,39 0 0 1 119,80"/><path id="st${u}b" d="M 34,80 A 46,46 0 0 0 126,80"/>${filt}</defs>
    <g${rough?` filter="url(#st${u}f)"`:""} opacity="${locked?1:.95}">${frame}${text}${trophy}${date}</g></svg>`;
}
/* ---------------- the unlock animation ---------------- */
let ppQ=[];
function ppEnqueue(list){ ppQ.push(...list); if(document.getElementById("unlock").hidden) ppNext(); }
function ppNext(){
  const d=ppQ.shift(), el=document.getElementById("unlock"); if(!d){ closeUnlock(); return; }
  const legend=d.tier==="z", ink=PP_INK[d.tier]||PP_INK.x, n=legend?46:16, gold=["#A87712","#E0B84C","#14171A","#FFFFFF","#E0B84C"];
  document.getElementById("ulBurst").innerHTML=Array.from({length:n},(_,i)=>{ const a=(i/n)*Math.PI*2+Math.random()*.5, r=88+Math.random()*44;
    return `<i style="--dx:${Math.round(Math.cos(a)*r)}px;--dy:${Math.round(Math.sin(a)*r)}px;--c:${legend?gold[i%gold.length]:ink};--s:${(3+Math.random()*(legend?6:4)).toFixed(1)}px;${legend?"border-radius:1px;":""}"></i>`; }).join("");
  document.getElementById("ulMedal").innerHTML=stampSvg(d,{date:Date.now()});
  document.getElementById("ulMedal").style.setProperty("--rot",ppRot(d.id)+"deg"); el.querySelector(".ul-card").style.setProperty("--stampink",ink);
  document.getElementById("ulName").textContent=d.name; document.getElementById("ulDesc").textContent=d.desc;
  document.getElementById("ulBtn").textContent=ppQ.length?`Next stamp (${ppQ.length} more)`:"Nice";
  el.querySelector(".ul-kick").textContent=legend?"Legendary stamp":"New stamp";
  const card=el.querySelector(".ul-card"); card.classList.toggle("legend",legend); card.classList.remove("go"); void card.offsetWidth; card.classList.add("go");   /* restart the animation */
  el.hidden=false; document.body.style.overflow="hidden";
  clearTimeout(window._ppThud); window._ppThud=setTimeout(()=>{ try{ LSget("paddock:haptics","1")==="1"&&navigator.vibrate&&navigator.vibrate(d.tier==="z"?[40,50,40,50,160]:[26,40,12]); }catch(e){} },930);   /* the thud when the stamp lands */
}
function closeUnlock(){ const el=document.getElementById("unlock"); el.hidden=true; document.body.style.overflow=""; ppQ=[]; }
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&!document.getElementById("unlock").hidden) closeUnlock(); });
function previewUnlock(){ const t=TRACKS.find(x=>x.id==="road-atlanta")||TRACKS[0]; ppEnqueue([ppTrackDefs().find(d=>d.track===t&&d.tier==="g"),PP_GLOBAL.find(d=>d.id==="tour")]); }
function ppReplay(id){ const d=ppTrackDefs().concat(PP_GLOBAL).find(x=>x.id===id); if(d) ppEnqueue([d]); }

/* ---------------- passport screen and home card ---------------- */
function ppTier(n){ return n>=3?3:n; }
function renderPassportCard(){
  const m=document.getElementById("ppMeta"); if(!m) return; const p=ppLoad(), st=ppStats(p), n=Object.keys(p.unlocked).filter(k=>!k.startsWith("t:")).length;
  m.textContent=st.tracks?`${st.tracks} of ${st.total} tracks · ${n} badge${n===1?"":"s"}`:`Stamps and badges from race weekends`;
}
/* ---- passport layout: tracks grouped by region or by series, badges grouped with a "next up" list ---- */
const PP_GROUP_KEY="paddock:ppGroup";
function ppGroupMode(){ try{ return localStorage.getItem(PP_GROUP_KEY)==="series"?"series":"region"; }catch(e){ return "region"; } }
function ppGroup(m){ try{ localStorage.setItem(PP_GROUP_KEY,m); }catch(e){} renderPassport(); }
function ppMenu(force){ const m=document.getElementById("ppMenu"); if(m) m.hidden=force===undefined?!m.hidden:!force; }
document.addEventListener("click",e=>{ if(!e.target.closest("#ppMenu,.ppmore")) ppMenu(false); });
const ppRegionOf=t=>/^Europe\//.test(t.tz||"")?"eu":"na";
const PP_BADGE_GROUPS=[
  ["By series",["sportscar","endcup","openwheel","gtfan","stock","grandprix","double","trifecta","tour"]],
  ["Places",["street","jungle","endurance","zones","border","sunshine","lonestar","lakes","golden","peach","banks"]],
  ["Milestones",["first","hopper","tripper","grand","weekend","marathon","ten","season","fullgrid"]]];
/* how close each unearned badge is: [have, need] (only for the ones that are a count of something) */
const PP_LISTS={street:[["long-beach","detroit","st-petersburg","arlington"],2],jungle:[["long-beach","detroit","st-petersburg","arlington"],4],endurance:[["daytona","sebring","road-atlanta"],3],
  sunshine:[["daytona","sebring","st-petersburg"],3],lonestar:[["cota","arlington"],2],lakes:[["road-america","mid-ohio","detroit"],3],golden:[["long-beach","laguna-seca","sonoma"],3],peach:[["road-atlanta","barber"],2]};
const PP_COUNTS={hopper:[s=>s.tracks,3],tripper:[s=>s.tracks,6],grand:[s=>s.tracks,10],ten:[s=>s.weekends,10],season:[s=>s.weekends,25],zones:[s=>s.zones,3],tour:[s=>s.imsaVisited,s=>s.imsaTotal],fullgrid:[s=>s.tracks,s=>s.total]};
function ppProg(d,st){
  const l=PP_LISTS[d.id]; if(l) return [Math.min(l[1],l[0].filter(i=>d.id==="endurance"?st.endLong.has(i):st.visits[i]>0).length),l[1]];
  const c=PP_COUNTS[d.id]; if(c){ const need=typeof c[1]==="function"?c[1](st):c[1]; return [Math.min(need,c[0](st)),need]; }
  return null;
}
const ppChev=`<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>`;
const ppSec=(title,count,inner,open,sid)=>`<details class="ppSec"${open?" open":""}${sid?` data-s="${sid}"`:""}><summary><span class="ppSecT">${title}</span><span class="ppSecN">${count}</span>${ppChev}</summary>${inner}</details>`;
function ppTrackGrid(list,p,st,defs){
  const sorted=list.slice().sort((a,b)=>a.short.localeCompare(b.short)), got=sorted.filter(t=>st.visits[t.id]), not=sorted.filter(t=>!st.visits[t.id]);
  const earned=t=>{ const n=st.visits[t.id], tier=ppTier(n), def=defs.find(d=>d.track===t&&d.id.endsWith(":"+tier)), last=p.stamps.filter(s=>s.t===t.id).reduce((m,s)=>Math.max(m,s.at||0),0);
    return `<button class="pt t${tier}" onclick="openTrack('${t.id}','passport')"><span class="sbox" style="--r:${ppRot(t.id)}deg">${stampSvg(def,{date:last||undefined})}</span><b>${esc(t.short)}</b><small>${n} race weekend${n>1?"s":""}</small></button>`; };
  const empty=t=>`<button class="pt mini" onclick="openTrack('${t.id}','passport')"><span class="sbox empty"><svg ${ppOutline(t,34,{c:"rgba(90,75,45,.38)",w:1.8})}</svg></span><b>${esc(t.short)}</b></button>`;
  return (got.length?`<div class="pgrid">${got.map(earned).join("")}</div>`:"")+(not.length?`<div class="pgrid mini">${not.map(empty).join("")}</div>`:"");
}
function ppTracksHtml(p,st){
  const defs=ppTrackDefs(), mode=ppGroupMode(), count=l=>`${l.filter(t=>st.visits[t.id]).length} of ${l.length}`;
  let html;
  if(mode==="series"){
    /* a track shows under every series that races there, so the same stamp can appear more than once */
    html=orderedChamps().filter(c=>!c.optIn||followed(c)).map(c=>({c,l:TRACKS.filter(t=>t.events.some(e=>inChamp(c,e)))})).filter(x=>x.l.length)
      .map(x=>ppSec(esc(x.c.name),count(x.l),ppTrackGrid(x.l,p,st,defs),x.l.some(t=>st.visits[t.id]),x.c.id)).join("");
  } else {
    html=Object.keys(REGIONS).map(r=>({r,l:TRACKS.filter(t=>ppRegionOf(t)===r)})).filter(x=>x.l.length)
      .map(x=>ppSec(esc(REGIONS[x.r]),count(x.l),ppTrackGrid(x.l,p,st,defs),true)).join("");
  }
  return html;
}
function ppNextUp(p,st){
  return PP_GLOBAL.filter(d=>!p.unlocked[d.id]).map((d,i)=>{ const g=ppProg(d,st); return {d,g,i,score:g?g[0]/g[1]:(d.tier==="x"?0.01:0)}; })
    .filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,3);
}
function ppBadgesHtml(p,st){
  const next=ppNextUp(p,st), byId=Object.fromEntries(PP_GLOBAL.map(d=>[d.id,d]));
  const need=x=>x.g?`<span class="ppbar"><i style="width:${Math.round(x.g[0]/x.g[1]*100)}%"></i></span>`:"";
  const nextHtml=next.length?`<div class="ppNextBox"><h4>Next up</h4>${next.map(x=>`<button class="ppnx" onclick="toast(${esc(JSON.stringify(x.d.desc))})"><span class="sbox sm">${stampSvg(x.d,{locked:true})}</span><div><b>${esc(x.d.name)}</b><small>${esc(x.d.desc)}</small>${need(x)}</div>${x.g?`<em>${x.g[0]} of ${x.g[1]}</em>`:""}</button>`).join("")}</div>`:"";
  const groups=PP_BADGE_GROUPS.map(([title,ids])=>{ const ds=ids.map(i=>byId[i]).filter(Boolean), got=ds.filter(d=>p.unlocked[d.id]), lock=ds.filter(d=>!p.unlocked[d.id]);
    const big=d=>{ const at=p.unlocked[d.id]; return `<button class="pb${d.tier==="z"?" legend":""}" onclick="ppReplay('${d.id}')"><span class="sbox mid" style="--r:${ppRot(d.id)}deg">${stampSvg(d,{date:at})}</span><b>${esc(d.name)}</b><small>${new Date(at).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"})}</small></button>`; };
    const small=d=>{ const g=ppProg(d,st), tip=d.desc+(g?` You have ${g[0]} of ${g[1]}.`:""); return `<button class="pb lock mini${d.tier==="z"?" legend":""}" onclick="toast(${esc(JSON.stringify(tip))})"><span class="sbox sm">${stampSvg(d,{locked:true})}</span><b>${esc(d.name)}</b></button>`; };
    return ppSec(title,`${got.length} of ${ds.length}`,(got.length?`<div class="bgrid three">${got.map(big).join("")}</div>`:"")+(lock.length?`<div class="bgrid mini">${lock.map(small).join("")}</div>`:""),true);
  }).join("");
  return nextHtml+groups;
}
function renderPassport(){
  const p=ppLoad(), st=ppStats(p), total=PP_GLOBAL.length, got=PP_GLOBAL.filter(d=>p.unlocked[d.id]).length, nx=ppNextUp(p,st).find(x=>x.g);
  document.getElementById("ppSum").innerHTML=`<div class="ppn">${st.tracks}<small>of ${st.total} tracks</small></div><div class="ppbar big"><i style="width:${Math.round(st.tracks/st.total*100)}%"></i></div>
    <div class="ppb">${got} of ${total} badges${nx?` · next: ${esc(nx.d.name)}, ${nx.g[0]} of ${nx.g[1]}`:""}</div>`;
  const live=TRACKS.some(t=>activeEvent(t)), cb=document.getElementById("ppCheckBtn"); if(cb) cb.className="btn "+(live?"primary":"quiet");
  const mode=ppGroupMode(); document.getElementById("ppgRegion").classList.toggle("on",mode==="region"); document.getElementById("ppgSeries").classList.toggle("on",mode==="series");
  document.getElementById("ppTracks").innerHTML=ppTracksHtml(p,st);
  document.getElementById("ppBadges").innerHTML=ppBadgesHtml(p,st);
}
function openPassport(){ renderPassport(); ppMenu(false); document.getElementById("ppStatus").textContent=""; showScreen("passport"); }
function ppBackup(){ const code=btoa(unescape(encodeURIComponent(JSON.stringify({...ppLoad(),going:goingList(),v:2})))); try{ navigator.clipboard.writeText(code).then(()=>toast("Backup code copied. Keep it somewhere safe.")); }catch(e){ prompt("Copy this backup code:",code); } }
function ppRestore(){
  const code=prompt("Paste your backup code:"); if(!code) return;
  try{ const j=JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if(!j||!Array.isArray(j.stamps)) throw 0;
    const cur2=ppLoad(), seen=new Set(cur2.stamps.map(s=>s.t+"|"+s.day)); j.stamps.forEach(s=>{ if(!seen.has(s.t+"|"+s.day)) cur2.stamps.push(s); }); cur2.unlocked={...(j.unlocked||{}),...cur2.unlocked}; if(Array.isArray(j.going)){ LSset(GO_KEY,JSON.stringify([...new Set([...goingList(),...j.going])])); renderHero(); }
    ppEvaluate(cur2); ppSave(cur2); renderPassport(); renderPassportCard(); toast("Restored."); }
  catch(e){ toast("That code did not work."); }
}
renderPassportCard(); renderPpSw();
if(typeof renderChampList==="function") renderChampList();     /* app.js drew the home list before the series marks existed */

/* ---------------- sticker sheet: every stamp at a glance, for review, not tied to what you have actually earned ---------------- */
function openStampSheet(){
  const el=document.createElement("div"); el.className="stampsheet"; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-label","All stamps");
  const trackTiers=PP_TIERS.map((tdef,i)=>({id:`t:${TRACKS[0].id}:${i+1}`,name:`${TRACKS[0].short} · ${tdef[0]}`,tier:tdef[1],track:TRACKS[0]}));
  const all=[...PP_GLOBAL,...trackTiers];
  el.innerHTML=`<div class="ssbar"><b>Sticker sheet</b><button class="fab" aria-label="Close" onclick="this.closest('.stampsheet').remove()"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
    <p class="fine" style="margin:0 14px 14px">Every stamp, shown as it looks when earned. This does not change your passport.</p>
    <div class="bgrid" style="padding:0 14px 40px;margin:0">${all.map(d=>`<div class="pb${d.tier==="z"?" legend":""}"><span class="sbox big" style="--r:${ppRot(d.id)}deg">${stampSvg(d,{date:Date.now()})}</span><b>${esc(d.name)}</b><small>${esc(d.desc||"")}</small></div>`).join("")}</div>`;
  document.body.appendChild(el);
}
