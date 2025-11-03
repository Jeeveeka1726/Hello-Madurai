'use client'

import { useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import SubscriptionModal from './SubscriptionModal'
import TranslatedText from './TranslatedText'

interface SubscriptionButtonProps {
  className?: string
  variant?: 'button' | 'banner' | 'floating'
}

export default function SubscriptionButton({ className = '', variant = 'button' }: SubscriptionButtonProps) {
  const { t } = useLanguage()
  const [showModal, setShowModal] = useState(false)

  const handleSubscribe = (data: any) => {
    console.log('Subscription data:', data)
    // Handle successful subscription
  }

  if (variant === 'banner') {
    return (
      <>
        <div className={`bg-gradient-to-r from-blue-500 to-blue-600 p-4 ${className}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="h-6 w-6" style={{ color: '#ffffff' }} />
              <div>
                <h3 className="font-semibold" style={{ color: '#ffffff' }}>
                  <TranslatedText tamil="புதுப்பித்த நிலையில் இருங்கள்!">Stay Updated!</TranslatedText>
                </h3>
                <p className="text-sm" style={{ color: '#ffffff' }}>
                  <TranslatedText tamil="சமீபத்திய செய்திகள் மற்றும் புதுப்பிப்புகளுக்கான அறிவிப்புகளைப் பெறுங்கள்">Get notifications for latest news and updates</TranslatedText>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              style={{ color: '#2563eb' }}
            >
              <TranslatedText tamil="சந்தா செய்யுங்கள்">Subscribe</TranslatedText>
            </button>
          </div>
        </div>
        
        <SubscriptionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubscribe={handleSubscribe}
        />
      </>
    )
  }

  if (variant === 'floating') {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className={`fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-40 ${className}`}
          suppressHydrationWarning
        >
          <BellIcon className="h-6 w-6" />
          <span className="sr-only" suppressHydrationWarning>
            {t('subscription.floating.title', 'Subscribe for updates', 'புதுப்பிப்புகளுக்கு சந்தா செய்யுங்கள்')}
          </span>
        </button>
        
        <SubscriptionModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSubscribe={handleSubscribe}
        />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors ${className}`}
        suppressHydrationWarning
      >
        <BellIcon className="h-4 w-4" />
        <span suppressHydrationWarning>
          {t('subscription.button.text', 'Subscribe', 'சந்தா செய்யுங்கள்')}
        </span>
      </button>
      
      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubscribe={handleSubscribe}
      />
    </>
  )
}








