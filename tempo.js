(function(){
const $q=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SECS=16;
// ---- tempo analysis: onset strength -> autocorrelation over 60-180 BPM
function analyze(x,sr){
  const hop=Math.round(sr*0.01),win=hop*2,n=Math.floor((x.length-win)/hop);
  if(n<200)return null;
  const lo=new Float32Array(n),hi=new Float32Array(n);
  let sm=0;
  for(let f=0;f<n;f++){
    let el=0,eh=0,prev=x[f*hop];
    for(let i=0;i<win;i++){const v=x[f*hop+i];const d=v-prev;prev=v;sm+=(v-sm)*0.05;el+=sm*sm;eh+=d*d}
    lo[f]=Math.log(1+800*el/win);hi[f]=Math.log(1+300*eh/win);
  }
  const on=new Float32Array(n);
  for(let f=1;f<n;f++)on[f]=Math.max(0,lo[f]-lo[f-1])+Math.max(0,hi[f]-hi[f-1]);
  // remove slow trend
  const w=50;let mean=0;const oc=new Float32Array(n);
  for(let f=0;f<n;f++){let s=0,c=0;for(let k=Math.max(0,f-w);k<=Math.min(n-1,f+w);k++){s+=on[k];c++}mean=s/c;oc[f]=Math.max(0,on[f]-mean)}
  const fps=sr/hop;
  const ac=lag=>{const l=Math.floor(lag),fr=lag-l;let s=0,c=0;for(let f=0;f+l+1<n;f++){s+=oc[f]*((1-fr)*oc[f+l]+fr*oc[f+l+1]);c++}return c?s/c:0};
  const res=[];
  for(let b=60;b<=180;b+=.5){
    const lag=60/b*fps;
    // reward the beat period plus its multiples (2x, 4x) and half period (offbeats) lightly
    let s=ac(lag)+.5*ac(lag*2)+.25*ac(lag*4);
    const prior=Math.exp(-Math.pow(Math.log2(b/110),2)/(2*.6*.6));
    res.push([b,s*(.55+.45*prior),s]);
  }
  let best=res[0];for(const r of res)if(r[1]>best[1])best=r;
  const vals=res.map(r=>r[1]),avg=vals.reduce((a,b)=>a+b,0)/vals.length;
  return {bpm:Math.round(best[0]),conf:avg>0?best[1]/avg:0};
}
// ---- state
let S_=null,stream=null,rec=null,chunks=[],timer=null,t0=0,ac=null,an=null,raf=0,buf=null,last=null;
function tempos(){return S.tempos||(S.tempos=[])}
function ui(){
  if($q('lcard'))return;
  const tap=$q('tap');if(!tap)return;const tc=tap.closest('.card');
  const c=document.createElement('div');c.className='card';c.id='lcard';c.style.padding='14px 16px';
  c.innerHTML=`<h3 style="margin:0 0 4px">Listen to a song</h3><div class="sub">Play a song near your phone. I listen for about ${SECS} seconds, work out the tempo and save it so you can practise to it later.</div>
  <div id="lbox"><div class="btns" style="margin-top:10px;justify-content:flex-start"><button class="btn go" id="lgo" style="min-width:150px">Listen</button></div></div>
  <div class="sub" id="lmsg" style="margin-top:8px"></div>`;
  tc.insertAdjacentElement('afterend',c);
  const sv=document.createElement('div');sv.className='card';sv.id='scard';sv.style.padding='14px 16px';
  c.insertAdjacentElement('afterend',sv);
  // save button for the tap result
  const use=$q('tapuse');if(use&&!$q('tapsave')){const b=document.createElement('button');b.className='btn';b.id='tapsave';b.textContent='Save for practice';b.style.cssText='display:none;margin:10px 0 0 8px';use.insertAdjacentElement('afterend',b);
    new MutationObserver(()=>{b.style.display=use.style.display==='none'?'none':'inline-block'}).observe(use,{attributes:true,attributeFilter:['style']})}
  renderSaved();
}
function renderSaved(){
  const sv=$q('scard');if(!sv)return;const t=tempos();
  sv.innerHTML=`<h3 style="margin:0 0 4px">Saved tempos</h3>`+(t.length?t.map((x,i)=>`<div class="trk"><div class="sum"><strong>${esc(x.n)}</strong><span>${x.b} BPM</span></div><button class="vbtn" style="margin:0 6px 0 0" data-tpr="${i}">Practise</button><button class="vbtn" style="margin:0;background:#4B3A8C" data-tdel="${i}">Delete</button></div>`).join(''):`<div class="sub">Nothing saved yet. Use Listen or Tap tempo, then tap Save for practice.</div>`);
}
function save(name,b){const t=tempos();t.unshift({n:name||('Song '+(t.length+1)),b:Math.round(b),d:Date.now()});if(t.length>30)t.length=30;window.save&&window.save();renderSaved()}
function msg(m){const e=$q('lmsg');if(e)e.textContent=m}
function reset(){$q('lbox').innerHTML=`<div class="btns" style="margin-top:10px;justify-content:flex-start"><button class="btn go" id="lgo" style="min-width:150px">Listen</button></div>`}
async function start(){
  msg('');
  try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}catch(e){msg('The microphone is not available here. Open the app from its own web address to use it, or use Tap tempo instead.');return}
  ac=ac||new (window.AudioContext||window.webkitAudioContext)();try{ac.resume()}catch(e){}
  const src=ac.createMediaStreamSource(stream);an=ac.createAnalyser();an.fftSize=1024;src.connect(an);buf=new Float32Array(an.fftSize);
  chunks=[];rec=new MediaRecorder(stream);rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};rec.onstop=done;rec.start();
  t0=Date.now();
  $q('lbox').innerHTML=`<div class="lvl" style="margin-top:12px"><i id="llv" style="background:var(--yellow)"></i></div><div class="sub" id="lt">Listening... 0 / ${SECS} s</div><div class="btns" style="justify-content:flex-start;margin-top:8px"><button class="btn" id="lstop">Stop now</button></div>`;
  tick();timer=setInterval(()=>{if((Date.now()-t0)/1000>=SECS)stop()},250);
}
function tick(){
  if(!an)return;an.getFloatTimeDomainData(buf);let s=0;for(let i=0;i<buf.length;i++)s+=buf[i]*buf[i];const r=Math.sqrt(s/buf.length);
  const l=$q('llv');if(l)l.style.width=Math.min(100,r*500)+'%';const t=$q('lt');if(t)t.textContent='Listening... '+Math.min(SECS,Math.round((Date.now()-t0)/1000))+' / '+SECS+' s';
  raf=requestAnimationFrame(tick)}
