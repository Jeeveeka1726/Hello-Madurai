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

    // Auto-refresh reels every 30 seconds to get latest updates
    const interval = setInterval(() => {
      fetchReels()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchReels = async () => {
    try {
      const response = await fetch('/api/reels?active=true', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched reels:', data)
        data.forEach((reel: Reel) => {
          console.log(`Reel ${reel.id}:`, {
            title: reel.title,
            reelType: reel.reelType,
            videoUrl: reel.videoUrl,
            thumbnailUrl: reel.thumbnailUrl,
            generatedThumbnail: getThumbnailUrl(reel)
          })
        })
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

  const getYouTubeThumbnail = (url: string) => {
    if (!url) return null
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
    if (videoId && videoId[1]) {
      return `https://img.youtube.com/vi/${videoId[1]}/hqdefault.jpg`
    }
    return null
  }

  const getThumbnailUrl = (reel: Reel) => {
    // Priority: 1. thumbnailUrl from DB, 2. Auto-generate from YouTube, 3. Placeholder
    if (reel.thumbnailUrl) {
      return reel.thumbnailUrl
    }

    if (reel.reelType === 'youtube' && reel.videoUrl) {
      return getYouTubeThumbnail(reel.videoUrl)
    }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <TranslatedText as="h2" className="text-3xl font-bold text-gray-900 mb-4" tamil="சமீபத்திய வீடியோக்கள்">
              Latest Reels
            </TranslatedText>
            <TranslatedText as="p" className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto" tamil="மதுரையின் சமீபத்திய வீடியோக்கள் மற்றும் ரீல்ஸ்களைப் பார்க்கவும்">
              Watch the latest videos and reels from Madurai
            </TranslatedText>
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
                  className="flex-shrink-0 w-44 cursor-pointer group"
                >
                  <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    {/* Thumbnail - Instagram Reel 9:16 aspect ratio */}
                    <div className="relative bg-gray-200 w-full" style={{ aspectRatio: '9/16' }}>
                      <img
                        src={getThumbnailUrl(reel) || '/placeholder-video.jpg'}
                        alt={language === 'ta' && reel.title_ta ? reel.title_ta : reel.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          console.log('Thumbnail failed to load for reel:', reel.id, 'URL:', target.src)
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTgwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDE4MCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxODAiIGhlaWdodD0iMzIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik03MCAyMDBMMTEwIDE4MEwxMTAgMjIwTDcwIDIwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHR4dCB4PSI5MCIgeT0iMjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiPk5vIFRodW1ibmFpbDwvdGV4dD4KPC9zdmc+'
                        }}
                      />
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/90 rounded-full p-3">
                          <PlayIcon className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>

                      {/* Duration badge */}
                      {reel.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {reel.duration}
                        </div>
                      )}

                      {/* Reel type badge */}
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {reel.reelType.toUpperCase()}
                      </div>
                    </div>

                    {/* Reel info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-xs leading-tight">
                        {language === 'ta' && reel.title_ta ? reel.title_ta : reel.title}
                      </h3>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-3 h-3" />
                          <span className="text-xs">{formatViews(reel.views)}</span>
                        </div>
                        <span className="capitalize text-xs truncate ml-1">{reel.reelType}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* View All Reels Card */}
              <div
                onClick={() => router.push('/videos')}
                className="flex-shrink-0 w-44 cursor-pointer group"
              >
                <div className="relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center w-full" style={{ aspectRatio: '9/16' }}>
                    <div className="text-center text-white">
                      <PlayIcon className="w-12 h-12 mx-auto mb-2 opacity-80" />
                      <div className="text-lg font-semibold">
                        <TranslatedText tamil="அனைத்து ரீல்கள்">View All</TranslatedText>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 text-white">
                    <h3 className="font-semibold text-xs mb-1 leading-tight">
                      <TranslatedText tamil="மேலும் ரீல்கள்">
                        More Reels
                      </TranslatedText>
                    </h3>
                    <div className="text-xs opacity-80 leading-tight">
                      <TranslatedText tamil="அனைத்தும் பார்க்க">
                        View All
                      </TranslatedText>
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
        />
      )}
    </>
  )
}
