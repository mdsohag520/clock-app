const CACHE_NAME = 'clock-app-v2';
const FILES_TO_CACHE = ['./clock-app.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* Network-first: always try to fetch the latest version from the
   network. Only fall back to the cached copy if the network request
   fails (e.g. offline). This ensures that whenever new code is
   pushed to GitHub, the app (including the installed TWA) picks it
   up on the next load instead of getting stuck on an old cached
   version. */
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        var copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
