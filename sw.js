const CACHE = 'lettrix-v2';
const SHELL  = ['./', './index.html', './mots.txt'];

// Installation : mise en cache du shell
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : cache en priorité, réseau en fallback
// Les listes de mots externes (EN) sont aussi mises en cache dynamiquement
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(response => {
        if(response.ok) {
          const url = e.request.url;
          const isWordList = url.includes('mots.txt') || url.includes('wordle-list');
          if(isWordList) {
            caches.open(CACHE).then(c => c.put(e.request, response.clone()));
          }
        }
        return response;
      });
    })
  );
});