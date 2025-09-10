'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { BellIcon, BellSlashIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { initializeFCM, subscribeToTopic, unsubscribeFromTopic } from '@/lib/firebase/client'

interface NotificationPreferences {
  all: boolean
  news: boolean
  events: boolean
  jobs: boolean
  emergency: boolean
}

interface NotificationManagerProps {
  userId?: string
}

export default function NotificationManager({ userId }: NotificationManagerProps) {
  const t = useTranslations()
  const locale = useLocale() as 'en' | 'ta'
  
  const [isSupported, setIsSupported] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    all: false,
    news: false,
    events: false,
    jobs: false,
    emergency: true, // Emergency notifications enabled by default
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if notifications are supported
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true)
      setHasPermission(Notification.permission === 'granted')
    }

    // Load saved preferences from localStorage
    const savedPreferences = localStorage.getItem('notification-preferences')
    if (savedPreferences) {
      try {
        setPreferences(JSON.parse(savedPreferences))
      } catch (error) {
        console.error('Error loading notification preferences:', error)
      }
    }
  }, [])

  const enableNotifications = async () => {
    if (!isSupported) return

    setLoading(true)
    try {
      const result = await initializeFCM(userId, locale)
      
      if (result) {
        setHasPermission(true)
        setIsInitialized(true)
        
        // Subscribe to emergency notifications by default
        await subscribeToTopic('emergency', locale)
        
        // Update preferences
        const newPreferences = { ...preferences, emergency: true }
        setPreferences(newPreferences)
        localStorage.setItem('notification-preferences', JSON.stringify(newPreferences))
      }
    } catch (error) {
      console.error('Error enabling notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = async (topic: keyof NotificationPreferences, enabled: boolean) => {
    if (!hasPermission) return

    setLoading(true)
    try {
      if (enabled) {
        await subscribeToTopic(topic, locale)
      } else {
        await unsubscribeFromTopic(topic, locale)
      }

      const newPreferences = { ...preferences, [topic]: enabled }
      setPreferences(newPreferences)
      localStorage.setItem('notification-preferences', JSON.stringify(newPreferences))
    } catch (error) {
      console.error('Error updating notification preference:', error)
    } finally {
      setLoading(false)
    }
  }

  const testNotification = () => {
    if (!hasPermission) return

    new Notification(
      locale === 'ta' ? 'சோதனை அறிவிப்பு' : 'Test Notification',
      {
        body: locale === 'ta' 
          ? 'இது ஒரு சோதனை அறிவிப்பு. அறிவிப்புகள் சரியாக வேலை செய்கின்றன!'
          : 'This is a test notification. Notifications are working correctly!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'test-notification',
      }
    )
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellSlashIcon className="h-5 w-5 mr-2" />
            {locale === 'ta' ? 'அறிவிப்புகள் ஆதரிக்கப்படவில்லை' : 'Notifications Not Supported'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {locale === 'ta'
              ? 'உங்கள் பிரவுசர் புஷ் அறிவிப்புகளை ஆதரிக்கவில்லை.'
              : 'Your browser does not support push notifications.'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BellIcon className="h-5 w-5 mr-2" />
          {locale === 'ta' ? 'அறிவிப்பு அமைப்புகள்' : 'Notification Settings'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasPermission ? (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              {locale === 'ta'
                ? 'முக்கியமான செய்திகள் மற்றும் நிகழ்வுகளுக்கான அறிவிப்புகளை பெற அனுமதி வழங்கவும்.'
                : 'Enable notifications to receive important news and event updates.'
              }
            </p>
            <Button 
              onClick={enableNotifications} 
              loading={loading}
              className="w-full sm:w-auto"
            >
              <BellIcon className="h-4 w-4 mr-2" />
              {locale === 'ta' ? 'அறிவிப்புகளை இயக்கு' : 'Enable Notifications'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-600">
                {locale === 'ta' ? '✓ அறிவிப்புகள் இயக்கப்பட்டுள்ளன' : '✓ Notifications Enabled'}
              </span>
              <Button variant="outline" size="sm" onClick={testNotification}>
                {locale === 'ta' ? 'சோதனை' : 'Test'}
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                {locale === 'ta' ? 'அறிவிப்பு வகைகள்' : 'Notification Categories'}
              </h4>

              {/* All Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {locale === 'ta' ? 'அனைத்து அறிவிப்புகள்' : 'All Notifications'}
                  </label>
                  <p className="text-xs text-gray-500">
                    {locale === 'ta' ? 'பொதுவான அறிவிப்புகள்' : 'General announcements'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.all}
                  onChange={(e) => updatePreference('all', e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>

              {/* News Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {locale === 'ta' ? 'செய்தி அறிவிப்புகள்' : 'News Notifications'}
                  </label>
                  <p className="text-xs text-gray-500">
                    {locale === 'ta' ? 'புதிய செய்திகள்' : 'Breaking news updates'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.news}
                  onChange={(e) => updatePreference('news', e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>

              {/* Event Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {locale === 'ta' ? 'நிகழ்வு அறிவிப்புகள்' : 'Event Notifications'}
                  </label>
                  <p className="text-xs text-gray-500">
                    {locale === 'ta' ? 'வரவிருக்கும் நிகழ்வுகள்' : 'Upcoming events and festivals'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.events}
                  onChange={(e) => updatePreference('events', e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>

              {/* Job Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {locale === 'ta' ? 'வேலை அறிவிப்புகள்' : 'Job Notifications'}
                  </label>
                  <p className="text-xs text-gray-500">
                    {locale === 'ta' ? 'புதிய வேலை வாய்ப்புகள்' : 'New job opportunities'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.jobs}
                  onChange={(e) => updatePreference('jobs', e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>

              {/* Emergency Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {locale === 'ta' ? 'அவசர அறிவிப்புகள்' : 'Emergency Notifications'}
                  </label>
                  <p className="text-xs text-gray-500">
                    {locale === 'ta' ? 'அவசர எச்சரிக்கைகள்' : 'Critical alerts and warnings'}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emergency}
                  onChange={(e) => updatePreference('emergency', e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {locale === 'ta'
                  ? 'நீங்கள் எந்த நேரத்திலும் இந்த அமைப்புகளை மாற்றலாம்.'
                  : 'You can change these settings at any time.'
                }
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
