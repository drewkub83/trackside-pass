/* Trackside Pass: Race Log (Nov 27 2026). The weekends you were at (a passport stamp) or marked "I'm going" that have started, newest first, in the Passport.
   Each can carry a photo and a note, kept ONLY on this phone: the note in localStorage (K.raceLog), the photo, shrunk to 1600 px, in IndexedDB.
   With a photo, "Share card" draws the photo full-bleed under a gradient with the event, the top three, your picks and the "I was there" stamp (1080x1350). */
const RL_DB="paddock-racelog", RL_STORE="photos";
function rlDb(){
  return new Promise((ok,no)=>{ try{ const r=indexedDB.open(RL_DB,1); r.onupgradeneeded=()=>r.result.createObjectStore(RL_STORE); r.onsuccess=()=>ok(r.result); r.onerror=()=>no(r.error); }catch(e){ no(e); } });
}
async function rlPhotoOp(mode,key,val){
  const db=await rlDb();
  return new Promise((ok,no)=>{ const tx=db.transaction(RL_STORE,mode==="get"?"readonly":"readwrite"), s=tx.objectStore(RL_STORE), r=mode==="get"?s.get(key):mode==="put"?s.put(val,key):s.delete(key);
    r.onsuccess=()=>ok(r.result||null); r.onerror=()=>no(r.error); });
}
const rlGetPhoto=k=>rlPhotoOp("get",k).catch(()=>null), rlPutPhoto=(k,b)=>rlPhotoOp("put",k,b), rlDelPhoto=k=>rlPhotoOp("del",k).catch(()=>{});
function rlLoad(){ try{ return JSON.parse(LSget(K.raceLog,"{}"))||{}; }catch(e){ return {}; } }
function rlSave(o){ try{ LSset(K.raceLog,JSON.stringify(o)); }catch(e){} }
const rlKey=(t,e)=>t.id+"|"+e.d;
/* the weekends in the log: checked in (stamp) or marked going, started already, newest first */
function rlEntries(){
  const today=localToday(), stamps=(typeof ppLoad==="function"?ppLoad().stamps:[]), out=[], log=rlLoad();
  TRACKS.forEach(t=>(t.events||[]).forEach(e=>{ if(/test/i.test(e.s||"")||e.d>today) return;
    const key=rlKey(t,e), added=!!(log[key]&&log[key].added), was=stamps.some(s=>s.t===t.id&&s.ev===e.d)||added, going=isGoing(t,e); if(was||going) out.push({t,e,key,was,added}); }));
  return out.sort((a,b)=>b.e.d.localeCompare(a.e.d));
}
let rlUrls=[];
async function rlRender(){
  const el=document.getElementById("ppRaces"); if(!el) return; if(typeof ppView!=="undefined"&&ppView){ el.innerHTML=""; return; }
  rlUrls.forEach(u=>URL.revokeObjectURL(u)); rlUrls=[]; const rows=rlEntries(), log=rlLoad();
  const add=`<button class="btn quiet rlAdd" onclick="rlPicker()">Add a race I went to</button>`;
  if(!rows.length){ el.innerHTML=`<p class="rlEmpty">Races you check in at, or mark "I'm going" to, appear here. Add a photo and a note to each, and turn the best into a share card. A race you went to before: add it yourself.</p>${add}`; return; }
  const html=[]; for(const r of rows){ const ph=await rlGetPhoto(r.key); let img=""; if(ph){ const u=URL.createObjectURL(ph); rlUrls.push(u); img=`<img src="${u}" alt="">`; }
    html.push(`<button class="rlRow" onclick="rlOpen('${r.key}')"><span class="rlThumb">${img||"<i></i>"}</span><span class="rlTxt"><b>${esc(r.e.e)}</b><small>${esc(r.t.short)} · ${esc(fmtRange(r.e))}</small><small>${r.was?"I was there":"Marked going"}${log[r.key]&&log[r.key].note?" · note":""}</small></span><i aria-hidden="true">&rsaquo;</i></button>`); }
  el.innerHTML=html.join("")+add;
}
let rlCur=null, rlCurUrl=null;
async function rlOpen(key){
  const r=rlEntries().find(x=>x.key===key); if(!r) return; rlCur=r; const log=rlLoad()[key]||{}, ph=await rlGetPhoto(key), vd=await rlGetPhoto(key+"#v");
  if(rlCurUrl){ URL.revokeObjectURL(rlCurUrl); rlCurUrl=null; } if(ph) rlCurUrl=URL.createObjectURL(ph);
  const sun=sunOf(eventEnd(r.e)), items=recapItems(sun,null).filter(i=>i.t.id===r.t.id), it=items[0], top=it?recapTop(it.r.groups[0],3):[];
  const games=it?recapGames(r.t,r.e,it.r.s):[], pts=games.reduce((n,x)=>n+x.sc.pts,0), mx=games.reduce((n,x)=>n+x.sc.max,0);
  setInfo(`<div class="mkick">${r.was?"I was there":"Marked going"}</div><h3 id="infoTitle">${esc(r.e.e)}</h3><p class="plRules">${esc(r.t.short)} · ${esc(fmtRange(r.e))}</p>
    <div class="rlPhoto">${rlCurUrl?`<img src="${rlCurUrl}" alt="Your photo">`:`<div class="rlNo">No photo yet</div>`}</div>
    <div class="rcpBtns"><button class="btn quiet" onclick="document.getElementById('rlFile').click()">${ph?"Change photo":"Add photo"}</button>${ph?`<button class="btn quiet" onclick="rlRemovePhoto()">Remove</button>`:""}</div>
    <input type="file" id="rlFile" accept="image/*" hidden onchange="rlPick(this)">
    <label class="f" for="rlNote">Your note</label><textarea id="rlNote" class="rlNote" rows="3" maxlength="500" placeholder="Where you sat, what you remember" onblur="rlSaveNote()">${esc(log.note||"")}</textarea>
    <label class="f">Who went with you</label><div id="rlWith">${rlWithHtml(log.with||[])}</div>
    ${top.length?`<div class="rcpStory"><h5>${esc(watchSeriesName(it.r)||it.r.event)}</h5>${top.map((l,i)=>`<p>${esc(String(l).replace(/^Winner:\s*/,"Winner: "))}</p>`).join("")}${games.length?`<p class="rcpAsOf">Your picks scored ${pts} of ${mx}.</p>`:""}</div>`:""}
    <div class="rlBlock"><div class="rlLbl">Video clip <small>(optional, the first 15 seconds are used)</small></div>${vd?`<p class="rlVidInfo">Clip added: ${(vd.size/1048576).toFixed(1)} MB</p>`:""}
      <div class="rcpBtns"><button class="btn quiet" onclick="document.getElementById('rlVid').click()">${vd?"Change clip":"Add video clip"}</button>${vd?`<button class="btn quiet" onclick="rlRemoveVideo()">Remove</button><button class="btn" onclick="rlMakeVideo()">Make video card</button>`:""}</div>
      <input type="file" id="rlVid" accept="video/*" hidden onchange="rlVidPick(this)"><div class="rlProg" id="rlProg" hidden></div></div>
    <div class="rlSeg" id="rlSeg">${rlSegHtml()}</div>
    <div class="rcpBtns"><button class="btn primary" onclick="rlShare()">${ph?"Share card":"Share recap card"}</button><button class="btn quiet" onclick="closeInfo()">Close</button></div>
    <p class="fine">Your photo and note stay on this phone. Nothing is uploaded.</p>`);
}
function rlSaveNote(){ if(!rlCur) return; const el=document.getElementById("rlNote"); if(!el) return; const o=rlLoad(), v=el.value.trim(); if(v) o[rlCur.key]=Object.assign({},o[rlCur.key],{note:v}); else if(o[rlCur.key]){ delete o[rlCur.key].note; } rlSave(o); }
/* shrink to 1600 px on the long side and re-encode as JPEG, so a 12 MB photo becomes a few hundred KB */
async function rlShrink(file){
  let bmp; try{ bmp=await createImageBitmap(file,{imageOrientation:"from-image"}); }catch(e){ bmp=await new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=no; i.src=URL.createObjectURL(file); }); }
  const w0=bmp.width||bmp.naturalWidth, h0=bmp.height||bmp.naturalHeight, s=Math.min(1,1600/Math.max(w0,h0)), cv=document.createElement("canvas"); cv.width=Math.round(w0*s); cv.height=Math.round(h0*s);
  cv.getContext("2d").drawImage(bmp,0,0,cv.width,cv.height); return await new Promise(ok=>cv.toBlob(ok,"image/jpeg",.86));
}
async function rlPick(inp){
  const f=inp.files&&inp.files[0]; if(!f||!rlCur) return; const key=rlCur.key;
  try{ const b=await rlShrink(f); await rlPutPhoto(key,b); toast("Photo saved on this phone"); }catch(e){ toast("Could not save that photo"); return; }
  rlSaveNote(); await rlOpen(key); rlRender();
}
async function rlRemovePhoto(){ if(!rlCur) return; const key=rlCur.key; await rlDelPhoto(key); await rlOpen(key); rlRender(); }
async function rlShare(){
  if(!rlCur) return; rlSaveNote(); const r=rlCur, ph=await rlGetPhoto(r.key);
  if(!ph){ closeInfo(); return shareRecapCard(sunOf(eventEnd(r.e))); }
  toast("Making your card…"); const blob=await rlCardBlob(r,ph).catch(()=>null); if(!blob){ toast("Could not make the card"); return; }
  const file=new File([blob],"trackside-pass-race.png",{type:"image/png"});
  try{ if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:r.e.e}); return; } }catch(x){ if(x&&x.name==="AbortError") return; }
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="trackside-pass-race.png"; document.body.appendChild(a); a.click(); a.remove(); toast("Card saved");
}
/* the card: the photo full-bleed (a little above centre), a gradient at the top and a longer one at the bottom for the text, the stamp at the top right */
/* the card's overlay (gradients, stamp and all the text) on a transparent canvas: the photo or each video frame is drawn under it. Story size (tall) keeps the text out of Instagram's top and bottom 250 px. */
function rlShape(){ return LSget(K.rlShape,"feed")==="story"?1920:1350; }
async function rlOverlay(r,W,H){
  try{ await document.fonts.ready; }catch(x){}
  const story=H>1500, cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d"), P=recapPalette(g); g.textBaseline="alphabetic";
  let gr=g.createLinearGradient(0,0,0,H*.22); gr.addColorStop(0,"rgba(10,10,12,.55)"); gr.addColorStop(1,"rgba(10,10,12,0)"); g.fillStyle=gr; g.fillRect(0,0,W,H*.22);
  gr=g.createLinearGradient(0,H,0,H*(story?.5:.38)); gr.addColorStop(0,"rgba(10,10,12,.93)"); gr.addColorStop(.55,"rgba(10,10,12,.78)"); gr.addColorStop(1,"rgba(10,10,12,0)"); g.fillStyle=gr; g.fillRect(0,H*(story?.5:.38),W,H*(story?.5:.62));
  const acc="#F6A04D", light="#FFFFFF", fit=(t,wd)=>{ t=String(t); if(g.measureText(t).width<=wd) return t; while(g.measureText(t+"…").width>wd&&t.length>4) t=t.slice(0,-1); return t.trim()+"…"; };
  const sun=sunOf(eventEnd(r.e)), it=recapItems(sun,null).find(i=>i.t.id===r.t.id), log=rlLoad()[r.key]||{};
  if(r.was){ g.save(); g.translate(W-165,story?340:165); g.rotate(-8*Math.PI/180); g.fillStyle="rgba(10,10,12,.38)"; g.beginPath(); g.arc(0,0,98,0,7); g.fill(); g.strokeStyle=acc; g.lineWidth=8; g.stroke();
    g.fillStyle=acc; g.textAlign="center"; g.font=`800 33px ${P.fontD}`; g.fillText("I WAS",0,-10); g.fillText("THERE",0,28); g.font=`700 21px ${P.fontB}`; g.fillText(String(r.e.d).slice(0,4),0,62); g.restore(); g.textAlign="left"; }
  let y=H-(story?270:70); g.fillStyle="rgba(255,255,255,.72)"; g.font=`600 26px ${P.fontB}`; g.fillText("TRACKSIDE PASS  ·  TRACKSIDEPASS.COM",70,y); y-=56;
  if(log.note){ g.fillStyle="rgba(255,255,255,.9)"; g.font=`italic 400 32px ${P.fontB}`; const words=log.note.split(/\s+/); let line="", lines=[]; words.forEach(wd=>{ const t=line?line+" "+wd:wd; if(g.measureText(t).width>W-160){ lines.push(line); line=wd; } else line=t; }); if(line) lines.push(line);
    const cut=lines.length>2; lines=lines.slice(0,2); if(cut) lines[1]=fit(lines[1]+"…",W-160); lines[0]="“"+lines[0]; lines[lines.length-1]+="”";
    for(let i=lines.length-1;i>=0;i--){ g.fillText(lines[i],70,y); y-=44; } y-=10; }
  if(it){ const games=recapGames(r.t,r.e,it.r.s), pts=games.reduce((n,x)=>n+x.sc.pts,0), mx=games.reduce((n,x)=>n+x.sc.max,0);
    if(games.length){ g.fillStyle=acc; g.font=`600 36px ${P.fontD}`; g.fillText(`My picks: ${pts} of ${mx} points`,70,y); y-=62; }
    const clean=l=>String(l).replace(/^Winner:\s*/,"").replace(/^\d+\.\s*/,"").replace(/\s*[—-]\s*.*$/,"").replace(/\s*\([^)]*\)\s*$/,"");
    const top=recapTop(it.r.groups[0],3).map((l,i)=>(i+1)+". "+clean(l)); g.font=`600 28px ${P.fontB}`; const rows=[[]]; let rw=0; const items=top.map(t=>{ const tx=fit(t,W-190), wd=g.measureText(tx).width+52; return {tx,wd}; });
    items.forEach(o=>{ if(rw+o.wd>W-140&&rows[rows.length-1].length){ rows.push([]); rw=0; } rows[rows.length-1].push(o); rw+=o.wd+16; });
    for(let ri=rows.length-1;ri>=0;ri--){ let x=70; rows[ri].forEach(o=>{ g.strokeStyle="rgba(255,255,255,.7)"; g.lineWidth=3; g.beginPath(); g.roundRect(x,y-38,o.wd,54,27); g.stroke(); g.fillStyle=light; g.fillText(o.tx,x+26,y); x+=o.wd+16; }); y-=70; } y-=26; }
  if((log.with||[]).length){ g.fillStyle="rgba(255,255,255,.85)"; g.font=`500 30px ${P.fontB}`; g.fillText(fit("With "+log.with.map(x=>x.n).join(", "),W-140),70,y); y-=48; }
  g.fillStyle=light; g.font=`500 36px ${P.fontB}`; g.fillText(fit(`${r.t.short} · ${fmtRange(r.e)}`,W-140),70,y); y-=64;
  { const words=String(r.e.e).toUpperCase().split(" "); let fs=118, l1=words.join(" "), l2="";
    g.font=`800 ${fs}px ${P.fontD}`;
    if(g.measureText(l1).width>W-140){ let best=null; for(let i=1;i<words.length;i++){ const a=words.slice(0,i).join(" "), b2=words.slice(i).join(" "), m=Math.max(g.measureText(a).width,g.measureText(b2).width); if(!best||m<best.m) best={a,b:b2,m}; } if(best){ l1=best.a; l2=best.b; } }
    while((g.measureText(l1).width>W-140||g.measureText(l2).width>W-140)&&fs>56){ fs-=6; g.font=`800 ${fs}px ${P.fontD}`; }
    g.fillStyle=light; if(l2){ g.fillText(l2,70,y); y-=fs*1.02; } g.fillText(l1,70,y); y-=fs+26; }
  g.fillStyle=acc; g.font=`700 28px ${P.fontB}`; g.fillText(r.was?"MY RACE WEEKEND":"RACE WEEKEND",70,y);
  return cv;
}
async function rlCardBlob(r,photo,H){
  H=H||rlShape(); const W=1080, ov=await rlOverlay(r,W,H), cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d");
  let bmp; try{ bmp=await createImageBitmap(photo); }catch(e){ bmp=await new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=no; i.src=URL.createObjectURL(photo); }); }
  const bw=bmp.width||bmp.naturalWidth, bh=bmp.height||bmp.naturalHeight, sc=Math.max(W/bw,H/bh), w=bw*sc, h=bh*sc; g.drawImage(bmp,(W-w)/2,-(h-H)*.38,w,h); g.drawImage(ov,0,0);
  return await new Promise(ok=>cv.toBlob(ok,"image/png"));
}

