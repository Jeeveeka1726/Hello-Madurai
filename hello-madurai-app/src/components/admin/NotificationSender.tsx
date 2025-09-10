'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { PaperAirplaneIcon, BellIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { toast } from 'react-hot-toast'

interface NotificationForm {
  type: 'topic' | 'token' | 'content'
  target: string
  contentType?: 'news' | 'event' | 'job' | 'emergency'
  title: string
  body: string
  title_ta: string
  body_ta: string
  image?: string
  link?: string
}

export default function NotificationSender() {
  const t = useTranslations()
  const locale = useLocale()
  
  const [form, setForm] = useState<NotificationForm>({
    type: 'topic',
    target: 'all',
    title: '',
    body: '',
    title_ta: '',
    body_ta: '',
    image: '',
    link: '',
  })
  const [sending, setSending] = useState(false)

  const topics = [
    { value: 'all', label: 'All Users', label_ta: 'அனைத்து பயனர்கள்' },
    { value: 'news', label: 'News Subscribers', label_ta: 'செய்தி சந்தாதாரர்கள்' },
    { value: 'events', label: 'Event Subscribers', label_ta: 'நிகழ்வு சந்தாதாரர்கள்' },
    { value: 'jobs', label: 'Job Subscribers', label_ta: 'வேலை சந்தாதாரர்கள்' },
    { value: 'emergency', label: 'Emergency Alerts', label_ta: 'அவசர எச்சரிக்கைகள்' },
  ]

  const contentTypes = [
    { value: 'news', label: 'News', label_ta: 'செய்திகள்' },
    { value: 'event', label: 'Event', label_ta: 'நிகழ்வு' },
    { value: 'job', label: 'Job', label_ta: 'வேலை' },
    { value: 'emergency', label: 'Emergency', label_ta: 'அவசரம்' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.title || !form.body) {
      toast.error('Title and body are required')
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/fcm/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      if (response.ok) {
        toast.success('Notification sent successfully!')
        // Reset form
        setForm({
          type: 'topic',
          target: 'all',
          title: '',
          body: '',
          title_ta: '',
          body_ta: '',
          image: '',
          link: '',
        })
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BellIcon className="h-5 w-5 mr-2" />
          {locale === 'ta' ? 'அறிவிப்பு அனுப்பவும்' : 'Send Notification'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ta' ? 'அறிவிப்பு வகை' : 'Notification Type'}
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="topic">{locale === 'ta' ? 'தலைப்பு' : 'Topic'}</option>
              <option value="token">{locale === 'ta' ? 'டோக்கன்' : 'Token'}</option>
              <option value="content">{locale === 'ta' ? 'உள்ளடக்கம்' : 'Content'}</option>
            </select>
          </div>

          {/* Target */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {form.type === 'topic' 
                ? (locale === 'ta' ? 'தலைப்பு' : 'Topic')
                : form.type === 'token'
                ? (locale === 'ta' ? 'டிவைஸ் டோக்கன்' : 'Device Token')
                : (locale === 'ta' ? 'இலக்கு' : 'Target')
              }
            </label>
            {form.type === 'topic' ? (
              <select
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {topics.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {locale === 'ta' ? topic.label_ta : topic.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                placeholder={form.type === 'token' ? 'Device token...' : 'Target...'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}
          </div>

          {/* Content Type (for content notifications) */}
          {form.type === 'content' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'ta' ? 'உள்ளடக்க வகை' : 'Content Type'}
              </label>
              <select
                value={form.contentType || ''}
                onChange={(e) => setForm({ ...form, contentType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{locale === 'ta' ? 'தேர்ந்தெடுக்கவும்' : 'Select...'}</option>
                {contentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {locale === 'ta' ? type.label_ta : type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title (English) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ta' ? 'தலைப்பு (ஆங்கிலம்)' : 'Title (English)'}
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter notification title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Body (English) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ta' ? 'உள்ளடக்கம் (ஆங்கிலம்)' : 'Body (English)'}
            </label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Enter notification message..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Title (Tamil) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ta' ? 'தலைப்பு (தமிழ்)' : 'Title (Tamil)'}
            </label>
            <input
              type="text"
              value={form.title_ta}
              onChange={(e) => setForm({ ...form, title_ta: e.target.value })}
              placeholder="தமிழ் தலைப்பு..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Body (Tamil) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ta' ? 'உள்ளடக்கம் (தமிழ்)' : 'Body (Tamil)'}
            </label>
            <textarea
              value={form.body_ta}
              onChange={(e) => setForm({ ...form, body_ta: e.target.value })}
              placeholder="தமிழ் செய்தி..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ta' ? 'படம் URL (விருப்பம்)' : 'Image URL (Optional)'}
            </label>
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Click Action URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'ta' ? 'கிளிக் செய்யும் URL (விருப்பம்)' : 'Click Action URL (Optional)'}
            </label>
            <input
              type="text"
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
              placeholder="/news/123 or https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={sending}
              className="w-full sm:w-auto"
            >
              <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              {locale === 'ta' ? 'அறிவிப்பு அனுப்பவும்' : 'Send Notification'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
