'use client'

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react'

interface RadioSong {
  id: string
  title: string
  title_ta: string | null
  audioUrl: string
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
  playSong: (song: RadioSong) => void
  pauseSong: () => void
  resumeSong: () => void
  togglePlayPause: () => void
  seekTo: (time: number) => void
  setCurrentSong: (song: RadioSong | null) => void
}

const RadioPlayerContext = createContext<RadioPlayerContextType | undefined>(undefined)

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
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('durationchange', handleDurationChange)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  const playSong = (song: RadioSong) => {
    if (audioRef.current) {
      setCurrentSong(song)
      audioRef.current.src = song.audioUrl
      audioRef.current.play()
      setIsPlaying(true)

      // Track play count
      fetch(`/api/radio-songs/${song.id}/play`, { method: 'POST' })
        .catch(err => console.error('Error tracking play:', err))
    }
  }

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause()
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
        setCurrentSong,
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

