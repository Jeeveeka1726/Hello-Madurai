'use client'

import { useState, useEffect } from 'react'
import { PlayIcon, EyeIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Video {
  id: string
  title: string
  title_ta?: string
  description: string
  description_ta?: string
  videoUrl: string
  youtubeId?: string
  thumbnail?: string
  category: string
  duration?: string
  views: number
  featured: boolean
  publishedAt: string
}

function VideosPageContent() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch videos from database
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        console.log('Fetching videos from API...')
        const response = await fetch('/api/admin/videos')
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched videos data:', data)
          setVideos(data)
        } else {
          console.error('Failed to fetch videos, status:', response.status)
        }
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  // Variables will be defined later after categories

  // No hardcoded videos - all data comes from database
  const fallbackVideos = []

  const categories = [
    { id: 'all', name: t('videos.categories.all', 'All Videos', 'அனைத்து வீடியோக்கள்') },
    { id: 'business', name: t('videos.categories.business', 'Business', 'வணிகம்') },
    { id: 'agriculture', name: t('videos.categories.agriculture', 'Agriculture', 'விவசாயம்') },
    { id: 'cultural', name: t('videos.categories.cultural', 'Cultural', 'கலாச்சாரம்') },
    { id: 'medical', name: t('videos.categories.medical', 'Medical', 'மருத்துவம்') },
    { id: 'pets', name: t('videos.categories.pets', 'Pets', 'செல்லப்பிராணிகள்') }
  ]

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory)

  const featuredVideos = filteredVideos.filter(video => video.featured)
  const regularVideos = filteredVideos.filter(video => !video.featured)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const playVideo = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')
  }

  const getYouTubeThumbnail = (youtubeId?: string) => {
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    }
    return '/placeholder-video.jpg'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t('videos.title', 'Videos', 'வீடியோக்கள்')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {t('videos.subtitle', 'Watch local content about Madurai and surrounding areas', 'மதுரை மற்றும் சுற்றுவட்டார பகுதிகளைப் பற்றிய உள்ளூர் உள்ளடக்கத்தைப் பார்க்கவும்')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t('videos.loading', 'Loading videos...', 'வீடியோக்கள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* Category Filter */}
        {!loading && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "primary" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id 
                  ? "bg-primary-600 text-white" 
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
        )}

        {/* Featured Videos */}
        {!loading && (
          <>
            {featuredVideos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('videos.featured', 'Featured Videos', 'சிறப்பு வீடியோக்கள்')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredVideos.map((video) => (
                <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="relative aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 cursor-pointer" onClick={() => playVideo(video.youtubeId)}>
                    <img
                      src={getYouTubeThumbnail(video.youtubeId)}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-video.jpg'
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all">
                      <div className="bg-red-600 rounded-full p-4 hover:bg-red-700 transition-all">
                        <PlayIcon className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                        {t('videos.featured', 'Featured', 'சிறப்பு')}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {t(`videos.categories.${video.category}`, video.category, video.category)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {t(`videos.${video.id}.title`, video.title, video.title_ta)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {t(`videos.${video.id}.description`, video.description, video.description_ta)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {video.views.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(video.publishedAt)}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {video.duration}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => playVideo(video.youtubeId)} className="w-full">
                      <PlayIcon className="h-4 w-4 mr-2" />
                      {t('videos.watch', 'Watch Video', 'வீடியோ பார்க்க')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Videos */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {selectedCategory === 'all' 
              ? t('videos.allVideos', 'All Videos', 'அனைத்து வீடியோக்கள்')
              : categories.find(cat => cat.id === selectedCategory)?.name
            }
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(selectedCategory === 'all' ? regularVideos : filteredVideos).map((video) => (
              <Card key={video.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="relative aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700 cursor-pointer" onClick={() => playVideo(video.youtubeId)}>
                  <div className="flex items-center justify-center">
                    <div className="bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-70 transition-all">
                      <PlayIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {t(`videos.categories.${video.category}`, video.category, video.category)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(video.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {t(`videos.${video.id}.title`, video.title, video.title_ta)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {t(`videos.${video.id}.description`, video.description, video.description_ta)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      {video.views.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {video.duration}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => playVideo(video.youtubeId)} className="w-full">
                    <PlayIcon className="h-3 w-3 mr-1" />
                    {t('videos.watch', 'Watch', 'பார்க்க')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* No videos message */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('videos.noVideos', 'No videos found in this category', 'இந்த வகையில் வீடியோக்கள் எதுவும் கிடைக்கவில்லை')}
            </p>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  )
}

export default function VideosPage() {
  return (
    <div>
      <NewHeader />
      <VideosPageContent />
    </div>
  )
}
