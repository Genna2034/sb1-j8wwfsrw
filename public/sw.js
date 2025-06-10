// Service Worker per ottimizzazioni performance e funzionalità offline
const CACHE_NAME = 'emmanuel-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/index.css',
  '/assets/index.js',
  '/Screenshot 2025-06-09 alle 14.11.10.png'
];

// Installazione Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installazione');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Attivazione Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Attivazione');
  
  // Pulisci vecchie cache
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🧹 Service Worker: Pulizia cache vecchia', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Intercetta richieste di rete
self.addEventListener('fetch', (event) => {
  // Ignora richieste API
  if (event.request.url.includes('/api/')) {
    return;
  }
  
  // Strategia Cache First con Network Fallback
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Ritorna dalla cache se disponibile
        if (response) {
          return response;
        }
        
        // Altrimenti, fetch dalla rete
        return fetch(event.request)
          .then((networkResponse) => {
            // Salva in cache se è una richiesta GET
            if (event.request.method === 'GET') {
              return caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            }
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('❌ Service Worker: Fetch error', error);
            
            // Fallback per HTML
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // Fallback generico
            return new Response('Errore di rete. Controlla la connessione.', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Gestione notifiche push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/Screenshot 2025-06-09 alle 14.11.10.png',
    badge: '/Screenshot 2025-06-09 alle 14.11.10.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Click su notifica
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// Sincronizzazione in background
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Implementazione sincronizzazione dati
  console.log('🔄 Service Worker: Sincronizzazione dati in background');
  
  // Qui implementeresti la logica per sincronizzare dati con il server
  // quando l'utente torna online
}

// Messaggi dal client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});