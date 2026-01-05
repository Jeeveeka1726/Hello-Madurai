'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'

interface PopupAd {
  id: string
  title: string
  content: string
  imageUrl?: string
  actionUrl?: string
  actionText?: string
  active: boolean
  startDate: string
  endDate?: string
}

interface PopupAdsProps {
  className?: string
}

export default function PopupAds({ className = '' }: PopupAdsProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [currentAd, setCurrentAd] = useState<PopupAd | null>(null)
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    console.log('🎯 PopupAds - pathname:', pathname)

    // Don't show popup ads on admin pages or admin login page
    if (pathname.startsWith('/admin')) {
      console.log('🎯 PopupAds - SKIPPING because pathname starts with /admin')
      return
    }

    console.log('🎯 PopupAds - Will show popup (not admin page)')

    const fetchAndShowAd = async () => {
      try {
        // Check if we've already shown a popup this session
        const sessionKey = 'popup_shown_session'
        const sessionShown = sessionStorage.getItem(sessionKey)

        if (sessionShown) {
          return // Don't show popup if already shown this session
        }

        const response = await fetch('/api/popup-ads/active')
        if (response.ok) {
          const ad = await response.json()

          if (ad) {
            // Show the active ad
            setCurrentAd(ad)

            // Delay showing popup by 3 seconds
            setTimeout(() => {
              setShowPopup(true)
              // Mark as shown for this session
              sessionStorage.setItem(sessionKey, 'true')

              // Record impression
              fetch(`/api/popup-ads/${ad.id}/impression`, { method: 'POST' })
            }, 3000)
          }
        }
      } catch (error) {
        console.error('Error fetching popup ads:', error)
      }
    }

    // Only show popup on initial page load
    const timer = setTimeout(fetchAndShowAd, 1000)

    return () => clearTimeout(timer)
  }, [pathname])

  const handleClose = () => {
    setShowPopup(false)
    setCurrentAd(null)
  }

  const handleAction = () => {
    if (currentAd?.actionUrl) {
      // Open URL IMMEDIATELY for instant response
      window.open(currentAd.actionUrl, '_blank', 'noopener,noreferrer')

      // Record click in background (non-blocking)
      fetch(`/api/popup-ads/${currentAd.id}/click`, { method: 'POST' })
        .catch(error => console.error('Error tracking popup click:', error))
    }
    handleClose()
  }

  if (!showPopup || !currentAd) {
    return null
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentAd.title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Image */}
          {currentAd.imageUrl && (
            <div className="mb-4">
              <img
                src={currentAd.imageUrl}
                alt={currentAd.title}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="text-gray-700 mb-6"
            dangerouslySetInnerHTML={{ __html: currentAd.content }}
          />

          {/* Actions */}
          <div className="flex gap-3">
            {currentAd.actionUrl && currentAd.actionText && (
              <button
                onClick={handleAction}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {currentAd.actionText}
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('popup.close', 'Close', 'மூடு')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



