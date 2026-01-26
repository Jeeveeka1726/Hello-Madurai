'use client'

import { useEffect, useRef } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'

interface VideoPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  videoType: 'youtube' | 'instagram' | 'upload'
  title: string
}

export default function VideoPlayerModal({
  isOpen,
  onClose,
  videoUrl,
  videoType,
  title
}: VideoPlayerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getEmbedUrl = () => {
    if (videoType === 'youtube') {
      // Extract video ID from various YouTube URL formats
      const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId[1]}?autoplay=1`
      }
    } else if (videoType === 'instagram') {
      // Instagram embed URL
      const postId = videoUrl.match(/\/p\/([^\/\?]+)/)
      if (postId) {
        return `https://www.instagram.com/p/${postId[1]}/embed`
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
    >
      <div className="relative w-full h-full max-w-md max-h-[90vh] mx-auto flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 z-10 bg-white/20 hover:bg-white/30 rounded-full p-2 text-white transition-colors"
          aria-label="Close video"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Title */}
        <div className="mb-3 text-white px-2">
          <h2 className="text-lg font-semibold line-clamp-2">{title}</h2>
        </div>

        {/* Video container - 9:16 aspect ratio for reels */}
        <div className="relative bg-black rounded-lg overflow-hidden flex-1" style={{ aspectRatio: '9/16', maxHeight: 'calc(90vh - 60px)' }}>
          {videoType === 'youtube' || videoType === 'instagram' ? (
            <iframe
              src={getEmbedUrl()}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          ) : (
            <video
              src={videoUrl}
              className="absolute top-0 left-0 w-full h-full object-contain"
              controls
              autoPlay
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  )
}

