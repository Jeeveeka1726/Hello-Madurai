'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlayIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'
import VideoPlayerModal from '@/components/VideoPlayerModal'

interface Reel {
  id: string
  title: string
  title_ta?: string
  videoUrl: string
  reelType: string
  thumbnailUrl?: string
  duration?: string
  views: number
  likes: number
  active: boolean
  orderNumber: number
  publishedAt: string
}

export default function ReelsSection() {
  const [reels, setReels] = useState<Reel[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const { language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    fetchReels()
  }, [])

  const fetchReels = async () => {
    try {
      const response = await fetch('/api/reels?active=true', {
        next: { revalidate: 300 } // Cache for 5 minutes
      })
      if (response.ok) {
        const data = await response.json()
        setReels(data)
      }
    } catch (error) {
      console.error('Error fetching reels:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollLeft = () => {
    const container = document.getElementById('reels-container')
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    const container = document.getElementById('reels-container')
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const handleReelClick = (reel: Reel) => {
    // Open video in modal player
    setSelectedReel(reel)
    setIsPlayerOpen(true)

    // Increment view count
    fetch(`/api/reels/${reel.id}/view`, { method: 'POST' }).catch(() => {})
  }

  const handleClosePlayer = () => {
    setIsPlayerOpen(false)
    setSelectedReel(null)
  }

  const handleNextReel = () => {
    if (!selectedReel) return
    const currentIndex = reels.findIndex(r => r.id === selectedReel.id)
    if (currentIndex < reels.length - 1) {
      const nextReel = reels[currentIndex + 1]
      setSelectedReel(nextReel)
      // Increment view count for next reel
      fetch(`/api/reels/${nextReel.id}/view`, { method: 'POST' }).catch(() => {})
    }
  }

  const handlePreviousReel = () => {
    if (!selectedReel) return
    const currentIndex = reels.findIndex(r => r.id === selectedReel.id)
    if (currentIndex > 0) {
      const previousReel = reels[currentIndex - 1]
      setSelectedReel(previousReel)
      // Increment view count for previous reel
      fetch(`/api/reels/${previousReel.id}/view`, { method: 'POST' }).catch(() => {})
    }
  }

  const getCurrentReelIndex = () => {
    if (!selectedReel) return -1
    return reels.findIndex(r => r.id === selectedReel.id)
  }

  const getThumbnailUrl = (reel: Reel) => {
    // Only use manually uploaded thumbnails from DB
    if (reel.thumbnailUrl) {
      return reel.thumbnailUrl
    }

    // No auto-generation - use placeholder if no thumbnail uploaded
    return '/placeholder-video.jpg'
  }

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  if (loading) {
    return (
      <div className="bg-gray-50 border-t-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-8"></div>
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48 bg-gray-300 rounded-lg" style={{ height: '400px' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gray-50 border-t-2 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 mb-2 sm:mb-3 leading-tight">
              <span suppressHydrationWarning>
                {language === 'ta' ? 'சமீபத்திய வீடியோக்கள்' : 'Latest Reels'}
              </span>
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 font-semibold mb-4 sm:mb-6 mx-auto leading-tight" style={{ maxWidth: '95%' }}>
              <span suppressHydrationWarning>
                {language === 'ta' ? 'சமீபத்திய ரீல்ஸ்களைப் பார்க்கவும்' : 'Watch latest reels from Madurai'}
              </span>
            </p>
          </div>

        {reels.length > 0 ? (
          <div className="relative">
            {/* Scroll buttons */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>

            {/* Reels container */}
            <div
              id="reels-container"
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {reels.map((reel) => (
                <div
                  key={reel.id}
                  onClick={() => handleReelClick(reel)}
                  className="flex-shrink-0 cursor-pointer group"
                  style={{ width: '160px' }}
                >
                  {/* Card with thumbnail covering entire area */}
                  <div
                    className="relative bg-gray-200 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                    style={{ width: '160px', height: '280px' }}
                  >
                    {/* Thumbnail - Full coverage */}
                    <img
                      src={getThumbnailUrl(reel) || '/placeholder-video.jpg'}
                      alt={language === 'ta' && reel.title_ta ? reel.title_ta : reel.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        // Fallback to placeholder SVG
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjI4MCIgdmlld0JveD0iMCAwIDE2MCAyODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNjAiIGhlaWdodD0iMjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAyMDBMMTAwIDE4MEwxMDAgMjIwTDYwIDIwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHR4dCB4PSI4MCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPk5vIFRodW1ibmFpbDwvdGV4dD4KPC9zdmc+'
                      }}
                    />

                    {/* Dark gradient overlay at bottom for text readability */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent h-24"></div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-white/90 rounded-full p-3">
                        <PlayIcon className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    {/* Reel type badge */}
                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {reel.reelType.toUpperCase()}
                    </div>

                    {/* Duration badge */}
                    {reel.duration && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {reel.duration}
                      </div>
                    )}

                    {/* Reel info - Overlaid at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
                      <h3 className="font-semibold mb-1 line-clamp-2 text-xs leading-tight">
                        {language === 'ta' && reel.title_ta ? reel.title_ta : reel.title}
                      </h3>

                      <div className="flex items-center gap-2 text-xs opacity-90">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-3 h-3" />
                          <span>{formatViews(reel.views)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* View All Reels Card */}
              <div
                onClick={() => window.open('https://www.youtube.com/@hellomadurai/shorts', '_blank')}
                className="flex-shrink-0 cursor-pointer group"
                style={{ width: '160px' }}
              >
                <div
                  className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                  style={{ width: '160px', height: '280px' }}
                >
                  <div className="text-center text-white">
                    <PlayIcon className="w-12 h-12 mx-auto mb-3 opacity-80" />
                    <div className="text-lg font-semibold mb-2">
                      <TranslatedText tamil="அனைத்து ரீல்கள்">View All</TranslatedText>
                    </div>
                    <div className="text-sm opacity-90">
                      <TranslatedText tamil="மேலும் ரீல்கள்">More Reels</TranslatedText>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <TranslatedText className="text-gray-500" tamil="ரீல்கள் இல்லை">
              No reels available
            </TranslatedText>
          </div>
        )}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedReel && (
        <VideoPlayerModal
          isOpen={isPlayerOpen}
          onClose={handleClosePlayer}
          videoUrl={selectedReel.videoUrl}
          videoType={selectedReel.reelType as 'youtube' | 'instagram' | 'upload'}
          title={language === 'ta' && selectedReel.title_ta ? selectedReel.title_ta : selectedReel.title}
          onNext={handleNextReel}
          onPrevious={handlePreviousReel}
          hasNext={getCurrentReelIndex() < reels.length - 1}
          hasPrevious={getCurrentReelIndex() > 0}
        />
      )}
    </>
  )
}
