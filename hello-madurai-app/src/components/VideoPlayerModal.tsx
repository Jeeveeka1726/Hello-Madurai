'use client'

import { useEffect, useRef } from 'react'
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid'

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  videoType: 'youtube' | 'instagram' | 'upload'
  title: string
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  videoType,
  title,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false
}: VideoPlayerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext()
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose, onNext, onPrevious, hasNext, hasPrevious])

  if (!isOpen) return null

  console.log('VideoPlayerModal opened with:', { videoUrl, videoType, title })

  const getEmbedUrl = () => {
    if (videoType === 'youtube') {
      // Extract video ID from various YouTube URL formats
      // Updated regex to properly extract 11-character video IDs
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,           // Standard watch URL
        /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,                       // Shortened URL
        /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,             // Embed URL
        /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,            // Shorts URL
      ]

      let videoId = null
      for (const pattern of patterns) {
        const match = videoUrl.match(pattern)
        if (match && match[1]) {
          videoId = match[1]
          break
        }
      }

      if (videoId) {
        console.log('VideoPlayerModal - Extracted video ID:', videoId)
        // Add parameters for iPhone autoplay support
        // mute=1 is required for autoplay on iOS (browsers block unmuted autoplay)
        // playsinline=1 allows inline playback on iOS instead of fullscreen
        return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&rel=0&controls=1`
      } else {
        console.error('VideoPlayerModal - Failed to extract video ID from:', videoUrl)
      }
    } else if (videoType === 'instagram') {
      // Instagram embed URL - support both /reel/ and /p/ patterns
      const postId = videoUrl.match(/\/(?:reel|p)\/([^\/\?]+)/)
      if (postId) {
        // Use /p/ endpoint for embed (works for both posts and reels)
        // Add autoplay parameter
        return `https://www.instagram.com/p/${postId[1]}/embed/?autoplay=1`
      }
    }
    return videoUrl
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      onClose()
    }
  }

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-0 sm:p-8"
    >
      {/* Video container - Responsive: fullscreen on mobile, contained on desktop */}
      <div className="relative w-full h-full sm:w-[500px] sm:h-[calc(500px*16/9)] sm:max-h-[85vh] bg-black sm:rounded-lg overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors"
          aria-label="Close video"
        >
          <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Previous button */}
        {hasPrevious && onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 text-white transition-colors"
            aria-label="Previous video"
          >
            <ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Next button */}
        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 text-white transition-colors"
            aria-label="Next video"
          >
            <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        )}

        {/* Title */}
        <div className="absolute top-2 left-2 right-16 sm:top-4 sm:left-4 sm:right-20 z-20 text-white">
          <h2 className="text-sm sm:text-base font-semibold line-clamp-1 drop-shadow-lg">{title}</h2>
        </div>

        {/* Video iframe/element */}
        {videoType === 'youtube' ? (
          (() => {
            const embedUrl = getEmbedUrl()
            console.log('YouTube embed URL:', embedUrl)
            return (
              <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-black">
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full sm:relative"
                  style={{
                    border: 'none',
                    width: '100%',
                    height: '100%',
                    minWidth: '100%',
                    minHeight: '100%'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={title}
                />
              </div>
            )
          })()
        ) : videoType === 'instagram' ? (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
            {/* Instagram gradient background - shows while loading and as fallback */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-20 h-20 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <p className="text-base font-medium">Instagram Reel</p>
              </div>
            </div>
            {/* Instagram iframe - centered vertical format like Shorts */}
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <iframe
                src={getEmbedUrl()}
                className="border-0"
                style={{
                  width: '328px',
                  height: '100%',
                  maxHeight: '580px',
                  backgroundColor: 'transparent'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            </div>
          </div>
        ) : (
          <video
            src={videoUrl}
            className="absolute inset-0 w-full h-full"
            style={{ objectFit: 'contain' }}
            controls
            autoPlay
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  )
}

