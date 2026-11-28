(function(){
const RV={single:['ynIV2P_trYQ','Single stroke roll'],double:['r89XcU9NZtA','Double stroke roll'],para:['-imiZIrGwXE','Single paradiddle'],flam:['5ujmfxvr0bQ','Flam'],pdd:['lwAjX__7jF8','Paradiddle-diddle'],dpara:['6C4vcZdFuSc','Double paradiddle']};
const SQ={accent:'accented single strokes drum lesson',flamtap:'flam tap drum rudiment lesson',trip:'drum triplets beginner lesson',five:'five stroke roll drum rudiment lesson'};
const LV=[[/grip|hold|stick/i,'6nq-JeTUIEY','How to hold drumsticks'],[/rock beat|first beat|8th|eighth|backbeat/i,'XeVLe4dX9V8','The classic rock beat']];
const e=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function parseId(u){u=String(u||'').trim();const m=u.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)||(/^[\w-]{11}$/.test(u)?[0,u]:null);return m?m[1]:''}
const frame=id=>`<iframe src="https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1" title="Video" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
const yt=q=>'https://www.youtube.com/results?search_query='+encodeURIComponent(q);
function box(id,title,q,key,open){
  const lnk=id?`https://www.youtube.com/watch?v=${id}`:yt(q);
  return `<div class="vid" data-vk="${e(key)}"><div class="vidh"><b>${id?'Video: '+e(title):'Video lessons'}</b></div>`+
  (id?`<button class="vbtn vplay" data-vid="${id}">${open?'&#10005; Close video':'&#9654; Watch here'}</button>`:'')+
  `<a class="vbtn" target="_blank" rel="noopener" href="${lnk}">${id?'Open on YouTube':'Search YouTube for this'}</a>`+
  `<div class="vplayer">${open?frame(id):''}</div></div>`;
}
function myBox(lid){
  S.vids=S.vids||{};const id=S.vids[lid];
  return `<div class="vid" data-vk="my${lid}"><div class="vidh"><b>My video</b></div>`+
  (id?`<button class="vbtn vplay" data-vid="${id}">&#9654; Watch here</button><button class="vbtn" data-vclr="${lid}">Remove</button>`:
  `<input class="vin" placeholder="Paste a YouTube link" data-vin="${lid}"><button class="vbtn" data-vsave="${lid}">Save</button>`)+
  `<div class="vplayer"></div></div>`;
}
function lessonVideo(l,lid){
  let h='';const g=(l.g||'')+' '+(l.t||'');const vm=window.VMAP,k=vm&&vm.M[lid];
  if(k)h+=box(vm.V[k][0],vm.V[k][1],'',lid+'c',true);
  else for(const [re,id,t] of LV)if(re.test(g)){h+=box(id,t,'',lid+'c',true);break}
  h+=box('','','beginner drum lesson '+(l.g||'').replace(/[^\w ]/g,' ').split(' ').slice(0,7).join(' '),lid+'s');
  return h+myBox(lid);
}
function rudVideo(id,name){
  const r=RV[id];
  return r?box(r[0],r[1],'',id,true):box('','',SQ[id]||name+' drum rudiment lesson',id);
}
function mount(){
  const tip=document.getElementById('rtip');if(!tip)return;
  let d=document.getElementById('rvid');
  if(!d){d=document.createElement('div');d.id='rvid';tip.parentNode.insertBefore(d,tip.nextSibling)}
  const R=window.__rudCur;if(R)d.innerHTML=rudVideo(R.id,R.name);
}
window.Vid={lessonVideo,rudVideo,mount,parseId};
document.addEventListener('click',ev=>{
  const t=ev.target.closest('button');if(!t)return;
  if(t.dataset.vid){const p=t.parentNode.querySelector('.vplayer');
    if(p.firstChild){p.innerHTML='';t.innerHTML='&#9654; Watch here';return}
    p.innerHTML=`<iframe src="https://www.youtube-nocookie.com/embed/${t.dataset.vid}?rel=0&playsinline=1" title="Video" allow="accelerometer; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;t.innerHTML='&#10005; Close video';return}
  if(t.dataset.vsave){const inp=t.parentNode.querySelector('.vin'),id=parseId(inp.value);
    if(!id){inp.value='';inp.placeholder='Not a YouTube link, try again';return}
    S.vids=S.vids||{};S.vids[t.dataset.vsave]=id;save();const b=t.closest('.vid');b.outerHTML=myBox(t.dataset.vsave);return}
  if(t.dataset.vclr){S.vids=S.vids||{};delete S.vids[t.dataset.vclr];save();t.closest('.vid').outerHTML=myBox(t.dataset.vclr)}
});
})();
