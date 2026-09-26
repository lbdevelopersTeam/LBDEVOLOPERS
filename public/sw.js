const CACHE_NAME = 'lb-codebase-media-v4';
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

  const cachePromise = caches.open(CACHE_NAME).catch(() => null);
  const cachedPromise = cachePromise.then((cache) => cache?.match(request));
  const fetchPromise = fetch(request);
  const networkPromise = fetchPromise.catch(async () => (
    (await cachedPromise) || new Response('Offline', { status: 503, statusText: 'Offline' })
  ));
  const cacheUpdatePromise = Promise.all([cachePromise, fetchPromise])
    .then(([cache, response]) => {
      // Browsers reject partial (206) responses in Cache Storage. Videos are
      // commonly fetched with byte ranges, so only persist complete responses.
      if (!cache || !response.ok || response.status === 206) return undefined;
      return cache.put(request, response.clone()).catch(() => undefined);
    })
    .catch(() => undefined);

  event.waitUntil(cacheUpdatePromise);
  event.respondWith(cachedPromise.then((cached) => cached || networkPromise));
});
