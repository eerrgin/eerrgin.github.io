/* Eski greyfield önbelleğini siler ve kendini kaldırır.
   Bir kez yüklendikten sonra site normal statik dosyalara döner. */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
      const clients = await self.clients.matchAll({ type: "window" });
      await self.registration.unregister();
      for (const client of clients) {
        client.navigate(client.url);
      }
    })(),
  );
});
