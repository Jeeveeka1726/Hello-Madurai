'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  GlobeAltIcon, 
  MagnifyingGlassIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChatBubbleLeftIcon
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
  description: string
  description_ta?: string
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [commentsBusinessId, setCommentsBusinessId] = useState<string>('')
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)

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
          // Sort categories alphabetically by name
          const sortedCategories = (categoriesData.categories || []).sort((a: Category, b: Category) => {
            const nameA = language === 'ta' ? a.name_ta : a.name
            const nameB = language === 'ta' ? b.name_ta : b.name
            return nameA.localeCompare(nameB)
          })
          setCategories(sortedCategories)

          // Auto-select first category if none selected
          if (sortedCategories.length > 0 && !selectedCategory) {
            setSelectedCategory(sortedCategories[0].id)
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

  const filteredBusinesses = businesses.filter(business => {
    // Filter by category
    const matchesCategory = !selectedCategory || business.categoryId === selectedCategory

    // Filter by subcategory
    const matchesSubcategory = !selectedSubcategory || business.subcategoryId === selectedSubcategory

    // Filter by search term
    const matchesSearch = searchTerm === '' ||
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.name_ta && business.name_ta.includes(searchTerm)) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.description_ta && business.description_ta.includes(searchTerm))

    return matchesCategory && matchesSubcategory && matchesSearch
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
    const url = `${window.location.origin}/directory/${business.id}`
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.description,
        url: url,
      })
    } else {
      navigator.clipboard.writeText(url)
      alert(t('directory.linkCopied', 'Link copied to clipboard!', 'இணைப்பு கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!'))
    }
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

        {/* Search and Filter */}
        {!loading && (
          <>
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('directory.searchPlaceholder', 'Search businesses...', 'வணிகங்களைத் தேடுங்கள்...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Main Categories */}
            {!loading && categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {t('directory.selectCategory', 'Select Category', 'வகையைத் தேர்ந்தெடுக்கவும்')}
                </h2>
                <div className="flex flex-wrap gap-3 justify-center">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.id)
                        setSelectedSubcategory(null)
                      }}
                      className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white shadow-lg scale-105'
                          : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:shadow-md'
                      }`}
                    >
                      <span>{language === 'ta' ? category.name_ta : category.name}</span>
                      {category._count && category._count.businesses > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          selectedCategory === category.id
                            ? 'bg-white/20'
                            : 'bg-gray-200'
                        }`}>
                          {category._count.businesses}
                        </span>
                      )}
                    </button>
                  ))}
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

            {/* Subcategories */}
            {selectedCategoryObj && selectedCategoryObj.subcategories.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  {t('directory.selectSubcategory', 'Select Subcategory', 'துணை வகையைத் தேர்ந்தெடுக்கவும்')}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {selectedCategoryObj.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => setSelectedSubcategory(subcategory.id)}
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

            {/* Businesses */}
            {selectedCategoryObj && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {language === 'ta' ? selectedCategoryObj.name_ta : selectedCategoryObj.name}
                </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                      <h3 className="font-bold text-xl text-gray-900 mb-2">
                        {language === 'ta' && business.name_ta ? business.name_ta : business.name}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {language === 'ta' && business.description_ta ? business.description_ta : business.description}
                      </p>

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

                      {/* Action Buttons Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {/* Instagram */}
                        {business.instagramUrl && (
                          <button
                            onClick={() => handleInstagram(business.instagramUrl!)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Instagram
                          </button>
                        )}

                        {/* Facebook */}
                        {business.facebookUrl && (
                          <button
                            onClick={() => handleFacebook(business.facebookUrl!)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Facebook
                          </button>
                        )}

                        {/* YouTube */}
                        {business.youtubeUrl && (
                          <button
                            onClick={() => window.open(business.youtubeUrl, '_blank')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Youtube
                          </button>
                        )}

                        {/* Booking */}
                        {business.bookingUrl && (
                          <button
                            onClick={() => handleBooking(business.bookingUrl!)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            Booking
                          </button>
                        )}

                        {/* Share */}
                        <button
                          onClick={() => handleShare(business)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Share
                        </button>
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
      </div>
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      <DirectoryPageContent />
    </div>
  )
}