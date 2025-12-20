'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Phone, Mail, Globe, MapPin, Instagram, Facebook, Youtube } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import TranslatedText from '@/components/TranslatedText'

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

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null
  }

  const renderVideoContent = () => {
    if (business.mainVideoUrl) {
      const embedUrl = getYouTubeEmbedUrl(business.mainVideoUrl)
      if (embedUrl) {
        return (
          <div className="aspect-video w-full mb-6">
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-lg"
              allowFullScreen
              title="Business Video"
            />
          </div>
        )
      }
    }
    return null
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
            <div className="mb-4 sm:mb-6">
              <img
                src={business.mainImage}
                alt={business.name}
                className="w-full h-48 sm:h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Main Video */}
          {renderVideoContent()}

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

            {business.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    <TranslatedText>Email</TranslatedText>
                  </p>
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
