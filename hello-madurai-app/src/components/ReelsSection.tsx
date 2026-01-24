'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PlayIcon, EyeIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'

interface Video {
  id: string
  title: string
  title_ta?: string
  videoUrl: string
  videoType: string
  thumbnailUrl?: string
  category: string
  duration?: string
  views: number
  likes: number
  featured: boolean
  publishedAt: string
}

export default function ReelsSection() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)
  const { language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      const response = await fetch('/api/videos')
      if (response.ok) {
        const data = await response.json()
        // Get latest 10 videos for reels
        setVideos(data.slice(0, 10))
      }
    } catch (error) {
      console.error('Error fetching videos:', error)
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

  const handleVideoClick = (video: Video) => {
    router.push(`/videos/${video.id}`)
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return videoId ? `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg` : null
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
                <div key={i} className="flex-shrink-0 w-64 h-80 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
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

        {videos.length > 0 ? (
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
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoClick(video)}
                  className="flex-shrink-0 w-64 cursor-pointer group"
                >
                  <div className="relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-gray-200">
                      <img
                        src={video.thumbnailUrl || (video.videoType === 'youtube' ? getYouTubeThumbnail(video.videoUrl) : '/placeholder-video.jpg')}
                        alt={language === 'ta' && video.title_ta ? video.title_ta : video.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-video.jpg'
                        }}
                      />
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white/90 rounded-full p-3">
                          <PlayIcon className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>

                      {/* Duration badge */}
                      {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {video.duration}
                        </div>
                      )}
                    </div>

                    {/* Video info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                        {language === 'ta' && video.title_ta ? video.title_ta : video.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-3 h-3" />
                          <span>{formatViews(video.views)}</span>
                        </div>
                        <span className="capitalize">{video.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <TranslatedText className="text-gray-500" tamil="வீடியோக்கள் இல்லை">
              No videos available
            </TranslatedText>
          </div>
        )}
      </div>
    </div>
  )
}
