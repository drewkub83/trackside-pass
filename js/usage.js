/* Anonymous usage counts and the feedback form (Nov 2026): which screens and features get used, and whether people come back.
   A random device number (not linked to an account, name, email or location) plus an event name goes to our database.
   Off in Settings > Your data; never sent from localhost or when developer tools are on. Totals are read in the Supabase SQL
   editor (docs/usage-counts.md). The server function is track_events() in supabase/schema.sql. */
const U={q:[],t:0,hidAt:0,lastOpen:0};
function uOn(){
  try{ if(localStorage.getItem(K.usageOff)==="1") return false; }catch(e){}
  const h=location.hostname; if(h==="localhost"||h==="127.0.0.1"||h==="0.0.0.0"||h==="[::1]"||h.endsWith(".localhost")) return false;
  try{ if(typeof isDev==="function"&&isDev()) return false; }catch(e){}
  return typeof SB!=="undefined";
}
function uId(){
  let v=null;
  try{ v=localStorage.getItem(K.usageId); if(!v){ v=(window.crypto&&crypto.randomUUID)?crypto.randomUUID():String(Math.random()).slice(2)+String(Date.now()); localStorage.setItem(K.usageId,v); } }catch(e){}
  return v||null;
}
function uPlat(){
  const c=window.Capacitor; if(c&&c.isNativePlatform&&c.isNativePlatform()) return (c.getPlatform&&c.getPlatform())||"native";
  try{ if(matchMedia("(display-mode: standalone)").matches||navigator.standalone) return "pwa"; }catch(e){}
  return "web";
}
function uTrack(ev,arg){
  if(!uOn()) return; U.q.push({ev,arg:arg==null?null:String(arg).slice(0,60)});
  if(U.q.length>=15) uFlush(); else if(!U.t) U.t=setTimeout(uFlush,4000);
}
function uFlush(){
  clearTimeout(U.t); U.t=0; if(!U.q.length) return; const did=uId(); if(!did||!uOn()){ U.q=[]; return; }
  const body=JSON.stringify({p_did:did,p_plat:uPlat(),p_ev:U.q.splice(0,30)});
  try{ fetch(SB.url+"/rest/v1/rpc/track_events",{method:"POST",keepalive:true,headers:{apikey:SB.key,"Content-Type":"application/json"},body}).catch(()=>{}); }catch(e){}
}
/* one "open" each time the app starts, and again when it comes back to the front after 30 minutes away */
function uOpen(){ const n=Date.now(); if(n-U.lastOpen<30*60000) return; U.lastOpen=n; uTrack("open"); }
document.addEventListener("visibilitychange",()=>{ if(document.hidden){ U.hidAt=Date.now(); uFlush(); } else if(U.hidAt&&Date.now()-U.hidAt>30*60000) uOpen(); });
window.addEventListener("pagehide",uFlush);
uOpen();

/* ---- Send feedback (Settings): a note goes to the `feedback` table through send_feedback() in supabase/schema.sql; read it in the SQL editor ---- */
let fbKindSel="idea";
function openFeedback(){
  fbKindSel="idea";
  document.getElementById("infoBody").innerHTML=`<h3>Send feedback</h3>
    <p class="plRules">An idea, something confusing, something broken: every note gets read.</p>
    <div class="seg fbKind">${[["idea","Idea"],["problem","Problem"],["other","Other"]].map(([k,l])=>`<button class="${k===fbKindSel?"on":""}" onclick="fbKind('${k}')">${l}</button>`).join("")}</div>
    <textarea class="acIn fbMsg" id="fbMsg" rows="5" maxlength="1000" placeholder="What's on your mind?"></textarea>
    <input class="acIn" id="fbContact" maxlength="80" autocomplete="off" autocapitalize="none" placeholder="Email, if you want a reply (optional)">
    <p class="plRules fine" id="fbMsgNote">The screen you are on and your device type are sent with it. Nothing else.</p>
    <div class="acRow"><button class="btn primary acBtn" id="fbSend" onclick="sendFeedback()">Send</button><button class="btn quiet acBtn" onclick="closeInfo()">Cancel</button></div>`;
  const m=document.getElementById("infoModal"); m.hidden=false; document.body.style.overflow="hidden"; m.querySelector(".mcard").scrollTop=0;
}
function fbKind(k){ fbKindSel=k; document.querySelectorAll(".fbKind button").forEach((b,i)=>b.classList.toggle("on",["idea","problem","other"][i]===k)); }
async function sendFeedback(){
  const msg=(document.getElementById("fbMsg").value||"").trim(), contact=(document.getElementById("fbContact").value||"").trim(), note=document.getElementById("fbMsgNote"), btn=document.getElementById("fbSend");
  if(msg.length<3){ note.textContent="Write a few words first."; return; }
  const on=document.querySelector(".screen.on"), ctx={screen:on?on.id:null,track:(typeof cur!=="undefined"&&cur&&on&&on.id==="detail")?cur.id:null,plat:uPlat(),w:innerWidth,h:innerHeight,ua:(navigator.userAgent||"").slice(0,160),at:new Date().toISOString()};
  btn.disabled=true; btn.textContent="Sending…";
  try{
    const r=await fetch(SB.url+"/rest/v1/rpc/send_feedback",{method:"POST",headers:{apikey:SB.key,"Content-Type":"application/json"},body:JSON.stringify({p_did:uId()||"unknown00",p_kind:fbKindSel,p_msg:msg,p_contact:contact||null,p_ctx:ctx})});
    if(!r.ok){ let t=""; try{ t=(await r.json()).message||""; }catch(e){} throw new Error(/too many/i.test(t)?"too many":"failed"); }
    closeInfo(); if(typeof toast==="function") toast("Thanks, got it.");
  }catch(e){
    btn.disabled=false; btn.textContent="Send"; note.textContent=e.message==="too many"?"That's a lot of notes today. Try again tomorrow.":"Couldn't send that. Check your signal and try again. Your note is still here.";
  }
}

