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
let rlCur=null, rlCurUrl=null, rlCurVid=null;
async function rlOpen(key){
  const r=rlEntries().find(x=>x.key===key); if(!r) return; rlCur=r; const log=rlLoad()[key]||{}, ph=await rlGetPhoto(key), vdWeb=await rlGetPhoto(key+"#v"), vid=log.vid||null, vd=vdWeb||(vid?{size:vid.bytes||0}:null);
  if(rlCurUrl){ URL.revokeObjectURL(rlCurUrl); rlCurUrl=null; } if(rlCurVid){ URL.revokeObjectURL(rlCurVid); rlCurVid=null; } if(ph) rlCurUrl=URL.createObjectURL(ph); if(vdWeb) rlCurVid=URL.createObjectURL(vdWeb);
  const sun=sunOf(eventEnd(r.e)), items=recapItems(sun,null).filter(i=>i.t.id===r.t.id), it=items[0], top=it?recapTop(it.r.groups[0],3):[];
  const games=it?recapGames(r.t,r.e,it.r.s):[], pts=games.reduce((n,x)=>n+x.sc.pts,0), mx=games.reduce((n,x)=>n+x.sc.max,0);
  setInfo(`<div class="mkick">${r.was?"I was there":"Marked going"}</div><h3 id="infoTitle">${esc(r.e.e)}</h3><p class="plRules">${esc(r.t.short)} · ${esc(fmtRange(r.e))}</p>
    <div class="rlPhoto">${vdWeb&&rlCurVid?`<video class="rlMedia" src="${rlCurVid}" controls playsinline muted preload="metadata"></video>`:rlCurUrl?`<img src="${rlCurUrl}" alt="${vid?"First frame of your clip":"Your photo"}">${vid?`<div class="rlClipTag">Video clip${vid.dur?" · "+Math.round(vid.dur)+" s":""}</div>`:""}`:`<div class="rlNo">No photo or video yet</div>`}</div>
    <div class="rcpBtns"><button class="btn quiet" onclick="rlAddMedia()">${ph||vd?"Change photo or video":"Add photo or video"}</button>${ph||vd?`<button class="btn quiet" onclick="rlRemoveMedia()">Remove</button>`:""}</div>
    <input type="file" id="rlFile" accept="image/*,video/*" hidden onchange="rlPickMedia(this)">
    <label class="f" for="rlNote">Your note</label><textarea id="rlNote" class="rlNote" rows="3" maxlength="500" placeholder="Where you sat, what you remember" onblur="rlSaveNote()">${esc(log.note||"")}</textarea>
    <label class="f">Who went with you</label><div id="rlWith">${rlWithHtml(log.with||[])}</div>
    ${top.length?`<div class="rcpStory"><h5>${esc(watchSeriesName(it.r)||it.r.event)}</h5>${top.map((l,i)=>`<p>${esc(String(l).replace(/^Winner:\s*/,"Winner: "))}</p>`).join("")}${games.length?`<p class="rcpAsOf">Your picks scored ${pts} of ${mx}.</p>`:""}</div>`:""}
    <div class="rlSeg" id="rlSeg">${rlSegHtml()}</div>${vd?`<div class="rlSeg" id="rlLen">${rlLenHtml()}</div>`:""}
    <div class="rcpBtns"><button class="btn ${vd?"quiet":"primary"}" onclick="rlShare()">${ph?"Share card":"Share recap card"}</button>${vd?`<button class="btn primary" onclick="rlMakeVideo()">Make video card</button>`:""}<button class="btn quiet" onclick="closeInfo()">Close</button></div>
    <div class="rlProg" id="rlProg" hidden></div>
    <p class="fine">Your photos, videos and note stay on this phone. Nothing is uploaded.</p>`);
}
function rlSaveNote(){ if(!rlCur) return; const el=document.getElementById("rlNote"); if(!el) return; const o=rlLoad(), v=el.value.trim(); if(v) o[rlCur.key]=Object.assign({},o[rlCur.key],{note:v}); else if(o[rlCur.key]){ delete o[rlCur.key].note; } rlSave(o); }
/* shrink to 1600 px on the long side and re-encode as JPEG, so a 12 MB photo becomes a few hundred KB */
async function rlShrink(file){
  let bmp; try{ bmp=await createImageBitmap(file,{imageOrientation:"from-image"}); }catch(e){ bmp=await new Promise((ok,no)=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=no; i.src=URL.createObjectURL(file); }); }
  const w0=bmp.width||bmp.naturalWidth, h0=bmp.height||bmp.naturalHeight, s=Math.min(1,1600/Math.max(w0,h0)), cv=document.createElement("canvas"); cv.width=Math.round(w0*s); cv.height=Math.round(h0*s);
  cv.getContext("2d").drawImage(bmp,0,0,cv.width,cv.height); return await new Promise(ok=>cv.toBlob(ok,"image/jpeg",.86));
}
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

