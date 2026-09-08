const CACHE_NAME = 'mindmod-v3';

const assets = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/db.js',
  './js/hjson-engine.js',
  './js/ui-controller.js',
  './js/item-registry.js',
  './js/block-templates.js',
  './js/bullet-editor.js',
  './js/mod-manager.js',
  './js/mod-validator.js',
  './js/code-editor.js',
  './js/logger.js',
  './js/sprite-engine.js',
  './js/sprite-viewer.js',
  './js/zip-exporter.js',
  './js/project-backup.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(assets))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
