/* Native-shell bridge. Does nothing in a browser or the installed web app: window.Capacitor only exists inside the
   iPhone app (ios/). Loaded before app.js so every later navigator.geolocation call is already routed here.

   Why: inside the iPhone app, the web view's own geolocation asks "deft-medovik...netlify.app would like to use
   your current location" on EVERY launch, on top of the app's own one-time permission. The native location plugin
   only asks once (iOS remembers it), so this swaps it in underneath the unchanged web code: navigator.geolocation
   and navigator.permissions.query({name:"geolocation"}) keep their normal shapes. */
(function(){
  const c=window.Capacitor; if(!(c&&c.isNativePlatform&&c.isNativePlatform())) return;
  const G=c.Plugins&&c.Plugins.Geolocation; if(!G) return;
  const codeOf=e=>{ const m=String((e&&e.message)||e||""); return /denied|permission|not authorized/i.test(m)?1:/timeout|timed out/i.test(m)?3:2; };
  const toErr=e=>({code:codeOf(e),message:String((e&&e.message)||e||"location error")});
  const ids=new Map(); let n=0;
  const geo={
    getCurrentPosition(ok,err,o){ G.getCurrentPosition(o||{}).then(ok,e=>{ if(err) err(toErr(e)); }); },
    watchPosition(ok,err,o){
      const my=++n; ids.set(my,null);
      G.watchPosition(o||{},(p,e)=>{ if(p) ok(p); else if(err) err(toErr(e)); }).then(cid=>{ if(ids.has(my)) ids.set(my,cid); else G.clearWatch({id:cid}); });
      return my;
    },
    clearWatch(my){ const cid=ids.get(my); ids.delete(my); if(cid!==null&&cid!==undefined) G.clearWatch({id:cid}); }
  };
  try{ Object.defineProperty(navigator,"geolocation",{value:geo,configurable:true}); }catch(e){}
  if(navigator.permissions&&navigator.permissions.query){
    const orig=navigator.permissions.query.bind(navigator.permissions);
    navigator.permissions.query=function(d){
      if(d&&d.name==="geolocation") return G.checkPermissions().then(r=>({state:r.location==="granted"?"granted":r.location==="denied"?"denied":"prompt",onchange:null}));
      return orig(d);
    };
  }
})();

/* Android's system back button / back gesture. The app does not use browser history (screens are swapped in place),
   so without this the first press would close the whole app. Back steps exactly like the in-app back arrow and
   swipe-back (swipeBack in app.js: close the open card or sheet, Map/Events/Info -> Hub -> track list) and only
   exits from the track list itself. iOS has no such button, so this is Android only. */
(function(){
  const c=window.Capacitor; if(!(c&&c.isNativePlatform&&c.isNativePlatform()&&c.getPlatform&&c.getPlatform()==="android")) return;
  const A=c.Plugins&&c.Plugins.App; if(!A||!A.addListener) return;
  const open=id=>{ const e=document.getElementById(id); return !!(e&&!e.hidden); };
  const atRoot=()=>{ const sc=document.querySelector(".screen.on"); return (!sc||sc.id==="home")&&!open("infoModal")&&!open("sheet"); };
  A.addListener("backButton",()=>{ if(atRoot()) A.exitApp(); else if(typeof swipeBack==="function") swipeBack(); });
})();