/* stamps and badges earned at this weekend: the track stamp (tier by how many weekends there so far) and every badge unlocked between the first day and the day after the last, drawn from the Passport's own SVG on a paper disc */
function rlEarned(r){
  if(typeof ppLoad!=="function"||typeof stampSvg!=="function") return [];
  const p=ppLoad(), out=[]; if(!r.was) return out;
  const evs=new Set(p.stamps.filter(x=>x.t===r.t.id&&x.ev<=r.e.d).map(x=>x.ev)); const n=Math.max(1,evs.size), tier=ppTier(n);
  const tdef=ppTrackDefs().find(d=>d.track===r.t&&d.id.endsWith(":"+tier)); const stamp=p.stamps.filter(x=>x.t===r.t.id&&x.ev===r.e.d).reduce((m,x)=>Math.max(m,x.at||0),0);
  if(tdef) out.push({d:tdef,at:stamp||undefined});
  /* the badges this weekend earned: the ones your stamps up to and including this weekend satisfy that the stamps before it did not. Worked out from the stamps (not from the unlock date, which is later when a passport was rebuilt or restored). */
  const mk=list=>({stamps:list,unlocked:{}}), after=ppStats(mk(p.stamps.filter(x=>x.ev<=r.e.d))), before=ppStats(mk(p.stamps.filter(x=>x.ev<r.e.d))), order={z:0,g:1,s:2,b:3,x:4};
  const got=d=>{ try{ return !!d.test(after)&&!d.test(before); }catch(e){ return false; } };
  PP_GLOBAL.filter(got).sort((a,b)=>(order[a.tier]??5)-(order[b.tier]??5)).forEach(d=>out.push({d,at:stamp||p.unlocked[d.id]||undefined}));
  return out;
}
async function rlStampImages(list){
  /* the stamps are HTML-parsed inline SVG (some repeat an attribute, which a standalone SVG image refuses): parse as HTML and serialise as XML */
  const mk=()=>list.map(x=>{ const d=document.createElement("div"); d.innerHTML=stampSvg(x.d,{date:x.at}); const el=d.querySelector("svg"); if(!el) return ""; el.setAttribute("xmlns","http://www.w3.org/2000/svg"); el.setAttribute("width","300"); el.setAttribute("height","300"); return new XMLSerializer().serializeToString(el); });
  mk(); await new Promise(r=>setTimeout(r,500));      /* the big pieces of art load on first use: ask once, wait, ask again */
  return await Promise.all(mk().map(svg=>new Promise(ok=>{ const i=new Image(); i.onload=()=>ok(i); i.onerror=()=>ok(null); i.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg); })));
}
function rlShape(){ return LSget(K.rlShape,"feed")==="story"?1920:1350; }
async function rlOverlay(r,W,H){
  try{ await document.fonts.ready; }catch(x){}
  const story=H>1500, cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d"), P=recapPalette(g); g.textBaseline="alphabetic";
  let textMaxX=70, firstTextY=H; { const ft=g.fillText.bind(g); g.fillText=(t,x,yy,mw)=>{ if(x>=60&&x<=200){ textMaxX=Math.max(textMaxX,x+g.measureText(String(t)).width+(x>70?30:0)); firstTextY=Math.min(firstTextY,yy); } return ft(t,x,yy,mw); }; }
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
  /* every stamp earned that weekend, scattered like a passport page: random angles, around the top and the sides of the photo, a little over the edge, never over the text or the I WAS THERE stamp. The layout is seeded by the race, so the card and the video always match. */
  const earned=rlEarned(r).slice(0,12);
  if(earned.length){ const imgs=await rlStampImages(earned), limit=y-70, avoid=r.was?{x:W-165,y:story?340:165,r:118}:null;
    let sd=0; String(r.key).split("").forEach(ch=>{ sd=(sd*31+ch.charCodeAt(0))>>>0; }); const rnd=()=>{ sd=(sd+0x6D2B79F5)>>>0; let t=sd; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
    const placed=[], base=earned.length>8?118:earned.length>5?136:154, textTop=firstTextY-44, textBot=story?H-270+34:H, textRight=textMaxX+36;
    /* a circle clear of the text block (a rectangle), the I WAS THERE stamp and the stamps already placed; only around the edges (top, sides, and the lower corners and bottom where there is room) */
    const clearOfText=(cx,cy,sz)=>{ const nx=Math.max(30,Math.min(cx,textRight)), ny=Math.max(textTop,Math.min(cy,textBot)); return Math.hypot(cx-nx,cy-ny)-sz*.46; };
    earned.forEach((e,i)=>{ const im=imgs[i]; if(!im) return; const size=Math.round(i===0?base*1.22:base*(0.9+rnd()*0.25)); let best=null;
      const ymin=story?250+size*.42:size*.25, band=Math.min(250,W*.24);
      for(let k=0;k<500;k++){ const cx=size*.3+rnd()*(W-size*.6), cy=ymin+rnd()*(H-ymin-size*.28);
        const edge=Math.min(cx,W-cx)<band||cy<ymin+size*1.1||(story&&cy>H-250)||cy>H-size*.9;
        if(!edge) continue; const tg=clearOfText(cx,cy,size); if(tg<0) continue;
        let gap=tg+20; if(avoid) gap=Math.min(gap,Math.hypot(cx-avoid.x,cy-avoid.y)-(size/2+avoid.r)); if(gap<-10) continue;
        let sep=1e9; placed.forEach(q=>{ sep=Math.min(sep,Math.hypot(cx-q.cx,cy-q.cy)-(size+q.size)*.34); });
        const score=Math.min(sep,300)+Math.min(gap,120)*.2; if(!best||score>best.score) best={cx,cy,score}; }
      if(!best) return; placed.push({cx:best.cx,cy:best.cy,size,rot:(rnd()-.5)*.9,im}); });
    placed.forEach(q=>{ g.save(); g.translate(q.cx,q.cy); g.rotate(q.rot); g.shadowColor="rgba(0,0,0,.5)"; g.shadowBlur=16; g.shadowOffsetY=4; g.fillStyle="rgba(243,237,224,.95)"; g.beginPath(); g.arc(0,0,q.size/2,0,7); g.fill(); g.shadowColor="transparent"; g.drawImage(q.im,-q.size/2+q.size*.05,-q.size/2+q.size*.05,q.size*.9,q.size*.9); g.restore(); }); }
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
async function rlMakeVideo(){
  if(!rlCur) return; rlSaveNote(); const r=rlCur, vb=await rlGetPhoto(r.key+"#v"), prog=document.getElementById("rlProg"), say=t=>{ if(prog){ prog.hidden=false; prog.textContent=t; } };
  { const nv=(rlLoad()[r.key]||{}).vid, NP=rlNative(); if(nv&&NP) return rlMakeNative(r,nv,NP,say); }
  if(!vb){ toast("Add a video clip first"); return; }
  if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){ say("This phone cannot make a video card yet. The photo card still works."); return; }
  const mime=["video/mp4;codecs=avc1.42E01E,mp4a.40.2","video/mp4","video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(m=>MediaRecorder.isTypeSupported(m));
  if(!mime){ say("This phone cannot record video here. The photo card still works."); return; }
  say("Getting ready…"); const W=1080, H=1920, ov=await rlOverlay(r,W,H), cv=document.createElement("canvas"); cv.width=W; cv.height=H; const g=cv.getContext("2d");
  const v=document.createElement("video"); v.playsInline=true; v.setAttribute("playsinline",""); v.preload="auto"; v.src=URL.createObjectURL(vb);
  try{ await new Promise((ok,no)=>{ v.onloadeddata=ok; v.onerror=()=>no(new Error("video")); setTimeout(()=>no(new Error("timeout")),15000); }); }catch(e){ say("This phone could not read that clip."); return; }
  const len=+LSget(K.rlLen,"6")||6, dur=Math.min(len,isFinite(v.duration)?v.duration:len), stream=cv.captureStream(30); let ac=null;
  try{ ac=new (window.AudioContext||window.webkitAudioContext)(); const src=ac.createMediaElementSource(v), dest=ac.createMediaStreamDestination(); src.connect(dest); dest.stream.getAudioTracks().forEach(t=>stream.addTrack(t)); }catch(e){}
  const chunks=[]; let rec; try{ rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6000000}); }catch(e){ say("This phone could not start recording."); return; }
  rec.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
  const done=new Promise(ok=>{ rec.onstop=ok; }); let last=-1, stopped=false, recording=false, startT=0;
  /* the clip is already playing and the canvas already showing it before the recorder starts, so the video begins with moving picture, not black or a held frame */
  const draw=()=>{ const vw=v.videoWidth||W, vh=v.videoHeight||H, sc=Math.max(W/vw,H/vh), w=vw*sc, h=vh*sc; g.fillStyle="#000"; g.fillRect(0,0,W,H); g.drawImage(v,(W-w)/2,(H-h)/2,w,h); g.drawImage(ov,0,0);
    if(!recording&&!stopped&&v.currentTime>0.12){ recording=true; startT=v.currentTime; rec.start(500); }
    if(recording){ const t=Math.floor(v.currentTime-startT); if(t!==last){ last=t; say(`Making your video card… ${Math.min(t,Math.ceil(dur))} of ${Math.ceil(dur)} s. Keep the app open.`); }
      if(!stopped&&(v.currentTime-startT>=dur||v.ended)){ stopped=true; try{ v.pause(); }catch(e){} rec.stop(); return; } }
    if(!stopped) requestAnimationFrame(draw); };
  try{ if(ac&&ac.state==="suspended") await ac.resume(); v.currentTime=0; await v.play(); }catch(e){ say("This phone did not allow the clip to play. Tap again."); return; }
  draw(); await done; try{ if(ac) ac.close(); }catch(e){} URL.revokeObjectURL(v.src);
  const blob=new Blob(chunks,{type:mime.split(";")[0]}); if(blob.size<20000){ say("The recording came out empty on this phone."); return; }
  const ext=blob.type==="video/mp4"?"mp4":"webm"; rlVid={blob,file:new File([blob],"trackside-pass-race."+ext,{type:blob.type}),title:r.e.e};
  if(rlVidUrl) URL.revokeObjectURL(rlVidUrl); rlVidUrl=URL.createObjectURL(blob);
  if(prog){ prog.hidden=false; prog.innerHTML=`<video class="rlVidPrev" src="${rlVidUrl}" controls playsinline loop></video><div class="rcpBtns"><button class="btn primary" onclick="rlShareVideo()">Share</button><button class="btn quiet" onclick="rlSaveVideo()">Save to my phone</button></div><small>${(blob.size/1048576).toFixed(1)} MB · ${ext.toUpperCase()}. Play it to check it before you share.</small>`; const v=prog.querySelector("video"); if(v) v.scrollIntoView({block:"center"}); }
}
let rlVid=null, rlVidUrl=null;
async function rlShareVideo(){ if(!rlVid) return; const f=rlVid.file;
  try{ if(navigator.canShare&&navigator.canShare({files:[f]})){ await navigator.share({files:[f],title:rlVid.title}); return; } }catch(x){ if(x&&x.name==="AbortError") return; }
  rlSaveVideo(); }
