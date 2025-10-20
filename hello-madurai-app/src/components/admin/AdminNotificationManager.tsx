'use client'

import { useState, useEffect } from 'react'
import { 
  BellIcon, 
  PaperAirplaneIcon,
  UserGroupIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

interface NotificationTemplate {
  id: string
  title: string
  message: string
  type: 'news' | 'event' | 'offer' | 'general'
  targetAudience: 'all' | 'subscribers' | 'recent_users'
  channels: ('push' | 'email' | 'sms')[]
  scheduled?: string
  status: 'draft' | 'scheduled' | 'sent' | 'failed'
  sentCount?: number
  openRate?: number
  clickRate?: number
  createdAt: string
}

interface AdminNotificationManagerProps {
  className?: string
}

export default function AdminNotificationManager({ className = '' }: AdminNotificationManagerProps) {
  const { t } = useLanguage()
  const [notifications, setNotifications] = useState<NotificationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<NotificationTemplate | null>(null)
  const [newNotification, setNewNotification] = useState<Partial<NotificationTemplate>>({
    title: '',
    message: '',
    type: 'general',
    targetAudience: 'all',
    channels: ['push']
  })

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNotification = async () => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newNotification)
      })

      if (response.ok) {
        const notification = await response.json()
        setNotifications(prev => [notification, ...prev])
        setShowCreateModal(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating notification:', error)
    }
  }

  const sendNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/send`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchNotifications() // Refresh to get updated status
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const scheduleNotification = async (id: string, scheduledTime: string) => {
    try {
      const response = await fetch(`/api/admin/notifications/${id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scheduledTime })
      })

      if (response.ok) {
        fetchNotifications()
      }
    } catch (error) {
      console.error('Error scheduling notification:', error)
    }
  }

  const resetForm = () => {
    setNewNotification({
      title: '',
      message: '',
      type: 'general',
      targetAudience: 'all',
      channels: ['push']
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'text-green-600 bg-green-100'
      case 'scheduled': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return CheckCircleIcon
      case 'scheduled': return ClockIcon
      case 'failed': return XCircleIcon
      default: return BellIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'news': return 'text-red-600 bg-red-100'
      case 'event': return 'text-blue-600 bg-blue-100'
      case 'offer': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('admin.notifications.title', 'Notification Manager', 'அறிவிப்பு மேலாளர்')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.notifications.subtitle', 'Send push notifications, emails, and SMS to your users', 'உங்கள் பயனர்களுக்கு புஷ் அறிவிப்புகள், மின்னஞ்சல்கள் மற்றும் SMS அனுப்பவும்')}
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <BellIcon className="h-5 w-5" />
          {t('admin.notifications.create', 'Create Notification', 'அறிவிப்பு உருவாக்கவும்')}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.status === 'sent').length}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.status === 'scheduled').length}
              </p>
            </div>
            <ClockIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Drafts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.status === 'draft').length}
              </p>
            </div>
            <BellIcon className="h-8 w-8 text-gray-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notifications.filter(n => n.status === 'failed').length}
              </p>
            </div>
            <XCircleIcon className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.notifications.allNotifications', 'All Notifications', 'அனைத்து அறிவிப்புகள்')}
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No notifications created yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => {
              const StatusIcon = getStatusIcon(notification.status)
              return (
                <div key={notification.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <UserGroupIcon className="h-4 w-4" />
                          <span>{notification.targetAudience}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {notification.channels.includes('push') && <DevicePhoneMobileIcon className="h-4 w-4" />}
                          {notification.channels.includes('email') && <EnvelopeIcon className="h-4 w-4" />}
                          {notification.channels.includes('sms') && <DevicePhoneMobileIcon className="h-4 w-4" />}
                        </div>

                        {notification.sentCount && (
                          <div className="flex items-center gap-1">
                            <span>{notification.sentCount} sent</span>
                          </div>
                        )}

                        {notification.openRate && (
                          <div className="flex items-center gap-1">
                            <EyeIcon className="h-4 w-4" />
                            <span>{notification.openRate}% opened</span>
                          </div>
                        )}

                        <span>{new Date(notification.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <StatusIcon className={`h-5 w-5 ${notification.status === 'sent' ? 'text-green-500' : notification.status === 'failed' ? 'text-red-500' : 'text-gray-400'}`} />
                      
                      {notification.status === 'draft' && (
                        <button
                          onClick={() => sendNotification(notification.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          Send Now
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedNotification(notification)}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded transition-colors"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('admin.notifications.createNew', 'Create New Notification', 'புதிய அறிவிப்பை உருவாக்கவும்')}
              </h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Notification title..."
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Notification message..."
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="general">General</option>
                  <option value="news">News</option>
                  <option value="event">Event</option>
                  <option value="offer">Offer</option>
                </select>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Audience
                </label>
                <select
                  value={newNotification.targetAudience}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, targetAudience: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Users</option>
                  <option value="subscribers">Subscribers Only</option>
                  <option value="recent_users">Recent Users</option>
                </select>
              </div>

              {/* Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Delivery Channels
                </label>
                <div className="space-y-2">
                  {['push', 'email', 'sms'].map((channel) => (
                    <label key={channel} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newNotification.channels?.includes(channel as any) || false}
                        onChange={(e) => {
                          const channels = newNotification.channels || []
                          if (e.target.checked) {
                            setNewNotification(prev => ({ 
                              ...prev, 
                              channels: [...channels, channel as any] 
                            }))
                          } else {
                            setNewNotification(prev => ({ 
                              ...prev, 
                              channels: channels.filter(c => c !== channel) 
                            }))
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                        {channel} Notification
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNotification}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




