(function(){
const $q=id=>document.getElementById(id);
const sh=$q('sheet');
let mr=null,chunks=[],mstream=null,mctx=null,raf=0,heard=false,lastLoud=0,cur=null,url=null,tick=null;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const pct=(a,p)=>{const s=[...a].sort((x,y)=>x-y);return s[Math.min(s.length-1,Math.floor(p*s.length))]};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function fit(t,k){const n=t.length;let sk=0,st=0,skk=0,skt=0;for(let i=0;i<n;i++){sk+=k[i];st+=t[i];skk+=k[i]*k[i];skt+=k[i]*t[i]}
  const b=(n*skt-sk*st)/(n*skk-sk*sk),a=(st-b*sk)/n;let r=0;const dev=[];for(let i=0;i<n;i++){const e=t[i]-(a+b*k[i]);dev.push(e);r+=e*e}return {a,b,rms:Math.sqrt(r/n),dev}}
function analyze(buf){
  const out=RecUtil.onsets(buf).out;
  if(out.length<6)return {err:'I only heard '+out.length+' hits. Move closer to the pad, play louder, or record in a quieter room.'};
  const ts=out.map(o=>o.t),am=out.map(o=>o.a),iv=[];
  for(let i=1;i<ts.length;i++)iv.push(ts[i]-ts[i-1]);
  const dm=pct(iv,.3),k=[0];
  for(let i=1;i<ts.length;i++)k.push(k[i-1]+Math.max(1,Math.round(iv[i-1]/dm)));
  const f=fit(ts,k),h=Math.floor(ts.length/2);
  const f1=fit(ts.slice(0,h),k.slice(0,h)),f2=fit(ts.slice(h),k.slice(h));
  const drift=(f1.b-f2.b)/f1.b*100;
  const mean=am.reduce((s,v)=>s+v,0)/am.length,cv=Math.sqrt(am.reduce((s,v)=>s+(v-mean)*(v-mean),0)/am.length)/mean;
  return {hits:out.length,b:f.b,rms:f.rms*1000,score:Math.round(clamp(100-(f.rms/f.b)*300,0,100)),drift,cv,dev:f.dev};
}
function show(r){
  const el=$q('sh-res');
  if(r.err){el.innerHTML='<p class="bad">'+r.err+'</p>';return}
  const n=cur.n,bpm=Math.round(60/(r.b*n));
  const dots=r.dev.slice(0,48).map(e=>{const x=Math.abs(e)/r.b;return `<span class="dt ${x<.08?'g':x<.16?'a':'r'}" title="${Math.round(e*1000)} ms"></span>`}).join('');
  const L=[];
  L.push(`<b>Timing: ${r.score}/100.</b> Your note spacing was off by about ${Math.round(r.rms)} ms on average. Under ${Math.round(r.b*80)} ms is a good aim.`);
  L.push(`<b>Tempo:</b> about ${bpm} BPM, counting ${n} note${n===1?'':'s'} per beat (target ${cur.bpm}).`+(Math.abs(bpm-cur.bpm)>cur.bpm*.25?' That is far from the target. Check the notes-per-beat setting above.':''));
  L.push('<b>Steadiness:</b> '+(Math.abs(r.drift)<3?'the tempo held steady from start to finish.':`you ${r.drift>0?'sped up':'slowed down'} by about ${Math.abs(r.drift).toFixed(0)}% by the end.`));
  L.push('<b>Volume:</b> '+(r.cv<.35?'even. (Ignore this if your pattern has accents.)':'uneven. Try to hit from the same stick height each time, unless the pattern has accents.'));
  el.innerHTML=`<div class="dots2">${dots}</div><p class="sub">Each dot is a hit: green is on time, amber slightly off, red clearly early or late.</p>`+L.map(l=>`<p>${l}</p>`).join('');
}
function msg(t){const e=$q('sh-msg');if(e)e.textContent=t}
function cleanup(){cancelAnimationFrame(raf);clearInterval(tick);if(mstream)mstream.getTracks().forEach(t=>t.stop());mstream=null;if(mctx){try{mctx.close()}catch(e){}mctx=null}const l=$q('sh-lvl');if(l)l.style.width='0'}
async function decodeBlob(blob){return RecUtil.decode(blob)}
async function finish(blob,fromFile){
  if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);
  const au=$q('sh-au');if(au){au.src=url;au.style.display='block'}
  $q('sh-res').innerHTML='<p class="sub">Listening...</p>';
  try{show(analyze(await decodeBlob(blob)));S.takeCount=(S.takeCount||0)+1;save();if(window.Game)Game.update()}
  catch(e){$q('sh-res').innerHTML='<p class="bad">I could not read that recording. Try again.</p>'}
}
async function record(){
  if(mr){mr.stop();return}
  if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.MediaRecorder)){fallback('Recording is not available in this browser.');return}
  try{mstream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}
  catch(e){fallback('The microphone is not available here ('+(e.name||'blocked')+'). Open the app from its own web address to use it, or choose a recording instead.');return}
  const mime=['audio/webm;codecs=opus','audio/mp4','audio/webm'].find(m=>MediaRecorder.isTypeSupported(m));
  mr=new MediaRecorder(mstream,mime?{mimeType:mime}:undefined);chunks=[];
  mr.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  mr.onstop=()=>{const blob=new Blob(chunks,{type:(chunks[0]&&chunks[0].type)||mime||'audio/webm'});mr=null;cleanup();const b=$q('sh-rec');if(b)b.textContent='Record again';msg('');finish(blob)};
  try{mctx=new (window.AudioContext||window.webkitAudioContext)();const src=mctx.createMediaStreamSource(mstream),an=mctx.createAnalyser();an.fftSize=1024;src.connect(an);const buf=new Float32Array(an.fftSize);
    (function loop(){an.getFloatTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++)s+=buf[i]*buf[i];const lv=Math.sqrt(s/buf.length),l=$q('sh-lvl');if(l)l.style.width=Math.min(100,lv*400)+'%';const nw=Date.now();
      if(lv>.02){heard=true;lastLoud=nw}else if(heard&&nw-lastLoud>3000&&mr&&mr.state==='recording'){mr.stop();return}raf=requestAnimationFrame(loop)})()}catch(e){}
  const t0=Date.now();heard=false;lastLoud=t0;
  tick=setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000);msg('Recording '+Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'. It stops by itself after 3 seconds of silence.');if(s>=90&&mr)mr.stop()},500);
  mr.start();$q('sh-rec').textContent='Stop and score';
}
function fallback(t){msg(t);const f=$q('sh-fall');if(f)f.style.display='block'}
function close(){if(mr){try{mr.stop()}catch(e){}}cleanup();mr=null;if(url){URL.revokeObjectURL(url);url=null}sh.style.display='none';sh.innerHTML=''}
function open(key,title,bpm,n){
  close();cur={key,bpm:bpm||80,n:n||2};
  sh.style.display='block';
  sh.innerHTML=`<div class="shin"><div class="shh"><div><div class="sub">Record a take</div><strong>${esc(title)}</strong></div><button class="btn" id="sh-x">Close</button></div>
  <p class="sub" style="margin:6px 0">Play for 20 to 30 seconds without a click, close to your phone. Use headphones if you want to hear a click or track while you play.</p>
  <div class="shr"><label class="sub">Notes per beat <select id="sh-n"><option value="1">1 (quarters)</option><option value="2">2 (eighths)</option><option value="3">3 (triplets)</option><option value="4">4 (sixteenths)</option></select></label>
  <label class="sub">Target BPM <input type="number" id="sh-b" min="30" max="200" style="width:64px"></label></div>
  <button class="btn go" id="sh-rec" style="width:100%;margin-top:8px">Record</button>
  <div class="lvl"><i id="sh-lvl"></i></div><div class="sub" id="sh-msg"></div>
  <audio id="sh-au" controls style="display:none;width:100%;margin:8px 0"></audio>
  <div id="sh-res"></div>
  <div id="sh-fall" style="display:none"><label class="btn go filebtn">Choose a recording<input type="file" id="sh-file" accept="audio/*,video/*" hidden></label></div></div>`;
  $q('sh-n').value=String(cur.n);$q('sh-b').value=cur.bpm;
  $q('sh-n').onchange=e=>{cur.n=+e.target.value};
  $q('sh-b').onchange=e=>{cur.bpm=clamp(+e.target.value||80,30,200)};
  $q('sh-rec').onclick=record;$q('sh-x').onclick=close;
  $q('sh-file').addEventListener('change',e=>{const f=e.target.files&&e.target.files[0];if(f)finish(f,true);e.target.value=''});
}
window.Rec={open,close};
})();