function rlSaveVideo(){ if(!rlVid) return; const a=document.createElement("a"); a.href=rlVidUrl; a.download=rlVid.file.name; document.body.appendChild(a); a.click(); a.remove(); toast("Video saved"); }

/* one button for both: a photo is shrunk and kept; a video clip is kept as picked (up to 300 MB) and its first frame is kept as the photo, so the list, the still card and the video card all work. The newest pick replaces the other kind. */
/* inside the iPhone app the native plugin picks the media (PHPicker), keeps a clip as a real file and makes the video card in a second or two; anywhere else the web input and the recorder below do it */
function rlNative(){ const c=window.Capacitor; return (c&&c.isNativePlatform&&c.isNativePlatform()&&c.Plugins&&c.Plugins.VideoCard)||null; }
const rlB64Blob=(b64,type)=>fetch("data:"+type+";base64,"+b64).then(r=>r.blob());
async function rlAddMedia(){
  const P=rlNative(); if(!P||!rlCur){ const f=document.getElementById("rlFile"); if(f) f.click(); return; }
  rlSaveNote(); const key=rlCur.key; let res; try{ res=await P.pickMedia(); }catch(e){ toast("Could not open your library"); return; }
  if(!res||res.cancelled) return;
  const o=rlLoad(), old=(o[key]||{}).vid; o[key]=Object.assign({},o[key]);
  try{
    if(res.kind==="video"){ await rlDelPhoto(key+"#v"); if(old&&old.id&&old.id!==res.id) P.deleteVideo({id:old.id}).catch(()=>{});
      o[key].vid={id:res.id,dur:res.dur,w:res.w,h:res.h,bytes:res.bytes}; if(res.poster) await rlPutPhoto(key,await rlB64Blob(res.poster,"image/jpeg")); else await rlDelPhoto(key); toast("Clip saved on this phone"); }
    else if(res.kind==="image"){ await rlPutPhoto(key,await rlB64Blob(res.image,"image/jpeg")); await rlDelPhoto(key+"#v"); if(old&&old.id) P.deleteVideo({id:old.id}).catch(()=>{}); delete o[key].vid; toast("Photo saved on this phone"); }
  }catch(e){ toast("Could not save that (is the phone full?)"); return; }
  rlSave(o); await rlOpen(key); rlRender();
}
async function rlPoster(file){
  const v=document.createElement("video"); v.muted=true; v.playsInline=true; v.preload="auto"; v.src=URL.createObjectURL(file);
  try{ await new Promise((ok,no)=>{ v.onloadeddata=ok; v.onerror=()=>no(new Error("v")); setTimeout(()=>no(new Error("t")),15000); }); v.currentTime=Math.min(0.2,(v.duration||1)/2); await new Promise(ok=>{ v.onseeked=ok; setTimeout(ok,2000); });
    const sc=Math.min(1,1600/Math.max(v.videoWidth,v.videoHeight)), cv=document.createElement("canvas"); cv.width=Math.round(v.videoWidth*sc); cv.height=Math.round(v.videoHeight*sc); cv.getContext("2d").drawImage(v,0,0,cv.width,cv.height);
    return await new Promise(ok=>cv.toBlob(ok,"image/jpeg",.86)); }catch(e){ return null; } finally{ URL.revokeObjectURL(v.src); }
}
async function rlPickMedia(inp){
  const f=inp.files&&inp.files[0]; if(!f||!rlCur) return; const key=rlCur.key, isVid=/^video\//.test(f.type)||/\.(mp4|mov|m4v|webm)$/i.test(f.name||"");
  try{
    if(isVid){ if(f.size>300*1048576){ toast("That clip is over 300 MB: pick a shorter one"); return; }
      toast("Saving your clip…"); await rlPutPhoto(key+"#v",f); const post=await rlPoster(f); if(post) await rlPutPhoto(key,post); else await rlDelPhoto(key); toast("Clip saved on this phone"); }
    else { const b=await rlShrink(f); await rlPutPhoto(key,b); await rlDelPhoto(key+"#v"); { const o=rlLoad(); if(o[key]&&o[key].vid){ delete o[key].vid; rlSave(o); } } toast("Photo saved on this phone"); }
  }catch(e){ toast("Could not save that (is the phone full?)"); return; }
  rlSaveNote(); await rlOpen(key); rlRender();
}
async function rlRemoveMedia(){ if(!rlCur) return; const key=rlCur.key; await rlDelPhoto(key); await rlDelPhoto(key+"#v");
  const o=rlLoad(), v=(o[key]||{}).vid, P=rlNative(); if(v){ if(P&&v.id) P.deleteVideo({id:v.id}).catch(()=>{}); delete o[key].vid; rlSave(o); } await rlOpen(key); rlRender(); }

