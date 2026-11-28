(function(){
const $q=id=>document.getElementById(id);
const LANES=['HH','SN','T1','FT','RD','CR'];
const COL={HH:'#f2c94c',SN:'#e5484d',T1:'#3e8ef7',FT:'#3cc47c',RD:'#a16bf0',CR:'#f08a3c',KK:'#ff8a00'};
const NAME={HH:'Hi-hat',SN:'Snare',T1:'Tom',FT:'Floor',RD:'Ride',CR:'Crash',KK:'Kick'};
// ---- groove library: steps per bar, beats per bar, band style, lane patterns (x hit, g ghost)
const G={
 q4:{st:'rock',steps:4,beats:4,HH:'xxxx',SN:'.x.x',KK:'x.x.'},
 r8:{st:'rock',steps:8,beats:4,HH:'xxxxxxxx',SN:'..x...x.',KK:'x...x...'},
 r8b:{st:'rock',steps:8,beats:4,HH:'xxxxxxxx',SN:'..x...x.',KK:'x...xx..'},
 r8c:{st:'rock',steps:8,beats:4,HH:'xxxxxxxx',SN:'..x...x.',KK:'x..xx...'},
 r8d:{st:'rock',steps:8,beats:4,HH:'xxxxxxxx',SN:'..x...x.',KK:'x..x.x..'},
 rd8:{st:'rock',steps:8,beats:4,RD:'xxxxxxxx',SN:'..x...x.',KK:'x...x...'},
 rd8s:{st:'rock',steps:8,beats:4,RD:'xxxxxxxx',SN:'..x..xx.',KK:'x...x...'},
 rd8t:{st:'rock',steps:8,beats:4,RD:'xxxxxxxx',SN:'..x...xx',KK:'x...x.x.'},
 r16:{st:'sync',steps:16,beats:4,HH:'xxxxxxxxxxxxxxxx',SN:'....x.......x...',KK:'x.......x.......'},
 r16g:{st:'sync',steps:16,beats:4,HH:'xxxxxxxxxxxxxxxx',SN:'...gx.......x...',KK:'x.......x.......'},
 f16:{st:'funk',steps:16,beats:4,HH:'xxxxxxxxxxxxxxxx',SN:'...gx..g...gx...',KK:'x.....x...x.....'},
 sh12:{st:'shuffle',steps:12,beats:4,HH:'x.xx.xx.xx.x',SN:'...x.....x..',KK:'x.....x.....'},
 h8:{st:'half',steps:8,beats:4,HH:'xxxxxxxx',SN:'....x...',KK:'x..x....'},
 s68:{st:'six8',steps:6,beats:2,HH:'xxxxxx',SN:'...x..',KK:'x.....'},
 w34:{st:'waltz',steps:6,beats:3,HH:'xxxxxx',SN:'..x.x.',KK:'x.....'}
};
const FH=n=>({2:['SN','FT'],3:['SN','T1','FT'],4:['SN','SN','T1','FT'],6:['SN','SN','T1','T1','FT','FT'],8:['SN','SN','T1','T1','FT','FT','FT','FT']}[n]);
const P=[[[0,0],[7,0],[9,1],[5,0]],[[0,0],[5,0],[7,0],[5,0]],[[9,1],[5,0],[0,0],[7,0]],[[0,0],[9,1],[5,0],[7,0]]];
const BR=[[9,1],[5,0],[9,1],[7,0]];
const SONGS={
 m1:{title:'Steady Rain',bpm:60,key:9,vp:0,cp:1,secs:[['Verse',8,'q4',''],['Chorus',8,'q4','']]},
 m2:{title:'Eight to the Bar',bpm:80,key:4,vp:1,cp:2,secs:[['Verse',8,'r8',''],['Chorus',8,'r8b',''],['Verse',8,'r8',''],['Chorus',8,'r8b','']]},
 m3:{title:'Crash Course',bpm:88,key:2,vp:2,cp:3,secs:[['Intro',2,'r8',''],['Verse',8,'r8','h'],['Chorus',8,'r8b','h'],['Verse',8,'r8','h'],['Chorus',8,'r8b','h']]},
 q1:{title:'Open Road Anthem',bpm:96,key:7,vp:3,cp:0,secs:[['Intro',4,'r8',''],['Verse',8,'r8','h'],['Chorus',8,'rd8','h'],['Verse',8,'r8','h'],['Chorus',8,'rd8','h'],['Bridge',4,'r8c',''],['Chorus',8,'rd8','h']]},
 m4:{title:'Kick Starter',bpm:88,key:0,vp:0,cp:2,secs:[['Verse',8,'r8c',''],['Chorus',8,'r8d','h'],['Verse',8,'r8b',''],['Chorus',8,'r8d','h'],['Bridge',4,'r8c','h'],['Chorus',8,'r8d','h']]},
 m5:{title:'Sixteen Miles',bpm:76,key:5,vp:1,cp:3,secs:[['Verse',8,'r16','h'],['Chorus',8,'r16','h'],['Verse',8,'r16','h'],['Chorus',8,'r16','h']]},
 m6:{title:'Full Circle',bpm:96,key:4,vp:2,cp:0,secs:[['Intro',4,'r8',''],['Verse',8,'r8c','h'],['Chorus',8,'rd8','h'],['Verse',8,'r8c','h'],['Chorus',8,'rd8','h'],['Bridge',4,'r8','h'],['Chorus',8,'rd8','h'],['Outro',4,'r8','']]},
 q2:{title:'Stamina',bpm:104,key:9,vp:3,cp:1,secs:[['Intro',4,'r8',''],['Verse',8,'r16','h'],['Chorus',8,'rd8','h'],['Verse',8,'r16','h'],['Chorus',8,'rd8','h'],['Bridge',8,'r16g','h'],['Chorus',8,'rd8','h'],['Chorus',8,'rd8','h'],['Outro',4,'r8','']]},
 m7:{title:'Ghost Town',bpm:80,key:2,vp:0,cp:2,secs:[['Verse',8,'r16g','h'],['Chorus',8,'rd8','h'],['Verse',8,'r16g','h'],['Chorus',8,'rd8','h']]},
 m8:{title:'Three Feels',bpm:84,key:7,vp:1,cp:3,secs:[['Verse',8,'sh12','h'],['Chorus',8,'f16','h'],['Bridge',8,'h8','h'],['Chorus',8,'f16','h']]},
 m9:{title:'Four Limbs',bpm:84,key:0,vp:2,cp:0,secs:[['Verse',8,'rd8s','h'],['Chorus',8,'rd8t','h'],['Verse',8,'rd8s','h'],['Chorus',8,'rd8t','h']]},
 q3:{title:'Showcase',bpm:92,key:5,vp:3,cp:1,secs:[['Intro',4,'r16g',''],['Verse',8,'sh12','h'],['Chorus',8,'f16','h'],['Bridge',8,'h8','h'],['Verse',8,'r16g','h'],['Chorus',8,'rd8','h']]},
 m10:{title:'Slow Tide',bpm:54,key:9,vp:0,cp:3,secs:[['Verse',8,'s68',''],['Chorus',8,'s68','h'],['Verse',8,'s68',''],['Chorus',8,'s68','h']]},
 m11:{title:'Paper Boats',bpm:84,key:4,vp:1,cp:2,secs:[['Verse',8,'w34',''],['Chorus',8,'w34','h'],['Verse',8,'w34',''],['Chorus',8,'w34','h']]},
 m12:{title:'Last Call',bpm:100,key:2,vp:2,cp:0,secs:[['Intro',4,'r8',''],['Verse',8,'r16g','h'],['Chorus',8,'rd8','h'],['Verse',8,'r16g','h'],['Chorus',8,'rd8','h'],['Bridge',4,'h8','h'],['Chorus',8,'rd8','h']]},
 q4:{title:'Finale',bpm:96,key:7,vp:3,cp:1,secs:[['Intro',4,'r8',''],['Verse',8,'r16g','h'],['Chorus',8,'rd8','h'],['Bridge',8,'sh12','h'],['Verse',8,'f16','h'],['Chorus',8,'rd8','h'],['Outro',4,'r8','']]}
};
// ---- chart builder (times in beats)
function build(def){
  const notes=[],bars=[];let b0=0,fillBars=0;
  def.secs.forEach(([name,n,g,fill],si)=>{
    const gr=G[g];
    for(let i=0;i<n;i++){
      const step=gr.beats/gr.steps,last=i===n-1,first=i===0&&si>0;
      let ch;
      if(name==='Verse'||name==='Intro')ch=P[def.vp][i%4];else if(name==='Chorus')ch=P[def.cp][i%4];else if(name==='Bridge')ch=BR[i%4];else ch=i===n-1?[0,0]:P[def.vp][i%4];
      const cut=(last&&fill==='h'&&si<def.secs.length-1)?gr.steps/2:gr.steps;
      ['HH','SN','RD','KK'].forEach(l=>{const pat=gr[l];if(!pat)return;for(let s=0;s<cut;s++){const c=pat[s];if(c==='x'||c==='g')notes.push({b:b0+s*step,lane:l,g:c==='g'})}});
      if(cut<gr.steps){const f=FH(gr.steps/2);f.forEach((l,j)=>notes.push({b:b0+(cut+j)*step,lane:l,g:false}));fillBars++}
      if(first){notes.push({b:b0,lane:'CR',g:false});if(!gr.KK||gr.KK[0]!=='x')notes.push({b:b0,lane:'KK',g:false})}
      bars.push({b:b0,beats:gr.beats,st:gr.st,ch,sec:name,i,n,fill:cut<gr.steps});
      b0+=gr.beats;
    }
  });
  // final hit
  notes.push({b:b0,lane:'CR',g:false});notes.push({b:b0,lane:'KK',g:false});
  bars.push({b:b0,beats:def.secs.length?G[def.secs[def.secs.length-1][2]].beats:4,st:'rock',ch:[0,0],sec:'End',i:0,n:1,end:true});
  notes.forEach(n=>{n.done=0});
  return {notes:notes.sort((a,b)=>a.b-b.b),bars,beats:b0+bars[bars.length-1].beats};
}
// ---- state
let ctx=null,cv=null,g2=null,W=0,H=0,dpr=1,raf=0,song=null,def=null,key='',mode='pads',speed=1,offset=0,sens=.04,
  t0=0,beatDur=.6,playing=false,bot=false,stat=null,flash=[],laneFlash={},jText='',jT=0,micStream=null,an=null,tbuf=null,fbuf=null,prevR=[],lastMic=-1,micOk=false,nbuf=null,endT=0;
const WIN_P=.07,WIN_G=.13,WIN_M=.15;
function curT(){return ctx.currentTime-t0-offset/1000}
function noise(){if(!nbuf){nbuf=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}return nbuf}
function nz(t,type,f,gain,dur){const s=ctx.createBufferSource();s.buffer=noise();const fl=ctx.createBiquadFilter();fl.type=type;fl.frequency.value=f;const g=ctx.createGain();g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(g);g.connect(ctx.destination);s.start(t);s.stop(t+dur+.02)}
function tn(t,f0,f1,gain,dur){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+dur+.02)}
function snd(l,t){t=t||ctx.currentTime;
  if(l==='KK')tn(t,150,45,.9,.14);
  else if(l==='SN'){nz(t,'bandpass',1800,.5,.14);tn(t,200,150,.3,.08)}
  else if(l==='HH')nz(t,'highpass',7000,.25,.05);
  else if(l==='T1')tn(t,200,120,.6,.22);
  else if(l==='FT')tn(t,130,75,.7,.3);
  else if(l==='RD')nz(t,'bandpass',6500,.16,.5);
  else if(l==='CR')nz(t,'highpass',4200,.32,.9)}
// ---- layout
function size(){const r=cv.getBoundingClientRect();dpr=window.devicePixelRatio||1;W=r.width;H=r.height;cv.width=W*dpr;cv.height=H*dpr;g2.setTransform(dpr,0,0,dpr,0,0)}
function draw(now){
  const hitY=H-40,look=2.1,pps=(hitY-10)/look,lw=W/6;
  g2.clearRect(0,0,W,H);
  g2.fillStyle='rgba(11,4,32,.55)';g2.fillRect(0,0,W,H);
  LANES.forEach((l,i)=>{g2.fillStyle=i%2?'rgba(255,255,255,.035)':'rgba(255,255,255,.015)';g2.fillRect(i*lw,0,lw,H);
    if(laneFlash[l]>performance.now()){g2.fillStyle=COL[l]+'55';g2.fillRect(i*lw,0,lw,H)}});
  // beat lines
  const bd=beatDur;let b=Math.floor((now-.2)/bd);
  for(let k=Math.max(0,b);k*bd<now+look;k++){const y=hitY-(k*bd-now)*pps;if(y<0||y>H)continue;const isBar=song.bars.some(x=>Math.abs(x.b-k)<1e-6);g2.fillStyle=isBar?'rgba(255,255,255,.28)':'rgba(255,255,255,.08)';g2.fillRect(0,y,W,isBar?2:1)}
  // notes
  song.notes.forEach(n=>{
    const y=hitY-(n.t-now)*pps;if(y<-20||y>H+20||n.done===1&&!n.g)return;
    if(n.g){g2.fillStyle='rgba(229,72,77,.45)';const i=LANES.indexOf(n.lane);g2.beginPath();g2.arc(i*lw+lw/2,y,6,0,6.3);g2.fill();return}
    const c=n.done===2?'#555':COL[n.lane];g2.fillStyle=c;
    if(n.lane==='KK'){g2.globalAlpha=n.done===2?.5:.9;g2.fillRect(6,y-6,W-12,12);g2.globalAlpha=1}
    else{const i=LANES.indexOf(n.lane),x=i*lw+5,w=lw-10;g2.beginPath();g2.roundRect?g2.roundRect(x,y-11,w,22,8):g2.rect(x,y-11,w,22);g2.fill();g2.fillStyle='rgba(255,255,255,.35)';g2.fillRect(x+6,y-8,w-12,4)}
  });
  // hit line + targets
  g2.fillStyle='rgba(255,255,255,.7)';g2.fillRect(0,hitY,W,2);
  LANES.forEach((l,i)=>{g2.strokeStyle=COL[l];g2.lineWidth=3;g2.beginPath();g2.arc(i*lw+lw/2,hitY+1,lw/2-9,0,6.3);g2.stroke();g2.fillStyle=COL[l]+'33';g2.fill()});
  // flashes
  flash=flash.filter(f=>f.t>performance.now());
  flash.forEach(f=>{const a=(f.t-performance.now())/260;g2.fillStyle=f.c;g2.globalAlpha=Math.max(0,a);const i=LANES.indexOf(f.l);if(f.l==='KK')g2.fillRect(0,hitY-4,W,10);else g2.fillRect(i*lw,hitY-30,lw,60);g2.globalAlpha=1});
  if(jT>performance.now()){g2.fillStyle='#fff';g2.font='700 22px system-ui';g2.textAlign='center';g2.globalAlpha=Math.min(1,(jT-performance.now())/300);g2.fillText(jText,W/2,hitY-90);g2.globalAlpha=1}
}
// ---- judging
function mult(){return Math.min(4,1+Math.floor(stat.combo/10))}
function judge(n,dt,lane){
  const a=Math.abs(dt);
  if(a<=WIN_P){n.done=1;stat.perfect++;stat.score+=100*mult();jText='Perfect';}
  else{n.done=1;stat.good++;stat.score+=60*mult();jText='Good'}
  stat.combo++;if(stat.combo>stat.max)stat.max=stat.combo;stat.sum+=dt;stat.n++;jT=performance.now()+700;
  flash.push({l:n.lane,c:COL[n.lane],t:performance.now()+260});
  updateHud();
}
function hit(lane,type){ // lane for pads; type 'KK'|'HAND' for mic
  if(!playing||bot)return;
  const now=curT();
  if(lane){laneFlash[lane]=performance.now()+120;snd(lane)}
  let best=null,bd=9;
  song.notes.forEach(n=>{if(n.done||n.g)return;const d=Math.abs(n.t-now);if(d>WIN_G)return;
    const ok=lane?n.lane===lane:(type==='KK'?n.lane==='KK':n.lane!=='KK');if(!ok)return;if(d<bd){bd=d;best=n}});
  if(best)judge(best,now-best.t,lane);
}
function updateHud(){$q('hscore').textContent=stat.score.toLocaleString();$q('hcombo').textContent=stat.combo>1?stat.combo+' combo  x'+mult():''}
// ---- mic
async function micStart(){
  try{micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}catch(e){return false}
  const src=ctx.createMediaStreamSource(micStream);an=ctx.createAnalyser();an.fftSize=1024;src.connect(an);tbuf=new Float32Array(an.fftSize);fbuf=new Float32Array(an.frequencyBinCount);prevR=[];lastMic=-1;return true}
function micStop(){if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}an=null}
function micPoll(now){
  if(!an)return;an.getFloatTimeDomainData(tbuf);
  let s=0;for(let i=tbuf.length-256;i<tbuf.length;i++)s+=tbuf[i]*tbuf[i];const r=Math.sqrt(s/256);
  const avg=prevR.length?prevR.reduce((a,b)=>a+b,0)/prevR.length:0;prevR.push(r);if(prevR.length>12)prevR.shift();
  if(r>Math.max(sens,avg*2.5)&&now-lastMic>.07){lastMic=now;an.getFloatFrequencyData(fbuf);
    let lo=0,hi=0;for(let i=1;i<4;i++)lo+=Math.pow(10,fbuf[i]/10);for(let i=6;i<120;i++)hi+=Math.pow(10,fbuf[i]/10);
    hit(null,lo/(hi+1e-12)>1.5?'KK':'HAND');
    const lf=lo/(hi+1e-12)>1.5?'KK':null;if(lf)laneFlash.KK=performance.now()+120}
}
// ---- main loop
function frame(){
  const now=curT();
  if(micOk)micPoll(now);
  song.notes.forEach(n=>{
    if(n.done||n.g)return;
    if(bot&&now>=n.t){n.done=1;snd(n.lane);laneFlash[n.lane]=performance.now()+120;stat.perfect++;flash.push({l:n.lane,c:COL[n.lane],t:performance.now()+260});return}
    if(!bot&&now-n.t>WIN_M){n.done=2;stat.miss++;stat.combo=0;jText='Miss';jT=performance.now()+600;updateHud()}
  });
  const cur=song.bars.filter(b=>b.t<=now).pop();
  if(cur&&!cur.end)$q('hsec').textContent=cur.sec+' · bar '+(cur.i+1)+'/'+cur.n+(cur.fill?'  FILL':'');
  draw(now);
  if(now>endT){finish();return}
  raf=requestAnimationFrame(frame);
}
function finish(){
  playing=false;cancelAnimationFrame(raf);micStop();micOk=false;
  const total=song.notes.filter(n=>!n.g).length;
  if(bot){showMenu('Demo finished.');return}
  const acc=total?(stat.perfect+stat.good*.6)/total:0;
  const stars=acc>=.95?5:acc>=.85?4:acc>=.7?3:acc>=.5?2:1;
  const avg=stat.n?stat.sum/stat.n*1000:0;
  const H2=S.hero||(S.hero={});const prev=H2[key]||{score:0,stars:0};
  const rec={score:Math.max(prev.score,stat.score),stars:Math.max(prev.stars,stars),acc:Math.round(acc*100),plays:(prev.plays||0)+1};H2[key]=rec;save();
  const tend=Math.abs(avg)<12?'Your timing was right on the beat.':avg>0?`You tended to hit about ${Math.round(avg)} ms late. Try to lead the beat slightly.`:`You tended to hit about ${Math.round(-avg)} ms early. Try to relax and wait for the beat.`;
  showMenu(`<div class="hstars">${'★'.repeat(stars)}${'☆'.repeat(5-stars)}</div><b>${stat.score.toLocaleString()} points</b><div class="sub">${Math.round(acc*100)}% accuracy · best streak ${stat.max}<br>${stat.perfect} perfect · ${stat.good} good · ${stat.miss} missed</div><p class="sub">${tend}</p>`);
  if(window.Game)Game.update();
}
// ---- UI
function pads(){
  $q('hpads').innerHTML=LANES.map(l=>`<button class="hp" data-hl="${l}" style="background:${COL[l]}">${NAME[l]}</button>`).join('')+`<button class="hp hk" data-hl="KK" style="background:${COL.KK}">Kick</button>`;
}
function showMenu(extra){
  const d=SONGS[key],info=window.Game&&Game.songInfo(key);
  const best=(S.hero&&S.hero[key])||null;
  $q('hmenu').style.display='flex';
  $q('hmenu').innerHTML=`<div class="hcard"><div class="sub">${info?esc(info.f):''}</div><h2>${d.title}</h2>
  ${extra?`<div class="hres">${extra}</div>`:`<p class="sub">${info?esc(info.m):''}</p>`}
  ${best?`<div class="sub">Best: ${best.score.toLocaleString()} · ${'★'.repeat(best.stars)}</div>`:''}
  <div class="hrow"><span>Play with</span><div class="seg" id="hmode"><button data-m="pads" class="${mode==='pads'?'on':''}">Screen pads</button><button data-m="mic" class="${mode==='mic'?'on':''}">My drums (mic)</button></div></div>
  <div class="hrow"><span>Speed</span><div class="seg" id="hspd">${[.6,.8,1].map(v=>`<button data-s="${v}" class="${speed===v?'on':''}">${Math.round(v*100)}%</button>`).join('')}</div></div>
  <div class="hrow"><span>Latency <b id="hofv">${offset}</b> ms</span><input type="range" id="hof" min="-250" max="250" step="5" value="${offset}"></div>
  <div id="hmicopt" style="display:${mode==='mic'?'block':'none'}"><div class="hrow"><span>Mic sensitivity</span><input type="range" id="hsens" min="1" max="10" value="${Math.round(11-sens*100)}"></div><p class="sub">Use headphones so the backing track is not picked up. Kick hits are detected by their low sound, so keep them firm.</p></div>
  <div class="btns" style="margin-top:12px"><button class="btn go" id="hplay">Play</button><button class="btn" id="hdemo">Watch demo</button><button class="btn" id="hclose">Close</button></div><div class="sub" id="hmsg"></div></div>`;
  $q('hmode').onclick=e=>{const b=e.target.closest('button');if(!b)return;mode=b.dataset.m;[...$q('hmode').children].forEach(x=>x.classList.toggle('on',x===b));$q('hmicopt').style.display=mode==='mic'?'block':'none'};
  $q('hspd').onclick=e=>{const b=e.target.closest('button');if(!b)return;speed=+b.dataset.s;[...$q('hspd').children].forEach(x=>x.classList.toggle('on',x===b))};
  $q('hof').oninput=e=>{offset=+e.target.value;$q('hofv').textContent=offset;S.heroOffset=offset;save()};
  const hs=$q('hsens');if(hs)hs.oninput=e=>{sens=(11-(+e.target.value))/100;S.heroSens=sens;save()};
  $q('hplay').onclick=()=>start(false);$q('hdemo').onclick=()=>start(true);$q('hclose').onclick=close;
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function start(isBot){
  cancelAnimationFrame(raf);
  ctx=Band.ctx();if(!ctx){$q('hmsg').textContent='Audio is not available.';return}
  bot=isBot;micOk=false;
  if(!isBot&&mode==='mic'){micOk=await micStart();if(!micOk){$q('hmsg').textContent='The microphone is not available here, so I switched to screen pads. Open the app from its own web address to use your drums.';mode='pads';return showMenuLater()}}
  def=SONGS[key];const sp=speed;beatDur=60/(def.bpm*sp);
  song=build(def);song.notes.forEach(n=>n.t=n.b*beatDur);song.bars.forEach(b=>b.t=b.b*beatDur);
  stat={score:0,combo:0,max:0,perfect:0,good:0,miss:0,sum:0,n:0};
  const lead=.3,cnt=song.bars[0].beats;
  const start0=ctx.currentTime+lead;
  for(let i=0;i<cnt;i++)Band.tick(start0+i*beatDur,i===0);
  t0=start0+cnt*beatDur;
  song.bars.forEach(b=>{if(!b.end)Band.bar(b.st,def.key,b.ch,t0+b.b*beatDur,def.bpm*sp,false)});
  endT=song.bars[song.bars.length-1].t+beatDur*2.2;
  $q('hmenu').style.display='none';playing=true;
  $q('hscore').textContent='0';$q('hcombo').textContent='';$q('hsec').textContent='Get ready';
  flash=[];laneFlash={};size();raf=requestAnimationFrame(frame);
}
function showMenuLater(){showMenu()}
function open(k){
  if(!SONGS[k])return;key=k;
  if(window.Player)Player.stop();
  offset=S.heroOffset||0;sens=S.heroSens||.04;
  const h=$q('hero');h.style.display='flex';
  $q('ht').textContent=SONGS[k].title;
  cv=$q('hcv');g2=cv.getContext('2d');pads();size();
  ctx=Band.ctx();song=build(SONGS[k]);beatDur=60/SONGS[k].bpm;song.notes.forEach(n=>n.t=n.b*beatDur);song.bars.forEach(b=>b.t=b.b*beatDur);
  g2.clearRect(0,0,W,H);showMenu();
}
function close(){playing=false;cancelAnimationFrame(raf);micStop();micOk=false;$q('hero').style.display='none'}
function padDown(e){const b=e.target.closest('[data-hl]');if(!b)return;e.preventDefault();hit(b.dataset.hl)}
document.addEventListener('pointerdown',e=>{if($q('hero').style.display==='flex')padDown(e)});
document.addEventListener('keydown',e=>{if($q('hero').style.display!=='flex')return;const m={a:'HH',s:'SN',d:'T1',f:'FT',j:'RD',k:'CR',' ':'KK',z:'KK'}[e.key.toLowerCase()];if(m){e.preventDefault();hit(m)}});
$q('hx').onclick=()=>{if(playing){playing=false;cancelAnimationFrame(raf);micStop();micOk=false;showMenu()}else close()};
window.addEventListener('resize',()=>{if($q('hero').style.display==='flex'&&cv)size()});
window.Hero={open,close,defs:SONGS,build,G};
})();
