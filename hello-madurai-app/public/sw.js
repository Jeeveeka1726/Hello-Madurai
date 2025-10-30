// Service Worker for Background Audio Playback
// Hello Madurai Radio - Background Play Support

const CACHE_NAME = 'hello-madurai-radio-v1'
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
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
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







