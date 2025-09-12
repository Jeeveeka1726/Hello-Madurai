'use client'

import { useEffect, useRef } from 'react'
import { ADSENSE_CONFIG, shouldShowAds, getAdSlot } from '@/config/adsense'

interface GoogleAdsenseProps {
  adSlot: string
  adFormat?: string
  fullWidthResponsive?: boolean
  style?: React.CSSProperties
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function GoogleAdsense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' },
  className = ''
}: GoogleAdsenseProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && adRef.current && !hasInitialized.current) {
        const insElement = adRef.current.querySelector('ins.adsbygoogle')
        
        // Only push to adsbygoogle if this specific ad hasn't been initialized
        if (insElement && !insElement.getAttribute('data-adsbygoogle-status')) {
          (window.adsbygoogle = window.adsbygoogle || []).push({})
          hasInitialized.current = true
        }
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // Don't render ads in development unless explicitly enabled
  if (!shouldShowAds()) {
    return (
      <div className={`adsense-placeholder ${className} border-2 border-dashed border-gray-300 dark:border-gray-600 p-4 text-center`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          📢 Ad Space - Will show after AdSense approval
        </p>
      </div>
    )
  }

  return (
    <div ref={adRef} className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={ADSENSE_CONFIG.publisherId}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  )
}

// Banner Ad Component
export function BannerAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAdsense
      adSlot={getAdSlot('homeBanner')}
      adFormat="horizontal"
      className={`my-4 ${className}`}
      style={{ display: 'block', textAlign: 'center' }}
    />
  )
}

// Square Ad Component
export function SquareAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAdsense
      adSlot={getAdSlot('sidebarSquare')}
      adFormat="rectangle"
      className={`my-4 ${className}`}
      style={{ display: 'block', width: '300px', height: '250px' }}
    />
  )
}

// In-Article Ad Component
export function InArticleAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAdsense
      adSlot={getAdSlot('inArticle')}
      adFormat="fluid"
      className={`my-6 ${className}`}
      style={{ display: 'block', textAlign: 'center' }}
    />
  )
}

// Responsive Ad Component
export function ResponsiveAd({ className = '' }: { className?: string }) {
  return (
    <GoogleAdsense
      adSlot={getAdSlot('responsive')}
      adFormat="auto"
      fullWidthResponsive={true}
      className={`my-4 ${className}`}
      style={{ display: 'block' }}
    />
  )
}
