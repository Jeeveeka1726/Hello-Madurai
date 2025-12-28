'use client'

import { useRadioPlayer } from '@/contexts/RadioPlayerContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { PlayIcon, PauseIcon, XMarkIcon, MusicalNoteIcon } from '@heroicons/react/24/solid'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'

export default function GlobalRadioPlayer() {
  const { currentSong, isPlaying, currentTime, duration, togglePlayPause, seekTo, setCurrentSong, pauseSong, audioRef } = useRadioPlayer()
  const { language } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  // Don't show if no song is playing
  if (!currentSong) {
    return null
  }

  const title = language === 'ta' && currentSong.title_ta ? currentSong.title_ta : currentSong.title
  const artistName = language === 'ta' && currentSong.singer?.name_ta 
    ? currentSong.singer.name_ta 
    : currentSong.singer?.name || 'Unknown Artist'

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    seekTo(time)
  }

  const handleClose = () => {
    // Stop the audio first
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    pauseSong()

    // Clear the song and localStorage
    setCurrentSong(null)
    localStorage.removeItem('radio_current_song')
    localStorage.removeItem('radio_current_time')
    localStorage.removeItem('radio_is_playing')
  }

  const handleOpenRadio = () => {
    // Only navigate if not already on radio page
    if (pathname !== '/radio') {
      router.push('/radio')
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white shadow-2xl z-50 border-t-2 border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Album Art / Artist Image */}
          <div 
            className="relative w-14 h-14 rounded-lg overflow-hidden shadow-lg flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
            onClick={handleOpenRadio}
          >
            {currentSong.singer?.imageUrl ? (
              <Image
                src={currentSong.singer.imageUrl}
                alt={artistName}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <MusicalNoteIcon className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={handleOpenRadio}>
            <h4 className="font-semibold text-sm truncate hover:text-yellow-200 transition-colors">
              {title}
            </h4>
            <p className="text-xs text-white/80 truncate">
              {artistName}
            </p>
          </div>

          {/* Progress Bar (Desktop) - Only show for direct audio */}
          {currentSong.audioType !== 'embed' && (
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
              <span className="text-xs text-white/80 w-12 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-3
                  [&::-webkit-slider-thumb]:h-3
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-white
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-moz-range-thumb]:w-3
                  [&::-moz-range-thumb]:h-3
                  [&::-moz-range-thumb]:rounded-full
                  [&::-moz-range-thumb]:bg-white
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:shadow-lg"
              />
              <span className="text-xs text-white/80 w-12">
                {formatTime(duration)}
              </span>
            </div>
          )}

          {/* Embedded Audio Info (Desktop) */}
          {currentSong.audioType === 'embed' && (
            <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
              <div className="flex-1 text-center">
                <span className="text-xs text-white/80">
                  {(currentSong as any).embedUrl
                    ? '🎵 SoundCloud Player • Ready'
                    : '🎵 Live Radio Station • Playing'}
                </span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause Button - Same behavior for all audio types */}
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-yellow-400 text-purple-900 flex items-center justify-center hover:bg-yellow-300 hover:scale-110 transition-all shadow-lg"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 fill-purple-900" />
              ) : (
                <PlayIcon className="w-5 h-5 ml-0.5 fill-purple-900" />
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close player"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Progress Bar (Mobile) - Only show for direct audio */}
        {currentSong.audioType !== 'embed' && (
          <div className="md:hidden mt-2 flex items-center gap-2">
            <span className="text-xs text-white/80">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/30 rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3
                [&::-webkit-slider-thumb]:h-3
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-moz-range-thumb]:w-3
                [&::-moz-range-thumb]:h-3
                [&::-moz-range-thumb]:rounded-full
                [&::-moz-range-thumb]:bg-white
                [&::-moz-range-thumb]:cursor-pointer
                [&::-moz-range-thumb]:border-0"
            />
            <span className="text-xs text-white/80">
              {formatTime(duration)}
            </span>
          </div>
        )}

        {/* Embedded Audio Info (Mobile) */}
        {currentSong.audioType === 'embed' && (
          <div className="md:hidden mt-2 text-center">
            <span className="text-xs text-white/80">
              {(currentSong as any).embedUrl
                ? '🎵 SoundCloud Player • Use player below'
                : '🎵 Live Radio Station • Click play button on the radio player below'}
            </span>
          </div>
        )}

        {/* Live Radio Stream Player */}
        {currentSong.audioType === 'embed' && (
          <div className="mt-3 bg-gradient-to-r from-red-600/20 to-orange-600/20 rounded-lg p-3 border border-white/10">
            {/* Check if this is a SoundCloud embed */}
            {(currentSong as any).embedUrl ? (
              <div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white font-medium">🎵 SoundCloud Player</span>
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div className="bg-white/10 rounded-lg p-2">
                  <iframe
                    width="100%"
                    height="166"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={(currentSong as any).embedUrl}
                    className="rounded-lg"
                  ></iframe>
                </div>
                <div className="text-xs text-white/70 text-center mt-2">
                  Use the play button in the SoundCloud player above
                </div>
              </div>
            ) : (
              <div>
                {/* Radio stream status removed as it's already visible in the right corner */}
              </div>
            )}
            <div className="text-xs text-white/60 text-center border-t border-white/10 pt-2">
              External Audio links Only | Rights Belong to Respective Owners,<br />
              Original Content © Hello Madurai
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

