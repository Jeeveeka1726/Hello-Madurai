'use client'

import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Video {
  id: string
  title: string
  title_ta?: string
  videoUrl: string
  videoType: string // "upload" or "youtube"
  thumbnailUrl?: string
  category: string
  orderNumber: number
  duration?: string
  views: number
  likes: number
  dislikes: number
  featured: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}

interface Ad {
  id: string
  title: string
  title_ta?: string
  imageUrl?: string
  htmlCode?: string
  link?: string
  active: boolean
  position: number
  category?: string
}

// Video categories
const videoCategories = [
  { id: 'all', name: 'All Videos', name_ta: 'அனைத்து வீடியோக்கள்' },
  { id: 'agri', name: 'Agri', name_ta: 'விவசாயம்' },
  { id: 'art', name: 'Art', name_ta: 'கலை' },
  { id: 'business', name: 'Business', name_ta: 'வணிகம்' },
  { id: 'cinema', name: 'Cinema', name_ta: 'சினிமா' },
  { id: 'education', name: 'Education', name_ta: 'கல்வி' },
  { id: 'food', name: 'Food', name_ta: 'உணவு' },
  { id: 'game', name: 'Game', name_ta: 'விளையாட்டு' },
  { id: 'heritage', name: 'Heritage', name_ta: 'பாரம்பரியம்' },
  { id: 'temple', name: 'Temple', name_ta: 'கோவில்' },
  { id: 'tourism', name: 'Tourism', name_ta: 'சுற்றுலா' },
  { id: 'pets', name: 'Pets', name_ta: 'செல்லப்பிராணிகள்' },
  { id: 'jallikattu', name: 'Jallikattu', name_ta: 'ஜல்லிக்கட்டு' },
  { id: 'medical', name: 'Medical', name_ta: 'மருத்துவம்' },
  { id: 'fitness', name: 'Fitness', name_ta: 'உடற்பயிற்சி' },
  { id: 'motors', name: 'Motors', name_ta: 'வாகனங்கள்' },
  { id: 'music', name: 'Music', name_ta: 'இசை' },
  { id: 'social', name: 'Social', name_ta: 'சமூகம்' }
]

