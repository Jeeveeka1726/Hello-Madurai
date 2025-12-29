'use client'

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface RadioSong {
  id: string
  title: string
  title_ta: string | null
  audioUrl: string
  audioType: string
  duration: string | null
  plays: number
  shares: number
  singer?: {
    id: string
    name: string
    name_ta: string | null
    imageUrl: string | null
  }
}

interface RadioPlayerContextType {
  currentSong: RadioSong | null
  isPlaying: boolean
  currentTime: number
  duration: number
  audioRef: React.RefObject<HTMLAudioElement>
  playSong: (song: RadioSong) => Promise<void>
  pauseSong: () => void
  resumeSong: () => void
  togglePlayPause: () => void
  seekTo: (time: number) => void
  setCurrentSong: (song: RadioSong | null) => void
}

const RadioPlayerContext = createContext<RadioPlayerContextType | undefined>(undefined)

// Utility function to validate and potentially fix audio URLs
const validateAndFixAudioUrl = (url: string): string => {
  if (!url) return url

  console.log('🔗 Original URL:', url)

  // Handle Google Drive links
  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (fileIdMatch) {
      const fileId = fileIdMatch[1]
      const fixedUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
      console.log('🔧 Fixed Google Drive URL:', fixedUrl)
      return fixedUrl
    }
  }

  // Handle Dropbox links
  if (url.includes('dropbox.com') && !url.includes('dl=1')) {
    const fixedUrl = url.replace('dl=0', 'dl=1').replace(/\?.*/, '') + '?dl=1'
    console.log('🔧 Fixed Dropbox URL:', fixedUrl)
    return fixedUrl
  }

  // Handle OneDrive links
  if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
    if (!url.includes('download=1')) {
      const fixedUrl = url + (url.includes('?') ? '&' : '?') + 'download=1'
      console.log('🔧 Fixed OneDrive URL:', fixedUrl)
      return fixedUrl
    }
  }

  // Handle YouTube links (not directly playable, but we can detect them)
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    console.warn('⚠️ YouTube URLs cannot be played directly. Please use a direct audio file URL.')
    return url
  }

  // Handle SoundCloud links (not directly playable)
  if (url.includes('soundcloud.com')) {
    console.warn('⚠️ SoundCloud URLs cannot be played directly. Please use a direct audio file URL.')
    return url
  }

  // Handle radio station webpage URLs (not direct streams)
  if (url.includes('tamilradios.com') || url.includes('radio.com') || url.includes('tunein.com')) {
    console.warn('⚠️ Radio station webpage URLs cannot be played directly. Please find the direct stream URL (usually ends with .m3u8, .pls, or .mp3).')
    return url
  }

  // Handle common radio streaming formats
  if (url.includes('.m3u8') || url.includes('.pls') || url.includes('.m3u')) {
    console.log('🎵 Detected streaming format:', url)
    return url
  }

  console.log('✅ URL appears to be a direct link:', url)
  return url
}