/* "Add a race I went to": every weekend in the app that has started, newest first, with a search box; picking one puts it in the log as one you were at */
function rlPicker(q){
  q=(q||"").trim().toLowerCase(); const today=localToday(), have=new Set(rlEntries().map(x=>x.key)), all=[];
  TRACKS.forEach(t=>(t.events||[]).forEach(e=>{ if(/test/i.test(e.s||"")||e.d>today||have.has(rlKey(t,e))) return; all.push({t,e}); }));
  all.sort((a,b)=>b.e.d.localeCompare(a.e.d));
  const hit=all.filter(x=>!q||(x.e.e+" "+x.t.short+" "+x.t.place).toLowerCase().includes(q)).slice(0,40);
  const rows=hit.map(x=>`<button class="rlRow" onclick="rlAdd('${x.t.id}','${x.e.d}')"><span class="rlTxt"><b>${esc(x.e.e)}</b><small>${esc(x.t.short)} · ${esc(fmtRange(x.e))}</small></span><i aria-hidden="true">+</i></button>`).join("");
    if(!document.getElementById("rlQ")){ setInfo(`<div class="mkick">Race Log</div><h3 id="infoTitle">Add a race I went to</h3><p class="plRules">Pick a weekend from the app's calendar. Only races already in the app can be added.</p><input id="rlQ" class="rlSearch" type="search" placeholder="Search a track or race" oninput="rlPicker(this.value)"><div id="rlList">${rows||'<p class="rlEmpty">Nothing matches.</p>'}</div><div class="rcpBtns"><button class="btn quiet" onclick="closeInfo()">Close</button></div>`); }
  else document.getElementById("rlList").innerHTML=rows||'<p class="rlEmpty">Nothing matches.</p>';
}
function rlAdd(tid,d){ const t=TRACKS.find(x=>x.id===tid); if(!t) return; const e=(t.events||[]).find(x=>x.d===d&&!/test/i.test(x.s||"")); if(!e) return;
  const o=rlLoad(), k=rlKey(t,e); o[k]=Object.assign({},o[k],{added:true}); rlSave(o); rlRender(); rlOpen(k); }

