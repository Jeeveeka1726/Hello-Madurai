'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Comments from '@/components/Comments'
import BusinessProfilePopup from '@/components/BusinessProfilePopup'

interface Subcategory {
  id: string
  name: string
  name_ta: string
  icon?: string
  categoryId: string
  _count?: {
    businesses: number
  }
}

interface Category {
  id: string
  name: string
  name_ta: string
  subcategories: Subcategory[]
  _count?: {
    businesses: number
    subcategories: number
  }
}

interface Business {
  id: string
  name: string
  name_ta?: string
  category: string
  categoryId?: string
  subcategoryId?: string
  mainCategory?: Category
  subcategory?: Subcategory
  address: string
  address_ta?: string
  phone: string
  email?: string
  website?: string
  mainImage?: string
  mainVideoUrl?: string

  // New business features
  videoUrl?: string
  youtubeUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  bookingUrl?: string
  latitude?: number
  longitude?: number
  orderNumber: number
  hasProfile: boolean
  profileContent?: string
  profileContent_ta?: string
  profileImage?: string
  profileVideo?: string

  verified: boolean
  createdAt: string
  updatedAt: string
  comments: BusinessComment[]
}

interface BusinessComment {
  id: string
  content: string
  author: string
  rating?: number
  createdAt: string
}

