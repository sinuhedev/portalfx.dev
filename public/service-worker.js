const CACHE = 'portalfx'

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim())
})

self.addEventListener('fetch', (event) => {
  // siempre ir a network primero
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // guardar nueva copia
        const clone = response.clone()

        caches.open(CACHE).then((cache) => {
          cache.put(event.request, clone)
        })

        return response
      })
      .catch(() => {
        // fallback cache offline
        return caches.match(event.request)
      })
  )
})
