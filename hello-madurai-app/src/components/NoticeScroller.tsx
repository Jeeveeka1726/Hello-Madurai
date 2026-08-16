'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Notice {
  id: string
  titleEn: string
  titleTa?: string
  descriptionEn: string
  descriptionTa?: string
  imageUrl?: string
  mobileImageUrl?: string
  link?: string
  active: boolean
  orderNumber: number
}

export default function NoticeScroller() {
  const { language } = useLanguage()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)

  // Default sample notices
  const defaultNotices: Notice[] = [
    {
      id: 'default-1',
      titleEn: 'Welcome to Hello Madurai',
      titleTa: 'ஹலோ மதுரைக்கு வரவேற்கிறோம்',
      descriptionEn: 'Your trusted source for local news, events, and information',
      descriptionTa: 'உள்ளூர் செய்திகள், நிகழ்வுகள் மற்றும் தகவல்களுக்கான உங்கள் நம்பகமான ஆதாரம்',
      active: true,
      orderNumber: 0
    },
    {
      id: 'default-2',
      titleEn: 'Breaking News',
      titleTa: 'முக்கிய செய்தி',
      descriptionEn: 'Stay updated with the latest news from Madurai',
      descriptionTa: 'மதுரையின் சமீபத்திய செய்திகளுடன் புதுப்பித்திருங்கள்',
      active: true,
      orderNumber: 1
    },
    {
      id: 'default-3',
      titleEn: 'Digital FM Radio',
      titleTa: 'டிஜிட்டல் எஃப்.எம் வானொலி',
      descriptionEn: 'Listen to our Digital FM radio station 24/7',
      descriptionTa: '24/7 எங்கள் டிஜிட்டல் எஃப்.எம் வானொலி நிலையத்தை கேளுங்கள்',
      active: true,
      orderNumber: 2
    }
  ]

  // Fetch notices from API - only once on mount
  useEffect(() => {
    let isMounted = true

    const fetchNotices = async () => {
      try {
        const response = await fetch('/api/notice-banners', {
          cache: 'force-cache',
        })

        if (!isMounted) return

        if (response.ok) {
          const data = await response.json()
          const activeNotices = data.length > 0 ? data : defaultNotices

          if (isMounted) {
            setNotices(activeNotices)
            setLoading(false)
          }

          // Aggressively preload images - create <link> tags for instant loading
          if (typeof window !== 'undefined') {
            activeNotices.forEach((notice: Notice) => {
              // Preload mobile images first (priority for mobile)
              if (notice.mobileImageUrl) {
                const link = document.createElement('link')
                link.rel = 'preload'
                link.as = 'image'
                link.href = notice.mobileImageUrl
                link.fetchPriority = 'high'
                document.head.appendChild(link)

                // Also create img object for browser cache
                const img = new Image()
                img.src = notice.mobileImageUrl
              }
              if (notice.imageUrl) {
                const link = document.createElement('link')
                link.rel = 'preload'
                link.as = 'image'
                link.href = notice.imageUrl
                document.head.appendChild(link)

                const img = new Image()
                img.src = notice.imageUrl
              }
            })
          }
        } else {
          if (isMounted) {
            setNotices(defaultNotices)
            setLoading(false)
          }
        }
      } catch (error) {
        console.error('Error fetching notice banners:', error)
        if (isMounted) {
          setNotices(defaultNotices)
          setLoading(false)
        }
      }
    }

    fetchNotices()

    return () => {
      isMounted = false
    }
  }, [])

  // Auto-scroll every 6 seconds
  useEffect(() => {
    if (notices.length === 0 || notices.length === 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % notices.length)
    }, 6000) // Auto-scroll every 6 seconds

    return () => clearInterval(interval)
  }, [notices.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + notices.length) % notices.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % notices.length)
  }

  if (loading) {
    return null // Don't show while loading
  }

  if (notices.length === 0) {
    return null // Don't show if no notices at all
  }

  const currentNotice = notices[currentIndex]

  const NoticeContent = () => {
    // Choose appropriate image based on screen size
    const hasImages = currentNotice.imageUrl || currentNotice.mobileImageUrl

    // Use picture element with srcset for proper responsive image handling
    const desktopImage = currentNotice.imageUrl || currentNotice.mobileImageUrl
    const mobileImage = currentNotice.mobileImageUrl || currentNotice.imageUrl

    return (
      <>
        {hasImages ? (
          <div className="w-full overflow-hidden rounded-2xl relative">
            {/* Render all images but only show the current one - prevents blinking */}
            {notices.map((notice, idx) => {
              const noticeDesktopImage = notice.imageUrl || notice.mobileImageUrl
              const noticeMobileImage = notice.mobileImageUrl || notice.imageUrl

              return (
                <picture
                  key={notice.id}
                  className={`${
                    idx === currentIndex
                      ? 'opacity-100 relative z-[1]'
                      : 'opacity-0 absolute inset-0 z-0 pointer-events-none'
                  } transition-opacity duration-700 ease-in-out`}
                >
                  {/* Desktop Image - shown on screens >= 768px */}
                  {notice.imageUrl && (
                    <source
                      media="(min-width: 768px)"
                      srcSet={notice.imageUrl}
                    />
                  )}

                  {/* Mobile Image - fallback and shown on screens < 768px */}
                  <img
                    src={noticeMobileImage}
                    alt={language === 'ta' && notice.titleTa ? notice.titleTa : notice.titleEn}
                    className="w-full h-auto block"
                    loading="eager"
                    fetchPriority={idx === 0 ? "high" : "low"}
                    decoding="async"
                    style={{
                      imageRendering: '-webkit-optimize-contrast',
                      backfaceVisibility: 'hidden',
                      transform: 'translateZ(0)',
                      WebkitTransform: 'translateZ(0)',
                      willChange: 'opacity'
                    }}
                  />
                </picture>
              )
            })}
          </div>
        ) : (
          <div className="transition-all duration-500 ease-in-out py-4 px-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              {language === 'ta' && currentNotice.titleTa ? currentNotice.titleTa : currentNotice.titleEn}
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100">
              {language === 'ta' && currentNotice.descriptionTa ? currentNotice.descriptionTa : currentNotice.descriptionEn}
            </p>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="w-full py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-2xl shadow-xl relative overflow-hidden ${
            !(currentNotice.imageUrl || currentNotice.mobileImageUrl)
              ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800'
              : ''
          }`}
        >

          {(currentNotice.imageUrl || currentNotice.mobileImageUrl) ? (
            // Image Banner Layout - Full Width (No blue background)
            <>
              <div className="relative w-full">
                <NoticeContent />

                {/* Navigation Buttons Overlaid on Image - higher z-index to be above overlay */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors duration-200 backdrop-blur-sm z-20"
                  aria-label="Previous notice"
                >
                  <ChevronLeftIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </button>

                <button
                  onClick={goToNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors duration-200 backdrop-blur-sm z-20"
                  aria-label="Next notice"
                >
                  <ChevronRightIcon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </button>
              </div>

              {/* Indicator Dots */}
              {notices.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center space-x-2 z-10">
                  {notices.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? 'bg-white w-10'
                          : 'bg-white/40 hover:bg-white/60'
                      }`}
                      aria-label={`Go to notice ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            // Text Banner Layout - Fixed aspect ratio with blue background
            <>
              {/* Decorative background elements */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
              </div>

              <div className="relative w-full h-60 sm:h-64 md:h-72 flex items-center px-6 sm:px-8 lg:px-12">
                {/* Previous Button */}
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm z-10"
                  aria-label="Previous notice"
                >
                  <ChevronLeftIcon className="w-7 h-7 text-white" />
                </button>

                {/* Notice Content - Centered */}
                <div className="w-full text-center">
                  <NoticeContent />
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm z-10"
                  aria-label="Next notice"
                >
                  <ChevronRightIcon className="w-7 h-7 text-white" />
                </button>

                {/* Indicator Dots - Bottom Center */}
                {notices.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center space-x-2 z-10">
                    {notices.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          index === currentIndex
                            ? 'bg-white w-10'
                            : 'bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Go to notice ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
