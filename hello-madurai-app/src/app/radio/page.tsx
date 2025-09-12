'use client'

import { useState, useRef, useEffect } from 'react'
import { PlayIcon, PauseIcon, SpeakerWaveIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'
import AppWrapper from '@/components/AppWrapper'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Podcast {
  id: string
  title: string
  title_ta?: string
  description: string
  description_ta?: string
  host: string
  duration: string
  audioUrl: string
  featured: boolean
  plays: number
  publishedAt: string
}

function PodcastPageContent() {
  const { t } = useLanguage()
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [podcasts, setPodcasts] = useState<Podcast[]>([])
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch podcasts from database
  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const response = await fetch('/api/admin/podcasts')
        if (response.ok) {
          const data = await response.json()
          setPodcasts(data)
        } else {
          console.error('Failed to fetch podcasts')
        }
      } catch (error) {
        console.error('Error fetching podcasts:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPodcasts()
  }, [])




  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const playPodcast = (podcastId: string, audioUrl: string) => {
    if (currentlyPlaying === podcastId) {
      // Pause current podcast
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(null)
    } else {
      // Play new podcast
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setCurrentlyPlaying(podcastId)
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setCurrentlyPlaying(null)
    setCurrentTime(0)
  }

  const featuredPodcasts = podcasts.filter(podcast => podcast.featured)
  const regularPodcasts = podcasts.filter(podcast => !podcast.featured)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/fm-logo.jpg"
              alt="Hello Madurai FM"
              className="h-16 w-16 rounded-full object-cover mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                {t('podcast.title', 'Hello Madurai Podcasts', 'ஹலோ மதுரை பாட்காஸ்ட்கள்')}
              </h1>
            </div>
          </div>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {t('podcast.subtitle', 'Listen to local stories, interviews, and discussions', 'உள்ளூர் கதைகள், நேர்காணல்கள் மற்றும் விவாதங்களைக் கேளுங்கள்')}
          </p>
        </div>

        {/* Audio Player */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="hidden"
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t('podcast.loading', 'Loading podcasts...', 'பாட்காஸ்ட்கள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* Featured Podcasts */}
        {!loading && featuredPodcasts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('podcast.featured', 'Featured Podcasts', 'சிறப்பு பாட்காஸ்ட்கள்')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredPodcasts.map((podcast) => (
                <Card key={podcast.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <SpeakerWaveIcon className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {podcast.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                        {t('podcast.featured', 'Featured', 'சிறப்பு')}
                      </span>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(podcast.publishedAt)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {t(`podcast.${podcast.id}.title`, podcast.title, podcast.title_ta || '')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {t(`podcast.${podcast.id}.description`, podcast.description, podcast.description_ta || '')}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>{t('podcast.host', 'Host:', 'தொகுப்பாளர்:')} {podcast.host}</span>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {podcast.duration}
                        </div>
                        <span>{podcast.plays.toLocaleString()} {t('podcast.plays', 'plays', 'ஒலிப்பு')}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => playPodcast(podcast.id, podcast.audioUrl)}
                      className="w-full"
                    >
                      {currentlyPlaying === podcast.id ? (
                        <>
                          <PauseIcon className="h-4 w-4 mr-2" />
                          {t('podcast.pause', 'Pause', 'இடைநிறுத்து')}
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4 mr-2" />
                          {t('podcast.play', 'Play', 'ஒலிக்க')}
                        </>
                      )}
                    </Button>
                    {currentlyPlaying === podcast.id && (
                      <div className="mt-4 bg-gray-50 dark:bg-purple-800 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-purple-700 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Podcasts */}
        {!loading && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('podcast.allPodcasts', 'All Podcasts', 'அனைத்து பாட்காஸ்ட்கள்')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularPodcasts.map((podcast) => (
              <Card key={podcast.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
                <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <SpeakerWaveIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {podcast.duration}
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(podcast.publishedAt)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {podcast.plays.toLocaleString()} {t('podcast.plays', 'plays', 'ஒலிப்பு')}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {t(`podcast.${podcast.id}.title`, podcast.title, podcast.title_ta || '')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {t(`podcast.${podcast.id}.description`, podcast.description, podcast.description_ta || '')}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>{t('podcast.host', 'Host:', 'தொகுப்பாளர்:')} {podcast.host}</span>
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {podcast.duration}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => playPodcast(podcast.id, podcast.audioUrl)}
                    className="w-full"
                  >
                    {currentlyPlaying === podcast.id ? (
                      <>
                        <PauseIcon className="h-3 w-3 mr-1" />
                        {t('podcast.pause', 'Pause', 'இடைநிறுத்து')}
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-3 w-3 mr-1" />
                        {t('podcast.play', 'Play', 'ஒலிக்க')}
                      </>
                    )}
                  </Button>
                  {currentlyPlaying === podcast.id && (
                    <div className="mt-3 bg-gray-50 dark:bg-purple-800 rounded-lg p-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-purple-700 rounded-full h-1">
                        <div
                          className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        )}

        {/* Contact Info */}
        {!loading && (
        <div className="mt-12 text-center">
          <Card className="bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {t('podcast.contact', 'Contact Hello Madurai Podcasts', 'ஹலோ மதுரை பாட்காஸ்ட்கள் தொடர்பு')}
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('podcast.phone', 'Phone', 'தொலைபேசி')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">+91 452 123 4567</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('podcast.email', 'Email', 'மின்னஞ்சல்')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">podcasts@hellomadurai.com</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t('podcast.submit', 'Submit Your Podcast', 'உங்கள் பாட்காஸ்ட்டை சமர்ப்பிக்கவும்')}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">{t('podcast.submitDesc', 'Share your stories', 'உங்கள் கதைகளைப் பகிருங்கள்')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
      </div>
    </div>
  )
}

export default function PodcastPage() {
  return (
    <AppWrapper>
      <PodcastPageContent />
    </AppWrapper>
  )
}
