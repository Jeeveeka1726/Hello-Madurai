'use client'

import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Get FCM registration token
export const getFCMToken = async (): Promise<string | null> => {
  try {
    if (typeof window === 'undefined') return null
    
    const messaging = getMessaging(app)
    const vapidKey = process.env.NEXT_PUBLIC_FCM_VAPID_KEY
    
    if (!vapidKey) {
      console.error('VAPID key not found')
      return null
    }

    const token = await getToken(messaging, { vapidKey })
    
    if (token) {
      console.log('FCM registration token:', token)
      return token
    } else {
      console.log('No registration token available.')
      return null
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error)
    return null
  }
}

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (typeof window === 'undefined') return false
    
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.')
      return false
    }

    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      console.log('Notification permission granted.')
      return true
    } else {
      console.log('Notification permission denied.')
      return false
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

// Listen for foreground messages
export const onForegroundMessage = (callback: (payload: MessagePayload) => void) => {
  try {
    if (typeof window === 'undefined') return () => {}
    
    const messaging = getMessaging(app)
    
    return onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload)
      callback(payload)
    })
  } catch (error) {
    console.error('Error setting up foreground message listener:', error)
    return () => {}
  }
}

// Initialize FCM for the app
export const initializeFCM = async (userId?: string, locale: 'en' | 'ta' = 'en') => {
  try {
    // Request permission
    const hasPermission = await requestNotificationPermission()
    if (!hasPermission) return null

    // Get FCM token
    const token = await getFCMToken()
    if (!token) return null

    // Store token in database if user is logged in
    if (userId) {
      await fetch('/api/fcm/store-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, token, locale }),
      })
    }

    // Set up foreground message listener
    const unsubscribe = onForegroundMessage((payload) => {
      // Show notification in foreground
      if (payload.notification) {
        const { title, body, image } = payload.notification
        
        if (title && body) {
          new Notification(title, {
            body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            tag: 'hello-madurai-notification',
            requireInteraction: true,
          })
        }
      }
    })

    return { token, unsubscribe }
  } catch (error) {
    console.error('Error initializing FCM:', error)
    return null
  }
}

// Subscribe to topic
export const subscribeToTopic = async (topic: string, locale: 'en' | 'ta' = 'en') => {
  try {
    const token = await getFCMToken()
    if (!token) return false

    const response = await fetch('/api/fcm/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, topic: `${topic}_${locale}` }),
    })

    return response.ok
  } catch (error) {
    console.error('Error subscribing to topic:', error)
    return false
  }
}

// Unsubscribe from topic
export const unsubscribeFromTopic = async (topic: string, locale: 'en' | 'ta' = 'en') => {
  try {
    const token = await getFCMToken()
    if (!token) return false

    const response = await fetch('/api/fcm/unsubscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, topic: `${topic}_${locale}` }),
    })

    return response.ok
  } catch (error) {
    console.error('Error unsubscribing from topic:', error)
    return false
  }
}

export default app