/* video card length: it records in real time, so 6 s takes about 6 s to make; 10 and 15 are longer */
function rlLenHtml(){ const c=+LSget(K.rlLen,"6")||6; return `<span>Video length</span>`+[6,10,15].map(n=>`<button class="${c===n?"on":""}" onclick="rlSetLen(${n})">${n} s</button>`).join(""); }
function rlSetLen(n){ LSset(K.rlLen,String(n)); const el=document.getElementById("rlLen"); if(el) el.innerHTML=rlLenHtml(); }

let rlNativeOut=null;
async function rlMakeNative(r,vid,P,say){
  const len=+LSget(K.rlLen,"6")||6, t0=Date.now(); say("Getting ready…");
  let b64; try{ const ov=await rlOverlay(r,1080,1920); b64=await new Promise(ok=>ov.toBlob(b=>{ const fr=new FileReader(); fr.onload=()=>ok(String(fr.result).split(",")[1]); fr.readAsDataURL(b); },"image/png")); }catch(e){ say("Could not draw the card."); return; }
  let h=null; try{ h=await P.addListener("progress",e=>say(`Making your video card… ${Math.round(Math.min(1,e.p||0)*100)}%`)); }catch(e){}
  try{ const res=await P.makeVideoCard({id:vid.id,overlay:b64,seconds:len,width:1080,height:1920}); rlNativeOut=res.path;
    const prog=document.getElementById("rlProg"); if(prog){ prog.hidden=false; prog.innerHTML=`<div class="rcpBtns"><button class="btn primary" onclick="rlNativeShare()">Share</button><button class="btn quiet" onclick="rlNativePlay()">Play it first</button></div><small>${(res.bytes/1048576).toFixed(1)} MB · MP4 · ${Math.round(res.seconds)} s, made in ${((Date.now()-t0)/1000).toFixed(1)} s.</small>`; } }
  catch(e){ say("Could not make the video: "+String((e&&e.message)||e).slice(0,120)); }
  finally{ try{ if(h&&h.remove) await h.remove(); }catch(e){} }
}
function rlNativeShare(){ const P=rlNative(); if(P&&rlNativeOut) P.shareFile({path:rlNativeOut}).catch(()=>{}); }
function rlNativePlay(){ const P=rlNative(); if(P&&rlNativeOut) P.previewVideo({path:rlNativeOut}).catch(()=>{}); }
