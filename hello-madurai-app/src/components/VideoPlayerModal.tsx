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
        return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1`
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
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 rounded-full p-2 text-white transition-colors"
        aria-label="Close video"
      >
        <XMarkIcon className="w-6 h-6" />
      </button>

      {/* Previous button */}
      {hasPrevious && onPrevious && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-3 text-white transition-colors"
          aria-label="Previous video"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      )}

      {/* Next button */}
      {hasNext && onNext && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 rounded-full p-3 text-white transition-colors"
          aria-label="Next video"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      )}

      {/* Title */}
      <div className="absolute top-4 left-4 right-20 z-20 text-white">
        <h2 className="text-base font-semibold line-clamp-1 drop-shadow-lg">{title}</h2>
      </div>

      {/* Video container - Full screen */}
      <div className="absolute inset-0 flex items-center justify-center">
        {videoType === 'youtube' || videoType === 'instagram' ? (
          <iframe
            src={getEmbedUrl()}
            className="w-full h-full"
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title}
          />
        ) : (
          <video
            src={videoUrl}
            className="w-full h-full"
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

