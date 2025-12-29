'use client'

import React, { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  PlayIcon,
  PauseIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  UserIcon,
  ArrowLeftIcon,
  XMarkIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRadioPlayer } from '@/contexts/RadioPlayerContext'
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
  slug: string | null
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
  audioType: string
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
  isAdminReply?: boolean
  replies?: Comment[]
}

function DigitalFMPageContent() {
  const { language } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Use global radio player
  const {
    currentSong,
    isPlaying: isMusicPlaying,
    currentTime: musicCurrentTime,
    duration: musicDuration,
    playSong,
    pauseSong,
    resumeSong,
    togglePlayPause,
    seekTo,
    setCurrentSong
  } = useRadioPlayer()

  // State
  const [categories, setCategories] = useState<RadioCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedSinger, setSelectedSinger] = useState<Singer | null>(null)
  const [songs, setSongs] = useState<RadioSong[]>([])
  const [allSongs, setAllSongs] = useState<RadioSong[]>([]) // All songs for search
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const [loadingSongs, setLoadingSongs] = useState(false)
  const [ads, setAds] = useState<Ad[]>([])
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set())
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [stateRestored, setStateRestored] = useState(false)

  // Comments state
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [commentAuthor, setCommentAuthor] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)

  // Share menu state
  const [openShareMenu, setOpenShareMenu] = useState<string | null>(null)

  // Note: Playback state is now managed by global RadioPlayerContext

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

  // Restore state on mount - BEFORE categories load
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedSinger = localStorage.getItem('radio_selected_singer')
        const savedSongs = localStorage.getItem('radio_songs')
        const savedCurrentSong = localStorage.getItem('radio_current_song')
        const savedTime = localStorage.getItem('radio_current_time')

        console.log('🔄 Attempting to restore state...', {
          hasSinger: !!savedSinger,
          hasSongs: !!savedSongs,
          hasCurrentSong: !!savedCurrentSong
        })

        if (savedSinger && savedSongs) {
          const singer = JSON.parse(savedSinger)
          const songsData = JSON.parse(savedSongs)

          console.log('✅ Restoring artist view:', singer.name, 'with', songsData.length, 'songs')

          // Set state immediately to prevent showing artist grid
          setSelectedSinger(singer)
          setSongs(songsData)
          setStateRestored(true)
          setLoading(false) // Stop loading immediately

          // Restore like statuses in background
          const songIds = songsData.map((song: RadioSong) => song.id)
          fetch('/api/radio-songs/likes/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songIds })
          })
            .then(res => res.json())
            .then(likeStatuses => {
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
            })
            .catch(err => console.error('Error fetching like statuses:', err))
        } else {
          console.log('ℹ️ No saved state found, will show artist grid')
          // Mark restoration as complete even if no state to restore
          setStateRestored(true)
        }

        // Current song is now managed by global RadioPlayerContext
        // No need to restore here
      } catch (error) {
        console.error('❌ Error restoring state:', error)
        // Mark restoration as complete even on error
        setStateRestored(true)
      }
    }

    restoreState()
  }, [])

  // Handle browser back/forward button
  useEffect(() => {
    const handlePopState = () => {
      const artistSlug = new URLSearchParams(window.location.search).get('artist')

      if (!artistSlug) {
        // User navigated back to main /radio page
        console.log('🔙 Browser back button - clearing artist view')
        setSelectedSinger(null)
        setSongs([])
        setShowComments(false)
        // Note: currentSong is managed by global RadioPlayerContext
        localStorage.removeItem('radio_selected_singer')
        localStorage.removeItem('radio_songs')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // Handle artist slug from URL parameter
  useEffect(() => {
    const artistSlug = searchParams.get('artist')

    if (artistSlug && Array.isArray(categories) && categories.length > 0 && !selectedSinger) {
      console.log('🔍 Restoring artist from URL:', artistSlug)

      // Find singer by slug across all categories
      let foundSinger: Singer | null = null
      for (const category of categories) {
        if (category.singers && Array.isArray(category.singers)) {
          const singer = category.singers.find(s => s.slug === artistSlug)
          if (singer) {
            foundSinger = singer
            console.log('✅ Found singer:', singer.name)
            break
          }
        }
      }

      if (foundSinger) {
        // Directly load singer's songs without calling handleSingerClick to avoid dependency issues
        setLoadingSongs(true)
        setSelectedSinger(foundSinger)

        fetch(`/api/radio-songs/singer/${foundSinger.id}`)
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch songs')
            return res.json()
          })
          .then(data => {
            if (data && Array.isArray(data) && data.length > 0) {
              // Merge with existing duration data from allSongs
              const mergedData = data.map((song: RadioSong) => {
                const existingSong = allSongs.find(s => s.id === song.id)
                return existingSong && existingSong.duration ? existingSong : song
              })

              setSongs(mergedData)
              console.log('✅ Restored artist view with', mergedData.length, 'songs')

              // Batch fetch like statuses
              if (mergedData.length > 0) {
                const songIds = mergedData.map((s: RadioSong) => s.id)
                fetch('/api/radio-songs/likes/batch', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ songIds })
                })
                  .then(res => res.json())
                  .then(likeStatuses => {
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
                  })
                  .catch(err => console.error('Error fetching likes:', err))
              }
            } else {
              setSongs([])
            }
          })
          .catch(error => {
            console.error('❌ Error fetching songs:', error)
            toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Error loading songs')
            setSongs([])
          })
          .finally(() => {
            setLoadingSongs(false)
          })
      } else {
        console.log('❌ Singer not found for slug:', artistSlug)
      }
    } else if (!artistSlug && selectedSinger) {
      // URL has no artist param but we have a selected singer - clear it
      console.log('🔄 No artist in URL, clearing selected singer')
      setSelectedSinger(null)
      setSongs([])
    }
  }, [searchParams, categories, allSongs, language, selectedSinger])

  // Handle song query parameter from share links
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const songId = urlParams.get('song')

    if (songId) {
      console.log('🔗 Loading shared song:', songId)
      // Fetch the song and its singer
      fetch(`/api/radio-songs/${songId}`)
        .then(res => res.json())
        .then(async (song) => {
          if (song && song.singer) {
            console.log('✅ Found shared song:', song.title, 'by', song.singer.name)
            // Fetch all songs by this singer
            const songsRes = await fetch(`/api/radio-songs/singer/${song.singerId}`)
            const songsData = await songsRes.json()

            setSelectedSinger(song.singer)
            setSongs(songsData)
            setCurrentSong(song)
            setLoading(false)
            setLoadingSongs(false)

            // Scroll to the song after a short delay to ensure DOM is ready
            setTimeout(() => {
              const songElement = document.getElementById(`song-${songId}`)
              if (songElement) {
                console.log('📍 Scrolling to shared song')
                songElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                // Add a highlight effect
                songElement.classList.add('ring-4', 'ring-blue-400', 'ring-opacity-50')
                setTimeout(() => {
                  songElement.classList.remove('ring-4', 'ring-blue-400', 'ring-opacity-50')
                }, 3000)
              } else {
                console.log('⚠️ Song element not found:', `song-${songId}`)
              }
            }, 1000)
          }
        })
        .catch(err => console.error('Error loading shared song:', err))
    }
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

  // Fetch only essential data on page load (categories and ads)
  // Songs are loaded on-demand when clicking an artist
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch categories and ads - skip all songs for faster initial load
        const [categoriesRes, adsRes] = await Promise.all([
          fetch('/api/radio-categories', { cache: 'no-store' }),
          fetch('/api/ads/active?category=radio', { cache: 'no-store' })
        ])

        // Check for errors
        if (!categoriesRes.ok) {
          console.error('❌ Categories API failed:', categoriesRes.status, categoriesRes.statusText)
          throw new Error('Failed to fetch categories')
        }

        const [categoriesData, adsData] = await Promise.all([
          categoriesRes.json(),
          adsRes.ok ? adsRes.json() : []
        ])

        // Ensure we have arrays
        const safeCategories = Array.isArray(categoriesData) ? categoriesData : []
        const safeAds = Array.isArray(adsData) ? adsData : []

        setCategories(safeCategories)
        setAds(safeAds)

        console.log('📂 Categories loaded:', safeCategories.length, 'categories')
        console.log('📢 Ads loaded:', safeAds.length, 'ads')

        // Only set selected category if state was NOT restored
        if (safeCategories.length > 0 && !stateRestored) {
          setSelectedCategory(safeCategories[0].id)
          console.log('📌 Selected first category:', safeCategories[0].name)
        }

        // Track ad impressions asynchronously without blocking
        if (safeAds.length > 0) {
          setTimeout(() => {
            safeAds.forEach((ad: Ad) => {
              fetch(`/api/ads/${ad.id}/impression`, { method: 'POST' }).catch(() => {})
            })
          }, 0)
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error)
        toast.error(language === 'ta' ? 'தரவு ஏற்ற முடியவில்லை' : 'Failed to load data')
        // Set empty arrays to prevent crashes
        setCategories([])
        setAds([])
      } finally {
        // Only set loading to false if we didn't restore state
        if (!stateRestored) {
          setLoading(false)
          console.log('✅ Loading complete - showing artist grid')
        } else {
          console.log('✅ Loading complete - artist view already restored')
        }
      }
    }
    fetchData()
  }, [stateRestored, language])

  // Lazy load all songs only when search is initiated
  useEffect(() => {
    if (searchQuery && allSongs.length === 0) {
      console.log('🔍 Loading all songs for search...')
      fetch('/api/radio-songs', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          const safeSongs = Array.isArray(data) ? data : []
          setAllSongs(safeSongs)
          console.log('🎵 All songs loaded for search:', safeSongs.length, 'songs')
        })
        .catch(err => console.error('Error loading songs for search:', err))
    }
  }, [searchQuery, allSongs.length])

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

  // Note: Audio playback is now managed by global RadioPlayerContext
  // Duration update logic is handled there as well

  // Handlers
  const handleSingerClick = async (singer: Singer) => {
    setLoadingSongs(true)

    // Update URL immediately for better perceived performance
    // Use pushState to ADD to browser history (so back button works)
    if (singer.slug) {
      window.history.pushState({}, '', `/radio?artist=${singer.slug}`)
    }

    try {
      // Fetch songs first
      const songsRes = await fetch(`/api/radio-songs/singer/${singer.id}`, { cache: 'no-store' })
      const data = await songsRes.json()

      if (data && data.length > 0) {
        // Merge with existing duration data from allSongs if available
        const mergedData = data.map((song: RadioSong) => {
          const existingSong = allSongs.find(s => s.id === song.id)
          return existingSong && existingSong.duration ? existingSong : song
        })

        setSongs(mergedData)
        setSelectedSinger(singer)

        // Fetch like statuses for these songs
        const songIds = data.map((song: RadioSong) => song.id)

        fetch('/api/radio-songs/likes/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ songIds })
        })
          .then(res => res.json())
          .then(likeStatuses => {
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
          })
          .catch(err => console.error('Error fetching likes:', err))
      } else {
        setSongs([])
        setSelectedSinger(singer)
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Error loading songs')
    } finally {
      setLoadingSongs(false)
    }
  }

  const handlePlaySong = async (song: RadioSong) => {
    console.log('🎵 handlePlaySong called with:', song.title, song.audioType)
    console.log('🔍 Current song ID:', currentSong?.id, 'New song ID:', song.id)

    // Handle both direct audio files and embedded radio stations using global player
    if (currentSong?.id === song.id) {
      console.log('🔄 Toggling play/pause for current song')
      // Toggle play/pause for current song
      togglePlayPause()
    } else {
      console.log('🎵 Playing new song via playSong()')
      // Play new song using global player (handles both direct and embed types)
      playSong(song)
    }
  }

  const handleLike = async (songId: string) => {
    const isLiked = likedSongs.has(songId)
    const method = isLiked ? 'DELETE' : 'POST'

    // Optimistic UI update - update immediately before API call
    setLikedSongs(prev => {
      const newSet = new Set(prev)
      if (isLiked) {
        newSet.delete(songId)
      } else {
        newSet.add(songId)
      }
      return newSet
    })

    // Optimistically update count
    const currentCount = likeCounts[songId] || 0
    const optimisticCount = isLiked ? Math.max(0, currentCount - 1) : currentCount + 1
    setLikeCounts(prev => ({
      ...prev,
      [songId]: optimisticCount
    }))

    try {
      const res = await fetch(`/api/radio-songs/${songId}/like`, {
        method,
        credentials: 'include' // Ensure cookies are sent
      })

      if (!res.ok) {
        const data = await res.json()
        console.error('❌ Like API error:', data)
        throw new Error(data.error || 'Failed to update like')
      }

      const data = await res.json()
      console.log('✅ Like updated:', { songId, liked: data.liked, count: data.likeCount })

      // Update with actual count from server
      setLikeCounts(prev => ({
        ...prev,
        [songId]: data.likeCount
      }))
    } catch (error) {
      console.error('❌ Error toggling like:', error)
      // Revert on error
      setLikedSongs(prev => {
        const newSet = new Set(prev)
        if (isLiked) {
          newSet.add(songId)
        } else {
          newSet.delete(songId)
        }
        return newSet
      })
      setLikeCounts(prev => ({
        ...prev,
        [songId]: currentCount
      }))
      toast.error(language === 'ta' ? 'பிழை ஏற்பட்டது' : 'Error occurred')
    }
  }

  const handleShare = async (song: RadioSong, platform: 'whatsapp' | 'facebook' | 'copy') => {
    // Use the share page URL which has proper Open Graph meta tags
    const shareUrl = `${window.location.origin}/radio/share/${song.id}`
    const title = language === 'ta' && song.title_ta ? song.title_ta : song.title
    const artistName = selectedSinger
      ? (language === 'ta' && selectedSinger.name_ta ? selectedSinger.name_ta : selectedSinger.name)
      : ''

    // Create share text with artist info
    const shareText = `${title}\n${language === 'ta' ? 'கலைஞர்' : 'Artist'}: ${artistName}\n\n${shareUrl}`

    try {
      if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
      } else if (platform === 'facebook') {
        // Facebook will fetch Open Graph meta tags from the share page
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
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

    // Close the share menu
    setOpenShareMenu(null)
  }

  const handleSubmitComment = async () => {
    if (!selectedSinger || !newComment.trim() || !commentAuthor.trim()) {
      toast.error(language === 'ta' ? 'அனைத்து புலங்களையும் நிரப்பவும்' : 'Please fill all fields')
      return
    }

    if (submittingComment) return // Prevent double submission

    setSubmittingComment(true)
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
    } finally {
      setSubmittingComment(false)
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

  // Enhanced filter - search across all categories and include song content
  const getFilteredSingers = () => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return []
    }

    if (!searchQuery) {
      // No search query - show singers from selected category
      const category = categories.find(cat => cat.id === selectedCategory)
      return category?.singers || []
    }

    // Search query exists - search across ALL categories
    const query = searchQuery.toLowerCase()
    const allSingers: Singer[] = []
    const matchedSingerIds = new Set<string>()

    categories.forEach(category => {
      if (category.singers && Array.isArray(category.singers)) {
        category.singers.forEach(singer => {
          // Check if singer name matches
          const singerNameMatch =
            singer.name.toLowerCase().includes(query) ||
            singer.name_ta?.toLowerCase().includes(query)

          // Add singer if name matches (prioritize artist matches)
          if (singerNameMatch && !matchedSingerIds.has(singer.id)) {
            matchedSingerIds.add(singer.id)
            allSingers.push(singer)
          }
        })
      }
    })

    return allSingers
  }

  // Get matching songs for search
  const getFilteredSongs = () => {
    if (!searchQuery || !Array.isArray(allSongs)) return []

    const query = searchQuery.toLowerCase()
    return allSongs.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.title_ta?.toLowerCase().includes(query)
    )
  }

  const filteredSingers = getFilteredSingers()
  const filteredSongs = getFilteredSongs()

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
    <div className="min-h-screen bg-gray-50">
      {/* Audio is now managed by global RadioPlayerContext */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl" suppressHydrationWarning>
            {language === 'ta' ? 'டிஜிட்டல் எஃப்.எம் & ரேடியோ' : 'Digital Fm & Radio'}
          </h1>
          <p className="mt-2 text-lg text-gray-600" suppressHydrationWarning>
            {language === 'ta'
              ? 'ரேடியோ, செய்தி, இசை, லோக்கல் தகவல்கள் அனைத்தும்'
              : 'Radio, News, Music, Local Information Everything'}
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
                  placeholder={language === 'ta'
                    ? 'கலைஞர்கள் அல்லது பாடல்களைத் தேடுங்கள்...'
                    : 'Search artists or songs across all categories...'}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-3.5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  {language === 'ta'
                    ? `"${searchQuery}" க்கான முடிவுகள் - அனைத்து வகைகளிலும் தேடப்பட்டது`
                    : `Results for "${searchQuery}" - searched across all categories`}
                </p>
              )}
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
              <>
                {/* Artists Section - Show when searching */}
                {searchQuery && filteredSingers.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {language === 'ta' ? 'கலைஞர்கள்' : 'Artists'} ({filteredSingers.length})
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {filteredSingers.map((singer) => (
                        <div
                          key={singer.id}
                          onClick={() => handleSingerClick(singer)}
                          className="cursor-pointer group flex-shrink-0"
                        >
                          <div className="relative w-24 h-24 mb-2 overflow-hidden rounded-full bg-gray-200 group-hover:ring-4 group-hover:ring-blue-300 transition-all">
                            {singer.imageUrl ? (
                              <img
                                src={singer.imageUrl}
                                alt={singer.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <UserIcon className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <p className="text-center text-sm font-medium text-gray-900 w-24 truncate">
                            {language === 'ta' && singer.name_ta ? singer.name_ta : singer.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Songs Section - Show when searching */}
                {searchQuery && filteredSongs.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {language === 'ta' ? 'ஆடியோ கோப்புகள்' : 'Audio Files'} ({filteredSongs.length})
                    </h3>
                    <div className="space-y-3">
                      {filteredSongs.map((song) => (
                        <div
                          key={song.id}
                          onClick={() => {
                            playSong(song)
                          }}
                          className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <MusicalNoteIcon className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">
                              {language === 'ta' && song.title_ta ? song.title_ta : song.title}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {song.singer?.name} • {song.duration || '0:00'} • {song.plays} {language === 'ta' ? 'பார்வைகள்' : 'plays'}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <PlayIcon className="h-8 w-8 text-blue-600" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Artist Grid - Show when not searching */}
                {!searchQuery && (
                  <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 ${currentSong ? 'pb-32' : ''}`}>
                    {filteredSingers.map((singer, index) => {
                      const shouldShowAd = (index + 1) % 15 === 0 && ads.length > 0
                      const adIndex = Math.floor(index / 15) % ads.length

                      return (
                        <React.Fragment key={`singer-${singer.id}-${index}`}>
                          <div
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
                              {singer._count?.songs || 0} {language === 'ta' ? 'ஆடியோக்கள்' : 'Audios'}
                            </p>
                          </div>
                          {shouldShowAd && renderAd(ads[adIndex], index)}
                        </React.Fragment>
                      )
                    })}
                  </div>
                )}

                {/* No Results Message */}
                {searchQuery && filteredSingers.length === 0 && filteredSongs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {language === 'ta' ? 'முடிவுகள் இல்லை' : 'No results found'}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          // Artist's Audio List View
          <div>
            {/* Back Button */}
            <button
              onClick={() => {
                console.log('🔙 Going back to artist grid')
                // Use browser's back button - this will trigger popstate event
                window.history.back()
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
                {songs.length} {language === 'ta' ? 'ஆடியோக்கள்' : 'Audios'}
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
                    disabled={submittingComment}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment
                      ? (language === 'ta' ? 'சமர்ப்பிக்கிறது...' : 'Submitting...')
                      : (language === 'ta' ? 'சமர்ப்பிக்கவும்' : 'Submit')
                    }
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
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{comment.author}</span>
                            {comment.isAdminReply && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                                {language === 'ta' ? 'நிர்வாகி' : 'Admin'}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 ml-6 space-y-3 border-l-2 border-blue-200 pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className={`p-3 rounded-lg ${
                                reply.isAdminReply
                                  ? 'bg-blue-50 border border-blue-200'
                                  : 'bg-gray-50'
                              }`}>
                                <div className="flex justify-between items-start mb-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm text-gray-900">{reply.author}</span>
                                    {reply.isAdminReply && (
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-600 text-white">
                                        {language === 'ta' ? 'நிர்வாகி' : 'Admin'}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="text-sm text-gray-700">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Audio List */}
            <div className={`space-y-4 ${currentSong ? 'pb-32' : ''}`}>
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
                    <div
                      key={song.id}
                      id={`song-${song.id}`}
                      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all"
                    >
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

        {/* Music Player is now global - shown at bottom of all pages via GlobalRadioPlayer component */}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            External Radio links Only | Rights Belong to Respective Owners,<br />
            Original Content © Hello Madurai
          </div>
        </div>

      </div>
    </div>
  )
}

// Wrapper component to handle Suspense boundary
function DigitalFMPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Digital FM & Radio...</p>
        </div>
      </div>
    }>
      <DigitalFMPageContent />
    </Suspense>
  )
}

export default function DigitalFMPage() {
  return (
    <>
      <NewspaperHeader />
      <NewHeader />
      <DigitalFMPageWrapper />
    </>
  )
}
