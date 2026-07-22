// Service Worker for Background Audio Playback + Image Caching
// Hello Madurai Radio - Background Play Support

const CACHE_NAME = 'hello-madurai-v3'
const IMAGE_CACHE_NAME = 'hello-madurai-images-v3'
const urlsToCache = [
  '/',
  '/radio',
  '/fm-logo.jpg',
  '/offline.html'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
  )
  // Force activation immediately
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Fetch event - aggressive image caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Aggressive caching for banner images - cache-first, never expire
  if (url.pathname.startsWith('/api/images/')) {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // Always return from cache if available (instant loading)
          if (cachedResponse) {
            return cachedResponse
          }

          // Not in cache, fetch and cache permanently
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              // Clone before caching
              cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          }).catch(() => {
            // Return a placeholder on error
            return new Response('Image not available', { status: 404 })
          })
        })
      })
    )
    return
  }

  // Cache-first for notice banners API
  if (url.pathname === '/api/notice-banners') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          })

          // Return cached response immediately if available
          return cachedResponse || fetchPromise
        })
      })
    )
    return
  }

  // Default: network first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return response
      })
      .catch(() => {
        // Fallback to cache on network failure
        return caches.match(event.request)
      })
  )
})

// Background sync for audio playback
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-audio') {
    event.waitUntil(handleBackgroundAudio())
  }
})

// Handle background audio playback
async function handleBackgroundAudio() {
  try {
    // Keep audio playing in background
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'BACKGROUND_AUDIO_SYNC',
        data: { status: 'active' }
      })
    })
  } catch (error) {
    console.error('Background audio sync failed:', error)
  }
}

// Message handling for audio controls
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'AUDIO_CONTROL') {
    const { action, data } = event.data
    
    switch (action) {
      case 'PLAY':
        // Handle play command
        break
      case 'PAUSE':
        // Handle pause command
        break
      case 'NEXT':
        // Handle next track
        break
      case 'PREVIOUS':
        // Handle previous track
        break
    }
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/radio')
  )
})

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Hello Madurai Radio is playing',
    icon: '/fm-logo.jpg',
    badge: '/fm-logo.jpg',
    tag: 'radio-notification',
    actions: [
      {
        action: 'play',
        title: 'Play',
        icon: '/icons/play.png'
      },
      {
        action: 'pause',
        title: 'Pause',
        icon: '/icons/pause.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Hello Madurai Radio', options)
  )
})








