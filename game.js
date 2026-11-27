(function(){
const $q=id=>document.getElementById(id);
const LEVELS=[[0,'Rookie'],[200,'Pad Tapper'],[500,'Beat Keeper'],[900,'Groove Builder'],[1400,'Fill Finder'],[2000,'Rhythm Maker'],[2700,'Stage Ready'],[3400,'Drummer']];
const B=()=>S.best||(S.best={}),LOG=()=>S.log||(S.log={}),SEEN=()=>S.seen||(S.seen={});
const L3=['A','B','C'];
const SONGS=[
{k:'m1',t:'Come Together',a:'The Beatles',bpm:'about 82',f:'Slow, steady 4/4',m:'Keep the hi-hat steady and the snare on 2 and 4. Hold the tempo for the whole song.'},
{k:'m2',t:'Wonderwall',a:'Oasis',bpm:'about 87',f:'Straight rock',m:'Use the classic eighth-note rock beat from Milestone 2 for a whole verse.'},
{k:'m3',t:'Back in Black',a:'AC/DC',bpm:'about 94',f:'Straight rock with fills',m:'Crash into each section and add a short fill before each chorus.'},
{k:'q1',t:'Smoke on the Water',a:'Deep Purple',bpm:'about 112',f:'Straight rock',m:'Quarter 1 reward. Play a steady beat for the full song and finish on a crash.'},
{k:'m4',t:'Another One Bites the Dust',a:'Queen',bpm:'about 110',f:'Tight kick pattern',m:'Use your kick patterns from Milestone 4 and keep the hi-hat steady.'},
{k:'m5',t:'Billie Jean',a:'Michael Jackson',bpm:'about 117',f:'Steady groove',m:'Hold a steady groove for the whole song. Control matters more than fills.'},
{k:'m6',t:'Seven Nation Army',a:'The White Stripes',bpm:'about 124',f:'Building rock',m:'Practise dynamics: start quiet and build to a big finish.'},
{k:'q2',t:'Under Pressure',a:'Queen and David Bowie',bpm:'about 114',f:'Groove and stamina',m:'Quarter 2 reward. Play it all the way through without stopping.'},
{k:'m7',t:'Hotel California',a:'Eagles',bpm:'about 75',f:'Relaxed groove',m:'Use the ride or hi-hat with soft ghost notes. Keep it relaxed.'},
{k:'m8',t:'Superstition',a:'Stevie Wonder',bpm:'about 100',f:'Funk (stretch)',m:'A stretch goal. Start with just the kick and snare, then add the hi-hat.'},
{k:'m9',t:'Get Lucky',a:'Daft Punk',bpm:'about 116',f:'Steady disco funk',m:'Keep the hi-hat foot steady and the groove light.'},
{k:'q3',t:'Rolling in the Deep',a:'Adele',bpm:'about 105',f:'Big choruses',m:'Quarter 3 reward. Keep the verses simple and open up in the choruses.'},
{k:'m10',t:'Hallelujah',a:'Leonard Cohen',bpm:'slow 6/8',f:'6/8 ballad',m:'Play a soft 6/8 groove and build gently to the chorus.'},
{k:'m11',t:'Piano Man',a:'Billy Joel',bpm:'about 70',f:'3/4 waltz',m:'Play the 3/4 groove from Milestone 10 softly under the verses.'},
{k:'m12',t:'Sweet Child o’ Mine',a:'Guns N’ Roses',bpm:'about 125',f:'Rock (stretch)',m:'A stretch goal for your final milestone. Learn it section by section.'},
{k:'q4',t:'Your own set list',a:'You',bpm:'',f:'Performance',m:'Final reward. Perform your five songs and play along to anything you love.'}
];
function weekDone(w){return L3.every(c=>S.d[w+c])}
function weekCount(w){return L3.filter(c=>S.d[w+c]).length}
function itemDone(key){
  if(key[0]==='m'){const n=+key.slice(1);const it=ALL.find(i=>i.t==='m'&&i.n===n);return !!it&&status(it).done}
  const q={q1:13,q2:26,q3:39,q4:52}[key];const it=ALL.find(i=>i.t==='r'&&i.w===q);return !!it&&status(it).done;
}
function dayKey(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function streaks(){
  const Lg=LOG(),days=Object.keys(Lg).filter(k=>Lg[k]>=10).sort();
  let best=0,run=0,prev=null;
  days.forEach(k=>{const dt=new Date(k+'T00:00:00');if(prev&&Math.round((dt-prev)/864e5)===1)run++;else run=1;if(run>best)best=run;prev=dt});
  const d=new Date();if(!(Lg[dayKey(d)]>=10))d.setDate(d.getDate()-1);
  let cur=0;while(Lg[dayKey(d)]>=10){cur++;d.setDate(d.getDate()-1)}
  const wk=[];for(let i=6;i>=0;i--){const x=new Date();x.setDate(x.getDate()-i);wk.push({k:dayKey(x),m:Lg[dayKey(x)]||0,d:x.getDay()})}
  return {cur,best,total:days.length,wk,wkDays:wk.filter(x=>x.m>=10).length};
}
function compute(){
  let lessons=0,weeks=0;for(let w=1;w<=52;w++){lessons+=weekCount(w);if(weekDone(w))weeks++}
  const tests=Object.keys(S.d).filter(k=>/^[tx]/.test(k)&&S.d[k]).length;
  let ms=0,ex=0;ALL.forEach(it=>{if(status(it).done){if(it.t==='m')ms++;else ex++}});
  const rud=Object.values(B()).filter(v=>v>=80).length;
  const st=streaks();
  const takes=Math.min(40,S.takeCount||0);
  const hs=Object.values(S.hero||{});const stars=hs.reduce((a,v)=>a+(v.stars||0),0);const played=hs.length;
  const xp=lessons*10+tests*5+ms*100+ex*150+rud*25+st.total*15+takes*5+stars*10;
  let li=0;LEVELS.forEach((l,i)=>{if(xp>=l[0])li=i});
  const next=LEVELS[li+1];
  const songs=SONGS.filter(s=>itemDone(s.k)).length;
  return {lessons,weeks,tests,ms,ex,rud,st,xp,li,next,songs,stars,played};
}
const BADGES=[
['First beat','Complete your first lesson',c=>c.lessons>=1],
['Week one','Finish all three lessons in one week',c=>c.weeks>=1],
['Milestone','Pass your first milestone',c=>c.ms>=1],
['On a roll','Practise 3 days in a row',c=>c.st.best>=3],
['Seven up','Practise 7 days in a row',c=>c.st.best>=7],
['Habit','Log 20 practice days',c=>c.st.total>=20],
['Rudiment pro','Score 80+ on all 10 rudiments',c=>c.rud>=10],
['Track collector','Unlock 13 backing tracks',c=>c.weeks>=13],
['Quarter 1','Pass the Quarter 1 exam',c=>itemDone('q1')],
['Quarter 2','Pass the Quarter 2 exam',c=>itemDone('q2')],
['Quarter 3','Pass the Quarter 3 exam',c=>itemDone('q3')],
['Showtime','Finish the final recital',c=>itemDone('q4')],
['Full vault','Unlock all 52 tracks',c=>c.weeks>=52],
['On the record','Record your first take',c=>(S.takeCount||0)>=1],
['Studio time','Record 10 takes',c=>(S.takeCount||0)>=10],
['Opening act','Finish your first song in Hero mode',c=>c.played>=1],
['Headliner','Earn 4 stars or more on any song',c=>Object.values(S.hero||{}).some(v=>v.stars>=4)],
['Full setlist','Play all 16 songs',c=>c.played>=16]
];
function unlockIds(c){
  const ids=[];
  for(let w=1;w<=52;w++)if(weekDone(w))ids.push('t'+w);
  SONGS.forEach(s=>{if(itemDone(s.k))ids.push('s'+s.k)});
  BADGES.forEach((b,i)=>{if(b[2](c))ids.push('b'+i)});
  LEVELS.forEach((l,i)=>{if(c.xp>=l[0]&&i>0)ids.push('l'+i)});
  return ids;
}
let toastT=null;
function toast(msg){const t=$q('toast');if(!t)return;t.innerHTML=`<span>${msg}</span><button id="tview">View</button><button id="tx" aria-label="Close">x</button>`;t.style.display='flex';$q('tx').onclick=()=>t.style.display='none';$q('tview').onclick=()=>{t.style.display='none';goTab('vault')};clearTimeout(toastT);toastT=setTimeout(()=>t.style.display='none',9000)}
function goTab(v){const b=document.querySelector(`nav button[data-v="${v}"]`);if(b)b.click();window.scrollTo(0,0)}
function esc2(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
let primed=false;
function renderVault(c){
  const lv=LEVELS[c.li];
  const base=lv[0],nx=c.next?c.next[0]:base,pctx=c.next?Math.round((c.xp-base)/(nx-base)*100):100;
  const dots=c.st.wk.map(x=>`<span class="sd${x.m>=10?' on':''}" title="${x.k}: ${x.m} min">${'SMTWTFS'[x.d]}</span>`).join('');
  const nextW=(()=>{for(let w=1;w<=52;w++)if(!weekDone(w))return w;return 0})();
  let h=`<div class="card" style="padding:14px 16px"><div class="sub">Level ${c.li+1}</div><h3 style="margin:2px 0 8px;font-size:22px">${lv[1]}</h3>
    <div class="bar"><i style="width:${pctx}%"></i></div><div class="sub" style="margin-top:6px">${c.xp} XP${c.next?` · ${nx-c.xp} to ${c.next[1]}`:' · top level'}</div>
    <div class="stats" style="margin-top:12px"><div class="stat"><b>${c.st.cur}</b><span>Day streak</span></div><div class="stat"><b>${c.st.wkDays}/4</b><span>Practice days this week</span></div></div>
    <div class="sdw">${dots}</div></div>`;
  if(nextW){h+=`<div class="card now"><b>Next unlock</b><p>Week ${nextW} track: ${Player.cfg(nextW).name}. Finish ${3-weekCount(nextW)} more lesson${3-weekCount(nextW)===1?'':'s'} in Week ${nextW}.</p></div>`}
  h+=`<div class="qh">Backing tracks</div><div class="sub" style="margin:0 4px 8px">Finish all three lessons in a week to unlock its track: a bass and chords band at a tempo that fits the week, with drums left for you.</div>`;
  const groups=[[1,13,'Quarter 1'],[14,26,'Quarter 2'],[27,39,'Quarter 3'],[40,52,'Quarter 4']];
  groups.forEach(g=>{
    let n=0;for(let w=g[0];w<=g[1];w++)if(weekDone(w))n++;
    h+=`<details class="card" ${nextW>=g[0]&&nextW<=g[1]?'open':''}><summary><div class="sum"><strong>${g[2]}: Weeks ${g[0]}-${g[1]}</strong><span>${n} of ${g[1]-g[0]+1} unlocked</span></div><span class="chev">›</span></summary><div class="body" style="padding-top:6px">`;
    for(let w=g[0];w<=g[1];w++){
      const cf=Player.cfg(w),ok=weekDone(w);
      h+=`<div class="trk${ok?'':' lk'}"><div class="sum"><strong>${ok?'':'🔒 '}Week ${w}: ${cf.name}</strong><span>${cf.label} · ${cf.bpm} BPM${ok?'':' · '+weekCount(w)+'/3 lessons'}</span></div>${ok?`<button class="vbtn" style="margin:0" data-play="${w}">Play</button>`:''}</div>`;
    }
    h+=`</div></details>`;
  });
  h+=`<div class="qh">Songs: Hero mode</div><div class="sub" style="margin:0 4px 8px">Original songs written for this app. Notes fall toward the line: hit them in time on the screen pads, or on your real drums with the microphone. Pass each milestone and quarter exam to unlock the next song. Earn stars for XP.</div>`;
  SONGS.forEach(s=>{
    const ok=itemDone(s.k),d=Hero.defs[s.k];
    const need=s.k[0]==='m'?'Pass Milestone '+s.k.slice(1):'Pass the Quarter '+s.k.slice(1)+' exam';
    const b=(S.hero||{})[s.k];
    h+=ok?`<div class="card" style="padding:12px 16px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><div><strong>${esc2(d.title)}</strong><div class="sub">${d.bpm} BPM · ${esc2(s.f)}</div><div class="sub">${b?'\u2605'.repeat(b.stars)+'\u2606'.repeat(5-b.stars)+' · best '+b.score.toLocaleString():'Not played yet'}</div></div><button class="vbtn" style="margin:0" data-hero="${s.k}">Play</button></div><p style="margin:6px 0 0;font-size:14px">${esc2(s.m)}</p><div class="sub" style="margin-top:6px">Real-world match: ${esc2(s.t)} (${esc2(s.a)}). Find it on your own music app to try the same feel.</div></div>`
      :`<div class="card lk" style="padding:12px 16px"><strong>🔒 Locked song</strong><div class="sub">${need} to unlock</div></div>`;
  });
  h+=`<div class="qh">Badges</div><div class="bdg">`;
  BADGES.forEach(b=>{const ok=b[2](c);h+=`<div class="bd${ok?' on':''}"><b>${ok?esc2(b[0]):'?'}</b><span>${esc2(b[1])}</span></div>`});
  h+=`</div>`;
  $q('vbody').innerHTML=h;
}
function renderTools(c){
  const Lg=LOG(),td=dayKey(new Date());
  $q('plog').innerHTML=`<div class="sub">Today: <b>${Lg[td]||0} min</b>${(Lg[td]||0)>=10?' · counted for your streak':''}</div>`;
}
function update(){
  const c=compute();
  renderVault(c);renderTools(c);
  const lv=$q('lv');if(lv)lv.textContent=LEVELS[c.li][1]+' · '+c.xp+' XP'+(c.st.cur?' · '+c.st.cur+' day streak':'');
  const ids=unlockIds(c),seen=SEEN();
  const fresh=ids.filter(i=>!seen[i]);
  if(fresh.length){
    ids.forEach(i=>seen[i]=1);save();
    if(primed){
      const t=fresh.filter(i=>i[0]==='t').length,s=fresh.filter(i=>i[0]==='s').length,b=fresh.filter(i=>i[0]==='b').length,l=fresh.filter(i=>i[0]==='l').length;
      const parts=[];if(t)parts.push(t===1?'a new backing track':t+' backing tracks');if(s)parts.push(s===1?'a new song challenge':s+' song challenges');if(b)parts.push(b===1?'a badge':b+' badges');if(l)parts.push('a new level');
      toast('Unlocked: '+parts.join(', ')+'.');
    }
  }
  primed=true;
}
function logPractice(m){const Lg=LOG(),k=dayKey(new Date());Lg[k]=(Lg[k]||0)+m;save();update()}
// tap tempo
let taps=[];
function tap(){const n=Date.now();if(taps.length&&n-taps[taps.length-1]>2000)taps=[];taps.push(n);if(taps.length>8)taps.shift();
  if(taps.length>=3){const iv=[];for(let i=1;i<taps.length;i++)iv.push(taps[i]-taps[i-1]);const a=iv.reduce((x,y)=>x+y,0)/iv.length;$q('tapv').textContent=Math.round(60000/a)+' BPM';$q('tapuse').style.display='inline-block'}
  else $q('tapv').textContent='Keep tapping...'}
document.addEventListener('click',e=>{
  const t=e.target;
  if(t.dataset&&t.dataset.play){const w=+t.dataset.play;goTab('vault');Player.open(w);return}
  if(t.dataset&&t.dataset.lp){logPractice(+t.dataset.lp);return}
  if(t.id==='tap'){tap();return}
  if(t.id==='resetBtn')$q('conf').style.display='block';
  if(t.id==='no')$q('conf').style.display='none';
  if(t.id==='yes'){S={d:{},started:new Date().toISOString().slice(0,10)};save();$q('conf').style.display='none';primed=false;render();update()}
});
// automatic practice-time tracking: any time the metronome, a track or the rudiment trainer is playing
let secs=0;
setInterval(()=>{
  const on=(typeof run!=='undefined'&&run)||(window.RudActive&&RudActive())||(window.Player&&Player.active&&Player.active());
  if(!on||document.hidden)return;
  S.secs=(S.secs||0)+1;
  if(S.secs>=60){S.secs=0;const Lg=LOG(),k=dayKey(new Date());Lg[k]=(Lg[k]||0)+1;save();update()}
},1000);
// back up / restore
function code(){try{return btoa(unescape(encodeURIComponent(JSON.stringify(S))))}catch(e){return''}}
document.addEventListener('click',e=>{
  const id=e.target.id;
  if(id==='bkshow'){$q('bk').value=code();$q('bkmsg').textContent='Copy this code and keep it somewhere safe.'}
  if(id==='bkcopy'){const v=$q('bk').value||code();$q('bk').value=v;$q('bk').select();let ok=false;try{if(navigator.clipboard){navigator.clipboard.writeText(v);ok=true}}catch(x){}$q('bkmsg').textContent=ok?'Copied.':'Select the text and copy it.'}
  if(id==='bkrestore'){try{const o=JSON.parse(decodeURIComponent(escape(atob($q('bk').value.trim()))));if(!o||typeof o.d!=='object')throw 0;S=o;save();primed=false;render();update();$q('bkmsg').textContent='Restored.'}catch(x){$q('bkmsg').textContent='That code did not work. Check you copied all of it.'}}
  if(id==='tapuse'){const v=parseInt($q('tapv').textContent);if(v){setBpm(v);goTab('met')}}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-hero]');if(b)Hero.open(b.dataset.hero)});
window.Game={songInfo:k=>{const s=SONGS.find(x=>x.k===k);return s?{f:s.f+' · '+Hero.defs[k].bpm+' BPM',m:s.m}:null},update,compute};
update();
})();