/* "With": people who went with you. Friends from your account (tap to add) and any name you type; kept only on this phone, nobody is told */
function rlWithHtml(list){
  const fr=(typeof acct!=="undefined"&&acct&&acct.friends)||[], has=n=>list.some(x=>x.n.toLowerCase()===String(n).toLowerCase());
  const chips=list.map((x,i)=>`<button class="rlChip on" onclick="rlWithRemove(${i})" aria-label="Remove ${esc(x.n)}">${esc(x.n)} <i>&times;</i></button>`).join("");
  const sug=fr.filter(f=>!has(f.display_name)).slice(0,12).map(f=>`<button class="rlChip" onclick="rlWithAddFriend('${esc(f.id)}','${esc(f.display_name).replace(/'/g,"&#39;")}')">+ ${esc(f.display_name)}</button>`).join("");
  return `<div class="rlChips">${chips}${sug}</div><div class="rlWithAdd"><input id="rlWithIn" class="rlSearch" type="text" maxlength="24" placeholder="Add a name (a friend, family, anyone)" onkeydown="if(event.key==='Enter'){event.preventDefault();rlWithAdd()}"><button class="btn quiet" onclick="rlWithAdd()">Add</button></div>`;
}
function rlWithSet(list){ if(!rlCur) return; const o=rlLoad(); o[rlCur.key]=Object.assign({},o[rlCur.key],{with:list}); if(!list.length) delete o[rlCur.key].with; rlSave(o); const el=document.getElementById("rlWith"); if(el) el.innerHTML=rlWithHtml(list); }
function rlWithGet(){ return ((rlLoad()[rlCur&&rlCur.key]||{}).with||[]).slice(); }
function rlWithAdd(){ const el=document.getElementById("rlWithIn"), v=el?el.value.trim():""; if(!v) return; const l=rlWithGet(); if(!l.some(x=>x.n.toLowerCase()===v.toLowerCase())&&l.length<8) l.push({n:v}); rlWithSet(l); }
function rlWithAddFriend(id,name){ const l=rlWithGet(); name=String(name).replace(/&#39;/g,"'"); if(!l.some(x=>x.n.toLowerCase()===name.toLowerCase())&&l.length<8) l.push({id,n:name}); rlWithSet(l); }
function rlWithRemove(i){ const l=rlWithGet(); l.splice(i,1); rlWithSet(l); }

/* card size: feed post (4:5) or Story / Reel (tall 9:16) */
function rlSegHtml(){ const st=rlShape()>1500; return `<span>Card size</span><button class="${st?"":"on"}" onclick="rlSetShape('feed')">Feed post</button><button class="${st?"on":""}" onclick="rlSetShape('story')">Story or Reel</button>`; }
function rlSetShape(v){ LSset(K.rlShape,v); const el=document.getElementById("rlSeg"); if(el) el.innerHTML=rlSegHtml(); }
/* an optional video clip per race (IndexedDB key "<race>#v"), kept as picked; "Make video card" records it with the card's text over it, 1080x1920, at most 15 seconds, in real time */
async function rlVidPick(inp){
  const f=inp.files&&inp.files[0]; if(!f||!rlCur) return; if(f.size>300*1048576){ toast("That clip is over 300 MB: pick a shorter one"); return; }
  const key=rlCur.key; try{ await rlPutPhoto(key+"#v",f); toast("Clip saved on this phone"); }catch(e){ toast("Could not save that clip (is the phone full?)"); return; } rlSaveNote(); await rlOpen(key);
}
async function rlRemoveVideo(){ if(!rlCur) return; const key=rlCur.key; await rlDelPhoto(key+"#v"); await rlOpen(key); }
async function rlMakeVideo(){
  if(!rlCur) return; rlSaveNote(); const r=rlCur, vb=await rlGetPhoto(r.key+"#v"), prog=document.getElementById("rlProg"), say=t=>{ if(prog){ prog.hidden=false; prog.textContent=t; } };
  if(!vb){ toast("Add a video clip first"); return; }
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){ say("This phone cannot make a video card yet. The photo card still works."); return; }
  const mime=["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(m=>MediaRecorder.isTypeSupported(m));
  if(!mime){ say("This phone cannot record video here. The photo card still works."); return; }
  say("Getting ready…"); const W=1080, H=1920, ov=await rlOverlay(r,W,H), cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d");
  const v=document.createElement("video"); v.playsInline=true; v.setAttribute("playsinline",""); v.preload="auto"; v.src=URL.createObjectURL(vb);
  try{ await new Promise((ok,no)=>{ v.onloadeddata=ok; v.onerror=()=>no(new Error("video")); setTimeout(()=>no(new Error("timeout")),15000); }); }catch(e){ say("This phone could not read that clip."); return; }
  const dur=Math.min(15,isFinite(v.duration)?v.duration:15), stream=cv.captureStream(30); let ac=null;
  try{ ac=new (window.AudioContext||window.webkitAudioContext)(); const src=ac.createMediaElementSource(v), dest=ac.createMediaStreamDestination(); src.connect(dest); dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t)); }catch(e){}
  const chunks=[]; let rec; try{ rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000}); }catch(e){ say("This phone could not start recording."); return; }
  rec.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
  const done=new Promise(ok=>{ rec.onstop=ok; }); let last=-1, stopped=false;
  const draw=()=>{ const vw=v.videoWidth||W, vh=v.videoHeight||H, sc=Math.max(W/vw,H/vh), w=vw*sc, h=vh*sc; g.fillStyle="#000"; g.fillRect(0,0,W,H); g.drawImage(v,(W-w)/2,(H-h)/2,w,h); g.drawImage(ov,0,0);
    const t=Math.floor(v.currentTime); if(t!==last){ last=t; say(`Making your video card… ${Math.min(t,Math.ceil(dur))} of ${Math.ceil(dur)} s. Keep the app open.`); }
    if(!stopped&&(v.currentTime>=dur||v.ended)){ stopped=true; try{ v.pause(); }catch(e){} rec.stop(); return; } if(!stopped) requestAnimationFrame(draw); };
  try{ if(ac&&ac.state==="suspended") await ac.resume(); rec.start(500); await v.play(); }catch(e){ say("This phone did not allow the clip to play. Tap again."); try{ rec.stop(); }catch(x){} return; }
  draw(); await done; try{ if(ac) ac.close(); }catch(e){} URL.revokeObjectURL(v.src);
  const blob=new Blob(chunks,{type:mime.split(";")[0]}); if(blob.size<20000){ say("The recording came out empty on this phone."); return; }
  const ext=blob.type==="video/mp4"?"mp4":"webm", file=new File([blob],"trackside-pass-race."+ext,{type:blob.type}); say(`Done: ${(blob.size/1048576).toFixed(1)} MB. Sharing…`);
  try{ if(navigator.canShare&&navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:r.e.e}); return; } }catch(x){ if(x&&x.name==="AbortError") return; }
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=file.name; document.body.appendChild(a); a.click(); a.remove(); toast("Video saved");
}
