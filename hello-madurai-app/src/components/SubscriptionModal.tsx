'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { BellIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubscribe: (data: SubscriptionData) => void
}

interface SubscriptionData {
  email?: string
  phone?: string
  name?: string
  categories: string[]
}

export default function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<SubscriptionData>({
    email: '',
    phone: '',
    name: '',
    categories: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const categories = [
    { id: 'news', name: t('subscription.categories.news', 'News', 'செய்திகள்') },
    { id: 'events', name: t('subscription.categories.events', 'Events', 'நிகழ்வுகள்') },
    { id: 'videos', name: t('subscription.categories.videos', 'Videos', 'வீடியோக்கள்') },
    { id: 'radio', name: t('subscription.categories.radio', 'Radio', 'வானொலி') },
    { id: 'magazine', name: t('subscription.categories.magazine', 'E-Paper', 'பத்திரிகை') },
    { id: 'directory', name: t('subscription.categories.directory', 'Directory', 'அடைவு') },
    { id: 'offers', name: t('subscription.categories.offers', 'Special Offers', 'சிறப்பு வாய்ப்புகள்') }
  ]

  const handleCategoryChange = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email && !formData.phone) {
      alert(t('subscription.error.contactRequired', 'Please provide either email or phone number', 'தயவுசெய்து மின்னஞ்சல் அல்லது தொலைபேசி எண்ணை வழங்கவும்'))
      return
    }

    if (formData.categories.length === 0) {
      alert(t('subscription.error.categoriesRequired', 'Please select at least one category', 'தயவுசெய்து குறைந்தது ஒரு வகையையாவது தேர்ந்தெடுக்கவும்'))
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsSuccess(true)
        onSubscribe(formData)
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission()
        }
        
        setTimeout(() => {
          onClose()
          setIsSuccess(false)
          setFormData({ email: '', phone: '', name: '', categories: [] })
        }, 2000)
      } else {
        const error = await response.json()
        alert(error.message || t('subscription.error.failed', 'Failed to subscribe', 'சந்தா செயல்படவில்லை'))
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert(t('subscription.error.failed', 'Failed to subscribe', 'சந்தா செயல்படவில்லை'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {t('subscription.success.title', 'Successfully Subscribed!', 'வெற்றிகரமாக சந்தா செய்யப்பட்டது!')}
          </h3>
          <p className="text-gray-600">
            {t('subscription.success.message', 'You will receive notifications for your selected categories.', 'நீங்கள் தேர்ந்தெடுத்த வகைகளுக்கான அறிவிப்புகளைப் பெறுவீர்கள்.')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <BellIcon className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {t('subscription.title', 'Subscribe for Updates', 'புதுப்பிப்புகளுக்கு சந்தா செய்யுங்கள்')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <p className="text-gray-600 mb-6">
            {t('subscription.description', 'Get notified about latest news, events, and updates from Hello Madurai.', 'ஹலோ மதுரையின் சமீபத்திய செய்திகள், நிகழ்வுகள் மற்றும் புதுப்பிப்புகள் பற்றி அறிவிப்பு பெறுங்கள்.')}
          </p>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('subscription.form.name', 'Name', 'பெயர்')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder={t('subscription.form.namePlaceholder', 'Your name', 'உங்கள் பெயர்')}
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('subscription.form.email', 'Email', 'மின்னஞ்சல்')}
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder={t('subscription.form.emailPlaceholder', 'your@email.com', 'உங்கள்@மின்னஞ்சல்.com')}
            />
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('subscription.form.phone', 'Phone (Optional)', 'தொலைபேசி (விருப்பம்)')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder={t('subscription.form.phonePlaceholder', '+91 9876543210', '+91 9876543210')}
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('subscription.form.categories', 'Select Categories', 'வகைகளைத் தேர்ந்தெடுக்கவும்')} *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.categories.includes(category.id)}
                    onChange={() => handleCategoryChange(category.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('subscription.form.cancel', 'Cancel', 'ரத்து')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting 
                ? t('subscription.form.subscribing', 'Subscribing...', 'சந்தா செய்யப்படுகிறது...')
                : t('subscription.form.subscribe', 'Subscribe', 'சந்தா செய்யுங்கள்')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

