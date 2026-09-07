const CACHE_NAME = 'mindmod-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  './js/db.js',
  './js/hjson-engine.js',
  './js/ui-controller.js',
  './js/sprite-engine.js',
  './js/zip-exporter.js',
  './js/code-editor.js',
  './js/mod-manager.js',
  './js/item-registry.js',
  './js/block-templates.js',
  './js/bullet-editor.js',
  './js/mod-validator.js',
  './js/sprite-viewer.js',
  './js/project-backup.js',
  './js/app.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request);
    })
  );
});
