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
  StarIcon,
  MusicalNoteIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BackwardIcon,
  ForwardIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import InteractionButtons from '@/components/InteractionButtons'
import Comments from '@/components/Comments'
import EnhancedRadioPlayer from '@/components/EnhancedRadioPlayer'
import BluetoothManager from '@/components/BluetoothManager'

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
  comments: RadioComment[]
  shares: RadioShare[]
}

interface RadioComment {
  id: string
  content: string
  author: string
  createdAt: string
}

interface RadioShare {
  id: string
  platform: string
  createdAt: string
}

interface RadioCategory {
  id: string
  name: string
  name_ta: string
  slug: string
  singers: Singer[]
}

interface Singer {
  id: string
  name: string
  name_ta: string | null
  imageUrl: string | null
  _count?: {
    songs: number
  }
  category?: RadioCategory
}

interface RadioSong {
  id: string
  title: string
  title_ta: string | null
  audioUrl: string
  duration: string | null
  plays: number
  singer?: Singer
}

function RadioPageContent() {
  const { t, language } = useLanguage()
  const router = useRouter()

  // Tab state
  const [activeTab, setActiveTab] = useState<'shows' | 'music'>('shows')

  // Radio Shows state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [radioFolders, setRadioFolders] = useState<RadioFolder[]>([])
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [commentsShowId, setCommentsShowId] = useState<string>('')
  const [showEnhancedPlayer, setShowEnhancedPlayer] = useState(false)
  const [showBluetoothManager, setShowBluetoothManager] = useState(false)
  const [currentShowIndex, setCurrentShowIndex] = useState(0)
  const [allShows, setAllShows] = useState<RadioShow[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  // Music state
  const [categories, setCategories] = useState<RadioCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSinger, setSelectedSinger] = useState<Singer | null>(null)
  const [songs, setSongs] = useState<RadioSong[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [musicLoading, setMusicLoading] = useState(true)

  // Music player state
  const [currentSong, setCurrentSong] = useState<RadioSong | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [musicCurrentTime, setMusicCurrentTime] = useState(0)
  const [musicDuration, setMusicDuration] = useState(0)
  const musicAudioRef = useRef<HTMLAudioElement>(null)

  // Fetch radio folders and shows from database
  useEffect(() => {
    const fetchRadioData = async () => {
      try {
        const response = await fetch('/api/radio/folders')
        if (response.ok) {
          const data = await response.json()
          setRadioFolders(data)

          // Flatten all shows from all folders
          const shows: RadioShow[] = []
          data.forEach((folder: RadioFolder) => {
            shows.push(...folder.radioShows)
          })
          setAllShows(shows)
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

  // Fetch music categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/radio-categories')
        const data = await res.json()
        setCategories(data)
        if (data.length > 0) {
          setSelectedCategory(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setMusicLoading(false)
      }
    }

    fetchCategories()
  }, [])

  // Fetch songs when singer is selected
  useEffect(() => {
    if (selectedSinger) {
      const fetchSongs = async () => {
        try {
          const res = await fetch(`/api/radio-songs/${selectedSinger.id}`)
          const data = await res.json()
          setSongs(data)
        } catch (error) {
          console.error('Error fetching songs:', error)
        }
      }
      fetchSongs()
    }
  }, [selectedSinger])

  // Music player audio events
  useEffect(() => {
    const audio = musicAudioRef.current
    if (!audio) return

    const updateTime = () => setMusicCurrentTime(audio.currentTime)
    const updateDuration = () => setMusicDuration(audio.duration)
    const handleEnded = () => {
      setIsMusicPlaying(false)
      setMusicCurrentTime(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Auto-play when current song changes
  useEffect(() => {
    if (currentSong && musicAudioRef.current) {
      musicAudioRef.current.src = currentSong.audioUrl
      musicAudioRef.current.play()
    }
  }, [currentSong])

  // Enhanced player functions
  const openEnhancedPlayer = (showId: string) => {
    const showIndex = allShows.findIndex(show => show.id === showId)
    if (showIndex !== -1) {
      setCurrentShowIndex(showIndex)
      setShowEnhancedPlayer(true)
    }
  }

  const handleShowChange = (newIndex: number) => {
    setCurrentShowIndex(newIndex)
    if (allShows[newIndex]) {
      setCurrentlyPlaying(allShows[newIndex].id)
    }
  }

  const handleBluetoothConnect = (device: any) => {
    console.log('Bluetooth device connected:', device.name)
    // Audio will automatically route to Bluetooth device
  }

  const handleBluetoothDisconnect = (device: any) => {
    console.log('Bluetooth device disconnected:', device.name)
  }

  // Music handlers
  const handlePlaySong = async (song: RadioSong) => {
    if (currentSong?.id === song.id) {
      // Toggle play/pause for current song
      if (isMusicPlaying) {
        musicAudioRef.current?.pause()
        setIsMusicPlaying(false)
      } else {
        musicAudioRef.current?.play()
        setIsMusicPlaying(true)
      }
    } else {
      // Play new song
      setCurrentSong(song)
      setIsMusicPlaying(true)

      // Increment play count
      try {
        await fetch(`/api/radio-songs/play/${song.id}`, { method: 'POST' })
      } catch (error) {
        console.error('Error incrementing play count:', error)
      }
    }
  }

  const handleSingerClick = (singer: Singer) => {
    setSelectedSinger(singer)
    setSongs([])
  }

  const handleBackToSingers = () => {
    setSelectedSinger(null)
    setSongs([])
    setCurrentSong(null)
    setIsMusicPlaying(false)
    musicAudioRef.current?.pause()
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
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

  const openComments = (showId: string) => {
    setCommentsShowId(showId)
    setShowComments(true)
  }

  // Get featured and regular shows
  const featuredShows = allShows.filter(show => show.featured)
  const regularShows = allShows.filter(show => !show.featured)

  // Filter singers for music tab
  const filteredSingers = categories
    .find(cat => cat.id === selectedCategory)
    ?.singers.filter(singer => {
      if (!searchQuery) return true
      return (
        singer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        singer.name_ta?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }) || []

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Hidden audio elements */}
      <audio ref={musicAudioRef} />

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
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {t('radio.title', 'Hello Madurai Radio', 'ஹலோ மதுரை வானொலி')}
              </h1>
            </div>
          </div>
          <p className="mt-2 text-lg text-gray-600">
            {t('radio.subtitle', 'Listen to local stories, interviews, and music', 'உள்ளூர் கதைகள், நேர்காணல்கள் மற்றும் இசையைக் கேளுங்கள்')}
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setActiveTab('shows')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'shows'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MicrophoneIcon className="h-5 w-5" />
              {language === 'ta' ? 'வானொலி நிகழ்ச்சிகள்' : 'Radio Shows'}
            </button>
            <button
              onClick={() => setActiveTab('music')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'music'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <MusicalNoteIcon className="h-5 w-5" />
              {language === 'ta' ? 'இசை' : 'Music'}
            </button>
          </div>
        </div>

        {/* Radio Shows Tab */}
        {activeTab === 'shows' && (
          <>
            {/* Enhanced Controls */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <Button
                onClick={() => setShowEnhancedPlayer(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                disabled={allShows.length === 0}
              >
                <SpeakerWaveIcon className="h-5 w-5" />
                {t('radio.enhancedPlayer', 'Enhanced Player', 'மேம்பட்ட பிளேயர்')}
              </Button>

              <Button
                onClick={() => setShowBluetoothManager(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <SpeakerWaveIcon className="h-5 w-5" />
                {t('radio.bluetooth', 'Bluetooth', 'புளூடூத்')}
              </Button>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t('podcast.loading', 'Loading podcasts...', 'பாட்காஸ்ட்கள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* Radio Folders */}
        {!loading && radioFolders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('radio.folders', 'Radio Shows by Category', 'வகை வாரியாக வானொலி நிகழ்ச்சிகள்')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {radioFolders.map((folder) => (
                <Card key={folder.id} className="hover:shadow-lg transition-shadow bg-white text-gray-900 border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <FolderIcon className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {folder.name}
                        </h3>
                        {folder.name_ta && (
                          <p className="text-sm text-gray-600">
                            {folder.name_ta}
                          </p>
                        )}
                      </div>
                    </div>

                    {folder.description && (
                      <p className="text-sm text-gray-600 mb-4">
                        {folder.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">
                        {folder.radioShows.length} {t('radio.shows', 'shows', 'நிகழ்ச்சிகள்')}
                      </span>
                      {folder.featured && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-blue-800">
                          <StarIcon className="h-3 w-3 mr-1" />
                          {t('radio.featured', 'Featured', 'சிறப்பு')}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => router.push(`/radio/${folder.id}`)}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('radio.featured', 'Featured Radio Shows', 'சிறப்பு வானொலி நிகழ்ச்சிகள்')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredShows.map((show) => (
                <Card key={show.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white text-gray-900 border-gray-200">
                  <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-primary-100 to-secondary-100">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <SpeakerWaveIcon className="h-16 w-16 text-primary-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {show.duration}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {t('radio.featured', 'Featured', 'சிறப்பு')}
                      </span>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        {formatDate(show.publishedAt)}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {t(`radio.${show.id}.title`, show.title, show.title_ta || '')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t(`radio.${show.id}.description`, show.description, show.description_ta || '')}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
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
                      <div className="mt-4 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Interaction Buttons */}
                    <div className="mt-4">
                      <InteractionButtons
                        itemId={show.id}
                        itemType="radio"
                        title={show.title}
                        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/radio#${show.id}`}
                        likes={0} // Radio shows don't have likes, just plays
                        comments={show.comments?.length || 0}
                        shares={show.shares?.length || 0}
                        onComment={() => openComments(show.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Podcasts */}
        {!loading && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('radio.allShows', 'All Radio Shows', 'அனைத்து வானொலி நிகழ்ச்சிகள்')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {regularShows.map((show) => (
              <Card key={show.id} className="hover:shadow-lg transition-shadow bg-white text-gray-900 border-gray-200">
                <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <SpeakerWaveIcon className="h-12 w-12 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-500">
                        {show.duration}
                      </p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {formatDate(show.publishedAt)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {show.plays.toLocaleString()} {t('radio.plays', 'plays', 'ஒலிப்பு')}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {t(`radio.${show.id}.title`, show.title, show.title_ta || '')}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {t(`radio.${show.id}.description`, show.description, show.description_ta || '')}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
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
                    <div className="mt-3 bg-gray-50 rounded-lg p-2">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                        ></div>
                      </div>
                      </div>
                    )}
                    
                    {/* Interaction Buttons */}
                    <div className="mt-3">
                      <InteractionButtons
                        itemId={show.id}
                        itemType="radio"
                        title={show.title}
                        url={`${typeof window !== 'undefined' ? window.location.origin : ''}/radio#${show.id}`}
                        likes={0}
                        comments={show.comments?.length || 0}
                        shares={show.shares?.length || 0}
                        onComment={() => openComments(show.id)}
                        className="text-xs"
                      />
                    </div>
                  </CardContent>
              </Card>
            ))}
          </div>
        </div>
        )}
          </>
        )}

        {/* Music Tab */}
        {activeTab === 'music' && (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ta' ? 'பாடகர்களைத் தேடுங்கள்...' : 'Search singers...'}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-3.5" />
              </div>
            </div>

            {/* Category Tabs */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex gap-2 min-w-max justify-center">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id)
                      setSelectedSinger(null)
                      setSongs([])
                    }}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {language === 'ta' ? category.name_ta : category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            {!selectedSinger ? (
              /* Singers Grid */
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {language === 'ta' ? 'பாடகர்கள்' : 'Singers'}
                </h2>
                {musicLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                  </div>
                ) : filteredSingers.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">
                    {language === 'ta' ? 'பாடகர்கள் இல்லை' : 'No singers found'}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {filteredSingers.map(singer => (
                      <div
                        key={singer.id}
                        onClick={() => handleSingerClick(singer)}
                        className="cursor-pointer group"
                      >
                        <div className="relative aspect-square mb-3 overflow-hidden rounded-full bg-gray-200 group-hover:ring-4 group-hover:ring-blue-300 transition-all">
                          {singer.imageUrl ? (
                            <img
                              src={singer.imageUrl}
                              alt={singer.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon className="h-1/2 w-1/2 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <h3 className="text-center font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {language === 'ta' && singer.name_ta ? singer.name_ta : singer.name}
                        </h3>
                        <p className="text-center text-sm text-gray-500">
                          {singer._count?.songs || 0} {language === 'ta' ? 'பாடல்கள்' : 'songs'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Songs List */
              <div>
                <div className="mb-6">
                  <button
                    onClick={handleBackToSingers}
                    className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
                  >
                    <BackwardIcon className="h-5 w-5" />
                    {language === 'ta' ? 'பாடகர்களுக்குத் திரும்பு' : 'Back to Singers'}
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  {selectedSinger.imageUrl ? (
                    <img
                      src={selectedSinger.imageUrl}
                      alt={selectedSinger.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {language === 'ta' && selectedSinger.name_ta ? selectedSinger.name_ta : selectedSinger.name}
                    </h2>
                    <p className="text-gray-600">
                      {songs.length} {language === 'ta' ? 'பாடல்கள்' : 'songs'}
                    </p>
                  </div>
                </div>

                {songs.length === 0 ? (
                  <p className="text-center py-12 text-gray-500">
                    {language === 'ta' ? 'பாடல்கள் இல்லை' : 'No songs available'}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {songs.map((song, index) => (
                      <Card
                        key={song.id}
                        className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${
                          currentSong?.id === song.id ? 'bg-blue-50 border-blue-300' : ''
                        }`}
                        onClick={() => handlePlaySong(song)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              currentSong?.id === song.id && isMusicPlaying
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                            }`}>
                              {currentSong?.id === song.id && isMusicPlaying ? (
                                <PauseIcon className="h-6 w-6 text-white" />
                              ) : (
                                <PlayIcon className="h-6 w-6 text-gray-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {language === 'ta' && song.title_ta ? song.title_ta : song.title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {song.duration || '-'} • {song.plays} {language === 'ta' ? 'இயக்கங்கள்' : 'plays'}
                            </p>
                          </div>
                          <div className="text-gray-400 text-lg font-semibold">
                            {index + 1}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Contact Info */}

        {/* Comments Modal */}
        <Comments
          itemId={commentsShowId}
          itemType="radio"
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />

        {/* Enhanced Radio Player Modal */}
        {showEnhancedPlayer && allShows.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('radio.enhancedPlayer', 'Enhanced Radio Player', 'மேம்பட்ட வானொலி பிளேயர்')}
                </h3>
                <button
                  onClick={() => setShowEnhancedPlayer(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <EnhancedRadioPlayer
                shows={allShows}
                currentShowIndex={currentShowIndex}
                onShowChange={handleShowChange}
                onCommentClick={openComments}
              />
            </div>
          </div>
        )}

        {/* Bluetooth Manager Modal */}
        {showBluetoothManager && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('radio.bluetoothManager', 'Bluetooth Manager', 'புளூடூத் மேலாளர்')}
                </h3>
                <button
                  onClick={() => setShowBluetoothManager(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <BluetoothManager
                onDeviceConnect={handleBluetoothConnect}
                onDeviceDisconnect={handleBluetoothDisconnect}
              />
            </div>
          </div>
        )}

        {/* Fixed Music Player */}
        {currentSong && activeTab === 'music' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center gap-4">
                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {language === 'ta' && currentSong.title_ta ? currentSong.title_ta : currentSong.title}
                  </h4>
                  <p className="text-sm text-gray-500 truncate">
                    {language === 'ta' && selectedSinger?.name_ta ? selectedSinger.name_ta : selectedSinger?.name}
                  </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      if (isMusicPlaying) {
                        musicAudioRef.current?.pause()
                        setIsMusicPlaying(false)
                      } else {
                        musicAudioRef.current?.play()
                        setIsMusicPlaying(true)
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                  >
                    {isMusicPlaying ? (
                      <PauseIcon className="h-6 w-6 text-white" />
                    ) : (
                      <PlayIcon className="h-6 w-6 text-white ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 hidden md:flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {formatTime(musicCurrentTime)}
                  </span>
                  <div className="flex-1">
                    <input
                      type="range"
                      min="0"
                      max={musicDuration || 0}
                      value={musicCurrentTime}
                      onChange={(e) => {
                        const time = parseFloat(e.target.value)
                        setMusicCurrentTime(time)
                        if (musicAudioRef.current) {
                          musicAudioRef.current.currentTime = time
                        }
                      }}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(musicCurrentTime / musicDuration) * 100}%, #e5e7eb ${(musicCurrentTime / musicDuration) * 100}%, #e5e7eb 100%)`
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">
                    {formatTime(musicDuration)}
                  </span>
                </div>

                {/* Volume */}
                <div className="hidden lg:flex items-center gap-2">
                  <SpeakerWaveIcon className="h-5 w-5 text-gray-500" />
                </div>
              </div>

              {/* Mobile Progress Bar */}
              <div className="md:hidden mt-3">
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <span>{formatTime(musicCurrentTime)}</span>
                  <span className="flex-1"></span>
                  <span>{formatTime(musicDuration)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={musicDuration || 0}
                  value={musicCurrentTime}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value)
                    setMusicCurrentTime(time)
                    if (musicAudioRef.current) {
                      musicAudioRef.current.currentTime = time
                    }
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(musicCurrentTime / musicDuration) * 100}%, #e5e7eb ${(musicCurrentTime / musicDuration) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        )}
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
