'use client'

import { useState, useEffect, useRef } from 'react'
import Card from '@/components/ui/Card'
import { 
  MagnifyingGlassIcon, 
  PlayIcon, 
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  SpeakerWaveIcon,
  UserIcon
} from '@heroicons/react/24/solid'
import { useLanguage } from '@/contexts/LanguageContext'

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
}

interface RadioSong {
  id: string
  title: string
  title_ta: string | null
  audioUrl: string
  duration: string | null
  plays: number
  singer?: Singer & { category?: RadioCategory }
}

export default function RadioMusicPage() {
  const { language, t } = useLanguage()
  const [categories, setCategories] = useState<RadioCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSinger, setSelectedSinger] = useState<Singer | null>(null)
  const [songs, setSongs] = useState<RadioSong[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Audio player state
  const [currentSong, setCurrentSong] = useState<RadioSong | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedSinger) {
      fetchSongs(selectedSinger.id)
    }
  }, [selectedSinger])

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
      setLoading(false)
    }
  }

  const fetchSongs = async (singerId: string) => {
    try {
      const res = await fetch(`/api/radio-songs/${singerId}`)
      const data = await res.json()
      setSongs(data)
    } catch (error) {
      console.error('Error fetching songs:', error)
    }
  }

  const handlePlaySong = async (song: RadioSong) => {
    if (currentSong?.id === song.id) {
      // Toggle play/pause for current song
      if (isPlaying) {
        audioRef.current?.pause()
        setIsPlaying(false)
      } else {
        audioRef.current?.play()
        setIsPlaying(true)
      }
    } else {
      // Play new song
      setCurrentSong(song)
      setIsPlaying(true)
      
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
    setIsPlaying(false)
    audioRef.current?.pause()
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
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

  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = currentSong.audioUrl
      audioRef.current.play()
    }
  }, [currentSong])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredSingers = categories
    .find(cat => cat.id === selectedCategory)
    ?.singers.filter(singer => {
      if (!searchQuery) return true
      return (
        singer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        singer.name_ta?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {language === 'ta' ? 'வானொலி இசை' : 'Radio Music'}
          </h1>
          <p className="text-blue-100">
            {language === 'ta' ? 'உங்களுக்கு பிடித்த பாடல்களைக் கேளுங்கள்' : 'Listen to your favorite songs'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
          <div className="flex gap-2 min-w-max">
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
            {filteredSingers.length === 0 ? (
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
                          currentSong?.id === song.id && isPlaying
                            ? 'bg-blue-600'
                            : 'bg-gray-200'
                        }`}>
                          {currentSong?.id === song.id && isPlaying ? (
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
      </div>

      {/* Fixed Audio Player */}
      {currentSong && (
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
                    if (isPlaying) {
                      audioRef.current?.pause()
                      setIsPlaying(false)
                    } else {
                      audioRef.current?.play()
                      setIsPlaying(true)
                    }
                  }}
                  className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                >
                  {isPlaying ? (
                    <PauseIcon className="h-6 w-6 text-white" />
                  ) : (
                    <PlayIcon className="h-6 w-6 text-white ml-0.5" />
                  )}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 hidden md:flex items-center gap-3">
                <span className="text-sm text-gray-500 w-12 text-right">
                  {formatTime(currentTime)}
                </span>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={(e) => {
                      const time = parseFloat(e.target.value)
                      setCurrentTime(time)
                      if (audioRef.current) {
                        audioRef.current.currentTime = time
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-500 w-12">
                  {formatTime(duration)}
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
                <span>{formatTime(currentTime)}</span>
                <span className="flex-1"></span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={(e) => {
                  const time = parseFloat(e.target.value)
                  setCurrentTime(time)
                  if (audioRef.current) {
                    audioRef.current.currentTime = time
                  }
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

