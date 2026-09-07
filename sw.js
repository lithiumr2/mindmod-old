/**
 * Service Worker (sw.js)
 * Enables complete offline capability by caching application shell and dependencies.
 */
const CACHE_NAME = 'modstudio-v1.0.0';

const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/db.js',
    './js/hjson-engine.js',
    './js/code-editor.js',
    './js/sprite-engine.js',
    './js/zip-exporter.js',
    './js/ui-controller.js',
    './js/app.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// Installation: Cache static core resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[ServiceWorker] Pre-caching offline App Shell');
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(() => self.skipWaiting())
    );
});

// Activation: Clean up old cache versions
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removing old cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Interception: Serve from Cache, fallback to Network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests or browser extension requests
    if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // Cache dynamically fetched CDN/external resources
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Return index.html for navigation requests when completely offline
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
