'use client'

import { useEffect } from 'react'

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
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX" // Replace with your AdSense publisher ID
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
      adSlot="1234567890" // Replace with your ad slot ID
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
      adSlot="0987654321" // Replace with your ad slot ID
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
      adSlot="1122334455" // Replace with your ad slot ID
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
      adSlot="5566778899" // Replace with your ad slot ID
      adFormat="auto"
      fullWidthResponsive={true}
      className={`my-4 ${className}`}
      style={{ display: 'block' }}
    />
  )
}
