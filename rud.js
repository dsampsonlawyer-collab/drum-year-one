(function(){
const RUD=[
{id:'single',name:'Single stroke',n:2,bpm:60,st:'R L R L',tip:'Alternate hands with the same stick height. Both hands should sound identical.'},
{id:'double',name:'Double stroke',n:2,bpm:60,st:'R R L L',tip:'Let the stick bounce for the second note instead of pushing it. The second note should match the first in volume.'},
{id:'para',name:'Paradiddle',n:2,bpm:60,st:'R l r r L r l l',tip:'Capital letters are accents (stick about 8 in high), lowercase are taps (about 2 in). The accent alternates hands each group.'},
{id:'accent',name:'Accented singles',n:2,bpm:60,st:'R l l l L r r r',tip:'Alternating hands. Accent the first note of each group of four and keep the rest very quiet.'},
{id:'flam',name:'Flam',n:2,bpm:60,st:'lR rL',tip:'A flam is a quiet grace note just before the main note. Hold one stick low and the other high, and they should sound like one fat note.'},
{id:'flamtap',name:'Flam tap',n:2,bpm:60,st:'lR L rL R',tip:'Flam, then a single tap with the other hand. Keep the taps quieter than the flams.'},
{id:'trip',name:'Triplets',n:3,bpm:60,st:'R L R L R L',tip:'Three even notes to every beat. Say "1-trip-let" as you play.'},
{id:'pdd',name:'Paradiddle-diddle',n:3,bpm:60,st:'R l r r l l',tip:'Triplet feel. Accent the first note and keep the rest even and quiet.'},
{id:'dpara',name:'Double paradiddle',n:3,bpm:60,st:'R l r l r r L r l r l l',tip:'Triplet feel. Two single strokes more than a paradiddle before the double.'},
{id:'five',name:'Five-stroke roll',n:4,bpm:50,st:'r r l l R . . . l l r r L . . .',tip:'Two doubles and a final accent, then rest. Let the sticks bounce, and land the accent on the beat.'}
];
let cur=RUD[0],bpm=60,mode='hear',run=false,rac=null,timer=null,nextT=0,hlT=[];
const B=()=>S.best||(S.best={}),RT=()=>S.rtempo||(S.rtempo={});
const $q=id=>document.getElementById(id);
function toks(r){return r.st.split(' ')}
function isUp(c){return c!=='.'&&c===c.toUpperCase()}
function parse(r){
  const tk=toks(r);const mains=tk.filter(t=>t!=='.').map(t=>t[t.length-1]);
  const mixed=new Set(mains.map(isUp)).size>1;
  const notes=[];
  tk.forEach((t,i)=>{if(t==='.')return;const m=t[t.length-1];notes.push({i,hand:m.toUpperCase(),acc:mixed?isUp(m):false,tap:mixed&&!isUp(m),grace:t.length===2})});
  return {tk,notes,mixed};
}
function dSlot(){return 60/(bpm*cur.n)}
function renderChips(){
  $q('rchips').innerHTML=RUD.map(r=>`<button data-r="${r.id}" class="${r===cur?'on':''}">${r.name}${B()[r.id]?` <i>${B()[r.id]}</i>`:''}</button>`).join('');
}
function renderCur(){
  const P=parse(cur);
  $q('rname').textContent=cur.name;
  $q('rtip').textContent=cur.tip;
  $q('stk').innerHTML=P.tk.map((t,i)=>{
    if(t==='.')return `<span class="tk rest" id="tk${i}">-</span>`;
    const m=t[t.length-1];const cls=(P.mixed&&!isUp(m))?'tap':'acc';
    const g=t.length===2?`<sup>${t[0].toUpperCase()}</sup>`:'';
    return `<span class="tk ${cls} ${m.toUpperCase()==='R'?'rh':'lh'}" id="tk${i}">${g}${m.toUpperCase()}</span>`;
  }).join('');
  $q('rbpm').textContent=bpm;$q('rslider').value=bpm;
  renderChips();
}
function click(t,acc,gain){const o=rac.createOscillator(),g=rac.createGain();o.type='sine';o.frequency.value=acc?2600:2000;g.gain.setValueAtTime(gain||.25,t);g.gain.exponentialRampToValueAtTime(.001,t+.04);o.connect(g);g.connect(rac.destination);o.start(t);o.stop(t+.05)}
function hit(t,hand,gain){const o=rac.createOscillator(),g=rac.createGain();o.type='triangle';o.frequency.value=hand==='R'?900:620;g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+.09);o.connect(g);g.connect(rac.destination);o.start(t);o.stop(t+.1)}
function flash(i,t){hlT.push(setTimeout(()=>{document.querySelectorAll('#stk .tk').forEach(e=>e.classList.remove('now'));const e=document.getElementById('tk'+i);if(e)e.classList.add('now')},Math.max(0,(t-rac.currentTime)*1000)))}
function sched(){
  const d=dSlot(),P=parse(cur),slots=P.tk.length,beats=slots/cur.n,beat=60/bpm;
  while(nextT<rac.currentTime+.25){
    for(let b=0;b<beats;b++)click(nextT+b*beat,b===0,mode==='along'?.35:.15);
    P.tk.forEach((t,i)=>flash(i,nextT+i*d));
    if(mode==='hear')P.notes.forEach(n=>{const t=nextT+n.i*d;
      if(n.grace)hit(t-.035,n.hand==='R'?'L':'R',.2);
      hit(t,n.hand,n.acc?.9:(n.tap?.28:.6));});
    nextT+=slots*d;
  }
  timer=setTimeout(sched,40);
}
function stop(){run=false;clearTimeout(timer);hlT.forEach(clearTimeout);hlT=[];document.querySelectorAll('#stk .tk').forEach(e=>e.classList.remove('now'));$q('rhear').textContent='Hear it';$q('ralong').textContent='Play along'}
function start(m){
  if(run){const same=m===mode;stop();if(same)return}
  try{rac=rac||new (window.AudioContext||window.webkitAudioContext)();rac.resume()}catch(e){return}
  mode=m;run=true;
  const beat=60/bpm,t0=rac.currentTime+.1;
  for(let i=0;i<4;i++)click(t0+i*beat,i===0,.4);
  nextT=t0+4*beat;
  (m==='hear'?$q('rhear'):$q('ralong')).textContent='Stop';
  sched();
}
// ---------- analysis ----------
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
async function decode(file){
  const ab=await file.arrayBuffer();
  const ctx=new (window.AudioContext||window.webkitAudioContext)();
  return await new Promise((res,rej)=>{const p=ctx.decodeAudioData(ab,res,rej);if(p&&p.catch)p.catch(rej)});
}
function onsets(buf){
  const x=buf.getChannelData(0),sr=buf.sampleRate,N=Math.min(x.length,sr*90);
  const hop=Math.floor(sr*.002),F=Math.floor(N/hop),e=new Float32Array(F);
  for(let f=0;f<F;f++){let s=0;const o=f*hop;for(let j=0;j<hop;j++){const v=x[o+j];s+=v*v}e[f]=Math.sqrt(s/hop)}
  let mx=0;for(let f=0;f<F;f++)if(e[f]>mx)mx=e[f];
  const floor=mx*.04,back=25,refr=Math.round(.07/.002),out=[];let last=-1e9;
  for(let f=back;f<F;f++){
    let m=0;for(let k=f-back;k<f-2;k++)m+=e[k];m/=(back-2);
    if(e[f]>floor&&e[f]>m*2.2&&f-last>refr){
      let pk=0;for(let k=f;k<Math.min(F,f+20);k++)if(e[k]>pk)pk=e[k];
      out.push({t:f*hop/sr,a:pk});last=f;
    }
  }
  return {out,dur:N/sr};
}
function analyze(buf){
  const P=parse(cur),K=P.notes.length,slots=P.tk.length,d=dSlot();
  const {out}=onsets(buf);
  const res={heard:out.length};
  if(out.length<Math.max(4,K)){res.err=`I only heard ${out.length} hits. Move the phone closer to the pad, play louder, or record in a quieter room.`;return res}
  const cycles=Math.max(1,Math.floor(out.length/K)),M=cycles*K;
  const pts=[];for(let j=0;j<M;j++){const c=Math.floor(j/K),n=P.notes[j%K];pts.push({p:c*slots+n.i,t:out[j].t,a:out[j].a,n})}
  // linear fit t = a0 + b*p
  let sp=0,st=0,spp=0,spt=0;pts.forEach(q=>{sp+=q.p;st+=q.t;spp+=q.p*q.p;spt+=q.p*q.t});
  const nn=pts.length,b=(nn*spt-sp*st)/(nn*spp-sp*sp),a0=(st-b*sp)/nn;
  pts.forEach(q=>{q.dev=q.t-(a0+b*q.p)});
  const rms=Math.sqrt(pts.reduce((s,q)=>s+q.dev*q.dev,0)/nn);
  res.pts=pts;res.bpm=Math.round(60/(b*cur.n));res.rms=rms*1000;res.d=b;
  res.timing=Math.round(clamp(100-(rms/b)*300,0,100));
  res.extra=out.length-M;
  const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
  const norm=pts.filter(q=>!q.n.acc);
  const rA=norm.filter(q=>q.n.hand==='R').map(q=>q.a),lA=norm.filter(q=>q.n.hand==='L').map(q=>q.a);
  if(rA.length>=3&&lA.length>=3)res.balance=(avg(rA)-avg(lA))/Math.max(avg(rA),avg(lA))*100;
  if(P.mixed){const ac=pts.filter(q=>q.n.acc).map(q=>q.a),tp=pts.filter(q=>q.n.tap).map(q=>q.a);if(ac.length&&tp.length)res.contrast=avg(ac)/avg(tp)}
  // double-stroke evenness: second note of same-hand pair vs first
  const tk=P.tk,r2=[];
  for(let j=1;j<pts.length;j++){const prev=pts[j-1],q=pts[j];if(q.n.hand===prev.n.hand&&q.p-prev.p===1&&!q.n.grace&&!q.n.tap)r2.push(q.a/prev.a)}
  if(r2.length>=3)res.second=avg(r2);
  return res;
}
function showResult(r){
  const el=$q('rres');
  if(r.err){el.innerHTML=`<p class="bad">${r.err}</p>`;return}
  const d=r.d;
  const dots=r.pts.slice(0,48).map(q=>{const x=Math.abs(q.dev)/d;const c=x<.08?'g':x<.16?'a':'r';return `<span class="dt ${c}" title="${Math.round(q.dev*1000)} ms">${q.n.hand}</span>`}).join('');
  const lines=[];
  lines.push(`<b>Timing: ${r.timing}/100.</b> Your spacing was off by about ${Math.round(r.rms)} ms on average. Aim for under ${Math.round(d*1000*.08)} ms.`);
  lines.push(`<b>Tempo:</b> you played about ${r.bpm} BPM (target ${bpm}).`+(Math.abs(r.bpm-bpm)>bpm*.25?' That is far from the target, so the note matching may be off. Record again at the target tempo.':''));
  if(r.balance!==undefined){const w=Math.abs(r.balance);lines.push(`<b>Hand balance:</b> `+(w<15?'both hands sound even. Good.':`your ${r.balance>0?'right':'left'} hand is about ${Math.round(w)}% louder than the ${r.balance>0?'left':'right'}.`))}
  if(r.contrast!==undefined)lines.push(`<b>Accents:</b> accents are about ${r.contrast.toFixed(1)}x louder than taps. `+(r.contrast>=2.5?'Clear contrast.':r.contrast>=1.6?'Make the accents higher and the taps lower.':'The accents are not clear yet. Raise accents to 8 in and keep taps near 2 in.'));
  if(r.second!==undefined){const s=Math.round(r.second*100);lines.push(`<b>Doubles:</b> the second note is about ${s}% of the first. `+(s>=80&&s<=120?'Even.':s<80?'The second note is too quiet. Let it rebound more.':'The second note is too loud. Do not push it.'))}
  if(r.extra>0&&r.extra%1===0)lines.push(`<i>I heard ${r.heard} hits. ${r.extra} extra or missing hits at the end were ignored.</i>`);
  el.innerHTML=`<div class="dots2">${dots}</div><p class="sub">Green = on time, amber = slightly off, red = clearly early or late.</p>`+lines.map(l=>`<p>${l}</p>`).join('');
  if(r.timing>=85){RT()[cur.id]=bpm;save();el.innerHTML+=`<p><button class="btn go" id="rnext">Great timing. Try ${bpm+5} BPM</button></p>`;$q('rnext').onclick=()=>{bpm=Math.min(140,bpm+5);RT()[cur.id]=bpm;save();$q('rbpm').textContent=bpm;$q('rslider').value=bpm;el.innerHTML=''}}
  const prev=B()[cur.id]||0;if(r.timing>prev){B()[cur.id]=r.timing;save();renderChips()}
}
async function onFile(e){
  const f=e.target.files&&e.target.files[0];if(!f)return;
  $q('rres').innerHTML='<p class="sub">Listening...</p>';
  try{const buf=await decode(f);showResult(analyze(buf))}
  catch(err){$q('rres').innerHTML='<p class="bad">I could not read that file. Try an audio recording (m4a, mp3, wav) or a short video.</p>'}
  e.target.value='';
}

// ---------- live microphone (works when the page is hosted outside the Claude sandbox) ----------
let heard=false,lastLoud=0,mr=null,chunks=[],mstream=null,mctx=null,recTick=null,meterRaf=0;
function micMsg(t){$q('rmsg').textContent=t}
function endRec(){cancelAnimationFrame(meterRaf);clearInterval(recTick);if(mstream)mstream.getTracks().forEach(t=>t.stop());if(mctx){try{mctx.close()}catch(e){}mctx=null}$q('rlvl').style.width='0';$q('rrec').textContent='Record and score';stop()}
async function rec(){
  if(mr){mr.stop();return}
  if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder)){micMsg('Recording is not available here. Use "Choose recording" below.');return}
  try{mstream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}
  catch(e){micMsg('The microphone is not available here ('+(e.name||'blocked')+'). Use "Choose recording" below.');return}
  const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));
  mr=new MediaRecorder(mstream,mime?{mimeType:mime}:undefined);chunks=[];
  mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  mr.onstop=async()=>{const blob=new Blob(chunks,{type:(chunks[0]&&chunks[0].type)||mime||'audio/webm'});mr=null;endRec();micMsg('');$q('rres').innerHTML='<p class="sub">Listening...</p>';
    try{showResult(analyze(await decode(blob)))}catch(err){$q('rres').innerHTML='<p class="bad">I could not read the recording. Try again, or choose a file instead.</p>'}};
  try{mctx=new (window.AudioContext||window.webkitAudioContext)();const src=mctx.createMediaStreamSource(mstream),an=mctx.createAnalyser();an.fftSize=1024;src.connect(an);const buf=new Float32Array(an.fftSize);
    (function loop(){an.getFloatTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++)s+=buf[i]*buf[i];const lv=Math.sqrt(s/buf.length);$q('rlvl').style.width=Math.min(100,lv*400)+'%';const nw=Date.now();if(lv>.02){heard=true;lastLoud=nw}else if(heard&&nw-lastLoud>3000&&mr&&mr.state==='recording'){mr.stop();return}meterRaf=requestAnimationFrame(loop)})()}catch(e){}
  const t0=Date.now();recTick=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);micMsg('Recording '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'. It stops by itself after 3 seconds of silence.');if(s>=60&&mr)mr.stop()},500);
  heard=false;lastLoud=Date.now();mr.start();$q('rrec').textContent='Stop and score';
  if($q('rclick').checked)start('along');
}
$q('rrec').onclick=rec;
$q('rchips').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const r=RUD.find(x=>x.id===b.dataset.r);if(!r)return;stop();cur=r;bpm=RT()[r.id]||r.bpm;$q('rres').innerHTML='';renderCur()});
$q('rslider').oninput=e=>{bpm=+e.target.value;$q('rbpm').textContent=bpm};
document.querySelectorAll('[data-rd]').forEach(b=>b.onclick=()=>{bpm=clamp(bpm+ +b.dataset.rd,30,140);$q('rbpm').textContent=bpm;$q('rslider').value=bpm});
$q('rhear').onclick=()=>start('hear');
$q('ralong').onclick=()=>start('along');
$q('rfile').addEventListener('change',onFile);
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{if(b.dataset.v!=='rud')stop()}));
bpm=RT()[cur.id]||cur.bpm;
window.RudActive=()=>run||!!mr;
renderCur();
})();
