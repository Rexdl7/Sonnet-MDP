const CACHE_NAME = 'sonnet-music-v1';
const MAX_CACHED_TRACKS = 10;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.delete(CACHE_NAME));
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((networkResponse) => {
        if (networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
            
            // Limit cache size
            cache.keys().then((keys) => {
              if (keys.length > MAX_CACHED_TRACKS * 2) {
                cache.delete(keys[0]);
              }
            });
          });
        }
        return networkResponse;
      });
    })
  );
});
