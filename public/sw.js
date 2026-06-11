const CACHE_NAME = "li-meet-private-library-v2";
const CORE_ASSETS = [
  "/",
  "/manifest.webmanifest",
  "/books/exponential-ai-life/cover.png",
  "/books/claude-latest-guide/cover.png",
  "/books/ai-philosophy-20-lectures/cover.png",
  "/books/cognitive-revolution-ai-core-capabilities/cover.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            if (response.ok) cache.put("/", copy);
          });
          return response;
        })
        .catch(() => caches.match("/") || Response.error()),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            if (response.ok && new URL(event.request.url).origin === self.location.origin) {
              cache.put(event.request, copy);
            }
          });
          return response;
        })
        .catch(() => caches.match("/"));
    }),
  );
});
