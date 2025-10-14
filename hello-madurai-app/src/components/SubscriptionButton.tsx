'use client'

import { useState } from 'react'
import { BellIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import SubscriptionModal from './SubscriptionModal'

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
        <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 ${className}`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="h-6 w-6" />
              <div>
                <h3 className="font-semibold">
                  {t('subscription.banner.title', 'Stay Updated!', 'புதுப்பித்த நிலையில் இருங்கள்!')}
                </h3>
                <p className="text-sm text-blue-100">
                  {t('subscription.banner.subtitle', 'Get notifications for latest news and updates', 'சமீபத்திய செய்திகள் மற்றும் புதுப்பிப்புகளுக்கான அறிவிப்புகளைப் பெறுங்கள்')}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              {t('subscription.banner.button', 'Subscribe', 'சந்தா செய்யுங்கள்')}
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
          title={t('subscription.floating.title', 'Subscribe for updates', 'புதுப்பிப்புகளுக்கு சந்தா செய்யுங்கள்')}
        >
          <BellIcon className="h-6 w-6" />
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
      >
        <BellIcon className="h-4 w-4" />
        {t('subscription.button.text', 'Subscribe', 'சந்தா செய்யுங்கள்')}
      </button>
      
      <SubscriptionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubscribe={handleSubscribe}
      />
    </>
  )
}