function stop(){clearInterval(timer);cancelAnimationFrame(raf);if(rec&&rec.state!=='inactive')rec.stop();if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;an=null}
async function done(){
  const secs=(Date.now()-t0)/1000;
  if(secs<8){reset();msg('That was too short. Listen for at least 8 seconds.');return}
  $q('lbox').innerHTML='<div class="sub" style="margin-top:10px">Working out the tempo...</div>';
  try{
    const ab=await new Blob(chunks,{type:chunks[0]&&chunks[0].type||'audio/webm'}).arrayBuffer();
    const au=await ac.decodeAudioData(ab);
    const r=analyze(au.getChannelData(0),au.sampleRate);
    if(!r||r.conf<1.4){reset();msg('I could not find a steady beat. Move the phone closer to the speaker and try again, or use Tap tempo.');return}
    last=r.bpm;
    $q('lbox').innerHTML=`<div class="bpm" style="font-size:44px;margin-top:10px">${r.bpm} BPM</div><div class="sub">${r.conf>2.2?'Clear beat found.':'Fairly steady. Check it by listening to the metronome at this speed.'}</div>
    <div class="chk" style="margin-top:10px"><input id="lname" placeholder="Song name" maxlength="40" style="flex:1;font:inherit;padding:10px 12px;border-radius:12px;border:2px solid var(--line);background:#1A0A3D;color:#fff"></div>
    <div class="btns" style="margin-top:10px;justify-content:flex-start"><button class="btn go" id="lsave">Save for practice</button><button class="btn" id="luse">Use in metronome</button><button class="btn" id="lagain">Listen again</button></div>
    <div class="btns" style="margin-top:8px;justify-content:flex-start"><button class="btn" id="lhalf">Half</button><button class="btn" id="ldbl">Double</button></div>`;
  }catch(e){reset();msg('I could not read that recording. Please try again.')}
}
document.addEventListener('click',e=>{
  const id=e.target.id;
  if(id==='lgo')start();
  else if(id==='lstop')stop();
  else if(id==='lagain'){reset();start()}
  else if(id==='lsave'){const n=$q('lname').value.trim();save(n,last);reset();msg('Saved '+(n||'tempo')+' at '+last+' BPM.')}
  else if(id==='luse'){setBpm(last);const b=document.querySelector('nav button[data-v="met"]');if(b)b.click();window.scrollTo(0,0)}
  else if(id==='lhalf'||id==='ldbl'){last=Math.max(40,Math.min(240,Math.round(id==='lhalf'?last/2:last*2)));e.target.closest('#lbox').querySelector('.bpm').textContent=last+' BPM'}
  else if(id==='tapsave'){const v=parseInt($q('tapv').textContent);if(v){save('',v);msg('Saved '+v+' BPM.')}}
  const pr=e.target.closest('[data-tpr]'),dl=e.target.closest('[data-tdel]');
  if(pr){const x=tempos()[+pr.dataset.tpr];if(x){setBpm(x.b);const b=document.querySelector('nav button[data-v="met"]');if(b)b.click();window.scrollTo(0,0)}}
  if(dl){tempos().splice(+dl.dataset.tdel,1);window.save&&window.save();renderSaved()}
});
window.Tempo={analyze,init:ui,renderSaved};
ui();
})();