function DirectoryPageContent() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [viewingSubcategory, setViewingSubcategory] = useState(false) // Track if we're in subcategory view
  const [searchTerm, setSearchTerm] = useState('')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [commentsBusinessId, setCommentsBusinessId] = useState<string>('')
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareBusinessData, setShareBusinessData] = useState<Business | null>(null)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  // Fetch categories and businesses from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, businessesRes] = await Promise.all([
          fetch('/api/directory-categories'),
          fetch('/api/directory')
        ])

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json()
          // Use categories in the order they come from API (ordered by orderNumber)
          const categories = categoriesData.categories || []
          setCategories(categories)

          // Auto-select first category if none selected
          if (categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0].id)
          }
        }

        if (businessesRes.ok) {
          const businessesData = await businessesRes.json()
          setBusinesses(businessesData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [language])

  // Handle business parameter from URL (for social media sharing)
  useEffect(() => {
    const businessId = searchParams.get('business')
    if (businessId && businesses.length > 0) {
      const business = businesses.find(b => b.id === businessId)
      if (business) {
        setSelectedBusiness(business)
        setShowProfilePopup(true)
      }
    }
  }, [searchParams, businesses])

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null
  }

  const getYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return match ? match[1] : null
  }

  const getYouTubeThumbnail = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
    return videoId ? `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg` : ''
  }

  const handleVideoPlay = (businessId: string) => {
    setPlayingVideo(playingVideo === businessId ? null : businessId)
  }

  const filteredBusinesses = businesses.filter(business => {
    // Enhanced search across ALL fields and categories/subcategories
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = searchTerm === '' ||
      // Business name (English & Tamil)
      business.name.toLowerCase().includes(searchLower) ||
      (business.name_ta && business.name_ta.includes(searchTerm)) ||
      // Business address (English & Tamil)
      business.address.toLowerCase().includes(searchLower) ||
      (business.address_ta && business.address_ta.includes(searchTerm)) ||
      // Business description (if exists)
      (business.description && business.description.toLowerCase().includes(searchLower)) ||
      (business.description_ta && business.description_ta.includes(searchTerm)) ||
      // Category name (English & Tamil)
      (business.mainCategory?.name && business.mainCategory.name.toLowerCase().includes(searchLower)) ||
      (business.mainCategory?.name_ta && business.mainCategory.name_ta.includes(searchTerm)) ||
      // Subcategory name (English & Tamil)
      (business.subcategory?.name && business.subcategory.name.toLowerCase().includes(searchLower)) ||
      (business.subcategory?.name_ta && business.subcategory.name_ta.includes(searchTerm)) ||
      // Phone number
      business.phone.includes(searchTerm) ||
      // Email
      (business.email && business.email.toLowerCase().includes(searchLower)) ||
      // Website
      (business.website && business.website.toLowerCase().includes(searchLower))

    // If searching, ignore category/subcategory filters and search across ALL businesses
    if (searchTerm) {
      return matchesSearch
    }

    // If not searching, apply category and subcategory filters
    const matchesCategory = !selectedCategory || business.categoryId === selectedCategory
    const matchesSubcategory = !selectedSubcategory || business.subcategoryId === selectedSubcategory

    return matchesCategory && matchesSubcategory
  }).sort((a, b) => {
    // Sort by orderNumber (ascending), then by name
    if (a.orderNumber !== b.orderNumber) {
      return a.orderNumber - b.orderNumber
    }
    return a.name.localeCompare(b.name)
  })

  // Get selected category object
  const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory)

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`
  }

  const handleWebsite = (website: string) => {
    window.open(website, '_blank')
  }

  const handleVideo = (videoUrl: string) => {
    window.open(videoUrl, '_blank')
  }

  const handleInstagram = (instagramUrl: string) => {
    window.open(instagramUrl, '_blank')
  }

  const handleFacebook = (facebookUrl: string) => {
    window.open(facebookUrl, '_blank')
  }

  const handleDirections = (business: Business) => {
    if (business.latitude && business.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
      window.open(url, '_blank')
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
      window.open(url, '_blank')
    }
  }

  const handleBooking = (bookingUrl: string) => {
    window.open(bookingUrl, '_blank')
  }

  const handleDownload = async (business: Business) => {
    try {
      const response = await fetch(`/api/business/${business.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${business.name}-info.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading business info:', error)
    }
  }

  const handleShare = (business: Business) => {
    setShareBusinessData(business)
    setShowShareModal(true)
  }

  const shareToWhatsApp = (business: Business) => {
    const url = `${window.location.origin}/directory/${business.id}`
    const text = `${business.name}\n${language === 'ta' && business.address_ta ? business.address_ta : business.address}\n${url}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
    setShowShareModal(false)
  }

  const shareToFacebook = (business: Business) => {
    const url = `${window.location.origin}/directory/${business.id}`
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank')
    setShowShareModal(false)
  }

  const copyLink = async (business: Business) => {
    const url = `${window.location.origin}/directory/${business.id}`
    try {
      await navigator.clipboard.writeText(url)
      alert(t('directory.linkCopied', 'Link copied to clipboard!', 'இணைப்பு கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!'))
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert(t('directory.linkCopied', 'Link copied to clipboard!', 'இணைப்பு கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!'))
    }
    setShowShareModal(false)
  }

  const openComments = (businessId: string) => {
    setCommentsBusinessId(businessId)
    setShowComments(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('directory.title', 'Business Directory', 'வணிக முகவரி')}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {t('directory.subtitle', 'Find local businesses and services in Madurai', 'மதுரையில் உள்ளூர் வணிகங்கள் மற்றும் சேவைகளைக் கண்டறியுங்கள்')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {t('directory.loading', 'Loading businesses...', 'வணிகங்கள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* Search Bar - Digital FM Style */}
        {!loading && (
          <>
            <div className="mb-6">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={language === 'ta'
                    ? 'வணிகங்கள், வகைகள், முகவரிகள், தொலைபேசி எண்கள்...'
                    : 'Search businesses, categories, addresses, phone numbers...'}
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-4 top-3.5" />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className="text-center text-sm text-gray-500 mt-2">
                  {language === 'ta'
                    ? `"${searchTerm}" க்கான முடிவுகள் - அனைத்து வகைகள், துணைவகைகள் மற்றும் வணிகங்களில் தேடப்பட்டது`
                    : `Results for "${searchTerm}" - searched across all categories, subcategories, and business details`}
                </p>
              )}
            </div>

            {/* Main Categories - Horizontal Scrollable */}
            {!loading && categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {t('directory.selectCategory', 'Select Category', 'வகையைத் தேர்ந்தெடுக்கவும்')}
                </h2>
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3 min-w-max px-4">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id)
                          setSelectedSubcategory(null)
                          setViewingSubcategory(false)
                        }}
                        className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                          selectedCategory === category.id
                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:shadow-md'
                        }`}
                      >
                        <span>{language === 'ta' ? category.name_ta : category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No categories message */}
            {!loading && categories.length === 0 && (
              <div className="mb-8 text-center py-8 bg-blue-50 rounded-lg">
                <p className="text-gray-600">
                  {language === 'ta'
                    ? 'வகைகள் இன்னும் சேர்க்கப்படவில்லை'
                    : 'No categories added yet'}
                </p>
              </div>
            )}

            {/* Back Button - Always at top when in subcategory view */}
            {viewingSubcategory && selectedSubcategory && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    setViewingSubcategory(false)
                    setSelectedSubcategory(null)
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>{t('directory.backToCategory', 'Back to Category', 'வகைக்கு திரும்பு')}</span>
                </button>
              </div>
            )}

            {/* Subcategories - Only show if not in subcategory view and not searching */}
            {selectedCategoryObj && selectedCategoryObj.subcategories.length > 0 && !viewingSubcategory && !searchTerm && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  {t('directory.selectSubcategory', 'Select Subcategory', 'துணை வகையைத் தேர்ந்தெடுக்கவும்')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedCategoryObj.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => {
                        setSelectedSubcategory(subcategory.id)
                        setViewingSubcategory(true)
                      }}
                      className={`p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                        selectedSubcategory === subcategory.id
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center gap-2">
                        {/* Icon from database */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                          selectedSubcategory === subcategory.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600'
                        }`}>
                          {subcategory.icon || '🏢'}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${
                            selectedSubcategory === subcategory.id
                              ? 'text-blue-900'
                              : 'text-gray-900'
                          }`}>
                            {language === 'ta' ? subcategory.name_ta : subcategory.name}
                          </p>
                          {subcategory._count && subcategory._count.businesses > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              {subcategory._count.businesses} {language === 'ta' ? 'வணிகங்கள்' : 'businesses'}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results - Show when searching */}
            {searchTerm && filteredBusinesses.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('directory.searchResults', 'Search Results', 'தேடல் முடிவுகள்')} ({filteredBusinesses.length})
                </h3>
                <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-2">
                  {filteredBusinesses.map((business) => (
                    <Card key={business.id} className="hover:shadow-xl transition-all bg-white border-gray-200 overflow-hidden">
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        {/* Category Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {business.subcategory && business.subcategory.icon && (
                              <span className="text-2xl">{business.subcategory.icon}</span>
                            )}
                            <span className="text-sm text-gray-600 font-medium">
                              {language === 'ta'
                                ? (business.mainCategory?.name_ta || business.category)
                                : (business.mainCategory?.name || business.category)
                              }
                            </span>
                          </div>
                          {business.verified && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                              ✓ {t('directory.verified', 'Verified', 'சரிபார்க்கப்பட்டது')}
                            </span>
                          )}
                        </div>

                        {/* Business Name */}
                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-3 break-words">
                          {language === 'ta' && business.name_ta ? business.name_ta : business.name}
                        </h3>

                        {/* Main Business Image/Video */}
                        {(business.mainImage || business.mainVideoUrl) && (
                          <div className="relative mb-4 aspect-video bg-gray-100 rounded-lg overflow-hidden min-h-[300px] md:min-h-[350px] lg:min-h-[400px]">
                            {business.mainVideoUrl ? (
                              <>
                                {playingVideo === business.id ? (
                                  <iframe
                                    src={`${getYouTubeEmbedUrl(business.mainVideoUrl)}?autoplay=1&rel=0&modestbranding=1`}
                                    className="absolute inset-0 w-full h-full border-0"
                                    style={{ minHeight: '300px' }}
                                    allowFullScreen
                                    title="Business Video"
                                  />
                                ) : (
                                  <div
                                    className="relative w-full h-full cursor-pointer group"
                                    onClick={() => handleVideoPlay(business.id)}
                                  >
                                    <img
                                      src={getYouTubeThumbnail(business.mainVideoUrl)}
                                      alt="Video thumbnail"
                                      className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all">
                                      <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                <button
                                  onClick={() => setPlayingVideo(null)}
                                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all z-10"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </>
                            ) : business.mainImage && (
                              <img
                                src={business.mainImage}
                                alt={business.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}

                        {/* Business Address */}
                        <div className="flex items-start gap-2 text-gray-600 mb-4">
                          <MapPinIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">
                            {language === 'ta' && business.address_ta ? business.address_ta : business.address}
                          </span>
                        </div>

                        {/* Action Buttons - Left/Right Layout */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          {/* Left Column - Social Media */}
                          <div className="space-y-2">
                            {business.instagramUrl && (
                              <a
                                href={business.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all text-sm"
                              >
                                <span>📷</span>
                                <span>Instagram</span>
                              </a>
                            )}
                            {business.youtubeUrl && (
                              <a
                                href={business.youtubeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all text-sm"
                              >
                                <span>📺</span>
                                <span>YouTube</span>
                              </a>
                            )}
                            {business.facebookUrl && (
                              <a
                                href={business.facebookUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                              >
                                <span>👥</span>
                                <span>Facebook</span>
                              </a>
                            )}
                          </div>

                          {/* Right Column - Business Actions */}
                          <div className="space-y-2">
                            {business.email && (
                              <button
                                onClick={() => handleEmail(business.email!)}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm w-full"
                              >
                                <EnvelopeIcon className="h-4 w-4" />
                                <span>{t('directory.email', 'Email', 'மின்னஞ்சல்')}</span>
                              </button>
                            )}
                            {business.bookingUrl && (
                              <a
                                href={business.bookingUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                              >
                                <CalendarIcon className="h-4 w-4" />
                                <span>{t('directory.booking', 'Booking', 'முன்பதிவு')}</span>
                              </a>
                            )}
                            <button
                              onClick={() => handleShare(business)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm w-full"
                            >
                              <ShareIcon className="h-4 w-4" />
                              <span>{t('directory.share', 'Share', 'பகிரவும்')}</span>
                            </button>
                          </div>
                        </div>

                        {/* Additional Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          <button
                            onClick={() => handleCall(business.phone)}
                            className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm"
                          >
                            <PhoneIcon className="h-4 w-4" />
                            <span>{t('directory.call', 'Call', 'அழைக்கவும்')}</span>
                          </button>

                          <button
                            onClick={() => handleDirections(business)}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                          >
                            <MapPinIcon className="h-4 w-4" />
                            <span>{t('directory.directions', 'Directions', 'திசைகள்')}</span>
                          </button>

                          {business.website && (
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all text-sm"
                            >
                              <GlobeAltIcon className="h-4 w-4" />
                              <span>{t('directory.website', 'Website', 'இணையதளம்')}</span>
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setCommentsBusinessId(business.id)
                              setShowComments(true)
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm"
                          >
                            <ChatBubbleLeftIcon className="h-4 w-4" />
                            <span>{t('directory.comments', 'Comments', 'கருத்துகள்')}</span>
                          </button>

                          {business.hasProfile && (
                            <button
                              onClick={() => {
                                setSelectedBusiness(business)
                                setShowProfilePopup(true)
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm"
                            >
                              <span>{t('directory.viewProfile', 'View Profile', 'சுயவிவரத்தைப் பார்க்கவும்')}</span>
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* No Search Results */}
            {searchTerm && filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {language === 'ta' ? 'முடிவுகள் இல்லை' : 'No results found'}
                </p>
              </div>
            )}

            {/* Businesses - Only show when in subcategory view and not searching */}
            {selectedCategoryObj && viewingSubcategory && selectedSubcategory && !searchTerm && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {viewingSubcategory && selectedSubcategory ? (
                    // Show subcategory name when in subcategory view
                    (() => {
                      const subcategoryObj = selectedCategoryObj.subcategories.find(sub => sub.id === selectedSubcategory)
                      return subcategoryObj ? (language === 'ta' ? subcategoryObj.name_ta : subcategoryObj.name) : ''
                    })()
                  ) : (
                    // Show category name when in category view
                    language === 'ta' ? selectedCategoryObj.name_ta : selectedCategoryObj.name
                  )}
                </h2>
              <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                {filteredBusinesses.map((business) => (
                  <Card key={business.id} className="hover:shadow-xl transition-all bg-white border-gray-200 overflow-hidden">
                    <CardContent className="p-6">
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {business.subcategory && business.subcategory.icon && (
                            <span className="text-2xl">{business.subcategory.icon}</span>
                          )}
                          <span className="text-sm text-gray-600 font-medium">
                            {language === 'ta'
                              ? (business.mainCategory?.name_ta || business.category)
                              : (business.mainCategory?.name || business.category)
                            }
                          </span>
                        </div>
                        {business.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                            ✓ {t('directory.verified', 'Verified', 'சரிபார்க்கப்பட்டது')}
                          </span>
                        )}
                      </div>

                      {/* Business Name */}
                      <h3 className="font-bold text-xl text-gray-900 mb-3">
                        {language === 'ta' && business.name_ta ? business.name_ta : business.name}
                      </h3>

                      {/* Main Business Image/Video */}
                      {(business.mainImage || business.mainVideoUrl) && (
                        <div className="mb-4">
                          {playingVideo === business.id && business.mainVideoUrl ? (
                            // Show video player when playing - Enhanced size for better visibility
                            <div className="aspect-video w-full min-h-[300px] md:min-h-[350px] lg:min-h-[400px]">
                              {(() => {
                                const embedUrl = getYouTubeEmbedUrl(business.mainVideoUrl)
                                if (embedUrl) {
                                  return (
                                    <div className="relative w-full h-full">
                                      <iframe
                                        src={`${embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                                        className="absolute inset-0 w-full h-full rounded-lg border-0"
                                        allowFullScreen
                                        title={`${business.name} video`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        style={{ minHeight: '300px' }}
                                      />
                                      <button
                                        onClick={() => setPlayingVideo(null)}
                                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity z-10"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  )
                                } else {
                                  // Fallback for non-YouTube videos
                                  return (
                                    <div className="relative w-full h-full">
                                      <video
                                        src={business.mainVideoUrl}
                                        className="absolute inset-0 w-full h-full rounded-lg object-cover"
                                        controls
                                        autoPlay
                                        style={{ minHeight: '300px' }}
                                      />
                                      <button
                                        onClick={() => setPlayingVideo(null)}
                                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity z-10"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  )
                                }
                              })()}
                            </div>
                          ) : (
                            // Show image or video thumbnail (exclusive)
                            <div className="relative">
                              {business.mainImage ? (
                                // Show image only (no video overlay since they're exclusive now)
                                <div className="aspect-video w-full">
                                  <img
                                    src={business.mainImage}
                                    alt={business.name}
                                    className="w-full h-full object-cover rounded-lg"
                                    loading="lazy"
                                  />
                                </div>
                              ) : business.mainVideoUrl ? (
                                // Show YouTube video thumbnail if no image but video exists
                                (() => {
                                  const youtubeId = getYouTubeId(business.mainVideoUrl)
                                  if (youtubeId) {
                                    return (
                                      <div className="aspect-video w-full">
                                        <div
                                          className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden cursor-pointer group"
                                          onClick={() => handleVideoPlay(business.id)}
                                        >
                                        <img
                                          src={getYouTubeThumbnail(business.mainVideoUrl)}
                                          alt={`${business.name} video`}
                                          className="absolute top-0 left-0 w-full h-full object-cover"
                                          loading="lazy"
                                          onError={(e) => {
                                            e.currentTarget.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
                                          }}
                                        />
                                        {/* Play Button Overlay */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                          <div className="absolute inset-0 bg-black opacity-30"></div>
                                          <div className="relative w-16 h-16 bg-black bg-opacity-60 rounded-full flex items-center justify-center backdrop-blur-sm border-3 border-white border-opacity-80 shadow-2xl">
                                            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                              <path d="M8 5v14l11-7z" />
                                            </svg>
                                          </div>
                                        </div>
                                        </div>
                                      </div>
                                    )
                                  } else {
                                    // Non-YouTube video or invalid URL - show placeholder
                                    return (
                                      <div className="aspect-video w-full">
                                        <div
                                          className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center cursor-pointer"
                                          onClick={() => handleVideoPlay(business.id)}
                                        >
                                        <div className="text-center text-white">
                                          <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                          </svg>
                                          <p className="text-sm">Play Video</p>
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

                      {/* Clickable Contact Info */}
                      <div className="space-y-2 mb-4 text-sm">
                        {/* Address - Clickable for directions */}
                        <button
                          onClick={() => handleDirections(business)}
                          className="flex items-start gap-2 text-gray-700 hover:text-blue-600 transition-colors w-full text-left group"
                        >
                          <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0 group-hover:text-blue-600" />
                          <span className="line-clamp-2">
                            {language === 'ta' && business.address_ta ? business.address_ta : business.address}
                          </span>
                        </button>

                        {/* Phone - Clickable to call */}
                        {business.phone && (
                          <a
                            href={`tel:${business.phone}`}
                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                            <span>{business.phone}</span>
                          </a>
                        )}

                        {/* Email - Clickable to email */}
                        {business.email && (
                          <a
                            href={`mailto:${business.email}`}
                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{business.email}</span>
                          </a>
                        )}

                        {/* Website - Clickable to open */}
                        {business.website && (
                          <a
                            href={business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                          >
                            <GlobeAltIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{business.website}</span>
                          </a>
                        )}
                      </div>

                      {/* Action Buttons Grid - Left: Instagram, YouTube, Facebook | Right: Email, Booking, Share */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {/* LEFT COLUMN */}
                        <div className="space-y-2">
                          {/* Instagram */}
                          {business.instagramUrl && (
                            <button
                              onClick={() => handleInstagram(business.instagramUrl!)}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Instagram
                            </button>
                          )}

                          {/* YouTube */}
                          {business.youtubeUrl && (
                            <button
                              onClick={() => window.open(business.youtubeUrl, '_blank')}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              YouTube
                            </button>
                          )}

                          {/* Facebook */}
                          {business.facebookUrl && (
                            <button
                              onClick={() => handleFacebook(business.facebookUrl!)}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Facebook
                            </button>
                          )}
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="space-y-2">
                          {/* Email */}
                          {business.email && (
                            <button
                              onClick={() => window.open(`mailto:${business.email}`, '_self')}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Email
                            </button>
                          )}

                          {/* Booking */}
                          {business.bookingUrl && (
                            <button
                              onClick={() => handleBooking(business.bookingUrl!)}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              Booking
                            </button>
                          )}

                          {/* Share */}
                          <button
                            onClick={() => handleShare(business)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Share
                          </button>
                        </div>
                      </div>

                      {/* View Profile Button - Only if hasProfile is true */}
                      {business.hasProfile && (
                        <button
                          onClick={() => {
                            setSelectedBusiness(business)
                            setShowProfilePopup(true)
                          }}
                          className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                        >
                          View Profile
                        </button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* No businesses message */}
              {filteredBusinesses.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    {t('directory.noBusinesses', 'No businesses found matching your criteria', 'உங்கள் அளவுகோலுக்கு பொருந்தும் வணிகங்கள் எதுவும் கிடைக்கவில்லை')}
                  </p>
                </div>
              )}
            </div>
            )}
          </>
        )}

        {/* Comments Modal */}
        <Comments
          itemId={commentsBusinessId}
          itemType="business"
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />

        {/* Business Profile Popup */}
        {selectedBusiness && (
          <BusinessProfilePopup
            business={selectedBusiness}
            isOpen={showProfilePopup}
            onClose={() => {
              setShowProfilePopup(false)
              setSelectedBusiness(null)
            }}
          />
        )}

        {/* Share Modal */}
        {showShareModal && shareBusinessData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('directory.shareBusiness', 'Share Business', 'வணிகத்தைப் பகிரவும்')}
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t('directory.share', 'Share', 'பகிரவும்')}: {language === 'ta' && shareBusinessData.name_ta ? shareBusinessData.name_ta : shareBusinessData.name}
                </p>
                {shareBusinessData.mainImage && (
                  <img
                    src={shareBusinessData.mainImage}
                    alt={shareBusinessData.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
              </div>

              <div className="space-y-3">
                {/* WhatsApp */}
                <button
                  onClick={() => shareToWhatsApp(shareBusinessData)}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
                  </svg>
                  <span>WhatsApp</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => shareToFacebook(shareBusinessData)}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>

                {/* Copy Link */}
                <button
                  onClick={() => copyLink(shareBusinessData)}
                  className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>{t('directory.copyLink', 'Copy Link', 'இணைப்பை நகலெடுக்கவும்')}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading directory...</p>
          </div>
        </div>
      }>
        <DirectoryPageContent />
      </Suspense>
    </div>
  )
}