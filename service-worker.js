const CACHE_NAME = 'kusti-newspaper-maker-v1';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    'https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;700&family=Tiro+Devanagari+Marathi:ital@0;1&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Precaching App Shell');
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Dynamic Fetch Strategy: serve Cache First, fallback to Network
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                return response; // Return Cache matched version
            }
            return fetch(event.request); // Fallback Network Call
        })
        .catch(error => {
            console.error('Fetch Failed', error);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Activating Service Worker');
    // Clear legacy caches out
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
