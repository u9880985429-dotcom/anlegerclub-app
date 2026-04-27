// Minimaler Service Worker — erfüllt Chrome-Install-Kriterien für PWA.
// Phase 2: erweitern auf Workbox / Caching-Strategien + Push-Notifications.
const CACHE_NAME = "traderiq-v1";

self.addEventListener("install", (event) => {
  // Sofort aktivieren, alte Worker ablösen.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

// Stale-While-Revalidate für statische Assets (Icons, manifest, _next-Assets).
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Nur Static-Assets cachen, kein HTML / API / NextAuth.
  const cachable =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json" ||
    url.pathname === "/bg-polygon.png" ||
    url.pathname === "/logo-light.png" ||
    url.pathname === "/logo-dark.png";

  if (!cachable) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      const network = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => cached);
      return cached ?? network;
    }),
  );
});
