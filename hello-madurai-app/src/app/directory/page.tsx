'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  GlobeAltIcon, 
  MagnifyingGlassIcon,
  VideoCameraIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Comments from '@/components/Comments'

interface Business {
  id: string
  name: string
  name_ta?: string
  description: string
  description_ta?: string
  category: string
  address: string
  address_ta?: string
  phone: string
  email?: string
  website?: string
  
  // New business features
  videoUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  bookingUrl?: string
  latitude?: number
  longitude?: number
  
  featured: boolean
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
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)
  const [commentsBusinessId, setCommentsBusinessId] = useState<string>('')

  // Fetch businesses from database
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('/api/directory')
        if (response.ok) {
          const data = await response.json()
          setBusinesses(data)
        } else {
          console.error('Failed to fetch businesses')
        }
      } catch (error) {
        console.error('Error fetching businesses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  const categories = [
    { id: 'all', name: t('directory.categories.all', 'All Categories', 'அனைத்து வகைகள்') },
    { id: 'healthcare', name: t('directory.categories.healthcare', 'Healthcare', 'சுகாதாரம்') },
    { id: 'education', name: t('directory.categories.education', 'Education', 'கல்வி') },
    { id: 'restaurant', name: t('directory.categories.restaurant', 'Restaurants', 'உணவகங்கள்') },
    { id: 'automotive', name: t('directory.categories.automotive', 'Automotive', 'வாகன சேவை') },
    { id: 'retail', name: t('directory.categories.retail', 'Retail', 'சில்லறை') },
    { id: 'service', name: t('directory.categories.service', 'Services', 'சேவைகள்') },
    { id: 'other', name: t('directory.categories.other', 'Other', 'மற்றவை') }
  ]

  const filteredBusinesses = businesses.filter(business => {
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.name_ta && business.name_ta.includes(searchTerm)) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (business.description_ta && business.description_ta.includes(searchTerm))
    return matchesCategory && matchesSearch
  })

  const featuredBusinesses = filteredBusinesses.filter(business => business.featured)
  const regularBusinesses = filteredBusinesses.filter(business => !business.featured)

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
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t('directory.title', 'Business Directory', 'வணிக அடைவு')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {t('directory.subtitle', 'Find local businesses and services in Madurai', 'மதுரையில் உள்ளூர் வணிகங்கள் மற்றும் சேவைகளைக் கண்டறியுங்கள்')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "primary" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id 
                      ? "bg-primary-600 text-white" 
                      : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Featured Businesses */}
            {featuredBusinesses.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {t('directory.featured', 'Featured Businesses', 'சிறப்பு வணிகங்கள்')}
                </h2>
                <div className="grid gap-8 lg:grid-cols-2">
                  {featuredBusinesses.map((business) => (
                    <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🏢</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                              {business.category}
                            </p>
                          </div>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                            {t('directory.featured', 'Featured', 'சிறப்பு')}
                          </span>
                          {business.verified && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              {t('directory.verified', 'Verified', 'சரிபார்க்கப்பட்டது')}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          {business.name}
                        </h3>
                        {business.name_ta && (
                          <h4 className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                            {business.name_ta}
                          </h4>
                        )}
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {business.description}
                        </p>
                        <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {business.address}
                          </div>
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {business.phone}
                          </div>
                          {business.email && (
                            <div className="flex items-center">
                              <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                              {business.email}
                            </div>
                          )}
                          {business.website && (
                            <div className="flex items-center">
                              <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-400" />
                              <span className="line-clamp-1">{business.website}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={() => handleCall(business.phone)} className="flex-1 min-w-[100px]">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            {t('directory.call', 'Call', 'அழை')}
                          </Button>
                          
                          {business.videoUrl && (
                            <Button 
                              variant="outline" 
                              onClick={() => handleVideo(business.videoUrl!)}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <VideoCameraIcon className="h-4 w-4 mr-2" />
                              {t('directory.video', 'Video', 'வீடியோ')}
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            onClick={() => handleDirections(business)}
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {t('directory.directions', 'Directions', 'திசைகள்')}
                          </Button>
                          
                          {business.website && (
                            <Button 
                              variant="outline" 
                              onClick={() => handleWebsite(business.website!)}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <GlobeAltIcon className="h-4 w-4 mr-2" />
                              {t('directory.website', 'Website', 'வலைத்தளம்')}
                            </Button>
                          )}
                          
                          {business.bookingUrl && (
                            <Button 
                              variant="outline" 
                              onClick={() => handleBooking(business.bookingUrl!)}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <CalendarIcon className="h-4 w-4 mr-2" />
                              {t('directory.booking', 'Book', 'முன்பதிவு')}
                            </Button>
                          )}
                        </div>
                        
                        {/* Social and Action Buttons */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {business.instagramUrl && (
                            <Button 
                              size="sm"
                              variant="outline" 
                              onClick={() => handleInstagram(business.instagramUrl!)}
                              className="bg-gradient-to-r from-blue-500 to-pink-500 text-white border-0 hover:from-blue-600 hover:to-pink-600"
                            >
                              📷 Instagram
                            </Button>
                          )}
                          
                          {business.facebookUrl && (
                            <Button 
                              size="sm"
                              variant="outline" 
                              onClick={() => handleFacebook(business.facebookUrl!)}
                              className="bg-blue-600 text-white border-0 hover:bg-blue-700"
                            >
                              📘 Facebook
                            </Button>
                          )}
                          
                          <Button 
                            size="sm"
                            variant="outline" 
                            onClick={() => handleDownload(business)}
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                            {t('directory.download', 'Download', 'பதிவிறக்கம்')}
                          </Button>
                          
                          <Button 
                            size="sm"
                            variant="outline" 
                            onClick={() => handleShare(business)}
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <ShareIcon className="h-3 w-3 mr-1" />
                            {t('directory.share', 'Share', 'பகிர்')}
                          </Button>
                          
                          <Button 
                            size="sm"
                            variant="outline" 
                            onClick={() => openComments(business.id)}
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <ChatBubbleLeftIcon className="h-3 w-3 mr-1" />
                            {t('directory.reviews', 'Reviews', 'மதிப்புரைகள்')} ({business.comments?.length || 0})
                          </Button>
                          
                          <Link href={`/directory/${business.id}`}>
                            <Button 
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {t('directory.viewProfile', 'View Profile', 'சுயவிவரம் பார்க்க')}
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Businesses */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                {selectedCategory === 'all' 
                  ? t('directory.allBusinesses', 'All Businesses', 'அனைத்து வணிகங்கள்')
                  : categories.find(cat => cat.id === selectedCategory)?.name
                }
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {(selectedCategory === 'all' ? regularBusinesses : filteredBusinesses.filter(b => !b.featured)).map((business) => (
                  <Card key={business.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl mb-1">🏢</div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {business.category}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {business.category}
                        </span>
                        {business.verified && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                            {t('directory.verified', 'Verified', 'சரிபார்க்கப்பட்டது')}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {business.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                        {business.description}
                      </p>
                      <div className="space-y-1 mb-3 text-xs text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                          <span className="line-clamp-1">{business.address}</span>
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{business.phone}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleCall(business.phone)} 
                          className="flex-1 text-xs"
                        >
                          <PhoneIcon className="h-3 w-3 mr-1" />
                          {t('directory.call', 'Call', 'அழை')}
                        </Button>
                        {business.email && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEmail(business.email!)}
                            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                          >
                            <EnvelopeIcon className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* No businesses message */}
            {!loading && filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('directory.noBusinesses', 'No businesses found matching your criteria', 'உங்கள் அளவுகோலுக்கு பொருந்தும் வணிகங்கள் எதுவும் கிடைக்கவில்லை')}
                </p>
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
      </div>
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <div>
      <NewHeader />
      <DirectoryPageContent />
    </div>
  )
}