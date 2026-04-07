'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import CategoryNavigation from '@/components/CategoryNavigation'
import { GiftIcon, ShareIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import {
  WhatsappShareButton,
  FacebookShareButton,
  TelegramShareButton,
  TwitterShareButton,
  WhatsappIcon,
  FacebookIcon,
  TelegramIcon,
  TwitterIcon
} from 'react-share'

interface Offer {
  id: string
  title: string
  title_ta: string | null
  imageUrl: string
  bookNowUrl: string | null
  bookNowPhone: string | null
  active: boolean
  orderNumber: number
  category?: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  name_ta: string | null
  orderNumber: number
  active: boolean
}

export default function OffersPage() {
  const { t, language } = useLanguage()
  const [offers, setOffers] = useState<Offer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    fetchOffers()
    fetchCategories()
  }, [])

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers')
      if (response.ok) {
        const data = await response.json()
        setOffers(data)
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/offer-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        // Set first category as default
        if (data.length > 0) {
          setSelectedCategory(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleShare = (offerId: string) => {
    setShareMenuOpen(shareMenuOpen === offerId ? null : offerId)
  }

  const getShareUrl = (offer: Offer) => {
    return `${window.location.origin}/offers/share/${offer.id}`
  }

  const handleCopyLink = async (offer: Offer) => {
    try {
      const shareUrl = getShareUrl(offer)
      await navigator.clipboard.writeText(shareUrl)
      toast.success(language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied!')
      setShareMenuOpen(null)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  // Show all offers if no categories exist
  // If categories exist but offer has no category, show it in all categories
  const filteredOffers = !selectedCategory || categories.length === 0
    ? offers
    : offers.filter(offer => !offer.category || offer.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NewspaperHeader showTagline={true} />
        <NewHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600 text-xl">
            {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Headers with their own padding */}
      <div className="bg-white">
        <NewspaperHeader showTagline={true} />
        <NewHeader />
      </div>

      {/* Category Navigation - Mobile Only */}
      <CategoryNavigation />

      {/* Main content */}
      <div className="min-h-screen bg-white">
        {/* Header Section - No padding on mobile */}
        <div className="py-4 bg-white">
          <div className="text-center px-4 md:px-0">
            <div className="flex items-center justify-center mb-1">
              <GiftIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {language === 'ta' ? 'தள்ளுபடிகள்' : 'Discounts'}
              </h1>
            </div>
            <p className="text-sm text-gray-600 font-medium mb-3">
              {language === 'ta' ? 'எல்லா நாட்களிலும் தள்ளுபடி' : 'Discount On All Days'}
            </p>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="mb-2">
                <p className="text-gray-700 font-semibold mb-2 text-center text-sm">
                  {language === 'ta' ? 'வகையைத் தேர்ந்தெடுக்கவும்' : 'Select Category'}
                </p>
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-2 min-w-max justify-center px-4 md:px-0">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 text-sm ${
                          selectedCategory === category.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {language === 'ta' ? category.name_ta || category.name : category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Offers Grid - 3x3 Portrait Grid on Desktop, Full width on Mobile */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12 px-4">
            <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'ta' ? 'தற்போது சலுகைகள் இல்லை' : 'No offers available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 sm:gap-4 lg:gap-6 sm:px-4">
            {filteredOffers.map((offer) => {
              // Determine the booking link - prefer phone number if available, otherwise use URL
              const bookingContact = offer.bookNowPhone || offer.bookNowUrl
              if (!bookingContact) return null // Skip offers without booking info

              const isPhoneNumber = offer.bookNowPhone || (offer.bookNowUrl && /^[\d\s\-\+\(\)]+$/.test(offer.bookNowUrl))
              const bookNowHref = isPhoneNumber
                ? (bookingContact.startsWith('tel:') ? bookingContact : `tel:${bookingContact}`)
                : bookingContact

              return (
                <div key={offer.id} className="mb-6 sm:mb-0 bg-white sm:rounded-lg sm:shadow-md sm:hover:shadow-xl sm:transition-all sm:duration-300 overflow-hidden flex flex-col">
                  {/* Offer Image - Portrait on all devices */}
                  <div className="relative overflow-hidden cursor-pointer group">
                    <img
                      src={offer.imageUrl}
                      alt={language === 'ta' && offer.title_ta ? offer.title_ta : offer.title}
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 aspect-[3/4]"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                  </div>

                  {/* Action Buttons - Compact and close to image */}
                  <div className="flex flex-col gap-2 py-3 px-2 bg-white sm:px-3">
                    {/* Title (if available) */}
                    {(offer.title || offer.title_ta) && (
                      <div className="mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-tight">
                          {language === 'ta' && offer.title_ta ? offer.title_ta : offer.title}
                        </h3>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 items-center">
                      <a
                        href={bookNowHref}
                        target={isPhoneNumber ? '_self' : '_blank'}
                        rel={isPhoneNumber ? undefined : 'noopener noreferrer'}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-3 rounded-lg text-center transition-all shadow-md hover:shadow-lg text-xs transform hover:scale-105 flex items-center justify-center gap-1"
                      >
                        {language === 'ta' ? 'முன்பதிவு' : 'Book Now'}
                      </a>

                      {/* Share Button with Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => handleShare(offer.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-all shadow-sm hover:shadow-md border border-gray-300"
                          aria-label="Share"
                          title={language === 'ta' ? 'பகிர்' : 'Share'}
                        >
                          <ShareIcon className="h-4 w-4" />
                        </button>

                        {/* Share Menu */}
                        {shareMenuOpen === offer.id && (
                          <>
                            {/* Backdrop to close menu */}
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShareMenuOpen(null)}
                            />

                            {/* Share Dropdown */}
                            <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 z-20 min-w-[280px]">
                              <p className="text-sm font-semibold text-gray-700 mb-3">
                                {language === 'ta' ? 'இதில் பகிரவும்:' : 'Share to:'}
                              </p>
                              <div className="flex gap-3 justify-center mb-4">
                                {/* WhatsApp */}
                                <WhatsappShareButton
                                  url={getShareUrl(offer)}
                                  title={`${language === 'ta' && offer.title_ta ? offer.title_ta : offer.title} - Hello Madurai`}
                                  onClick={() => setShareMenuOpen(null)}
                                >
                                  <div className="flex flex-col items-center gap-1 transform hover:scale-110 transition-transform">
                                    <WhatsappIcon size={48} round />
                                    <span className="text-xs text-gray-600">WhatsApp</span>
                                  </div>
                                </WhatsappShareButton>

                                {/* Facebook - Use direct URL for better Open Graph support */}
                                <button
                                  onClick={() => {
                                    const shareUrl = getShareUrl(offer)
                                    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
                                    window.open(facebookUrl, '_blank', 'width=600,height=400')
                                    setShareMenuOpen(null)
                                  }}
                                  className="transform hover:scale-110 transition-transform cursor-pointer"
                                >
                                  <div className="flex flex-col items-center gap-1">
                                    <FacebookIcon size={48} round />
                                    <span className="text-xs text-gray-600">Facebook</span>
                                  </div>
                                </button>
                              </div>

                              <p className="text-xs text-gray-500 mb-2 px-1">
                                {language === 'ta' ? 'மேலும் விருப்பங்கள்:' : 'More options:'}
                              </p>
                              <div className="flex gap-2 justify-center mb-3">
                                <TwitterShareButton
                                  url={getShareUrl(offer)}
                                  title={`${language === 'ta' && offer.title_ta ? offer.title_ta : offer.title} - Hello Madurai`}
                                  onClick={() => setShareMenuOpen(null)}
                                >
                                  <TwitterIcon size={32} round />
                                </TwitterShareButton>

                                <TelegramShareButton
                                  url={getShareUrl(offer)}
                                  title={`${language === 'ta' && offer.title_ta ? offer.title_ta : offer.title} - Hello Madurai`}
                                  onClick={() => setShareMenuOpen(null)}
                                >
                                  <TelegramIcon size={32} round />
                                </TelegramShareButton>
                              </div>

                              {/* Copy Link Button */}
                              <button
                                onClick={() => handleCopyLink(offer)}
                                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 flex items-center justify-center gap-2 transition-colors"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                {language === 'ta' ? 'இணைப்பை நகலெடு' : 'Copy Link'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

