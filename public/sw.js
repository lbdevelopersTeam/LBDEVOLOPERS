const CACHE_NAME = 'lb-codebase-media-v7';
const MEDIA_MATCH = /\.(?:png|jpg|jpeg|webp|avif|gif|svg|mp4|woff2?)$/i;

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !MEDIA_MATCH.test(url.pathname) || request.headers.has('range')) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME).catch(() => null);
    const cached = await cache?.match(request);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      // Never persist partial video responses; Cache Storage rejects 206s and
      // range requests must retain normal browser semantics.
      if (cache && response.ok && response.status !== 206) {
        event.waitUntil(cache.put(request, response.clone()).catch(() => undefined));
      }
      return response;
    } catch {
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});
