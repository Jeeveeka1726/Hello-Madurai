'use client'

import { useState, useRef, useEffect } from 'react'
import Head from 'next/head'
import {
  PlayIcon,
  PauseIcon,
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
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSinger, setSelectedSinger] = useState<Singer | null>(null)
  const [songs, setSongs] = useState<RadioSong[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingSongs, setLoadingSongs] = useState(false)
  const [ads, setAds] = useState<Ad[]>([])
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set())
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [showComments, setShowComments] = useState(false)

  // Share menu state
  const [openShareMenu, setOpenShareMenu] = useState<string | null>(null)

  // Music player state
  const [currentSong, setCurrentSong] = useState<RadioSong | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [musicCurrentTime, setMusicCurrentTime] = useState(0)
  const [musicDuration, setMusicDuration] = useState(0)
  const musicAudioRef = useRef<HTMLAudioElement>(null)

  // Save playback state to localStorage
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('radio_current_song', JSON.stringify(currentSong))
      localStorage.setItem('radio_is_playing', isMusicPlaying.toString())
    }
  }, [currentSong, isMusicPlaying])

  // Save state before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSong && musicAudioRef.current) {
        localStorage.setItem('radio_current_time', musicAudioRef.current.currentTime.toString())
        localStorage.setItem('radio_is_playing', (!musicAudioRef.current.paused).toString())
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [currentSong])

  // Save selected singer to localStorage
  useEffect(() => {
    if (selectedSinger) {
      localStorage.setItem('radio_selected_singer', JSON.stringify(selectedSinger))
      localStorage.setItem('radio_songs', JSON.stringify(songs))
    } else {
      localStorage.removeItem('radio_selected_singer')
      localStorage.removeItem('radio_songs')
    }
  }, [selectedSinger, songs])

  // Restore state on mount
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedSinger = localStorage.getItem('radio_selected_singer')
        const savedSongs = localStorage.getItem('radio_songs')
        const savedCurrentSong = localStorage.getItem('radio_current_song')
        const savedTime = localStorage.getItem('radio_current_time')
        const savedIsPlaying = localStorage.getItem('radio_is_playing')

        if (savedSinger && savedSongs) {
          const singer = JSON.parse(savedSinger)
          const songsData = JSON.parse(savedSongs)

          setSelectedSinger(singer)
          setSongs(songsData)

          // Restore like statuses
          const songIds = songsData.map((song: RadioSong) => song.id)
          const likeStatusRes = await fetch('/api/radio-songs/likes/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songIds })
          })
          const likeStatuses = await likeStatusRes.json()

          const newLikedSongs = new Set<string>()
          const newLikeCounts: Record<string, number> = {}

          Object.entries(likeStatuses).forEach(([songId, status]: [string, any]) => {
            if (status.liked) {
              newLikedSongs.add(songId)
            }
            newLikeCounts[songId] = status.likeCount
          })

          setLikedSongs(newLikedSongs)
          setLikeCounts(newLikeCounts)
        }

        if (savedCurrentSong) {
          const song = JSON.parse(savedCurrentSong)
          setCurrentSong(song)

          // Restore playback position but DON'T auto-play
          if (savedTime && musicAudioRef.current) {
            const time = parseFloat(savedTime)
            setTimeout(() => {
              if (musicAudioRef.current) {
                musicAudioRef.current.currentTime = time
                setMusicCurrentTime(time)
                // Don't auto-play - user must click play button
                setIsMusicPlaying(false)
              }
            }, 500)
          }
        }
      } catch (error) {
        console.error('Error restoring state:', error)
      }
    }

    restoreState()
  }, [])

  // Close share menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openShareMenu) {
        setOpenShareMenu(null)
      }
    }

    if (openShareMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openShareMenu])

  // Initialize session (only once)
  useEffect(() => {
    const initSession = async () => {
      try {
        // Check if we already have a session token cached
        const cachedToken = sessionStorage.getItem('session_token')
        if (cachedToken) {
          setSessionToken(cachedToken)
          return
        }

        const res = await fetch('/api/auth/session')
        const data = await res.json()
        setSessionToken(data.sessionToken)
        // Cache the session token
        sessionStorage.setItem('session_token', data.sessionToken)
      } catch (error) {
        console.error('Error initializing session:', error)
      }
    }
    initSession()
  }, [])

  // Fetch categories
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
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Fetch ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads/active?category=radio')
        if (response.ok) {
          const data = await response.json()
          setAds(data)
          // Track impressions asynchronously without blocking
          if (data.length > 0) {
            setTimeout(() => {
              data.forEach((ad: Ad) => {
                fetch(`/api/ads/${ad.id}/impression`, { method: 'POST' }).catch(() => {})
              })
            }, 0)
          }
        }
      } catch (error) {
        console.error('Error fetching ads:', error)
      }
    }
    fetchAds()
  }, [])

  // Fetch comments only when user opens comments section (lazy loading)
  useEffect(() => {
    if (!selectedSinger || !showComments) {
      return
    }

    const fetchComments = async () => {
      try {
        const res = await fetch(`/api/singers/${selectedSinger.id}/comments`)
        const data = await res.json()
        setComments(data)
      } catch (error) {
        console.error('Error fetching comments:', error)
      }
    }
    fetchComments()
  }, [selectedSinger, showComments])

  // Music player effects
  useEffect(() => {
    const audio = musicAudioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime
      setMusicCurrentTime(currentTime)
      // Save playback position every second
      if (currentSong && Math.floor(currentTime) % 1 === 0) {
        localStorage.setItem('radio_current_time', currentTime.toString())
      }
    }
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
  }, [currentSong])

  // Update audio source when current song changes
  useEffect(() => {
    const audio = musicAudioRef.current
    if (!audio || !currentSong) return

    audio.src = currentSong.audioUrl
    if (isMusicPlaying) {
      audio.play().catch(err => console.error('Error playing audio:', err))
    }
  }, [currentSong])

  // Handlers
  const handleSingerClick = async (singer: Singer) => {
    setLoadingSongs(true)
    try {
      const res = await fetch(`/api/radio-songs/singer/${singer.id}`)
      const data = await res.json()

      if (data && data.length > 0) {
        setSongs(data)
        setSelectedSinger(singer)
        // Don't auto-play or set current song
        setIsMusicPlaying(false)

        // Batch fetch like statuses for all songs in one API call
        const songIds = data.map((song: RadioSong) => song.id)
        const likeStatusRes = await fetch('/api/radio-songs/likes/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songIds })
        })
        const likeStatuses = await likeStatusRes.json()

        const newLikedSongs = new Set<string>()
        const newLikeCounts: Record<string, number> = {}

        Object.entries(likeStatuses).forEach(([songId, status]: [string, any]) => {
          if (status.liked) {
            newLikedSongs.add(songId)
          }
          newLikeCounts[songId] = status.likeCount
        })

        setLikedSongs(newLikedSongs)
        setLikeCounts(newLikeCounts)
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Error loading songs')
    } finally {
      setLoadingSongs(false)
    }
  }

  const handlePlaySong = async (song: RadioSong) => {
    if (currentSong?.id === song.id) {
      if (isMusicPlaying) {
        musicAudioRef.current?.pause()
        setIsMusicPlaying(false)
      } else {
        musicAudioRef.current?.play()
        setIsMusicPlaying(true)
      }
    } else {
      setCurrentSong(song)
      setIsMusicPlaying(true)

      // Increment play count
      try {
        await fetch(`/api/radio-songs/${song.id}/play`, { method: 'POST' })
      } catch (error) {
        console.error('Error incrementing play count:', error)
      }
    }
  }

  const handleLike = async (songId: string) => {
    if (!sessionToken) {
      toast.error(language === 'ta' ? 'தயவுசெய்து பக்கத்தை புதுப்பிக்கவும்' : 'Please refresh the page')
      return
    }

    const isLiked = likedSongs.has(songId)
    const method = isLiked ? 'DELETE' : 'POST'

    try {
      const res = await fetch(`/api/radio-songs/${songId}/like`, { method })
      const data = await res.json()

      if (res.ok) {
        setLikedSongs(prev => {
          const newSet = new Set(prev)
          if (isLiked) {
            newSet.delete(songId)
          } else {
            newSet.add(songId)
          }
          return newSet
        })

        setLikeCounts(prev => ({
          ...prev,
          [songId]: data.likeCount
        }))
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Error occurred')
    }
  }

  const handleShare = async (song: RadioSong, platform: 'whatsapp' | 'facebook' | 'copy') => {
    const url = `${window.location.origin}/radio?song=${song.id}`
    const title = language === 'ta' && song.title_ta ? song.title_ta : song.title
    const artistName = selectedSinger
      ? (language === 'ta' && selectedSinger.name_ta ? selectedSinger.name_ta : selectedSinger.name)
      : ''
    const artistImage = selectedSinger?.imageUrl || ''

    // Create share text with artist info
    const shareText = `${title}\n${language === 'ta' ? 'கலைஞர்' : 'Artist'}: ${artistName}\n\n${url}`

    try {
      if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
      } else if (platform === 'facebook') {
        // Facebook Open Graph will automatically fetch the image from the page meta tags
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
      } else {
        await navigator.clipboard.writeText(shareText)
        toast.success(language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது' : 'Link copied!')
      }

      // Increment share count
      await fetch(`/api/radio-songs/${song.id}/share`, { method: 'POST' })

      // Update local state
      setSongs(prev => prev.map(s =>
        s.id === song.id ? { ...s, shares: s.shares + 1 } : s
      ))
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleSubmitComment = async () => {
    if (!selectedSinger || !newComment.trim() || !commentAuthor.trim()) {
      toast.error(language === 'ta' ? 'அனைத்து புலங்களையும் நிரப்பவும்' : 'Please fill all fields')
      return
    }

    try {
      const res = await fetch(`/api/singers/${selectedSinger.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          author: commentAuthor
        })
      })

      if (res.ok) {
        const comment = await res.json()
        setComments(prev => [comment, ...prev])
        setNewComment('')
        toast.success(language === 'ta' ? 'கருத்து சேர்க்கப்பட்டது' : 'Comment added!')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Error occurred')
    }
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter singers
  const filteredSingers = categories
    .find(cat => cat.id === selectedCategory)
    ?.singers.filter(singer => {
      if (!searchQuery) return true
      return (
        singer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        singer.name_ta?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }) || []

  // Render ad
  const renderAd = (ad: Ad, index: number) => (
    <div key={`ad-${index}`} className="col-span-2 my-4">
      {ad.htmlCode ? (
        <div dangerouslySetInnerHTML={{ __html: ad.htmlCode }} />
      ) : ad.imageUrl ? (
        <a
          href={ad.link || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => fetch(`/api/ads/${ad.id}/click`, { method: 'POST' }).catch(() => {})}
        >
          <img src={ad.imageUrl} alt={ad.title} className="w-full rounded-lg" />
        </a>
      ) : null}
    </div>
  )

  return (
    <>
      {/* Dynamic Meta Tags for Sharing */}
      {selectedSinger && currentSong && (
        <Head>
          <meta property="og:title" content={`${language === 'ta' && currentSong.title_ta ? currentSong.title_ta : currentSong.title} - ${language === 'ta' && selectedSinger.name_ta ? selectedSinger.name_ta : selectedSinger.name}`} />
          <meta property="og:description" content={`Listen to ${language === 'ta' && currentSong.title_ta ? currentSong.title_ta : currentSong.title} by ${language === 'ta' && selectedSinger.name_ta ? selectedSinger.name_ta : selectedSinger.name} on Hello Madurai Digital FM`} />
          <meta property="og:image" content={selectedSinger.imageUrl || '/logo.jpg'} />
          <meta property="og:type" content="music.song" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={`${language === 'ta' && currentSong.title_ta ? currentSong.title_ta : currentSong.title} - ${language === 'ta' && selectedSinger.name_ta ? selectedSinger.name_ta : selectedSinger.name}`} />
          <meta name="twitter:description" content={`Listen to ${language === 'ta' && currentSong.title_ta ? currentSong.title_ta : currentSong.title} by ${language === 'ta' && selectedSinger.name_ta ? selectedSinger.name_ta : selectedSinger.name} on Hello Madurai Digital FM`} />
          <meta name="twitter:image" content={selectedSinger.imageUrl || '/logo.jpg'} />
        </Head>
      )}

      <div className="min-h-screen bg-gray-50">
        <audio ref={musicAudioRef} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl" suppressHydrationWarning>
            {language === 'ta' ? 'டிஜிட்டல் எஃப்.எம்' : 'Digital FM'}
          </h1>
          <p className="mt-2 text-lg text-gray-600" suppressHydrationWarning>
            {language === 'ta'
              ? 'மதுரையின் வரலாறு, விவசாயம், தொழில் மற்றும் கதைகள்'
              : 'Madurai – History, Agriculture, Industry & Stories'}
          </p>
        </div>

        {!selectedSinger ? (
          <>
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

            {/* Artists Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {filteredSingers.map((singer, index) => {
                  const shouldShowAd = (index + 1) % 15 === 0 && ads.length > 0 // After 3 rows (5 cols x 3 rows = 15)
                  const adIndex = Math.floor(index / 15) % ads.length

                  return (
                    <>
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
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserIcon className="h-1/2 w-1/2 text-gray-400" />
                            </div>
                          )}
                          {singer.featured && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 rounded-full p-1">
                              <span className="text-xs font-bold">⭐</span>
                            </div>
                          )}
                        </div>
                        <h3 className="text-center font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {language === 'ta' && singer.name_ta ? singer.name_ta : singer.name}
                        </h3>
                        <p className="text-center text-sm text-gray-500">
                          {singer._count?.songs || 0} {language === 'ta' ? 'ஆடியோக்கள்' : 'audios'}
                        </p>
                      </div>
                      {shouldShowAd && renderAd(ads[adIndex], index)}
                    </>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          // Artist's Audio List View
          <div>
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedSinger(null)
                setSongs([])
                setShowComments(false)
              }}
              className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              {language === 'ta' ? 'பின் செல்' : 'Back'}
            </button>

            {/* Artist Info - Centered */}
            <div className="flex flex-col items-center text-center mb-8 bg-white p-8 rounded-lg shadow">
              {selectedSinger.imageUrl ? (
                <img
                  src={selectedSinger.imageUrl}
                  alt={selectedSinger.name}
                  className="w-32 h-32 rounded-full object-contain mb-4"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                  <UserIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {language === 'ta' && selectedSinger.name_ta ? selectedSinger.name_ta : selectedSinger.name}
              </h2>
              <p className="text-gray-600 text-lg">
                {songs.length} {language === 'ta' ? 'ஆடியோக்கள்' : 'audios'}
              </p>
            </div>

            {/* Comments Toggle */}
            <div className="mb-6">
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ChatBubbleLeftIcon className="h-5 w-5" />
                {showComments
                  ? (language === 'ta' ? 'கருத்துகளை மறை' : 'Hide Comments')
                  : (language === 'ta' ? `கருத்துகள் (${comments.length})` : `Comments (${comments.length})`)}
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <div className="mb-8 bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">
                  {language === 'ta' ? 'கருத்துகள்' : 'Comments'}
                </h3>

                {/* Add Comment Form */}
                <div className="mb-6 space-y-3">
                  <input
                    type="text"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    placeholder={language === 'ta' ? 'உங்கள் பெயர்' : 'Your name'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={language === 'ta' ? 'உங்கள் கருத்தை எழுதுங்கள்...' : 'Write your comment...'}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSubmitComment}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {language === 'ta' ? 'சமர்ப்பிக்கவும்' : 'Submit'}
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      {language === 'ta' ? 'கருத்துகள் இல்லை' : 'No comments yet'}
                    </p>
                  ) : (
                    comments.map(comment => (
                      <div key={comment.id} className="border-b border-gray-200 pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-gray-900">{comment.author}</span>
                          <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Audio List */}
            <div className="space-y-4">
              {loadingSongs ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                        <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                songs.map(song => {
                  const isLiked = likedSongs.has(song.id)
                  const likeCount = likeCounts[song.id] || 0

                  return (
                    <div key={song.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      {/* Play Button */}
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700"
                      >
                        {currentSong?.id === song.id && isMusicPlaying ? (
                          <PauseIcon className="h-6 w-6" />
                        ) : (
                          <PlayIcon className="h-6 w-6" />
                        )}
                      </button>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {language === 'ta' && song.title_ta ? song.title_ta : song.title}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(song.createdAt)} • {song.duration || '0:00'} • {song.plays} {language === 'ta' ? 'பார்வைகள்' : 'plays'}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        {/* Like */}
                        <button
                          onClick={() => handleLike(song.id)}
                          className="flex items-center gap-1 text-gray-600 hover:text-red-600"
                        >
                          {isLiked ? (
                            <HeartIconSolid className="h-5 w-5 text-red-600" />
                          ) : (
                            <HeartIcon className="h-5 w-5" />
                          )}
                          <span className="text-sm">{likeCount}</span>
                        </button>

                        {/* Share */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenShareMenu(openShareMenu === song.id ? null : song.id)
                            }}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <ShareIcon className="h-5 w-5" />
                          </button>
                          {openShareMenu === song.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                            >
                              <button
                                onClick={() => {
                                  handleShare(song, 'whatsapp')
                                  setOpenShareMenu(null)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-t-lg"
                              >
                                WhatsApp
                              </button>
                              <button
                                onClick={() => {
                                  handleShare(song, 'facebook')
                                  setOpenShareMenu(null)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100"
                              >
                                Facebook
                              </button>
                              <button
                                onClick={() => {
                                  handleShare(song, 'copy')
                                  setOpenShareMenu(null)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded-b-lg"
                              >
                                {language === 'ta' ? 'இணைப்பை நகலெடு' : 'Copy Link'}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Shares Count */}
                        <span className="text-sm text-gray-500">{song.shares}</span>
                      </div>
                    </div>
                  </div>
                )
              })
              )}
            </div>
          </div>
        )}

        {/* Fixed Music Player */}
        {currentSong && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
            <div className="mx-auto max-w-7xl px-4 py-4">
              <div className="flex items-center gap-4">
                {/* Play/Pause */}
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
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700"
                >
                  {isMusicPlaying ? (
                    <PauseIcon className="h-5 w-5" />
                  ) : (
                    <PlayIcon className="h-5 w-5" />
                  )}
                </button>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {language === 'ta' && currentSong.title_ta ? currentSong.title_ta : currentSong.title}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {currentSong.singer && (language === 'ta' && currentSong.singer.name_ta
                      ? currentSong.singer.name_ta
                      : currentSong.singer.name)}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-sm text-gray-600">{formatTime(musicCurrentTime)}</span>
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
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600">{formatTime(musicDuration)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default function DigitalFMPage() {
  return (
    <>
      <NewspaperHeader />
      <NewHeader />
      <DigitalFMPageContent />
    </>
  )
}
