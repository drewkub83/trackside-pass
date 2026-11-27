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
  const r=rlEntries().find(x=>x.key===key); if(!r) return; rlCur=r; const log=rlLoad()[key]||{}, ph=await rlGetPhoto(key);
  if(rlCurUrl){ URL.revokeObjectURL(rlCurUrl); rlCurUrl=null; } if(ph) rlCurUrl=URL.createObjectURL(ph);
  const sun=sunOf(eventEnd(r.e)), items=recapItems(sun,null).filter(i=>i.t.id===r.t.id), it=items[0], top=it?recapTop(it.r.groups[0],3):[];
  const games=it?recapGames(r.t,r.e,it.r.s):[], pts=games.reduce((n,x)=>n+x.sc.pts,0), mx=games.reduce((n,x)=>n+x.sc.max,0);
  setInfo(`<div class="mkick">${r.was?"I was there":"Marked going"}</div><h3 id="infoTitle">${esc(r.e.e)}</h3><p class="plRules">${esc(r.t.short)} · ${esc(fmtRange(r.e))}</p>
    <div class="rlPhoto">${rlCurUrl?`<img src="${rlCurUrl}" alt="Your photo">`:`<div class="rlNo">No photo yet</div>`}</div>
    <div class="rcpBtns"><button class="btn quiet" onclick="document.getElementById('rlFile').click()">${ph?"Change photo":"Add photo"}</button>${ph?`<button class="btn quiet" onclick="rlRemovePhoto()">Remove</button>`:""}</div>
    <input type="file" id="rlFile" accept="image/*" hidden onchange="rlPick(this)">
    <label class="f" for="rlNote">Your note</label><textarea id="rlNote" class="rlNote" rows="3" maxlength="500" placeholder="Who you went with, where you sat, what you remember" onblur="rlSaveNote()">${esc(log.note||"")}</textarea>
    ${top.length?`<div class="rcpStory"><h5>${esc(watchSeriesName(it.r)||it.r.event)}</h5>${top.map((l,i)=>`<p>${esc(String(l).replace(/^Winner:\s*/,"Winner: "))}</p>`).join("")}${games.length?`<p class="rcpAsOf">Your picks scored ${pts} of ${mx}.</p>`:""}</div>`:""}
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
async function rlCardBlob(r,photo){
  try{ await document.fonts.ready; }catch(x){}
  const W=1080, H=1350, cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d"), P=recapPalette(g); g.textBaseline="alphabetic";
  let bmp; try{ bmp=await createImageBitmap(photo); }catch(e){ bmp=await new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=no; i.src=URL.createObjectURL(photo); }); }
  const bw=bmp.width||bmp.naturalWidth, bh=bmp.height||bmp.naturalHeight, s=Math.max(W/bw,H/bh), w=bw*s, h=bh*s; g.drawImage(bmp,(W-w)/2,-(h-H)*.38,w,h);
  let gr=g.createLinearGradient(0,0,0,H*.22); gr.addColorStop(0,"rgba(10,10,12,.55)"); gr.addColorStop(1,"rgba(10,10,12,0)"); g.fillStyle=gr; g.fillRect(0,0,W,H*.22);
  gr=g.createLinearGradient(0,H,0,H*.38); gr.addColorStop(0,"rgba(10,10,12,.93)"); gr.addColorStop(.55,"rgba(10,10,12,.78)"); gr.addColorStop(1,"rgba(10,10,12,0)"); g.fillStyle=gr; g.fillRect(0,H*.38,W,H*.62);
  const acc="#F6A04D", light="#FFFFFF", fit=(t,wd)=>{ t=String(t); if(g.measureText(t).width<=wd) return t; while(g.measureText(t+"…").width>wd&&t.length>4) t=t.slice(0,-1); return t.trim()+"…"; };
  const sun=sunOf(eventEnd(r.e)), it=recapItems(sun,null).find(i=>i.t.id===r.t.id), log=rlLoad()[r.key]||{};
  if(r.was){ g.save(); g.translate(W-165,165); g.rotate(-8*Math.PI/180); g.fillStyle="rgba(10,10,12,.38)"; g.beginPath(); g.arc(0,0,98,0,7); g.fill(); g.strokeStyle=acc; g.lineWidth=8; g.stroke();
    g.fillStyle=acc; g.textAlign="center"; g.font=`800 33px ${P.fontD}`; g.fillText("I WAS",0,-10); g.fillText("THERE",0,28); g.font=`700 21px ${P.fontB}`; g.fillText(String(r.e.d).slice(0,4),0,62); g.restore(); g.textAlign="left"; }
  let y=H-70; g.fillStyle="rgba(255,255,255,.72)"; g.font=`600 26px ${P.fontB}`; g.fillText("TRACKSIDE PASS  ·  TRACKSIDEPASS.COM",70,y); y-=56;
  if(log.note){ g.fillStyle="rgba(255,255,255,.9)"; g.font=`italic 400 32px ${P.fontB}`; const words=log.note.split(/\s+/); let line="", lines=[]; words.forEach(wd=>{ const t=line?line+" "+wd:wd; if(g.measureText(t).width>W-160){ lines.push(line); line=wd; } else line=t; }); if(line) lines.push(line);
    const cut=lines.length>2; lines=lines.slice(0,2); if(cut) lines[1]=fit(lines[1]+"…",W-160); lines[0]="“"+lines[0]; lines[lines.length-1]+="”";
    for(let i=lines.length-1;i>=0;i--){ g.fillText(lines[i],70,y); y-=44; } y-=10; }
  if(it){ const games=recapGames(r.t,r.e,it.r.s), pts=games.reduce((n,x)=>n+x.sc.pts,0), mx=games.reduce((n,x)=>n+x.sc.max,0);
    if(games.length){ g.fillStyle=acc; g.font=`600 36px ${P.fontD}`; g.fillText(`My picks: ${pts} of ${mx} points`,70,y); y-=62; }
    const clean=l=>String(l).replace(/^Winner:\s*/,"").replace(/^\d+\.\s*/,"").replace(/\s*[—-]\s*.*$/,"").replace(/\s*\([^)]*\)\s*$/,"");
    const top=recapTop(it.r.groups[0],3).map((l,i)=>(i+1)+". "+clean(l)); g.font=`600 28px ${P.fontB}`; const rows=[[]]; let rw=0; const items=top.map(t=>{ const tx=fit(t,W-190), wd=g.measureText(tx).width+52; return {tx,wd}; });
    items.forEach(o=>{ if(rw+o.wd>W-140&&rows[rows.length-1].length){ rows.push([]); rw=0; } rows[rows.length-1].push(o); rw+=o.wd+16; });
    for(let ri=rows.length-1;ri>=0;ri--){ let x=70; rows[ri].forEach(o=>{ g.strokeStyle="rgba(255,255,255,.7)"; g.lineWidth=3; g.beginPath(); g.roundRect(x,y-38,o.wd,54,27); g.stroke(); g.fillStyle=light; g.fillText(o.tx,x+26,y); x+=o.wd+16; }); y-=70; } y-=26; }
  g.fillStyle=light; g.font=`500 36px ${P.fontB}`; g.fillText(fit(`${r.t.short} · ${fmtRange(r.e)}`,W-140),70,y); y-=64;
  { const words=String(r.e.e).toUpperCase().split(" "); let fs=118, l1=words.join(" "), l2="";
    g.font=`800 ${fs}px ${P.fontD}`;
    if(g.measureText(l1).width>W-140){ let best=null; for(let i=1;i<words.length;i++){ const a=words.slice(0,i).join(" "), b2=words.slice(i).join(" "), m=Math.max(g.measureText(a).width,g.measureText(b2).width); if(!best||m<best.m) best={a,b:b2,m}; } if(best){ l1=best.a; l2=best.b; } }
    while((g.measureText(l1).width>W-140||g.measureText(l2).width>W-140)&&fs>56){ fs-=6; g.font=`800 ${fs}px ${P.fontD}`; }
    g.fillStyle=light; if(l2){ g.fillText(l2,70,y); y-=fs*1.02; } g.fillText(l1,70,y); y-=fs+26; }
  g.fillStyle=acc; g.font=`700 28px ${P.fontB}`; g.fillText(r.was?"MY RACE WEEKEND":"RACE WEEKEND",70,y);
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
