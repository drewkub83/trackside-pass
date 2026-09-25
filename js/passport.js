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
function ppStats(p){
  const ids=new Set(TRACKS.map(t=>t.id)), by={}; p.stamps.forEach(s=>{ if(ids.has(s.t)) (by[s.t]=by[s.t]||[]).push(s); });
  const visits={}; let full=false;
  Object.keys(by).forEach(id=>{ const t=TRACKS.find(x=>x.id===id), evs=new Set(by[id].map(s=>s.ev)); visits[id]=evs.size;
    evs.forEach(ev=>{ const e=t.events.find(x=>x.d===ev), n=e?(e.t||1):1; if(n>=2&&new Set(by[id].filter(s=>s.ev===ev).map(s=>s.day)).size>=n) full=true; }); });
  /* which series raced on the days you checked in, and how far you have travelled */
  const series=new Set(); let bill=false, marathon=false; const zones=new Set(), zoneOf=tz=>/Los_Angeles/.test(tz)?"PT":/Phoenix|Denver/.test(tz)?"MT":/Chicago/.test(tz)?"CT":"ET";
  Object.keys(by).forEach(id=>{ const t=TRACKS.find(x=>x.id===id); zones.add(zoneOf(t.tz||""));
    by[id].forEach(s=>{ const ids=new Set(); t.events.filter(e=>!/test/i.test(e.s||"")&&e.d<=s.day&&s.day<=eventEnd(e)).forEach(e=>{ CHAMPS.forEach(c=>{ if(inChamp(c,e)) ids.add(c.id); }); if(/NASCAR/i.test(e.s||"")) ids.add("nascar"); if(/Formula 1/i.test(e.s||"")) ids.add("f1"); });
      ids.forEach(i=>series.add(i)); if(ids.size>=2) bill=true; });
    new Set(by[id].map(s=>s.ev)).forEach(ev=>{ const e=t.events.find(x=>x.d===ev); if(e&&(e.t||1)>=4&&new Set(by[id].filter(s=>s.ev===ev).map(s=>s.day)).size>=e.t) marathon=true; }); });
  const imsa=TRACKS.filter(t=>t.events.some(e=>isImsa(e))); return {by,visits,full,series,bill,marathon,zones:zones.size,weekends:Object.values(visits).reduce((a,b)=>a+b,0),tracks:Object.keys(by).length,total:TRACKS.length,imsaTotal:imsa.length,imsaVisited:imsa.filter(t=>visits[t.id]>0).length};
}
const PP_GLOBAL=[
  {id:"first",name:"First Stamp",desc:"Check in at your first race weekend.",icon:"star",tier:"x",test:s=>s.tracks>=1},
  {id:"hopper",name:"Track Hopper",desc:"Visit 3 different tracks.",icon:"hop",tier:"b",test:s=>s.tracks>=3},
  {id:"tripper",name:"Road Tripper",desc:"Visit 6 different tracks.",icon:"sign",tier:"s",test:s=>s.tracks>=6},
  {id:"weekend",name:"Full Weekend",desc:"Check in every day of one race weekend.",icon:"cal",tier:"s",test:s=>s.full},
  {id:"street",name:"Street Fighter",desc:"Visit two street circuits: Long Beach, Detroit, St. Petersburg or Arlington.",icon:"wall",tier:"s",test:s=>["long-beach","detroit","st-petersburg","arlington"].filter(i=>s.visits[i]>0).length>=2},
  {id:"jungle",name:"Concrete Jungle",desc:"Visit all four street circuits: Long Beach, Detroit, St. Petersburg and Arlington.",icon:"city",tier:"g",test:s=>["long-beach","detroit","st-petersburg","arlington"].every(i=>s.visits[i]>0)},
  {id:"endurance",name:"Endurance Triple",desc:"Visit Daytona, Sebring and Road Atlanta.",icon:"moon",tier:"g",test:s=>["daytona","sebring","road-atlanta"].every(i=>s.visits[i]>0)},
  {id:"tour",name:"IMSA Grand Tour",desc:"Visit every venue on the IMSA schedule.",icon:"cup",tier:"g",test:s=>s.imsaVisited>=s.imsaTotal},
  /* by series */
  {id:"sportscar",name:"Sports Car Fan",desc:"Check in at an IMSA WeatherTech weekend.",icon:"car",tier:"x",test:s=>s.series.has("imsa")},
  {id:"openwheel",name:"Open Wheel",desc:"Check in at an IndyCar weekend.",icon:"wheel",tier:"x",test:s=>s.series.has("indycar")},
  {id:"gtfan",name:"GT Fan",desc:"Check in at a GT World Challenge America weekend.",icon:"gt",tier:"x",test:s=>s.series.has("gtwca")},
  {id:"stock",name:"Stock Car",desc:"Check in at a NASCAR weekend.",icon:"stockcar",tier:"x",test:s=>s.series.has("nascar")},
  {id:"grandprix",name:"Grand Prix",desc:"Check in at a Formula 1 weekend.",icon:"flag",tier:"s",test:s=>s.series.has("f1")},
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
  {id:"grand",name:"Grand Tourer",desc:"Visit 10 different tracks.",icon:"van",tier:"g",test:s=>s.tracks>=10},
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
function stampSvg(d,o){
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
function renderPassport(){
  const p=ppLoad(), st=ppStats(p), total=PP_GLOBAL.length, got=PP_GLOBAL.filter(d=>p.unlocked[d.id]).length;
  document.getElementById("ppSum").innerHTML=`<div class="ppn">${st.tracks}<small>of ${st.total} tracks</small></div><div class="ppb">${got} of ${total} badges</div>`;
  document.getElementById("ppTracks").innerHTML=ppTracks().map(t=>{ const n=st.visits[t.id]||0;
    const tier=ppTier(n), def=n?ppTrackDefs().find(d=>d.track===t&&d.id.endsWith(":"+tier)):null, last=p.stamps.filter(s=>s.t===t.id).reduce((m,s)=>Math.max(m,s.at||0),0);
    const art=def?`<span class="sbox" style="--r:${ppRot(t.id)}deg">${stampSvg(def,{date:last||undefined})}</span>`:`<span class="sbox empty"><svg ${ppOutline(t,34,{c:"rgba(90,75,45,.38)",w:1.8})}</svg></span>`;
    return `<button class="pt t${tier}" onclick="openTrack('${t.id}','passport')">${art}<b>${esc(t.short)}</b><small>${n?`${n} race weekend${n>1?"s":""}`:"Not yet"}</small></button>`; }).join("");
  document.getElementById("ppBadges").innerHTML=PP_GLOBAL.map(d=>{ const at=p.unlocked[d.id];
    return `<${at?`button onclick="ppReplay('${d.id}')"`:"div"} class="pb${at?"":" lock"}${d.tier==="z"?" legend":""}"><span class="sbox big" style="--r:${ppRot(d.id)}deg">${stampSvg(d,{locked:!at,date:at||undefined})}</span><b>${d.name}</b><small>${at?"Unlocked "+new Date(at).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}):d.desc+(d.tier==="z"?` You have ${st.tracks} of ${st.total}.`:"")}</small></${at?"button":"div"}>`; }).join("");
}
function openPassport(){ renderPassport(); document.getElementById("ppStatus").textContent=""; showScreen("passport"); }
function ppBackup(){ const code=btoa(unescape(encodeURIComponent(JSON.stringify({...ppLoad(),going:goingList(),v:2})))); try{ navigator.clipboard.writeText(code).then(()=>toast("Backup code copied. Keep it somewhere safe.")); }catch(e){ prompt("Copy this backup code:",code); } }
function ppRestore(){
  const code=prompt("Paste your backup code:"); if(!code) return;
  try{ const j=JSON.parse(decodeURIComponent(escape(atob(code.trim())))); if(!j||!Array.isArray(j.stamps)) throw 0;
    const cur2=ppLoad(), seen=new Set(cur2.stamps.map(s=>s.t+"|"+s.day)); j.stamps.forEach(s=>{ if(!seen.has(s.t+"|"+s.day)) cur2.stamps.push(s); }); cur2.unlocked={...(j.unlocked||{}),...cur2.unlocked}; if(Array.isArray(j.going)){ LSset(GO_KEY,JSON.stringify([...new Set([...goingList(),...j.going])])); renderHero(); }
    ppEvaluate(cur2); ppSave(cur2); renderPassport(); renderPassportCard(); toast("Restored."); }
  catch(e){ toast("That code did not work."); }
}
renderPassportCard(); renderPpSw();

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
