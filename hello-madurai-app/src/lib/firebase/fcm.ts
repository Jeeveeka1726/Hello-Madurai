import { getFirebaseMessaging, getAccessToken, getFCMEndpoint } from './admin'
import { createClient } from '@/lib/supabase/server'

export interface NotificationPayload {
  title: string
  body: string
  title_ta?: string
  body_ta?: string
  icon?: string
  image?: string
  click_action?: string
  data?: Record<string, string>
}

export interface FCMTokenMessage {
  token: string
  notification: {
    title: string
    body: string
    image?: string
  }
  data?: Record<string, string>
  webpush?: {
    headers?: Record<string, string>
    data?: Record<string, string>
    notification?: {
      title: string
      body: string
      icon?: string
      image?: string
      badge?: string
      click_action?: string
    }
    fcm_options?: {
      link?: string
    }
  }
}

export interface FCMTopicMessage {
  topic: string
  notification: {
    title: string
    body: string
    image?: string
  }
  data?: Record<string, string>
  webpush?: {
    headers?: Record<string, string>
    data?: Record<string, string>
    notification?: {
      title: string
      body: string
      icon?: string
      image?: string
      badge?: string
      click_action?: string
      actions?: Array<{
        action: string
        title: string
        icon?: string
      }>
    }
    fcm_options?: {
      link?: string
    }
  }
}

// Send notification to a specific device token
export async function sendNotificationToToken(
  token: string, 
  payload: NotificationPayload,
  locale: 'en' | 'ta' = 'en'
): Promise<boolean> {
  try {
    const messaging = getFirebaseMessaging()
    
    const message: FCMTokenMessage = {
      token,
      notification: {
        title: locale === 'ta' && payload.title_ta ? payload.title_ta : payload.title,
        body: locale === 'ta' && payload.body_ta ? payload.body_ta : payload.body,
        image: payload.image,
      },
      data: payload.data,
      webpush: {
        notification: {
          title: locale === 'ta' && payload.title_ta ? payload.title_ta : payload.title,
          body: locale === 'ta' && payload.body_ta ? payload.body_ta : payload.body,
          icon: payload.icon || '/icons/icon-192x192.png',
          image: payload.image,
          badge: '/icons/badge-72x72.png',
          click_action: payload.click_action || '/',
        },
        fcm_options: {
          link: payload.click_action || '/',
        },
      },
    }

    const response = await messaging.send(message)
    console.log('Successfully sent message:', response)
    return true
  } catch (error) {
    console.error('Error sending message:', error)
    return false
  }
}

// Send notification to a topic (e.g., 'news', 'events', 'all')
export async function sendNotificationToTopic(
  topic: string,
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const messaging = getFirebaseMessaging()
    
    // Send in both languages
    const messages: FCMTopicMessage[] = [
      {
        topic: `${topic}_en`,
        notification: {
          title: payload.title,
          body: payload.body,
          image: payload.image,
        },
        data: payload.data,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            image: payload.image,
            click_action: payload.click_action || '/',
          },
          fcm_options: {
            link: payload.click_action || '/',
          },
        },
      }
    ]

    // Add Tamil version if available
    if (payload.title_ta && payload.body_ta) {
      messages.push({
        topic: `${topic}_ta`,
        notification: {
          title: payload.title_ta,
          body: payload.body_ta,
          image: payload.image,
        },
        data: payload.data,
        webpush: {
          notification: {
            title: payload.title_ta,
            body: payload.body_ta,
            icon: payload.icon || '/icons/icon-192x192.png',
            image: payload.image,
            click_action: payload.click_action || '/',
          },
          fcm_options: {
            link: payload.click_action || '/',
          },
        },
      })
    }

    const responses = await messaging.sendEach(messages)
    console.log('Successfully sent messages:', responses)
    return responses.successCount > 0
  } catch (error) {
    console.error('Error sending topic message:', error)
    return false
  }
}

// Send notification using FCM v1 HTTP API (alternative method)
export async function sendNotificationHTTP(
  payload: NotificationPayload,
  target: { token?: string; topic?: string; condition?: string }
): Promise<boolean> {
  try {
    const accessToken = await getAccessToken()
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'hello-madurai'
    const endpoint = getFCMEndpoint(projectId)

    const message: any = {
      message: {
        notification: {
          title: payload.title,
          body: payload.body,
          image: payload.image,
        },
        data: payload.data,
        webpush: {
          notification: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            image: payload.image,
            click_action: payload.click_action || '/',
          },
          fcm_options: {
            link: payload.click_action || '/',
          },
        },
        ...target,
      },
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    if (response.ok) {
      const result = await response.json()
      console.log('HTTP notification sent successfully:', result)
      return true
    } else {
      const error = await response.text()
      console.error('HTTP notification failed:', error)
      return false
    }
  } catch (error) {
    console.error('Error sending HTTP notification:', error)
    return false
  }
}

// Subscribe user to topic
export async function subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
  try {
    const messaging = getFirebaseMessaging()
    const response = await messaging.subscribeToTopic(tokens, topic)
    console.log('Successfully subscribed to topic:', response)
    return response.successCount > 0
  } catch (error) {
    console.error('Error subscribing to topic:', error)
    return false
  }
}

// Unsubscribe user from topic
export async function unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
  try {
    const messaging = getFirebaseMessaging()
    const response = await messaging.unsubscribeFromTopic(tokens, topic)
    console.log('Successfully unsubscribed from topic:', response)
    return response.successCount > 0
  } catch (error) {
    console.error('Error unsubscribing from topic:', error)
    return false
  }
}

// Store FCM token in database
export async function storeFCMToken(userId: string, token: string, locale: 'en' | 'ta' = 'en'): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('fcm_tokens')
      .upsert({
        user_id: userId,
        token,
        locale,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,token'
      })

    if (error) {
      console.error('Error storing FCM token:', error)
      return false
    }

    // Subscribe to relevant topics
    await subscribeToTopic([token], 'all')
    await subscribeToTopic([token], `all_${locale}`)
    
    return true
  } catch (error) {
    console.error('Error storing FCM token:', error)
    return false
  }
}

// Send notification for new content
export async function sendContentNotification(
  contentType: 'news' | 'event' | 'job' | 'emergency',
  title: string,
  body: string,
  title_ta?: string,
  body_ta?: string,
  link?: string
): Promise<boolean> {
  const payload: NotificationPayload = {
    title,
    body,
    title_ta,
    body_ta,
    icon: '/icons/icon-192x192.png',
    click_action: link,
    data: {
      type: contentType,
      url: link || '/',
    },
  }

  // Send to general topic and content-specific topic
  const results = await Promise.all([
    sendNotificationToTopic('all', payload),
    sendNotificationToTopic(contentType, payload),
  ])

  return results.some(result => result)
}