export function RadioPlayerProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<RadioSong | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Restore state from localStorage on mount
  useEffect(() => {
    const savedSong = localStorage.getItem('radio_current_song')
    const savedTime = localStorage.getItem('radio_current_time')
    const savedIsPlaying = localStorage.getItem('radio_is_playing')

    if (savedSong) {
      const song = JSON.parse(savedSong)
      setCurrentSong(song)
      
      if (audioRef.current) {
        audioRef.current.src = song.audioUrl
        if (savedTime) {
          audioRef.current.currentTime = parseFloat(savedTime)
        }
        if (savedIsPlaying === 'true') {
          audioRef.current.play().catch(err => console.log('Auto-play prevented:', err))
          setIsPlaying(true)
        }
      }
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('radio_current_song', JSON.stringify(currentSong))
      localStorage.setItem('radio_is_playing', isPlaying.toString())
    }
  }, [currentSong, isPlaying])

  // Save current time periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && currentSong) {
        localStorage.setItem('radio_current_time', audioRef.current.currentTime.toString())
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSong])

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleDurationChange = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('durationchange', handleDurationChange)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      // Always stop any streams on unmount (don't check song type to avoid dependency issues)
      console.log('🛑 Component unmounting - stopping all audio streams')
      audio.pause()
      audio.src = ''
      audio.load()

      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  const playSong = async (song: RadioSong) => {
    console.log('🎵 Playing song:', song.title, 'URL:', song.audioUrl, 'Type:', song.audioType)
    console.log('🔍 Full song object:', JSON.stringify(song, null, 2))

    // Stop any currently playing embedded radio before starting new song
    if (currentSong?.audioType === 'embed' && audioRef.current) {
      console.log('🛑 Stopping previous embedded radio stream')
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.load()
    }

    setCurrentSong(song)

    // Handle embedded radio stations
    if (song.audioType === 'embed') {
      console.log('🎵 Extracting stream URL for embedded radio:', song.title)
      setIsPlaying(true) // Show as "playing" in the UI immediately

      try {
        // Extract the actual stream URL from the radio station webpage
        const response = await fetch('/api/radio-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ radioUrl: song.audioUrl })
        })

        if (!response.ok) {
          console.error('❌ API Error:', response.status, response.statusText)
          // Fallback: For SoundCloud and other embeds that can't be extracted
          if (song.audioUrl.includes('soundcloud.com')) {
            console.log('🎵 SoundCloud link detected - opening in new tab')
            window.open(song.audioUrl, '_blank')
          }
          setIsPlaying(false)
          return
        }

        const data = await response.json()

        if (data.success && data.streamUrl) {
          console.log('✅ Found stream URL:', data.streamUrl)
          console.log('🔄 Proxy URL available:', data.proxyUrl)

          // Play the extracted stream URL through the audio player
          if (audioRef.current) {
            console.log('🎵 Setting up radio stream playback')

            // Clear any previous source and reset audio element
            audioRef.current.pause()
            audioRef.current.currentTime = 0

            // Try direct stream URL first
            const streamUrl = data.streamUrl
            console.log('🎵 Loading radio stream:', streamUrl)

            // Simple approach - just set the source and play
            audioRef.current.src = streamUrl
            audioRef.current.load()

            // Wait a moment for the stream to load, then play
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.play()
                  .then(() => {
                    console.log('✅ Radio stream started successfully')
                    setIsPlaying(true)
                  })
                  .catch(err => {
                    console.error('❌ Radio stream failed to start:', err)
                    setIsPlaying(false)
                  })
              }
            }, 1000)
          }
        } else {
          console.error('❌ Failed to extract stream URL:', data.error)
          // Fallback for SoundCloud
          if (song.audioUrl.includes('soundcloud.com')) {
            console.log('🎵 SoundCloud extraction failed - opening in new tab')
            window.open(song.audioUrl, '_blank')
          }
          setIsPlaying(false)
        }
      } catch (error) {
        console.error('❌ Error extracting radio stream:', error)
        // Fallback for SoundCloud
        if (song.audioUrl.includes('soundcloud.com')) {
          console.log('🎵 SoundCloud API error - opening in new tab')
          window.open(song.audioUrl, '_blank')
        }
        setIsPlaying(false)
      }

      // Track play count for embedded radio
      fetch(`/api/radio-songs/${song.id}/play`, { method: 'POST' })
        .catch(err => console.error('Error tracking play:', err))
      return
    }

    // Handle direct audio files
    if (audioRef.current) {
      // Clear any previous source and reset audio element
      audioRef.current.pause()
      audioRef.current.currentTime = 0

      // Validate and fix the audio URL
      const fixedUrl = validateAndFixAudioUrl(song.audioUrl)

      // Set new source
      audioRef.current.src = fixedUrl

      // Add error handling
      const handleError = (e: Event) => {
        console.error('❌ Audio playback error:', e)
        console.error('❌ Audio URL that failed:', song.audioUrl)
        console.error('❌ Audio element error:', audioRef.current?.error)
        setIsPlaying(false)

        // Try to provide more specific error information
        if (audioRef.current?.error) {
          const error = audioRef.current.error
          let errorMessage = 'Unknown audio error'

          switch (error.code) {
            case MediaError.MEDIA_ERR_ABORTED:
              errorMessage = 'Audio playback was aborted'
              break
            case MediaError.MEDIA_ERR_NETWORK:
              errorMessage = 'Network error while loading audio'
              break
            case MediaError.MEDIA_ERR_DECODE:
              errorMessage = 'Audio file is corrupted or unsupported format'
              break
            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
              errorMessage = 'Audio format not supported or URL not accessible'
              break
          }

          console.error('❌ Detailed error:', errorMessage)
        }
      }

      const handleCanPlay = () => {
        console.log('✅ Audio can play, starting playback')
        audioRef.current?.play()
          .then(() => {
            console.log('✅ Audio playback started successfully')
            setIsPlaying(true)
          })
          .catch(err => {
            console.error('❌ Play promise rejected:', err)
            setIsPlaying(false)
          })
      }

      // Remove any existing event listeners
      audioRef.current.removeEventListener('error', handleError)
      audioRef.current.removeEventListener('canplay', handleCanPlay)

      // Add new event listeners
      audioRef.current.addEventListener('error', handleError)
      audioRef.current.addEventListener('canplay', handleCanPlay)

      // Load the audio
      audioRef.current.load()

      // Track play count
      fetch(`/api/radio-songs/${song.id}/play`, { method: 'POST' })
        .catch(err => console.error('Error tracking play:', err))
    }
  }

  const pauseSong = () => {
    console.log('⏸️ pauseSong called for:', currentSong?.audioType)

    if (audioRef.current) {
      audioRef.current.pause()

      // For embedded radio, also clear the source to fully stop the stream
      if (currentSong?.audioType === 'embed') {
        console.log('⏸️ Stopping embedded radio stream')
        audioRef.current.src = ''
        audioRef.current.load()
      }

      setIsPlaying(false)
    }
  }

  const resumeSong = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const togglePlayPause = () => {
    // Handle embedded radio stations
    if (currentSong?.audioType === 'embed') {
      if (isPlaying) {
        console.log('⏸️ Pausing embedded radio - stopping audio')
        // Actually stop the audio element
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.src = '' // Clear the source to stop the stream
          audioRef.current.load() // Reset the audio element
        }
        setIsPlaying(false)
      } else {
        console.log('▶️ Resuming embedded radio - calling playSong to restart stream')
        // "Resume" embedded radio by calling playSong to restart the stream extraction
        if (currentSong) {
          playSong(currentSong)
        }
      }
      return
    }

    // Handle direct audio files
    if (isPlaying) {
      pauseSong()
    } else {
      resumeSong()
    }
  }

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleSetCurrentSong = (song: RadioSong | null) => {
    // If clearing the current song, properly stop and reset audio
    if (!song && currentSong && audioRef.current) {
      console.log('🛑 Clearing current song:', currentSong.audioType)

      // Stop the audio
      audioRef.current.pause()
      audioRef.current.currentTime = 0

      // For embedded radio, also clear the source to fully stop the stream
      if (currentSong.audioType === 'embed') {
        console.log('🛑 Clearing embedded radio stream')
        audioRef.current.src = ''
        audioRef.current.load()
      }

      // Reset all states
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
    }

    setCurrentSong(song)
  }

  return (
    <RadioPlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        audioRef,
        playSong,
        pauseSong,
        resumeSong,
        togglePlayPause,
        seekTo,
        setCurrentSong: handleSetCurrentSong,
      }}
    >
      {children}
      {/* Global audio element */}
      <audio ref={audioRef} preload="metadata" />
    </RadioPlayerContext.Provider>
  )
}

export function useRadioPlayer() {
  const context = useContext(RadioPlayerContext)
  if (context === undefined) {
    throw new Error('useRadioPlayer must be used within a RadioPlayerProvider')
  }
  return context
}