/* ---- Map corrections: "Something wrong here?" on a badge and "Tell us" in the Info tab. Same send_feedback() path as the feedback form (kind "problem"), with the track and badge
   in the note's context so the daily email says exactly which badge. Nothing changes on the map until a person checks it. ---- */
let fixKindSel="place", fixBadge=null;
const FIX_BADGE=[["place","In the wrong place"],["gone","Not there, or closed"],["info","Wrong name or details"]], FIX_TRACK=[["missing","Something is missing"],["route","A walking route is wrong"],["other","Something else"]];
function openCorrection(badge){
  const p=badge&&typeof popPoi!=="undefined"?popPoi:null; fixBadge=p?{n:p.n,k:p.k,x:Math.round(p.x),y:Math.round(p.y)}:null;
  const kinds=fixBadge?FIX_BADGE:FIX_TRACK; fixKindSel=kinds[0][0];
  document.getElementById("infoBody").innerHTML=`<div class="mkick">Map correction · ${esc(cur.short)}</div><h3 id="infoTitle">${fixBadge?esc(fixBadge.n):"Tell us about this map"}</h3>
    <p class="plRules">${fixBadge?"What is wrong with this one?":"What should we fix or add?"} A person checks every note before the map changes.</p>
    <div class="seg fixKind">${kinds.map(([k,l])=>`<button class="${k===fixKindSel?"on":""}" onclick="fixKind('${k}')">${l}</button>`).join("")}</div>
    <textarea class="acIn fbMsg" id="fixMsg" rows="4" maxlength="500" placeholder="${fixBadge?"Where it really is, what it is called now… (optional)":"What is missing or wrong, and where? (optional)"}"></textarea>
    <input class="acIn" id="fixContact" maxlength="80" autocomplete="off" autocapitalize="none" placeholder="Email, if you want a reply (optional)">
    <p class="plRules fine" id="fixNote">Sent with the track and badge. Nothing else.</p>
    <div class="acRow"><button class="btn primary acBtn" id="fixSend" onclick="sendCorrection()">Send</button><button class="btn quiet acBtn" onclick="closeInfo()">Cancel</button></div>`;
  const m=document.getElementById("infoModal"); m.hidden=false; document.body.style.overflow="hidden"; m.querySelector(".mcard").scrollTop=0;
}
function fixKind(k){ fixKindSel=k; const kinds=fixBadge?FIX_BADGE:FIX_TRACK; document.querySelectorAll(".fixKind button").forEach((b,i)=>b.classList.toggle("on",kinds[i][0]===k)); }
async function sendCorrection(){
  const kinds=fixBadge?FIX_BADGE:FIX_TRACK, label=(kinds.find(x=>x[0]===fixKindSel)||[])[1]||"", note=(document.getElementById("fixMsg").value||"").trim(), contact=(document.getElementById("fixContact").value||"").trim(), out=document.getElementById("fixNote"), btn=document.getElementById("fixSend");
  const msg=`Map correction at ${cur.short}${fixBadge?` - ${fixBadge.n} (${fixBadge.k})`:""}: ${label}.${note?"\n"+note:""}`;
  const ctx={screen:"map",track:cur.id,plat:uPlat(),badge:fixBadge?`${fixBadge.n} (${fixBadge.k}) at ${fixBadge.x},${fixBadge.y}`:null,fix:fixKindSel,at:new Date().toISOString()};
  btn.disabled=true; btn.textContent="Sending…";
  try{
    const r=await fetch(SB.url+"/rest/v1/rpc/send_feedback",{method:"POST",headers:{apikey:SB.key,"Content-Type":"application/json"},body:JSON.stringify({p_did:uId()||"unknown00",p_kind:"problem",p_msg:msg,p_contact:contact||null,p_ctx:ctx})});
    if(!r.ok){ let t=""; try{ t=(await r.json()).message||""; }catch(e){} throw new Error(/too many/i.test(t)?"too many":"failed"); }
    closeInfo(); if(typeof toast==="function") toast("Thanks. We'll check it.");
  }catch(e){
    btn.disabled=false; btn.textContent="Send"; out.textContent=e.message==="too many"?"That's a lot of notes today. Try again tomorrow.":"Couldn't send that. Check your signal and try again. Your note is still here.";
  }
}
