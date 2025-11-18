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
  description: string
  description_ta?: string
  videoUrl: string
  thumbnailUrl?: string
  category: string
  duration?: string
  views: number
  likes: number
  dislikes: number
  featured: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
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
  const [loading, setLoading] = useState(true)

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

  // Filter videos by category and search query
  const filteredVideos = videos.filter(video => {
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory
    const matchesSearch = searchQuery === '' || 
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.title_ta && video.title_ta.includes(searchQuery)) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description_ta && video.description_ta.includes(searchQuery))
    
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
            {filteredVideos.map((video) => {
              const youtubeId = getYouTubeId(video.videoUrl)
              const videoTitle = language === 'ta' && video.title_ta ? video.title_ta : video.title
              const videoDescription = language === 'ta' && video.description_ta ? video.description_ta : video.description

              return (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white border-gray-200">
                  {/* Video Thumbnail/Player */}
                  <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
                    {youtubeId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                        title={videoTitle}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        onLoad={() => handleVideoView(video.id)}
                      />
                    ) : video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={videoTitle}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <p>Video</p>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2" suppressHydrationWarning>
                      {videoTitle}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2" suppressHydrationWarning>
                      {videoDescription}
                    </p>

                    {/* Category Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                        {videoCategories.find(c => c.id === video.category)?.[language === 'ta' ? 'name_ta' : 'name'] || video.category}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
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


