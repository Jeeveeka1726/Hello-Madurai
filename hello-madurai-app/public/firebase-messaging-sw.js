// Import Firebase scripts for service worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js')

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArpImyXLh-t6JgmPRZeKOeyiCM8lse_nM",
  authDomain: "hello-madurai.firebaseapp.com",
  projectId: "hello-madurai",
  storageBucket: "hello-madurai.firebasestorage.app",
  messagingSenderId: "941758481973",
  appId: "1:941758481973:web:2150ada47abefaf896937c"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

// Get messaging instance
const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload)

  const notificationTitle = payload.notification?.title || 'Hello Madurai'
  const notificationOptions = {
    body: payload.notification?.body || 'New update available',
    icon: payload.notification?.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: payload.notification?.image,
    tag: 'hello-madurai-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open',
        icon: '/icons/open-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-icon.png'
      }
    ],
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/',
      ...payload.data
    }
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  if (event.action === 'close') {
    return
  }

  // Get the URL to open
  const urlToOpen = event.notification.data?.url || '/'

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus()
        }
      }

      // If no existing window/tab, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
  
  // Track notification close event if needed
  // You can send analytics data here
})

// Handle push event (for additional processing)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)
  
  if (event.data) {
    try {
      const payload = event.data.json()
      console.log('Push payload:', payload)
      
      // You can add custom logic here for different types of notifications
      if (payload.data?.type === 'emergency') {
        // Handle emergency notifications with higher priority
        const notificationOptions = {
          body: payload.notification?.body || 'Emergency Alert',
          icon: '/icons/emergency-icon.png',
          badge: '/icons/emergency-badge.png',
          tag: 'emergency-notification',
          requireInteraction: true,
          vibrate: [200, 100, 200, 100, 200],
          silent: false,
          urgency: 'high'
        }
        
        event.waitUntil(
          self.registration.showNotification(
            payload.notification?.title || 'Emergency Alert',
            notificationOptions
          )
        )
      }
    } catch (error) {
      console.error('Error parsing push payload:', error)
    }
  }
})

// Service worker installation
self.addEventListener('install', (event) => {
  console.log('Service worker installing...')
  self.skipWaiting()
})

// Service worker activation
self.addEventListener('activate', (event) => {
  console.log('Service worker activating...')
  event.waitUntil(clients.claim())
})

// Handle message from main thread
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
