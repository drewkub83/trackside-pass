/* Anonymous usage counts (Nov 2026): which screens and features get used, and whether people come back.
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
