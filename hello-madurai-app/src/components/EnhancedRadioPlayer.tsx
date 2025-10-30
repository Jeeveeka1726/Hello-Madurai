'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  PlayIcon, 
  PauseIcon, 
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowsRightLeftIcon,
  QueueListIcon,
  HeartIcon,
  ShareIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useLanguage } from '@/contexts/LanguageContext'
import InteractionButtons from './InteractionButtons'

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
  comments?: any[]
  shares?: any[]
}

interface EnhancedRadioPlayerProps {
  shows: RadioShow[]
  currentShowIndex: number
  onShowChange: (index: number) => void
  onCommentClick: (showId: string) => void
  className?: string
}

export default function EnhancedRadioPlayer({ 
  shows, 
  currentShowIndex, 
  onShowChange, 
  onCommentClick,
  className = '' 
}: EnhancedRadioPlayerProps) {
  const { t, language } = useLanguage()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isLiked, setIsLiked] = useState(false)
  const [showPlaylist, setShowPlaylist] = useState(false)
  const [isBackgroundPlay, setIsBackgroundPlay] = useState(false)

  const currentShow = shows[currentShowIndex]

  // Background play functionality
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('Service Worker registered for background play')
      })
    }

    // Media Session API for background controls
    if ('mediaSession' in navigator && currentShow) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentShow.title,
        artist: currentShow.host,
        album: 'Hello Madurai Radio',
        artwork: [
          { src: '/fm-logo.jpg', sizes: '96x96', type: 'image/jpeg' },
          { src: '/fm-logo.jpg', sizes: '128x128', type: 'image/jpeg' },
          { src: '/fm-logo.jpg', sizes: '192x192', type: 'image/jpeg' },
          { src: '/fm-logo.jpg', sizes: '256x256', type: 'image/jpeg' }
        ]
      })

      navigator.mediaSession.setActionHandler('play', () => {
        handlePlay()
      })

      navigator.mediaSession.setActionHandler('pause', () => {
        handlePause()
      })

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        handlePrevious()
      })

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        handleNext()
      })

      navigator.mediaSession.setActionHandler('seekbackward', () => {
        handleSeek(currentTime - 10)
      })

      navigator.mediaSession.setActionHandler('seekforward', () => {
        handleSeek(currentTime + 10)
      })
    }
  }, [currentShow])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadStart = () => setIsLoading(true)
    const handleLoadedData = () => setIsLoading(false)
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      setIsPlaying(false)
      handleNext() // Auto-play next show
    }
    const handleError = () => {
      setIsLoading(false)
      console.error('Audio playback error')
    }

    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('loadeddata', handleLoadedData)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('loadeddata', handleLoadedData)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [currentShowIndex])

  // Load current show
  useEffect(() => {
    if (audioRef.current && currentShow) {
      audioRef.current.src = currentShow.audioUrl
      audioRef.current.playbackRate = playbackRate
      if (isPlaying) {
        audioRef.current.play()
      }
    }
  }, [currentShowIndex, currentShow])

  const handlePlay = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
        setIsBackgroundPlay(true)
        
        // Record play count
        fetch(`/api/radio/${currentShow.id}/play`, { method: 'POST' })
      } catch (error) {
        console.error('Play failed:', error)
      }
    }
  }

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleNext = () => {
    const nextIndex = (currentShowIndex + 1) % shows.length
    onShowChange(nextIndex)
  }

  const handlePrevious = () => {
    const prevIndex = currentShowIndex === 0 ? shows.length - 1 : currentShowIndex - 1
    onShowChange(prevIndex)
  }

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, duration))
    }
  }

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume
        setIsMuted(false)
      } else {
        audioRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate)
    if (audioRef.current) {
      audioRef.current.playbackRate = rate
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (!currentShow) return null

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Main Player */}
      <div className="p-6">
        {/* Show Info */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <SpeakerWaveIcon className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {language === 'ta' && currentShow.title_ta ? currentShow.title_ta : currentShow.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('radio.host', 'Host:', 'தொகுப்பாளர்:')} {currentShow.host}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {currentShow.duration} • {currentShow.plays.toLocaleString()} {t('radio.plays', 'plays', 'ஒலிப்பு')}
            </p>
          </div>
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isLiked ? (
              <HeartSolid className="h-6 w-6 text-red-500" />
            ) : (
              <HeartIcon className="h-6 w-6 text-gray-400" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div 
            className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const percent = (e.clientX - rect.left) / rect.width
              handleSeek(percent * duration)
            }}
          >
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            onClick={handlePrevious}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <BackwardIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>

          <button
            onClick={() => handleSeek(currentTime - 10)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">-10s</span>
          </button>

          <button
            onClick={isPlaying ? handlePause : handlePlay}
            disabled={isLoading}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
            ) : isPlaying ? (
              <PauseIcon className="h-6 w-6" />
            ) : (
              <PlayIcon className="h-6 w-6" />
            )}
          </button>

          <button
            onClick={() => handleSeek(currentTime + 10)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">+10s</span>
          </button>

          <button
            onClick={handleNext}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ForwardIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Secondary Controls */}
        <div className="flex items-center justify-between">
          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="p-1">
              {isMuted ? (
                <SpeakerXMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <SpeakerWaveIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Playback Speed */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Speed:</span>
            <select
              value={playbackRate}
              onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
              className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1"
            >
              <option value={0.5}>0.5x</option>
              <option value={0.75}>0.75x</option>
              <option value={1}>1x</option>
              <option value={1.25}>1.25x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>

          {/* Playlist Toggle */}
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <QueueListIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Background Play Indicator */}
        {isBackgroundPlay && isPlaying && (
          <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
              🎵 {t('radio.backgroundPlay', 'Playing in background', 'பின்னணியில் ஒலிக்கிறது')}
            </p>
          </div>
        )}

        {/* Interaction Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <InteractionButtons
            itemId={currentShow.id}
            itemType="radio"
            title={currentShow.title}
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/radio#${currentShow.id}`}
            likes={0}
            comments={currentShow.comments?.length || 0}
            shares={currentShow.shares?.length || 0}
            onComment={() => onCommentClick(currentShow.id)}
          />
        </div>
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div className="border-t border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              {t('radio.playlist', 'Playlist', 'பட்டியல்')} ({shows.length})
            </h4>
            <div className="space-y-2">
              {shows.map((show, index) => (
                <button
                  key={show.id}
                  onClick={() => onShowChange(index)}
                  className={`w-full text-left p-2 rounded-lg transition-colors ${
                    index === currentShowIndex
                      ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">
                        {language === 'ta' && show.title_ta ? show.title_ta : show.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {show.host} • {show.duration}
                      </p>
                    </div>
                    {index === currentShowIndex && isPlaying && (
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-3 bg-blue-600 rounded animate-pulse" />
                        <div className="w-1 h-2 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1 h-4 bg-blue-600 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="metadata"
        style={{ display: 'none' }}
      />
    </div>
  )
}







