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

  const getEmbedUrl = () => {
    if (videoType === 'youtube') {
      // Extract video ID from various YouTube URL formats
      const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
      if (videoId) {
        // Add parameters for iPhone autoplay support
        // mute=1 is required for autoplay on iOS (browsers block unmuted autoplay)
        // playsinline=1 allows inline playback on iOS instead of fullscreen
        return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1&mute=1&playsinline=1&rel=0&controls=1`
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
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-black">
            <iframe
              src={getEmbedUrl()}
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
        ) : videoType === 'instagram' ? (
          <div className="absolute inset-0 overflow-hidden flex items-center justify-center bg-black">
            <iframe
              src={getEmbedUrl()}
              className="w-full h-full"
              style={{
                border: 'none',
                minWidth: '100%',
                minHeight: '100%'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
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

