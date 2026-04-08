const CACHE='phd-kb-v2';
const PRECACHE=[
  '/PhD_Thesis/',
  '/PhD_Thesis/index.html',
  'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700;800&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js',
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  // Cache-first for static assets and CDN libs
  if(PRECACHE.includes(url.href)||PRECACHE.includes(url.pathname)){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      const clone=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,clone));
      return res;
    })));
    return;
  }
  // Cache PDFs from Supabase on first load (network-first)
  if(url.hostname.includes('supabase')&&url.pathname.includes('.pdf')){
    e.respondWith(fetch(e.request).then(res=>{
      const clone=res.clone();
      caches.open(CACHE).then(c=>c.put(e.request,clone));
      return res;
    }).catch(()=>caches.match(e.request)));
    return;
  }
  // Network-first for everything else
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});
