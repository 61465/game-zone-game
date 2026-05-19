const TLS_CACHE = 'tls-v1';
const TLS_BASE = '/game-zone-game';
const TLS_ASSETS = [
    TLS_BASE + '/',
    TLS_BASE + '/index.html',
    TLS_BASE + '/manifest.json'
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(TLS_CACHE).then(c => c.addAll(TLS_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== TLS_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    if (url.hostname.includes('fonts.googleapis') || url.hostname.includes('fonts.gstatic')) return;
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
            if (res.ok && url.origin === self.location.origin) {
                const clone = res.clone();
                caches.open(TLS_CACHE).then(c => c.put(e.request, clone));
            }
            return res;
        }).catch(() => caches.match(TLS_BASE + '/index.html')))
    );
});