function VideosPageContent() {
  const { t, language } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [videos, setVideos] = useState<Video[]>([])
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null)

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos')
        if (response.ok) {
          const data = await response.json()
          setVideos(data)
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  // Fetch ads for videos section
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads/active?category=videos')
        if (response.ok) {
          const data = await response.json()
          setAds(data)

          // Track impressions for each ad
          data.forEach((ad: Ad) => {
            fetch(`/api/ads/${ad.id}/impression`, { method: 'POST' }).catch(() => {})
          })
        }
      } catch (error) {
        console.error('Error fetching ads:', error)
      }
    }

    fetchAds()
  }, [])

  // Filter videos by category and search query
  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    const matchesSearch = searchQuery === '' ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.title_ta && video.title_ta.includes(searchQuery))

    return matchesCategory && matchesSearch
  })

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null
    
    try {
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1])
        return urlParams.get('v')
      } else if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1]?.split(/[?#]/)[0] || null
      } else if (url.includes('youtube.com/embed/')) {
        return url.split('embed/')[1]?.split(/[?#]/)[0] || null
      } else if (url.includes('youtube.com/shorts/')) {
        return url.split('shorts/')[1]?.split(/[?#]/)[0] || null
      } else if (url.length === 11 && !url.includes('/')) {
        return url
      }
    } catch (error) {
      console.error('Error extracting YouTube ID:', error)
    }
    
    return null
  }

  // Increment view count
  const handleVideoView = async (videoId: string) => {
    try {
      await fetch(`/api/videos/${videoId}/view`, { method: 'POST' })
    } catch (error) {
      console.error('Error incrementing view:', error)
    }
  }

  // Handle play button click for YouTube videos
  const handlePlayClick = (videoId: string) => {
    setPlayingVideoId(videoId)
    handleVideoView(videoId)
  }

  // Get YouTube thumbnail URL
  const getYouTubeThumbnail = (youtubeId: string): string => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
  }

  // Handle ad click
  const handleAdClick = async (adId: string, link: string) => {
    try {
      await fetch(`/api/ads/${adId}/click`, { method: 'POST' })
      window.open(link, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error tracking ad click:', error)
    }
  }

  // Render ad component
  const renderAd = (ad: Ad, index: number) => {
    const adTitle = language === 'ta' && ad.title_ta ? ad.title_ta : ad.title

    if (ad.htmlCode) {
      // HTML/AdSense code
      return (
        <div key={`ad-${ad.id}-${index}`} className="col-span-full my-8">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-400 shadow-lg">
            <p className="text-xs text-blue-700 mb-4 text-center font-bold">
              📢 {language === 'ta' ? 'விளம்பரம்' : 'Advertisement'}
            </p>
            <div dangerouslySetInnerHTML={{ __html: ad.htmlCode }} />
          </div>
        </div>
      )
    } else if (ad.imageUrl) {
      // Image ad with optional link
      return (
        <div key={`ad-${ad.id}-${index}`} className="col-span-full my-8">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-400 shadow-lg">
            <p className="text-xs text-blue-700 mb-4 text-center font-bold">
              📢 {language === 'ta' ? 'விளம்பரம்' : 'Advertisement'}
            </p>
            {ad.link ? (
              <div
                onClick={() => handleAdClick(ad.id, ad.link!)}
                className="cursor-pointer hover:opacity-90 transition-opacity"
              >
                <img
                  src={ad.imageUrl}
                  alt={adTitle}
                  className="w-full h-auto rounded-lg shadow-md max-w-4xl mx-auto"
                  onError={(e) => {
                    e.currentTarget.parentElement!.parentElement!.style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <img
                src={ad.imageUrl}
                alt={adTitle}
                className="w-full h-auto rounded-lg shadow-md max-w-4xl mx-auto"
                onError={(e) => {
                  e.currentTarget.parentElement!.parentElement!.style.display = 'none'
                }}
              />
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Search Box */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder={t('videos.search', 'Search videos...', 'வீடியோக்களைத் தேடுங்கள்...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-4 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4" suppressHydrationWarning>
            {t('videos.categories', 'Categories', 'வகைகள்')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {videoCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                suppressHydrationWarning
              >
                {language === 'ta' ? category.name_ta : category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">{t('videos.loading', 'Loading videos...', 'வீடியோக்கள் ஏற்றப்படுகின்றன...')}</p>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              {searchQuery
                ? t('videos.noResults', 'No videos found matching your search', 'உங்கள் தேடலுக்கு பொருந்தும் வீடியோக்கள் இல்லை')
                : selectedCategory === 'all'
                ? t('videos.noVideos', 'No videos available at the moment', 'தற்போது வீடியோக்கள் எதுவும் இல்லை')
                : t('videos.noVideosInCategory', 'No videos in this category', 'இந்த வகையில் வீடியோக்கள் இல்லை')
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video, index) => {
              const videoTitle = language === 'ta' && video.title_ta ? video.title_ta : video.title
              const isYouTube = video.videoType === 'youtube'
              const youtubeId = isYouTube ? getYouTubeId(video.videoUrl) : null

              // Insert ad after every 6 videos (2 rows of 3)
              const shouldShowAd = (index + 1) % 6 === 0 && ads.length > 0
              const adIndex = Math.floor(index / 6) % ads.length

              return (
                <>
                  <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-gray-200">
                    {/* Video Player */}
                    <div className="relative bg-black" style={{ aspectRatio: '16/9', maxHeight: '500px' }}>
                      {isYouTube && youtubeId ? (
                        playingVideoId === video.id ? (
                          // Show YouTube iframe when playing
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                            title={videoTitle}
                            className="w-full h-full object-contain"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        ) : (
                          // Show thumbnail with custom play button
                          <div
                            className="relative w-full h-full cursor-pointer group"
                            onClick={() => handlePlayClick(video.id)}
                          >
                            <img
                              src={video.thumbnailUrl || getYouTubeThumbnail(youtubeId)}
                              alt={videoTitle}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                // Fallback to default YouTube thumbnail if custom fails
                                e.currentTarget.src = getYouTubeThumbnail(youtubeId)
                              }}
                            />
                            {/* Custom Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
                              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                                <svg
                                  className="w-10 h-10 text-white ml-1"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        )
                      ) : video.videoType === 'upload' && video.videoUrl ? (
                        <video
                          controls
                          className="w-full h-full object-contain"
                          onPlay={() => handleVideoView(video.id)}
                          poster={video.thumbnailUrl}
                        >
                          <source src={video.videoUrl} type="video/mp4" />
                          <source src={video.videoUrl} type="video/webm" />
                          <source src={video.videoUrl} type="video/ogg" />
                          Your browser does not support the video tag.
                        </video>
                      ) : video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={videoTitle}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <p>Video</p>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2" suppressHydrationWarning>
                        {videoTitle}
                      </h3>

                      {/* Category Badge & Stats */}
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                          {videoCategories.find(c => c.id === video.category)?.[language === 'ta' ? 'name_ta' : 'name'] || video.category}
                        </span>

                        <div className="flex items-center space-x-3 text-sm text-gray-500">
                          <div className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            <span>{video.views}</span>
                          </div>
                          {video.duration && (
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              <span>{video.duration}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Show ad after every 6 videos */}
                  {shouldShowAd && renderAd(ads[adIndex], adIndex)}
                </>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default function VideosPage() {
  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      <VideosPageContent />
    </div>
  )
}


