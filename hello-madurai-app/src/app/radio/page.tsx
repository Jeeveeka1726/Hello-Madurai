'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  ClockIcon,
  CalendarIcon,
  FolderIcon,
  ChevronRightIcon,
  MicrophoneIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface RadioFolder {
  id: string
  name: string
  name_ta?: string
  description?: string
  description_ta?: string
  coverImage?: string
  featured: boolean
  radioShows: RadioShow[]
}

interface RadioShow {
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
  folderId: string
}

function RadioPageContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [radioFolders, setRadioFolders] = useState<RadioFolder[]>([])
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch radio folders and shows from database
  useEffect(() => {
    const fetchRadioData = async () => {
      try {
        const response = await fetch('/api/radio/folders')
        if (response.ok) {
          const data = await response.json()
          setRadioFolders(data)
        } else {
          console.error('Failed to fetch radio data')
        }
      } catch (error) {
        console.error('Error fetching radio data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRadioData()
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

  const playRadioShow = (showId: string, audioUrl: string) => {
    if (currentlyPlaying === showId) {
      // Pause current show
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setCurrentlyPlaying(null)
    } else {
      // Play new show
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        setCurrentlyPlaying(showId)
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

  // Get all shows from all folders
  const allShows = radioFolders.flatMap(folder => folder.radioShows)
  const featuredShows = allShows.filter(show => show.featured)
  const regularShows = allShows.filter(show => !show.featured)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img
              src="/fm-logo.jpg"
              alt="Hello Madurai Radio"
              className="h-16 w-16 rounded-full object-cover mr-4"
            />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                {t('radio.title', 'Hello Madurai Radio', 'ஹலோ மதுரை வானொலி')}
              </h1>
            </div>
          </div>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {t('radio.subtitle', 'Listen to local stories, interviews, and discussions', 'உள்ளூர் கதைகள், நேர்காணல்கள் மற்றும் விவாதங்களைக் கேளுங்கள்')}
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t('podcast.loading', 'Loading podcasts...', 'பாட்காஸ்ட்கள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* Radio Folders */}
        {!loading && radioFolders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('radio.folders', 'Radio Shows by Category', 'வகை வாரியாக வானொலி நிகழ்ச்சிகள்')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {radioFolders.map((folder) => (
                <Card key={folder.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <FolderIcon className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {folder.name}
                        </h3>
                        {folder.name_ta && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {folder.name_ta}
                          </p>
                        )}
                      </div>
                    </div>

                    {folder.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {folder.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {folder.radioShows.length} {t('radio.shows', 'shows', 'நிகழ்ச்சிகள்')}
                      </span>
                      {folder.featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          <StarIcon className="h-3 w-3 mr-1" />
                          {t('radio.featured', 'Featured', 'சிறப்பு')}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => router.push(`/radio/${folder.id}`)}
                      className="w-full bg-purple-600 text-white hover:bg-purple-700"
                    >
                      {t('radio.viewShows', 'View Shows', 'நிகழ்ச்சிகளைப் பார்க்கவும்')}
                      <ChevronRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}


        {/* Featured Radio Shows */}
        {!loading && featuredShows.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('radio.featured', 'Featured Radio Shows', 'சிறப்பு வானொலி நிகழ்ச்சிகள்')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredShows.map((show) => (
                <Card key={show.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <SpeakerWaveIcon className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {show.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                        {t('radio.featured', 'Featured', 'சிறப்பு')}
                      </span>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(show.publishedAt)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {t(`radio.${show.id}.title`, show.title, show.title_ta || '')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {t(`radio.${show.id}.description`, show.description, show.description_ta || '')}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>{t('radio.host', 'Host:', 'தொகுப்பாளர்:')} {show.host}</span>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {show.duration}
                        </div>
                        <span>{show.plays.toLocaleString()} {t('radio.plays', 'plays', 'ஒலிப்பு')}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => playRadioShow(show.id, show.audioUrl)}
                      className="w-full"
                    >
                      {currentlyPlaying === show.id ? (
                        <>
                          <PauseIcon className="h-4 w-4 mr-2" />
                          {t('radio.pause', 'Pause', 'இடைநிறுத்து')}
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4 mr-2" />
                          {t('radio.play', 'Play', 'ஒலிக்க')}
                        </>
                      )}
                    </Button>
                    {currentlyPlaying === show.id && (
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
            {t('radio.allShows', 'All Radio Shows', 'அனைத்து வானொலி நிகழ்ச்சிகள்')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularShows.map((show) => (
              <Card key={show.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
                <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <SpeakerWaveIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {show.duration}
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(show.publishedAt)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {show.plays.toLocaleString()} {t('radio.plays', 'plays', 'ஒலிப்பு')}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {t(`radio.${show.id}.title`, show.title, show.title_ta || '')}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {t(`radio.${show.id}.description`, show.description, show.description_ta || '')}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>{t('radio.host', 'Host:', 'தொகுப்பாளர்:')} {show.host}</span>
                    <div className="flex items-center">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {show.duration}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => playRadioShow(show.id, show.audioUrl)}
                    className="w-full"
                  >
                    {currentlyPlaying === show.id ? (
                      <>
                        <PauseIcon className="h-3 w-3 mr-1" />
                        {t('radio.pause', 'Pause', 'இடைநிறுத்து')}
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-3 w-3 mr-1" />
                        {t('radio.play', 'Play', 'ஒலிக்க')}
                      </>
                    )}
                  </Button>
                  {currentlyPlaying === show.id && (
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

      </div>
    </div>
  )
}

export default function RadioPage() {
  return (
    <div>
      <NewHeader />
      <RadioPageContent />
    </div>
  )
}
