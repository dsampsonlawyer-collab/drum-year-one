const V='drum-v20';
const FILES=["./", "index.html", "theme.css", "img/sunset.jpg", "img/shelf.jpg", "img/stage.jpg", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "l1.js", "l1b.js", "l2.js", "l2b.js", "l3.js", "l3b.js", "l4.js", "l4b.js", "rud.js", "play.js", "hero.js", "rec.js", "game.js", "tempo.js", "vmap.js", "vid.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(new Request(e.request,{cache:'no-cache'})).then(r=>{const cp=r.clone();caches.open(V).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request)))});
