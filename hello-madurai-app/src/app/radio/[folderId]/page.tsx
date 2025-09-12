'use client'

import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  ClockIcon,
  CalendarIcon,
  ArrowLeftIcon,
  MicrophoneIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Card, { CardContent } from '@/components/ui/Card'
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

function RadioFolderPageContent() {
  const { t } = useLanguage()
  const params = useParams()
  const router = useRouter()
  const folderId = params.folderId as string
  
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [folder, setFolder] = useState<RadioFolder | null>(null)
  const [loading, setLoading] = useState(true)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch specific folder and its shows
  useEffect(() => {
    const fetchFolderData = async () => {
      try {
        const response = await fetch(`/api/radio/folders`)
        if (response.ok) {
          const folders = await response.json()
          const selectedFolder = folders.find((f: RadioFolder) => f.id === folderId)
          setFolder(selectedFolder || null)
        } else {
          console.error('Failed to fetch radio folder data')
        }
      } catch (error) {
        console.error('Error fetching radio folder data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (folderId) {
      fetchFolderData()
    }
  }, [folderId])

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t('radio.loading', 'Loading radio shows...', 'வானொலி நிகழ்ச்சிகள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300">
              {t('radio.folderNotFound', 'Radio folder not found', 'வானொலி கோப்புறை கிடைக்கவில்லை')}
            </p>
            <Button 
              onClick={() => router.push('/radio')}
              className="mt-4"
            >
              {t('radio.backToRadio', 'Back to Radio', 'வானொலிக்கு திரும்பு')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.push('/radio')}
            variant="outline"
            className="mb-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            {t('radio.backToRadio', 'Back to Radio', 'வானொலிக்கு திரும்பு')}
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              {folder.name}
            </h1>
            {folder.name_ta && (
              <h2 className="text-xl text-gray-600 dark:text-gray-400 mt-2">
                {folder.name_ta}
              </h2>
            )}
            {folder.description && (
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {folder.description}
              </p>
            )}
            <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{folder.radioShows.length} {t('radio.shows', 'shows', 'நிகழ்ச்சிகள்')}</span>
              {folder.featured && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <StarIcon className="h-3 w-3 mr-1" />
                  {t('radio.featured', 'Featured', 'சிறப்பு')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          className="hidden"
        />

        {/* Radio Shows List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('radio.allShows', 'All Shows', 'அனைத்து நிகழ்ச்சிகள்')}
          </h2>
          
          {folder.radioShows.length === 0 ? (
            <div className="text-center py-12">
              <MicrophoneIcon className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                {t('radio.noShows', 'No shows available in this category', 'இந்த வகையில் நிகழ்ச்சிகள் எதுவும் இல்லை')}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {folder.radioShows.map((show) => (
                <Card key={show.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-purple-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-purple-800">
                  <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-800 dark:to-purple-900">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <MicrophoneIcon className="h-12 w-12 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {show.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      {show.featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          <StarIcon className="h-3 w-3 mr-1" />
                          {t('radio.featured', 'Featured', 'சிறப்பு')}
                        </span>
                      )}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(show.publishedAt)}
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {show.title}
                    </h3>
                    {show.title_ta && (
                      <h4 className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                        {show.title_ta}
                      </h4>
                    )}
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {show.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{t('radio.host', 'Host:', 'தொகுப்பாளர்:')} {show.host}</span>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {show.duration}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {show.plays.toLocaleString()} {t('radio.plays', 'plays', 'இயக்கங்கள்')}
                      </span>
                    </div>
                    
                    <Button
                      onClick={() => playRadioShow(show.id, show.audioUrl)}
                      className="w-full bg-green-600 text-white hover:bg-green-700"
                    >
                      {currentlyPlaying === show.id ? (
                        <>
                          <PauseIcon className="h-4 w-4 mr-2" />
                          {t('radio.pause', 'Pause', 'இடைநிறுத்தம்')}
                        </>
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4 mr-2" />
                          {t('radio.play', 'Play', 'இயக்கு')}
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
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RadioFolderPage() {
  return (
    <div>
      <NewHeader />
      <RadioFolderPageContent />
    </div>
  )
}
