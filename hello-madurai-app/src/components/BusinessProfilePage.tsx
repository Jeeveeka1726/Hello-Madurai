'use client'

import { Phone, MapPin, Mail, Globe, Facebook, Instagram, ExternalLink, ArrowLeft, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'
import BusinessStructuredData from './seo/BusinessStructuredData'
import { useState } from 'react'
import Link from 'next/link'

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
  videoType?: string
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

interface BusinessProfilePageProps {
  business: Business
}

// Helper function to get YouTube ID
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) return match[1]
  }
  return null
}

// Helper function to get Instagram Reel ID
function getInstagramReelId(url: string): string | null {
  const match = url.match(/instagram\.com\/reel\/([^/?#]+)/)
  return match ? match[1] : null
}

// Helper function to determine video type
function getVideoType(url: string, videoType?: string): 'YOUTUBE_VIDEO' | 'YOUTUBE_SHORTS' | 'INSTAGRAM_REEL' | null {
  if (videoType) return videoType as any
  if (url.includes('youtube.com/shorts') || url.includes('shorts/')) return 'YOUTUBE_SHORTS'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YOUTUBE_VIDEO'
  if (url.includes('instagram.com/reel')) return 'INSTAGRAM_REEL'
  return null
}

export default function BusinessProfilePage({ business }: BusinessProfilePageProps) {
  const { language } = useLanguage()
  const [playingVideo, setPlayingVideo] = useState(false)

  const videoUrl = business.profileVideo || business.mainVideoUrl

  // Helper functions - same as directory page
  const getYouTubeEmbedUrl = (url: string) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}`
    }
    return null
  }

  const getInstagramEmbedUrl = (url: string) => {
    const postId = url.match(/\/(?:reels?|p)\/([^\/\?]+)/)
    return postId ? `https://www.instagram.com/p/${postId[1]}/embed/captioned/?cr=1&v=14` : null
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeId(url)
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO: Structured Data for Business */}
      <BusinessStructuredData business={business} />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/directory" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            <TranslatedText>Back to Directory</TranslatedText>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {language === 'ta' && business.name_ta ? business.name_ta : business.name}
            </h1>
            {business.verified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                <TranslatedText>Verified</TranslatedText>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 sm:p-6">
            {/* Main Business Image/Video - Same logic as directory */}
            {(business.mainImage || videoUrl) && (
              <div className="mb-6 -mx-4 sm:mx-0">
                {playingVideo && videoUrl ? (
                  // Show video player when playing
                  <div className="relative w-full aspect-video bg-black sm:rounded-lg overflow-hidden">
                    {(() => {
                      const youtubeEmbedUrl = getYouTubeEmbedUrl(videoUrl)
                      const instagramEmbedUrl = getInstagramEmbedUrl(videoUrl)

                      if (youtubeEmbedUrl) {
                        return (
                          <>
                            <iframe
                              src={`${youtubeEmbedUrl}?autoplay=1&mute=0`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                            {/* Close button */}
                            <button
                              onClick={() => setPlayingVideo(false)}
                              className="absolute top-2 right-2 z-10 bg-black bg-opacity-75 text-white p-2 rounded-full hover:bg-opacity-90"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )
                      } else if (instagramEmbedUrl) {
                        return (
                          <>
                            <iframe
                              src={instagramEmbedUrl}
                              className="w-full h-full"
                              allowFullScreen
                            />
                            {/* Close button */}
                            <button
                              onClick={() => setPlayingVideo(false)}
                              className="absolute top-2 right-2 z-10 bg-black bg-opacity-75 text-white p-2 rounded-full hover:bg-opacity-90"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )
                      }
                    })()}
                  </div>
                ) : (
                  // Show image or video thumbnail
                  <div className="relative">
                    {business.mainImage ? (
                      <div className="aspect-video w-full">
                        <img
                          src={business.mainImage}
                          alt={business.name}
                          className="w-full h-full object-cover sm:rounded-lg"
                        />
                        {/* Play button overlay if video exists */}
                        {videoUrl && (
                          <div
                            className="absolute inset-0 flex items-center justify-center cursor-pointer"
                            onClick={() => setPlayingVideo(true)}
                          >
                            <div className="bg-black bg-opacity-60 text-white p-3 rounded-full shadow-lg">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : videoUrl ? (
                      // Show video thumbnail if no image
                      (() => {
                        const youtubeId = getYouTubeId(videoUrl)
                        if (youtubeId) {
                          return (
                            <div className="aspect-video w-full">
                              <div
                                className="relative w-full h-full bg-gray-900 sm:rounded-lg overflow-hidden cursor-pointer group"
                                onClick={() => setPlayingVideo(true)}
                              >
                                <img
                                  src={getYouTubeThumbnail(videoUrl)}
                                  alt={`${business.name} video`}
                                  className="absolute top-0 left-0 w-full h-full object-cover"
                                  loading="lazy"
                                  onError={(e) => {
                                    const videoId = getYouTubeId(videoUrl)
                                    if (videoId) {
                                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                    }
                                  }}
                                />
                                {/* Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-black bg-opacity-60 text-white p-3 rounded-full shadow-lg">
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                      })()
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {business.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900"><TranslatedText>Address</TranslatedText></p>
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
                    <p className="text-sm font-medium text-gray-900"><TranslatedText>Phone</TranslatedText></p>
                    <a href={`tel:${business.phone}`} className="text-sm text-primary-600 hover:text-primary-700">
                      {business.phone}
                    </a>
                  </div>
                </div>
              )}

              {business.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900"><TranslatedText>Email</TranslatedText></p>
                    <a href={`mailto:${business.email}`} className="text-sm text-primary-600 hover:text-primary-700">
                      {business.email}
                    </a>
                  </div>
                </div>
              )}

              {business.website && (
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900"><TranslatedText>Website</TranslatedText></p>
                    <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                      <TranslatedText>Visit Website</TranslatedText>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div className="flex flex-wrap gap-3 mb-6">
              {business.instagramUrl && (
                <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all">
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </a>
              )}
              {business.facebookUrl && (
                <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </a>
              )}
              {business.bookingUrl && (
                <a href={business.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:shadow-lg transition-all">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  <TranslatedText>Book Now</TranslatedText>
                </a>
              )}
            </div>

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
                <img src={business.profileImage} alt="Profile" className="w-full max-w-md mx-auto rounded-lg" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
