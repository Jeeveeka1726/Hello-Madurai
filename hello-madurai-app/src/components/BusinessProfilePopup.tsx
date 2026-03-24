'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Phone, Mail, Globe, MapPin, Instagram, Facebook, Youtube } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'
import VideoPlayerModal from '@/components/VideoPlayerModal'
import { PlayIcon } from '@heroicons/react/24/solid'

interface Business {
  id: string
  name: string
  name_ta: string
  address: string
  address_ta: string
  phone?: string
  email?: string
  website?: string
  mainImage?: string
  mainVideoUrl?: string
  videoType?: string  // Added to support video type detection
  youtubeUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  bookingUrl?: string
  profileContent?: string
  profileContent_ta?: string
  profileImage?: string
  profileVideo?: string
  verified: boolean
}

interface BusinessProfilePopupProps {
  business: Business
  isOpen: boolean
  onClose: () => void
}

export default function BusinessProfilePopup({ business, isOpen, onClose }: BusinessProfilePopupProps) {
  const { language } = useLanguage()
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false)

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  // Helper function to get YouTube ID from URL (including Shorts)
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        console.log('🎬 BusinessProfilePopup - Extracted YouTube ID:', match[1])
        return match[1]
      }
    }
    console.log('❌ BusinessProfilePopup - Failed to extract YouTube ID from:', url)
    return null
  }

  // Helper function to get Instagram Reel ID from URL
  const getInstagramReelId = (url: string): string | null => {
    const match = url.match(/instagram\.com\/reel\/([^/?#]+)/)
    return match ? match[1] : null
  }

  // Helper function to determine video type
  const getVideoType = (url: string, videoType?: string): 'YOUTUBE_VIDEO' | 'YOUTUBE_SHORTS' | 'INSTAGRAM_REEL' | null => {
    if (videoType) {
      return videoType as 'YOUTUBE_VIDEO' | 'YOUTUBE_SHORTS' | 'INSTAGRAM_REEL'
    }

    if (url.includes('youtube.com/shorts') || url.includes('shorts/')) {
      return 'YOUTUBE_SHORTS'
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'YOUTUBE_VIDEO'
    } else if (url.includes('instagram.com/reel')) {
      return 'INSTAGRAM_REEL'
    }

    return null
  }

  const renderVideoContent = () => {
    // Check profileVideo first, then fall back to mainVideoUrl
    const videoUrl = business.profileVideo || business.mainVideoUrl

    if (!videoUrl) return null

    const vType = getVideoType(videoUrl, business.videoType)
    const videoId = getYouTubeId(videoUrl)
    const reelId = getInstagramReelId(videoUrl)

    console.log('🎬 Profile Video:', { vType, videoId, reelId, videoUrl })

    // Determine the modal video type
    let modalVideoType: 'youtube' | 'instagram' | 'upload' = 'youtube'
    if (vType === 'INSTAGRAM_REEL') {
      modalVideoType = 'instagram'
    }

    // Get thumbnail URL
    let thumbnailUrl = ''
    let showThumbnail = false

    if (videoId) {
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      showThumbnail = true
      console.log('🖼️ BusinessProfilePopup - YouTube thumbnail URL:', thumbnailUrl)
      console.log('🖼️ BusinessProfilePopup - showThumbnail:', showThumbnail)
      console.log('🖼️ BusinessProfilePopup - videoId:', videoId)
    } else if (vType === 'INSTAGRAM_REEL') {
      // Instagram Reels don't have direct thumbnails, use gradient background
      thumbnailUrl = ''
      showThumbnail = false
      console.log('📸 BusinessProfilePopup - Instagram Reel, using gradient')
    } else {
      console.log('⚠️ BusinessProfilePopup - No videoId found, vType:', vType)
    }

    console.log('🎨 Rendering video content - showThumbnail:', showThumbnail, 'thumbnailUrl:', thumbnailUrl)

    return (
      <>
        <div className="w-full mb-4 sm:mb-6">
          <div
            className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
            onClick={() => setIsVideoPlayerOpen(true)}
          >
            {/* Background Layer - Thumbnail or Gradient */}
            {showThumbnail && thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="absolute top-0 left-0 w-full h-full object-cover"
                style={{ zIndex: 1 }}
                loading="eager"
                onLoad={() => {
                  console.log('✅ Thumbnail loaded successfully:', thumbnailUrl)
                }}
                onError={(e) => {
                  console.error('❌ Thumbnail failed to load, trying fallback:', thumbnailUrl)
                  if (videoId) {
                    const fallbackUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                    console.log('🔄 Trying fallback URL:', fallbackUrl)
                    e.currentTarget.src = fallbackUrl
                  }
                }}
              />
            ) : vType === 'INSTAGRAM_REEL' ? (
              // Instagram Reel - gradient background with Instagram icon
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center"
                style={{ zIndex: 1 }}
              >
                <div className="text-center text-white">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <p className="text-sm font-medium">Instagram Reel</p>
                </div>
              </div>
            ) : (
              // Fallback gradient for other video types
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                style={{ zIndex: 1 }}
              >
                <div className="text-center text-white">
                  <div className="bg-white bg-opacity-20 p-4 rounded-full mb-3 mx-auto w-fit">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  <p className="text-sm font-medium">Video</p>
                </div>
              </div>
            )}

            {/* Play Button Overlay - Above thumbnail */}
            <div
              className="absolute inset-0 flex items-center justify-center group-hover:bg-black group-hover:bg-opacity-30 transition-all duration-300 pointer-events-none"
              style={{ zIndex: 10 }}
            >
              <div className="bg-red-600 text-white p-4 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300 pointer-events-auto">
                <PlayIcon className="w-8 h-8" />
              </div>
            </div>

            {/* Video Type Badge - Above everything */}
            {vType && (
              <div
                className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium"
                style={{ zIndex: 20 }}
              >
                {vType === 'YOUTUBE_SHORTS' && 'YouTube Shorts'}
                {vType === 'YOUTUBE_VIDEO' && 'YouTube Video'}
                {vType === 'INSTAGRAM_REEL' && 'Instagram Reel'}
              </div>
            )}
          </div>
        </div>

        {/* Video Player Modal */}
        <VideoPlayerModal
          isOpen={isVideoPlayerOpen}
          onClose={() => setIsVideoPlayerOpen(false)}
          videoUrl={videoUrl}
          videoType={modalVideoType}
          title={business.name}
        />
      </>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-3 sm:p-4 flex justify-between items-start sm:items-center">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">
              {language === 'ta' && business.name_ta ? business.name_ta : business.name}
            </h2>
            {business.verified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                <TranslatedText>Verified</TranslatedText>
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-6">
          {/* Main Image */}
          {business.mainImage && (
            <div className="mb-4 sm:mb-6 -mx-3 sm:mx-0">
              <div className="aspect-video w-full">
                <img
                  src={business.mainImage}
                  alt={business.name}
                  className="w-full h-full object-cover sm:rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Profile Video - Centered */}
          <div className="mb-4 sm:mb-6">
            <div className="w-full max-w-3xl mx-auto px-0">
              {renderVideoContent()}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            {business.address && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <TranslatedText>Address</TranslatedText>
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'ta' && business.address_ta ? business.address_ta : business.address}
                  </p>
                </div>
              </div>
            )}

            {business.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <TranslatedText>Phone</TranslatedText>
                  </p>
                  <a href={`tel:${business.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                    {business.phone}
                  </a>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  <TranslatedText>Address</TranslatedText>
                </p>
                <button
                  onClick={() => {
                    const address = business.address_ta || business.address
                    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
                    window.open(url, '_blank')
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700 text-left"
                >
                  {business.address_ta || business.address}
                </button>
              </div>
            </div>

            {business.website && (
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <TranslatedText>Website</TranslatedText>
                  </p>
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <TranslatedText>Visit Website</TranslatedText>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Social Media Links */}
          {(business.instagramUrl || business.facebookUrl || business.youtubeUrl) && (
            <div className="mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3">
                <TranslatedText>Follow Us</TranslatedText>
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                {business.instagramUrl && (
                  <a
                    href={business.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors text-sm sm:text-base"
                  >
                    <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Instagram</span>
                  </a>
                )}
                {business.facebookUrl && (
                  <a
                    href={business.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm sm:text-base"
                  >
                    <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Facebook</span>
                  </a>
                )}
                {business.youtubeUrl && (
                  <a
                    href={business.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm sm:text-base"
                  >
                    <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Profile Content */}
          {(business.profileContent || business.profileContent_ta) && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                <TranslatedText>About Us</TranslatedText>
              </h3>
              <div
                className="prose prose-sm max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: language === 'ta' && business.profileContent_ta
                    ? business.profileContent_ta
                    : business.profileContent || ''
                }}
              />
            </div>
          )}

          {/* Profile Image */}
          {business.profileImage && (
            <div className="mb-6">
              <img
                src={business.profileImage}
                alt="Profile"
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>
          )}

          {/* Booking Button */}
          {business.bookingUrl && (
            <div className="text-center">
              <a
                href={business.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                <TranslatedText>Book Now</TranslatedText>
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
