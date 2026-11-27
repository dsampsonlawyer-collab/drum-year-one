(function(){
const NAMES=['First Light','Easy Street','Heartbeat','Steady Eddie','Backbone','Rolling Home','Open Road','Green Light','Crash Landing','Fill It Up','Chorus Line','Stage Door','Mile Marker',
'Off the Grid','Side Street','Late Bus','Low Rider','Upbeat Alley','Sixteen Candles','Double Time','Quick Silver','Big Sky','Switchback','Corner Store','Long Way Home','Tuesday Night',
'Ghost Town','Funky Monday','Ride Out','Chrome Dust','Shuffle Town','Blue Hour','Slow Burn','Half Moon','Hot Pavement','Midnight Train','Thin Ice','Four Corners','Rooftop','Moon Dance',
'Whisper Down','Rain Check','Waltz Time','Golden Hour','Loose Change','Bright Lights','Tight Rope','Soundcheck','Full House','Swing Door','Last Call','Showtime'];
const STY=[];
const put=(from,to,s)=>{for(let w=from;w<=to;w++)STY[w]=s};
put(1,13,'rock');put(14,17,'sync');put(18,21,'rock');
['sync','rock','sync','rock','rock'].forEach((s,i)=>STY[22+i]=s);
['rock','funk','rock','funk'].forEach((s,i)=>STY[27+i]=s);
['shuffle','shuffle','funk','half'].forEach((s,i)=>STY[31+i]=s);
['funk','rock','half','sync'].forEach((s,i)=>STY[35+i]=s);STY[39]='shuffle';
['rock','shuffle','six8','waltz'].forEach((s,i)=>STY[40+i]=s);
['funk','half','rock','sync'].forEach((s,i)=>STY[44+i]=s);
['rock','half','shuffle','funk'].forEach((s,i)=>STY[48+i]=s);STY[52]='rock';
// steps per bar, beats per bar; bass: 0 rest,1 root,2 fifth,3 octave; chord: 1 stab
const ST={
 rock:{label:'Rock',steps:8,beats:4,bass:[1,1,1,1,1,1,2,1],chord:[1,0,0,0,1,0,0,0]},
 sync:{label:'Syncopated rock',steps:16,beats:4,bass:[1,0,0,1,1,0,0,0,1,0,1,0,0,0,2,0],chord:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0]},
 funk:{label:'Funk',steps:16,beats:4,bass:[1,0,0,1,0,0,1,0,0,1,0,1,0,0,2,0],chord:[0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0]},
 shuffle:{label:'Shuffle',steps:12,beats:4,bass:[1,0,1,1,0,1,2,0,2,1,0,1],chord:[1,0,0,0,0,0,1,0,0,0,0,0]},
 half:{label:'Half-time',steps:8,beats:4,bass:[1,0,0,1,0,0,2,0],chord:[1,0,0,0,0,0,0,0]},
 six8:{label:'6/8 ballad',steps:6,beats:2,bass:[1,0,0,2,0,0],chord:[1,0,1,0,1,0]},
 waltz:{label:'3/4 waltz',steps:6,beats:3,bass:[1,0,0,0,0,0],chord:[0,0,1,0,1,0]}
};
const P=[[[0,0],[7,0],[9,1],[5,0]],[[0,0],[5,0],[7,0],[5,0]],[[9,1],[5,0],[0,0],[7,0]],[[0,0],[9,1],[5,0],[7,0]]];
const BLUES=[[0,0],[0,0],[0,0],[0,0],[5,0],[5,0],[0,0],[0,0],[7,0],[5,0],[0,0],[7,0]];
const BRIDGE=[[9,1],[5,0],[9,1],[7,0]];
const KEYS=[4,9,2,7,0,5];
const KN=['C','C#','D','Eb','E','F','F#','G','Ab','A','Bb','B'];
function cfg(w){
  const s=STY[w],d=ST[s];
  let bpm=Math.round(60+(w-1)*.7);
  if(s==='sync')bpm-=5;if(s==='shuffle')bpm-=10;if(s==='half')bpm-=12;if(s==='funk')bpm-=2;
  if(s==='six8')bpm=54;if(s==='waltz')bpm=Math.min(bpm,92);
  bpm=Math.max(50,Math.min(100,bpm));
  const key=KEYS[(w-1)%6];
  const vp=P[w%4],cp=P[(w+1)%4];
  let secs;
  if(w<=4)secs=[['Groove',8]];
  else if(w<=13)secs=[['Verse',8],['Chorus',8],['Verse',8],['Chorus',8]];
  else if(w<=26)secs=[['Intro',4],['Verse',8],['Chorus',8],['Verse',8],['Chorus',8],['Outro',4]];
  else secs=[['Intro',4],['Verse',8],['Chorus',8],['Verse',8],['Chorus',8],['Bridge',4],['Chorus',8],['Outro',4]];
  if(s==='shuffle')secs=secs.map(x=>x[0]==='Verse'?['Verse',12]:x);
  const bars=[];
  secs.forEach(([name,n],si)=>{for(let i=0;i<n;i++){
    let ch;
    if(name==='Verse'||name==='Groove'||name==='Intro')ch=(s==='shuffle'&&name==='Verse')?BLUES[i]:vp[i%4];
    else if(name==='Chorus')ch=cp[i%4];
    else if(name==='Bridge')ch=BRIDGE[i%4];
    else ch=i===n-1?[0,0]:vp[i%4];
    bars.push({sec:name,i,n,si,ch,fill:i===n-1&&si<secs.length-1})}});
  const L=window.LESSONS&&LESSONS[w+'B'];
  return {w,name:NAMES[w-1],style:s,label:d.label,bpm,key,keyName:KN[key],bars,secs,
    mission:L?L.g:'Play along and keep a steady beat.'};
}
let ac=null,run=false,timer=null,tc=null,k=0,nextT=0,tempo=0,loop=true,clk=false,uiT=[];
const $q=id=>document.getElementById(id);
const mf=m=>440*Math.pow(2,(m-69)/12);
function bass(t,f,dur){const o=ac.createOscillator(),g=ac.createGain(),lp=ac.createBiquadFilter();o.type='sawtooth';o.frequency.value=f;lp.type='lowpass';lp.frequency.value=520;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.32,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(lp);lp.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+dur+.02)}
function chord(t,fs,dur){const g=ac.createGain(),lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1800;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(.09,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+dur);lp.connect(g);g.connect(ac.destination);fs.forEach(f=>{const o=ac.createOscillator();o.type='triangle';o.frequency.value=f;o.connect(lp);o.start(t);o.stop(t+dur+.02)})}
function tick(t,acc){const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=acc?2600:2000;g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.001,t+.04);o.connect(g);g.connect(ac.destination);o.start(t);o.stop(t+.05)}
function schedBar(bar,t){
  const d=ST[tc.style],barDur=d.beats*60/tempo,sd=barDur/d.steps;
  const rootPc=(tc.key+bar.ch[0])%12,root=36+rootPc,minor=bar.ch[1];
  const notes=[root+12,root+12+(minor?3:4),root+12+7];
  for(let i=0;i<d.steps;i++){
    const t0=t+i*sd,b=d.bass[i];
    if(b)bass(t0,mf(b===2?root+7:b===3?root+12:root),sd*1.6);
    if(d.chord[i])chord(t0,notes.map(mf),Math.min(sd*3,barDur*.9));
  }
  if(clk)for(let b=0;b<d.beats;b++)tick(t+b*barDur/d.beats,b===0);
}
function ui(k2,t){uiT.push(setTimeout(()=>{const b=tc.bars[k2];const el=$q('pl-sec');if(!el)return;el.textContent=b.sec;$q('pl-bar').textContent='Bar '+(b.i+1)+' of '+b.n;$q('pl-fill').style.visibility=b.fill?'visible':'hidden';$q('pl-prog').style.width=((k2+1)/tc.bars.length*100)+'%'},Math.max(0,(t-ac.currentTime)*1000)))}
function sched(){
  const d=ST[tc.style],barDur=d.beats*60/tempo;
  while(run&&nextT<ac.currentTime+.3){
    if(k>=tc.bars.length){if(loop){k=0}else{run=false;setTimeout(stop,Math.max(0,(nextT-ac.currentTime)*1000));return}}
    schedBar(tc.bars[k],nextT);ui(k,nextT);nextT+=barDur;k++;
  }
  timer=setTimeout(sched,50);
}
function stop(){run=false;clearTimeout(timer);uiT.forEach(clearTimeout);uiT=[];const b=$q('pl-go');if(b)b.textContent='Start';const s=$q('pl-sec');if(s){s.textContent='Ready';$q('pl-bar').textContent='';$q('pl-prog').style.width='0';$q('pl-fill').style.visibility='hidden'}}
function start(){
  if(run){stop();return}
  try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();ac.resume()}catch(e){return}
  const d=ST[tc.style];run=true;k=0;
  const t0=ac.currentTime+.15,beat=d.beats*60/tempo/d.beats;
  for(let i=0;i<d.beats;i++)tick(t0+i*beat,i===0);
  nextT=t0+d.beats*beat;$q('pl-go').textContent='Stop';
  $q('pl-sec').textContent='Count-in';$q('pl-bar').textContent='';
  sched();
}
function open(w){
  stop();tc=cfg(w);tempo=tc.bpm;
  const secs=tc.secs.map(s=>s[0]+' '+s[1]).join(' · ');
  $q('player').innerHTML=`<div class="card plr"><div class="sub">Week ${w} track · ${tc.label} · key of ${tc.keyName}</div><h3>${tc.name}</h3>
  <div class="plstat"><div><b id="pl-sec">Ready</b><span id="pl-bar"></span></div><span class="fillchip" id="pl-fill">Fill this bar</span></div>
  <div class="bar"><i id="pl-prog"></i></div>
  <div class="rb" style="margin-top:12px"><button class="btn" id="pl-m">-5</button><div class="rbpm"><b id="pl-bpm">${tempo}</b> BPM</div><button class="btn" id="pl-p">+5</button></div>
  <div class="btns" style="margin:10px 0"><button class="btn go" id="pl-go" style="min-width:130px">Start</button><button class="btn" id="pl-x">Close</button></div>
  <label class="sub chk"><input type="checkbox" id="pl-loop" checked> Loop the track</label>
  <label class="sub chk"><input type="checkbox" id="pl-clk"> Add a click guide</label>
  <p class="sub" style="margin-top:8px"><b>Structure:</b> ${secs} bars.</p>
  <p class="sub"><b>Your mission:</b> ${tc.mission} Play drums only: the track has bass and chords. Add a fill in the last bar of each section and land on the next one with a crash.</p></div>`;
  $q('pl-go').onclick=start;
  $q('pl-x').onclick=()=>{stop();$q('player').innerHTML=''};
  $q('pl-m').onclick=()=>{tempo=Math.max(40,tempo-5);$q('pl-bpm').textContent=tempo};
  $q('pl-p').onclick=()=>{tempo=Math.min(160,tempo+5);$q('pl-bpm').textContent=tempo};
  $q('pl-loop').onchange=e=>loop=e.target.checked;
  $q('pl-clk').onchange=e=>clk=e.target.checked;
  loop=true;clk=false;
  $q('player').scrollIntoView&&$q('player').scrollIntoView({block:'start'});
}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>{if(run&&b.dataset.v!=='vault')stop()}));
window.Player={open,cfg,stop,count:52,active:()=>run};
})();
