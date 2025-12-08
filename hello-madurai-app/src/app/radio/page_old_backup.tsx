'use client'

import { useState, useRef, useEffect } from 'react'
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import Card from '@/components/ui/Card'
import { toast } from 'react-hot-toast'

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
  featured: boolean
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
  shares: number
  singer?: Singer
}

interface Ad {
  id: string
  title: string
  imageUrl?: string
  htmlCode?: string
  link?: string
}

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
}

function DigitalFMPageContent() {
  const { language } = useLanguage()
  
  // State
  const [categories, setCategories] = useState<RadioCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [allAudios, setAllAudios] = useState<RadioSong[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [likedAudios, setLikedAudios] = useState<Set<string>>(new Set())
  
  // Music player state
  const [currentSong, setCurrentSong] = useState<RadioSong | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [musicCurrentTime, setMusicCurrentTime] = useState(0)
  const [musicDuration, setMusicDuration] = useState(0)
  const musicAudioRef = useRef<HTMLAudioElement>(null)

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/radio-categories')
        const data = await res.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Fetch all audios
  useEffect(() => {
    const fetchAllAudios = async () => {
      try {
        setLoading(true)
        setError(null)

        // Add timeout to prevent infinite loading
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

        const res = await fetch('/api/radio-songs/all', {
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!res.ok) {
          throw new Error(`Failed to fetch audios: ${res.status}`)
        }

        const data = await res.json()

        if (data.error) {
          throw new Error(data.error)
        }

        setAllAudios(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error fetching audios:', error)
        if (error instanceof Error && error.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.')
        } else {
          setError(error instanceof Error ? error.message : 'Failed to load audios')
        }
        setAllAudios([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllAudios()
  }, [])

  // Fetch ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads/active?category=radio')
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

  // Music player effects
  useEffect(() => {
    const audio = musicAudioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setMusicCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setMusicDuration(audio.duration)
    const handleEnded = () => setIsMusicPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  // Update audio source when current song changes
  useEffect(() => {
    const audio = musicAudioRef.current
    if (!audio || !currentSong) return

    audio.src = currentSong.audioUrl
    if (isMusicPlaying) {
      audio.play().catch(err => console.error('Error playing audio:', err))
    }
  }, [currentSong])

  // Handle play audio
  const handlePlayAudio = async (audio: RadioSong) => {
    if (currentSong?.id === audio.id) {
      if (isMusicPlaying) {
        musicAudioRef.current?.pause()
        setIsMusicPlaying(false)
      } else {
        musicAudioRef.current?.play()
        setIsMusicPlaying(true)
      }
      return
    }

    setCurrentSong(audio)
    setIsMusicPlaying(true)

    try {
      await fetch(`/api/radio-songs/${audio.id}/play`, { method: 'POST' })
      setAllAudios(prev => prev.map(a =>
        a.id === audio.id ? { ...a, plays: a.plays + 1 } : a
      ))
    } catch (error) {
      console.error('Error updating play count:', error)
    }

    setTimeout(() => {
      musicAudioRef.current?.play()
    }, 100)
  }

  // Handle like
  const handleLike = async (audioId: string) => {
    try {
      const isLiked = likedAudios.has(audioId)
      const method = isLiked ? 'DELETE' : 'POST'

      await fetch(`/api/radio-songs/${audioId}/like`, { method })

      setAllAudios(prev => prev.map(a =>
        a.id === audioId ? { ...a, likes: isLiked ? a.likes - 1 : a.likes + 1 } : a
      ))

      setLikedAudios(prev => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.delete(audioId)
        } else {
          newSet.add(audioId)
        }
        return newSet
      })

      toast.success(isLiked
        ? (language === 'ta' ? 'விருப்பம் நீக்கப்பட்டது' : 'Removed from favorites')
        : (language === 'ta' ? 'விருப்பங்களில் சேர்க்கப்பட்டது' : 'Added to favorites')
      )
    } catch (error) {
      console.error('Error liking audio:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Error occurred')
    }
  }

  // Handle share
  const handleShare = async (audio: RadioSong) => {
    try {
      const url = `${window.location.origin}/radio?audio=${audio.id}`
      const title = language === 'ta' && audio.title_ta ? audio.title_ta : audio.title

      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `${language === 'ta' ? 'கேளுங்கள்' : 'Listen to'}: ${title}`,
          url: url
        })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success(language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது' : 'Link copied to clipboard')
      }

      await fetch(`/api/radio-songs/${audio.id}/share`, { method: 'POST' })
      setAllAudios(prev => prev.map(a =>
        a.id === audio.id ? { ...a, shares: a.shares + 1 } : a
      ))
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Filter audios
  const filteredAudios = allAudios.filter(audio => {
    const matchesCategory = selectedCategory === 'all' || audio.singer?.category?.id === selectedCategory
    const matchesSearch = !searchQuery ||
      audio.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audio.title_ta?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audio.singer?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      audio.singer?.name_ta?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  // Render ad
  const renderAd = (ad: Ad, index: number) => {
    if (ad.htmlCode) {
      return (
        <div key={`ad-${ad.id}-${index}`} className="col-span-full my-8">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-400 shadow-lg">
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-blue-700 font-bold">
                📢 {language === 'ta' ? 'விளம்பரம்' : 'Advertisement'}
              </p>
            </div>
            <div dangerouslySetInnerHTML={{ __html: ad.htmlCode }} />
          </div>
        </div>
      )
    } else if (ad.imageUrl) {
      return (
        <div key={`ad-${ad.id}-${index}`} className="col-span-full my-8">
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-400 shadow-lg">
            <div className="mb-4">
              <p className="text-xs sm:text-sm text-blue-700 font-bold">
                📢 {language === 'ta' ? 'விளம்பரம்' : 'Advertisement'}
              </p>
            </div>
            {ad.link ? (
              <a href={ad.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-90 transition-opacity">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto rounded-lg shadow-md" />
              </a>
            ) : (
              <img src={ad.imageUrl} alt={ad.title} className="w-full h-auto rounded-lg shadow-md" />
            )}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <audio ref={musicAudioRef} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-2" suppressHydrationWarning>
            {language === 'ta' ? 'டிஜிட்டல் எஃப்.எம்' : 'Digital FM'}
          </h1>
          <p className="text-lg text-gray-600 mb-1" suppressHydrationWarning>
            {language === 'ta'
              ? 'மதுரையின் வரலாறு, விவசாயம், தொழில் மற்றும் கதைகள்'
              : 'Madurai – History, Agriculture, Industry & Stories'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ta' ? 'தேடுங்கள்...' : 'Search...'}
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-3.5" />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-max justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {language === 'ta' ? 'அனைத்தும்' : 'All'}
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
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

        {/* Audios Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {language === 'ta' ? 'ஆடியோக்கள்' : 'Audios'}
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">
                {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {language === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : 'Retry'}
              </button>
            </div>
          ) : filteredAudios.length === 0 ? (
            <p className="text-center py-12 text-gray-500">
              {language === 'ta' ? 'ஆடியோக்கள் இல்லை' : 'No audios found'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAudios.map((audio, index) => {
                const shouldShowAd = (index + 1) % 6 === 0 && ads.length > 0
                const adIndex = Math.floor(index / 6) % ads.length
                const isLiked = likedAudios.has(audio.id)
                const isPlaying = currentSong?.id === audio.id && isMusicPlaying

                return (
                  <div key={audio.id}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <div className="p-6">
                        {/* Audio Info */}
                        <div className="flex items-start gap-4 mb-4">
                          {/* Play Button */}
                          <button
                            onClick={() => handlePlayAudio(audio)}
                            className="flex-shrink-0 w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center transition-colors"
                          >
                            {isPlaying ? (
                              <PauseIcon className="h-8 w-8 text-white" />
                            ) : (
                              <PlayIcon className="h-8 w-8 text-white ml-1" />
                            )}
                          </button>

                          {/* Title and Singer */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate mb-1">
                              {language === 'ta' && audio.title_ta ? audio.title_ta : audio.title}
                            </h3>
                            {audio.singer && (
                              <p className="text-sm text-gray-600 truncate">
                                {language === 'ta' && audio.singer.name_ta ? audio.singer.name_ta : audio.singer.name}
                              </p>
                            )}
                            {audio.singer?.category && (
                              <p className="text-xs text-gray-500 mt-1">
                                {language === 'ta' ? audio.singer.category.name_ta : audio.singer.category.name}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Interaction Buttons */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          {/* Like Button */}
                          <button
                            onClick={() => handleLike(audio.id)}
                            className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                          >
                            {isLiked ? (
                              <HeartIconSolid className="h-5 w-5 text-red-600" />
                            ) : (
                              <HeartIcon className="h-5 w-5" />
                            )}
                            <span className="text-sm font-medium">{formatNumber(audio.likes)}</span>
                          </button>

                          {/* Share Button */}
                          <button
                            onClick={() => handleShare(audio)}
                            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <ShareIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">{formatNumber(audio.shares)}</span>
                          </button>

                          {/* Comments Button */}
                          <button
                            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <ChatBubbleLeftIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">{formatNumber(audio.comments)}</span>
                          </button>

                          {/* Plays */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <SpeakerWaveIcon className="h-5 w-5" />
                            <span className="text-sm font-medium">{formatNumber(audio.plays)}</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Insert ad after every 6 audios (3 rows in 2-column grid) */}
                    {shouldShowAd && renderAd(ads[adIndex], adIndex)}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Fixed Music Player */}
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
                    {currentSong.singer && (language === 'ta' && currentSong.singer.name_ta ? currentSong.singer.name_ta : currentSong.singer?.name)}
                  </p>
                </div>

                {/* Play/Pause Button */}
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

export default function DigitalFMPage() {
  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      <DigitalFMPageContent />
    </div>
  )
}


