// sw.js CORREGIDO
const CACHE_NAME = 'kanban-v2.1';
const urlsToCache = [
  '/',
  '/index.html',
  './index.html',
  'https://cdn.tailwindcss.com'
];

self.addEventListener('install', event => {
  console.log('Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.log('Error al cachear:', error);
      })
  );
  self.skipWaiting(); // ✅ FORZAR ACTIVACIÓN INMEDIATA
});

self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Eliminando cache antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim(); // ✅ RECLAMAR CONTROL INMEDIATO
});

self.addEventListener('fetch', event => {
  // ✅ ESTRATEGIA CACHE FIRST CON FALLBACK A NETWORK
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        
        return fetch(event.request)
          .then(response => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // ✅ EN CASO DE ERROR, INTENTAR SERVIR INDEX.HTML PARA RUTAS
            if (event.request.mode === 'navigate') {
              return caches.match('./index.html');
            }
          });
      })
  );
});