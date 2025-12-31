'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
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
  XMarkIcon,
  UserIcon
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
  bookingPhone?: string
  directionsUrl?: string
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
  const router = useRouter()
  const pathname = usePathname()
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

  // Function to update URL parameters
  const updateURL = (category: string | null, subcategory: string | null, viewSubcategory: boolean) => {
    const params = new URLSearchParams(searchParams.toString())

    if (category) {
      params.set('category', category)
    } else {
      params.delete('category')
    }

    if (subcategory && viewSubcategory) {
      params.set('subcategory', subcategory)
      params.set('viewSubcategory', 'true')
    } else {
      params.delete('subcategory')
      params.delete('viewSubcategory')
    }

    const newURL = `${pathname}?${params.toString()}`
    router.replace(newURL)
  }
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareBusinessData, setShareBusinessData] = useState<Business | null>(null)

  const [playingVideo, setPlayingVideo] = useState<string | null>(null)

  // Nearby businesses state
  const [showNearbyBusinesses, setShowNearbyBusinesses] = useState(false)
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [gettingLocation, setGettingLocation] = useState(false)

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c // Distance in kilometers
    return Math.round(distance * 100) / 100 // Round to 2 decimal places
  }

  // Get user's current location
  const getUserLocation = () => {
    setGettingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError(language === 'ta'
        ? 'உங்கள் உலாவி இருப்பிடத்தை ஆதரிக்கவில்லை'
        : 'Your browser does not support location services')
      setGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setShowNearbyBusinesses(true)
        setGettingLocation(false)
        console.log('📍 User location:', latitude, longitude)
      },
      (error) => {
        let errorMessage = ''
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = language === 'ta'
              ? 'இருப்பிட அணுகல் மறுக்கப்பட்டது. அனுமதிகளை சரிபார்க்கவும்.'
              : 'Location access denied. Please check your permissions.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = language === 'ta'
              ? 'இருப்பிட தகவல் கிடைக்கவில்லை'
              : 'Location information is unavailable'
            break
          case error.TIMEOUT:
            errorMessage = language === 'ta'
              ? 'இருப்பிடத் தேடல் நேரம் முடிந்தது'
              : 'Location request timed out'
            break
          default:
            errorMessage = language === 'ta'
              ? 'இருப்பிடத்தைப் பெறுவதில் பிழை ஏற்பட்டது'
              : 'An error occurred while retrieving location'
            break
        }
        setLocationError(errorMessage)
        setGettingLocation(false)
        console.error('Location error:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    )
  }

  // Get nearby businesses with distances
  const getNearbyBusinesses = () => {
    if (!userLocation) return []

    const businessesWithCoords = businesses.filter(business =>
      business.latitude && business.longitude
    )

    const businessesWithDistances = businessesWithCoords.map(business => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        business.latitude!,
        business.longitude!
      )
      return {
        ...business,
        distance: Math.round(distance * 100) / 100 // Round to 2 decimal places
      }
    })

    // Sort by distance (ascending - nearest first) and return ALL businesses
    return businessesWithDistances.sort((a, b) => a.distance - b.distance)
  }

  // Fetch categories and businesses from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, businessesRes] = await Promise.all([
          fetch('/api/directory-categories', { cache: 'no-store' }),
          fetch('/api/directory', { cache: 'no-store' })
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

  // Handle category and subcategory parameters from URL (for direct navigation)
  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const subcategoryParam = searchParams.get('subcategory')
    const viewSubcategoryParam = searchParams.get('viewSubcategory')

    if (categoryParam && categories.length > 0) {
      // Set the category
      setSelectedCategory(categoryParam)

      if (subcategoryParam && viewSubcategoryParam === 'true') {
        // Navigate to the specific subcategory
        setSelectedSubcategory(subcategoryParam)
        setViewingSubcategory(true)
      } else {
        // Just show the category view
        setSelectedSubcategory(null)
        setViewingSubcategory(false)
      }
    }
  }, [searchParams, categories])

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

  const filteredBusinesses = (() => {
    // If showing nearby businesses, return them with distances
    if (showNearbyBusinesses && userLocation) {
      const nearbyBusinesses = getNearbyBusinesses()

      // Apply search filter to nearby businesses if search term exists
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return nearbyBusinesses.filter(business => {
          return business.name.toLowerCase().includes(searchLower) ||
            (business.name_ta && business.name_ta.includes(searchTerm)) ||
            business.address.toLowerCase().includes(searchLower) ||
            (business.address_ta && business.address_ta.includes(searchTerm)) ||
            (business.description && business.description.toLowerCase().includes(searchLower)) ||
            (business.description_ta && business.description_ta.includes(searchTerm)) ||
            (business.mainCategory?.name && business.mainCategory.name.toLowerCase().includes(searchLower)) ||
            (business.mainCategory?.name_ta && business.mainCategory.name_ta.includes(searchTerm)) ||
            (business.subcategory?.name && business.subcategory.name.toLowerCase().includes(searchLower)) ||
            (business.subcategory?.name_ta && business.subcategory.name_ta.includes(searchTerm)) ||
            business.phone.includes(searchTerm) ||
            (business.email && business.email.toLowerCase().includes(searchLower)) ||
            (business.website && business.website.toLowerCase().includes(searchLower))
        })
      }

      return nearbyBusinesses
    }

    // Regular filtering logic for non-nearby view
    return businesses.filter(business => {
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
  })()

  // Get selected category object
  const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory)

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
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
    // Use custom directions URL if provided
    if (business.directionsUrl) {
      window.open(business.directionsUrl, '_blank')
      return
    }

    // Fallback to coordinates or address
    if (business.latitude && business.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${business.latitude},${business.longitude}`
      window.open(url, '_blank')
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
      window.open(url, '_blank')
    }
  }

  // Function to get available action buttons for a business
  const getAvailableButtons = (business: Business) => {
    const buttons = []

    // Social media buttons (left column)
    if (business.instagramUrl) buttons.push('instagram')
    if (business.youtubeUrl) buttons.push('youtube')
    if (business.facebookUrl) buttons.push('facebook')

    // Action buttons (right column)
    buttons.push('directions') // Always available
    if (business.bookingUrl) buttons.push('booking')
    buttons.push('share') // Always available

    return buttons
  }

  // Function to get button layout classes - Dynamic flexbox layout
  const getButtonLayoutClasses = () => {
    return {
      containerClass: "flex flex-wrap gap-2 justify-center",
      buttonClass: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
    }
  }

  const handleBooking = (business: Business) => {
    const bookingUrl = business.bookingUrl || null

    if (bookingUrl) {
      // Smart detection: Check if bookingUrl contains multiple options separated by comma or pipe
      const bookingOptions = bookingUrl.split(/[,|]/).map(option => option.trim()).filter(option => option.length > 0)

      if (bookingOptions.length > 1) {
        // Multiple booking options available - show choice dialog
        let optionsText = `${t('directory.bookingOptions', 'Choose booking method:', 'முன்பதிவு முறையைத் தேர்ந்தெடுக்கவும்:')}\n\n`

        bookingOptions.forEach((option, index) => {
          const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/
          const isPhone = phoneRegex.test(option.replace(/\s/g, ''))
          const label = isPhone ?
            `${t('directory.phone', 'Phone', 'தொலைபேசி')}: ${option}` :
            `${t('directory.website', 'Website', 'வலைத்தளம்')}: ${option}`
          optionsText += `${index + 1}. ${label}\n`
        })

        optionsText += `\n${t('directory.clickOk', 'Click OK for first option, Cancel for second', 'முதல் விருப்பத்திற்கு OK, இரண்டாவதற்கு Cancel')}`

        const choice = confirm(optionsText)
        const selectedOption = choice ? bookingOptions[0] : bookingOptions[1]

        // Handle the selected option
        const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/
        if (phoneRegex.test(selectedOption.replace(/\s/g, ''))) {
          window.open(`tel:${selectedOption}`, '_self')
        } else {
          window.open(selectedOption.startsWith('http') ? selectedOption : `https://${selectedOption}`, '_blank')
        }
      } else {
        // Single booking option - auto-detect type
        const singleOption = bookingOptions[0]
        const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/

        if (phoneRegex.test(singleOption.replace(/\s/g, ''))) {
          // It's a phone number
          window.open(`tel:${singleOption}`, '_self')
        } else {
          // It's a URL
          window.open(singleOption.startsWith('http') ? singleOption : `https://${singleOption}`, '_blank')
        }
      }
    }
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



  const shareToWhatsApp = async (business: Business) => {
    const url = `${window.location.origin}/directory/${business.id}`
    const businessName = language === 'ta' && business.name_ta ? business.name_ta : business.name
    const businessAddress = language === 'ta' && business.address_ta ? business.address_ta : business.address
    const text = `${businessName}\n📍 ${businessAddress}\n\n${url}`

    // Track share
    try {
      await fetch(`/api/business/${business.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'whatsapp' })
      })
    } catch (error) {
      console.log('Could not track share:', error)
    }

    // Enhanced iPhone compatibility - try native sharing first
    if (navigator.share && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({
          title: businessName,
          text: `${businessName}\n📍 ${businessAddress}`,
          url: url
        })
        setShowShareModal(false)
        return
      } catch (error) {
        // Fall back to WhatsApp URL if native sharing fails
        console.log('Native sharing failed, falling back to WhatsApp URL')
      }
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
    setShowShareModal(false)
  }

  const shareToFacebook = async (business: Business) => {
    const url = `${window.location.origin}/directory/${business.id}`

    // Track share
    try {
      await fetch(`/api/business/${business.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'facebook' })
      })
    } catch (error) {
      console.log('Could not track share:', error)
    }

    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    window.open(facebookUrl, '_blank')
    setShowShareModal(false)
  }

  const copyLink = async (business: Business) => {
    const url = `${window.location.origin}/directory/${business.id}`

    // Track share
    try {
      await fetch(`/api/business/${business.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'copy' })
      })
    } catch (error) {
      console.log('Could not track share:', error)
    }

    try {
      // Enhanced iPhone compatibility
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url)
        alert(t('directory.linkCopied', 'Link copied to clipboard!', 'இணைப்பு கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!'))
      } else {
        // Fallback for older browsers and non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = url
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        // For iPhone Safari compatibility
        textArea.setSelectionRange(0, 99999)

        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)

        if (successful) {
          alert(t('directory.linkCopied', 'Link copied to clipboard!', 'இணைப்பு கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!'))
        } else {
          // Final fallback - show the URL for manual copying
          prompt('Copy this link:', url)
        }
      }
    } catch (error) {
      console.error('Copy failed:', error)
      // Final fallback - show the URL for manual copying
      prompt('Copy this link:', url)
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

            {/* Nearby Businesses Button */}
            <div className="mb-6 text-center">
              <button
                onClick={getUserLocation}
                disabled={gettingLocation}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  gettingLocation
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : showNearbyBusinesses && userLocation
                    ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {gettingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>{language === 'ta' ? 'இருப்பிடம் கண்டறியப்படுகிறது...' : 'Getting Location...'}</span>
                  </>
                ) : showNearbyBusinesses && userLocation ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{language === 'ta' ? 'அருகிலுள்ள வணிகங்கள் காட்டப்படுகின்றன' : 'Showing Nearby Businesses'}</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{language === 'ta' ? 'அருகிலுள்ள வணிகங்கள்' : 'Find Nearby Businesses'}</span>
                  </>
                )}
              </button>

              {locationError && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{locationError}</p>
                  <button
                    onClick={() => setLocationError(null)}
                    className="mt-2 text-red-500 hover:text-red-700 text-sm underline"
                  >
                    {language === 'ta' ? 'மூடு' : 'Dismiss'}
                  </button>
                </div>
              )}

              {showNearbyBusinesses && userLocation && (
                <div className="mt-3 flex items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      setShowNearbyBusinesses(false)
                      setUserLocation(null)
                      setSelectedCategory(null)
                      setSelectedSubcategory(null)
                      setViewingSubcategory(false)
                      updateURL(null, null, false)
                    }}
                    className="text-gray-600 hover:text-gray-800 text-sm underline"
                  >
                    {language === 'ta' ? 'அனைத்து வணிகங்களையும் காட்டு' : 'Show All Businesses'}
                  </button>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm text-gray-600">
                    {language === 'ta'
                      ? `${getNearbyBusinesses().length} அருகிலுள்ள வணிகங்கள்`
                      : `${getNearbyBusinesses().length} nearby businesses`}
                  </span>
                </div>
              )}
            </div>

            {/* Nearby Businesses - Show when nearby mode is active and not searching */}
            {showNearbyBusinesses && userLocation && !searchTerm && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  {language === 'ta' ? 'அருகிலுள்ள வணிகங்கள்' : 'Nearby Businesses'}
                </h2>
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                  {filteredBusinesses.map((business) => (
                    <Card key={business.id} className="hover:shadow-xl transition-all bg-white border-gray-200 overflow-hidden">
                      <CardContent className="p-6 directory-card-content">
                        {/* Category Badge with Distance */}
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
                          <div className="flex items-center gap-2">
                            {/* Distance Badge */}
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                              📍 {(business as any).distance < 1
                                ? `${Math.round((business as any).distance * 1000)}m`
                                : `${(business as any).distance}km`
                              }
                            </span>
                            {business.verified && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                ✓ {t('directory.verified', 'Verified', 'சரிபார்க்கப்பட்டது')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Business Name */}
                        <h3 className="font-bold text-xl text-gray-900 mb-3">
                          {language === 'ta' && business.name_ta ? business.name_ta : business.name}
                        </h3>

                        {/* Main Business Image/Video */}
                        {(business.mainImage || business.mainVideoUrl) && (
                          <div className="mb-4 -mx-6 sm:mx-0 sm:rounded-lg overflow-hidden directory-video-container">
                            {playingVideo === business.id && business.mainVideoUrl ? (
                              // Show video player when playing - Responsive 16:9 aspect ratio
                              <div className="relative w-full aspect-video bg-black sm:rounded-lg overflow-hidden">
                                {(() => {
                                  const embedUrl = getYouTubeEmbedUrl(business.mainVideoUrl)
                                  if (embedUrl) {
                                    return (
                                      <>
                                        <iframe
                                          src={`${embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                                          className="absolute inset-0 w-full h-full border-0"
                                          allowFullScreen
                                          title={`${business.name} video`}
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        />
                                        <button
                                          onClick={() => setPlayingVideo(null)}
                                          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity z-10"
                                        >
                                          <XMarkIcon className="w-4 h-4" />
                                        </button>
                                      </>
                                    )
                                  } else {
                                    // Fallback for non-YouTube videos
                                    return (
                                      <>
                                        <video
                                          src={business.mainVideoUrl}
                                          className="absolute inset-0 w-full h-full object-cover"
                                          controls
                                          autoPlay
                                          playsInline
                                          muted
                                        />
                                        <button
                                          onClick={() => setPlayingVideo(null)}
                                          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity z-10"
                                        >
                                          <XMarkIcon className="w-4 h-4" />
                                        </button>
                                      </>
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
                                      className="w-full h-full object-cover sm:rounded-lg"
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
                                            className="relative w-full h-full bg-gray-900 sm:rounded-lg overflow-hidden cursor-pointer group"
                                            onClick={() => handleVideoPlay(business.id)}
                                          >
                                          <img
                                            src={getYouTubeThumbnail(business.mainVideoUrl)}
                                            alt={`${business.name} video`}
                                            className="absolute top-0 left-0 w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                              const videoId = getYouTubeId(business.mainVideoUrl)
                                              if (videoId) {
                                                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                              }
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
                            <div className="flex-1">
                              <span className="line-clamp-2 block">
                                {language === 'ta' && business.address_ta ? business.address_ta : business.address}
                              </span>
                              {/* Distance display for nearby businesses */}
                              <span className="text-xs text-blue-600 font-medium mt-1 block">
                                🚶 {(business as any).distance < 1
                                  ? `${Math.round((business as any).distance * 1000)}m ${language === 'ta' ? 'தூரம்' : 'away'}`
                                  : `${(business as any).distance}km ${language === 'ta' ? 'தூரம்' : 'away'}`
                                }
                              </span>
                            </div>
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

                        {/* Action Buttons - Dynamic flexbox layout */}
                        <div className={`${getButtonLayoutClasses().containerClass} mb-3`}>
                          {/* Instagram */}
                          {business.instagramUrl && (
                            <button
                              onClick={() => handleInstagram(business.instagramUrl!)}
                              className={getButtonLayoutClasses().buttonClass}
                            >
                              Instagram
                            </button>
                          )}

                          {/* YouTube */}
                          {business.youtubeUrl && (
                            <button
                              onClick={() => window.open(business.youtubeUrl, '_blank')}
                              className={getButtonLayoutClasses().buttonClass}
                            >
                              YouTube
                            </button>
                          )}

                          {/* Facebook */}
                          {business.facebookUrl && (
                            <button
                              onClick={() => handleFacebook(business.facebookUrl!)}
                              className={getButtonLayoutClasses().buttonClass}
                            >
                              Facebook
                            </button>
                          )}

                          {/* Directions - Always available */}
                          <button
                            onClick={() => handleDirections(business)}
                            className={getButtonLayoutClasses().buttonClass}
                          >
                            Directions
                          </button>

                          {/* Booking */}
                          {business.bookingUrl && (
                            <button
                              onClick={() => handleBooking(business)}
                              className={getButtonLayoutClasses().buttonClass}
                            >
                              Book Now
                            </button>
                          )}

                          {/* Share - Always available */}
                          <button
                            onClick={() => handleShare(business)}
                            className={getButtonLayoutClasses().buttonClass}
                          >
                            Share
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Main Categories - Horizontal Scrollable */}
            {!loading && categories.length > 0 && !showNearbyBusinesses && (
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
                          updateURL(category.id, null, false)
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
                    updateURL(selectedCategory, null, false)
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
            {selectedCategoryObj && !viewingSubcategory && !searchTerm && (
              <div className="mb-8">
                {selectedCategoryObj.subcategories.length > 0 ? (
                  <>
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
                            updateURL(selectedCategory, subcategory.id, true)
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
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {language === 'ta'
                        ? 'இந்த வகையில் துணை வகைகள் எதுவும் இல்லை. அனைத்து வணிகங்களையும் பார்க்க தேடல் பயன்படுத்தவும்.'
                        : 'No subcategories in this category. Use search to find all businesses.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Search Results - Show when searching */}
            {searchTerm && filteredBusinesses.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {showNearbyBusinesses && userLocation
                    ? (language === 'ta'
                        ? `அருகிலுள்ள தேடல் முடிவுகள் (${filteredBusinesses.length})`
                        : `Nearby Search Results (${filteredBusinesses.length})`)
                    : (language === 'ta'
                        ? `தேடல் முடிவுகள் (${filteredBusinesses.length})`
                        : `Search Results (${filteredBusinesses.length})`)
                  }
                </h3>
                {/* Full Business Cards for Search Results */}
                <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
                  {filteredBusinesses.map((business) => (
                    <Card key={business.id} className="hover:shadow-xl transition-all bg-white border-gray-200 overflow-hidden">
                      <CardContent className="p-6 directory-card-content">
                        {/* Category Badge with Distance */}
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
                          {/* Distance display for nearby businesses */}
                          {showNearbyBusinesses && userLocation && (business as any).distance !== undefined && (
                            <span className="text-green-600 text-xs font-medium bg-green-50 px-2 py-1 rounded-full">
                              🚶 {(business as any).distance < 1
                                ? `${Math.round((business as any).distance * 1000)}m`
                                : `${(business as any).distance}km`
                              }
                            </span>
                          )}
                          <button
                            onClick={() => {
                              // Navigate to the specific subcategory where this business is located
                              if (business.categoryId) {
                                setSelectedCategory(business.categoryId)

                                // If business has a subcategory, navigate to that subcategory
                                if (business.subcategoryId) {
                                  setViewingSubcategory(true)
                                  setSelectedSubcategory(business.subcategoryId)
                                  updateURL(business.categoryId, business.subcategoryId, true)
                                } else {
                                  setViewingSubcategory(false)
                                  setSelectedSubcategory(null)
                                  updateURL(business.categoryId, null, false)
                                }

                                setSearchTerm('')
                              }
                            }}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            {language === 'ta' ? 'வகைக்கு செல்' : 'Go to Category'}
                          </button>
                        </div>

                        {/* Business Name */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {language === 'ta' ? (business.name_ta || business.name) : business.name}
                        </h3>

                        {/* Address */}
                        <div className="flex items-start gap-2 mb-3">
                          <MapPinIcon className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
                          <p className="text-gray-600 text-sm">
                            {language === 'ta' ? (business.address_ta || business.address) : business.address}
                          </p>
                        </div>

                        {/* Main Image or Video */}
                        {business.mainImage && (
                          <div className="mb-4">
                            <img
                              src={business.mainImage}
                              alt={business.name}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        {business.mainVideoUrl && !business.mainImage && (
                          <div className="mb-4">
                            {getYouTubeEmbedUrl(business.mainVideoUrl) ? (
                              <iframe
                                src={getYouTubeEmbedUrl(business.mainVideoUrl)}
                                className="w-full h-48 rounded-lg"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={business.mainVideoUrl}
                                className="w-full h-48 object-cover rounded-lg"
                                controls
                              />
                            )}
                          </div>
                        )}

                        {/* Action Buttons - Dynamic Flexbox Layout */}
                        <div className="flex flex-wrap gap-2">
                          {/* Phone Button - Always present */}
                          <a
                            href={`tel:${business.phone}`}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                          >
                            <PhoneIcon className="h-4 w-4" />
                            {language === 'ta' ? 'அழை' : 'Call'}
                          </a>

                          {/* Email Button - Only if email exists */}
                          {business.email && (
                            <a
                              href={`mailto:${business.email}`}
                              className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <EnvelopeIcon className="h-4 w-4" />
                              {language === 'ta' ? 'மின்னஞ்சல்' : 'Email'}
                            </a>
                          )}

                          {/* Website Button - Only if website exists */}
                          {business.website && (
                            <a
                              href={business.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              <GlobeAltIcon className="h-4 w-4" />
                              {language === 'ta' ? 'வலைத்தளம்' : 'Website'}
                            </a>
                          )}

                          {/* Directions Button - Only if directions or coordinates exist */}
                          {(business.directionsUrl || (business.latitude && business.longitude)) && (
                            <a
                              href={business.directionsUrl || `https://www.google.com/maps?q=${business.latitude},${business.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              <MapPinIcon className="h-4 w-4" />
                              {language === 'ta' ? 'திசைகள்' : 'Directions'}
                            </a>
                          )}

                          {/* Booking Button - Only if booking URL exists */}
                          {business.bookingUrl && (
                            <a
                              href={business.bookingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                            >
                              <CalendarIcon className="h-4 w-4" />
                              {language === 'ta' ? 'முன்பதிவு' : 'Book'}
                            </a>
                          )}

                          {/* Profile Button - Only if has profile */}
                          {business.hasProfile && (
                            <button
                              onClick={() => {
                                setSelectedBusiness(business)
                                setShowProfilePopup(true)
                              }}
                              className="flex items-center gap-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                            >
                              <UserIcon className="h-4 w-4" />
                              {language === 'ta' ? 'விவரம்' : 'Profile'}
                            </button>
                          )}

                          {/* Share Button - Always present */}
                          <button
                            onClick={() => {
                              setSelectedBusiness(business)
                              setShowShareModal(true)
                            }}
                            className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            <ShareIcon className="h-4 w-4" />
                            {language === 'ta' ? 'பகிர்' : 'Share'}
                          </button>
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

            {/* Businesses - Show when in subcategory view OR when category has no subcategories */}
            {selectedCategoryObj && !searchTerm && (
              (viewingSubcategory && selectedSubcategory) ||
              (selectedCategoryObj.subcategories.length === 0)
            ) && (
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
                    <CardContent className="p-6 directory-card-content">
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
                        <div className="mb-4 -mx-6 sm:mx-0 sm:rounded-lg overflow-hidden directory-video-container">
                          {playingVideo === business.id && business.mainVideoUrl ? (
                            // Show video player when playing - Responsive 16:9 aspect ratio
                            <div className="relative w-full aspect-video bg-black sm:rounded-lg overflow-hidden">
                              {(() => {
                                const embedUrl = getYouTubeEmbedUrl(business.mainVideoUrl)
                                if (embedUrl) {
                                  return (
                                    <>
                                      <iframe
                                        src={`${embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                                        className="absolute inset-0 w-full h-full border-0"
                                        allowFullScreen
                                        title={`${business.name} video`}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                      />
                                      <button
                                        onClick={() => setPlayingVideo(null)}
                                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity z-10"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </>
                                  )
                                } else {
                                  // Fallback for non-YouTube videos
                                  return (
                                    <>
                                      <video
                                        src={business.mainVideoUrl}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        controls
                                        autoPlay
                                        playsInline
                                        muted
                                      />
                                      <button
                                        onClick={() => setPlayingVideo(null)}
                                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-opacity z-10"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </>
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
                                    className="w-full h-full object-cover sm:rounded-lg"
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
                                          className="relative w-full h-full bg-gray-900 sm:rounded-lg overflow-hidden cursor-pointer group"
                                          onClick={() => handleVideoPlay(business.id)}
                                        >
                                        <img
                                          src={getYouTubeThumbnail(business.mainVideoUrl)}
                                          alt={`${business.name} video`}
                                          className="absolute top-0 left-0 w-full h-full object-cover"
                                          loading="lazy"
                                          onError={(e) => {
                                            const videoId = getYouTubeId(business.mainVideoUrl)
                                            if (videoId) {
                                              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                            }
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
                          <div className="flex-1">
                            <span className="line-clamp-2 block">
                              {language === 'ta' && business.address_ta ? business.address_ta : business.address}
                            </span>
                            {/* Distance display for nearby businesses */}
                            {showNearbyBusinesses && userLocation && (business as any).distance !== undefined && (
                              <span className="text-xs text-blue-600 font-medium mt-1 block">
                                📍 {(business as any).distance < 1
                                  ? `${Math.round((business as any).distance * 1000)}m ${language === 'ta' ? 'தூரம்' : 'away'}`
                                  : `${(business as any).distance}km ${language === 'ta' ? 'தூரம்' : 'away'}`
                                }
                              </span>
                            )}
                          </div>
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

                      {/* Action Buttons - Dynamic flexbox layout */}
                      <div className={`${getButtonLayoutClasses().containerClass} mb-3`}>
                        {/* Instagram */}
                        {business.instagramUrl && (
                          <button
                            onClick={() => handleInstagram(business.instagramUrl!)}
                            className={getButtonLayoutClasses().buttonClass}
                          >
                            Instagram
                          </button>
                        )}

                        {/* YouTube */}
                        {business.youtubeUrl && (
                          <button
                            onClick={() => window.open(business.youtubeUrl, '_blank')}
                            className={getButtonLayoutClasses().buttonClass}
                          >
                            YouTube
                          </button>
                        )}

                        {/* Facebook */}
                        {business.facebookUrl && (
                          <button
                            onClick={() => handleFacebook(business.facebookUrl!)}
                            className={getButtonLayoutClasses().buttonClass}
                          >
                            Facebook
                          </button>
                        )}

                        {/* Directions - Always available */}
                        <button
                          onClick={() => handleDirections(business)}
                          className={getButtonLayoutClasses().buttonClass}
                        >
                          Directions
                        </button>

                        {/* Booking */}
                        {business.bookingUrl && (
                          <button
                            onClick={() => handleBooking(business)}
                            className={getButtonLayoutClasses().buttonClass}
                          >
                            Book Now
                          </button>
                        )}

                        {/* Share - Always available */}
                        <button
                          onClick={() => handleShare(business)}
                          className={getButtonLayoutClasses().buttonClass}
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

        {/* Share Modal */}
        {showShareModal && shareBusinessData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Share Business
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
                  Share: {language === 'ta' && shareBusinessData.name_ta ? shareBusinessData.name_ta : shareBusinessData.name}
                </p>
                {(() => {
                  // Show the best image for sharing (same priority as metadata)
                  let imageUrl = ''
                  let imageAlt = shareBusinessData.name

                  if (shareBusinessData.mainVideoUrl) {
                    const youtubeId = getYouTubeId(shareBusinessData.mainVideoUrl)
                    if (youtubeId) {
                      imageUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
                      imageAlt = `${shareBusinessData.name} video thumbnail`
                    }
                  } else if (shareBusinessData.mainImage) {
                    imageUrl = shareBusinessData.mainImage
                    imageAlt = shareBusinessData.name
                  } else if (shareBusinessData.profileImage) {
                    imageUrl = shareBusinessData.profileImage
                    imageAlt = `${shareBusinessData.name} profile`
                  }

                  return imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : null
                })()}
              </div>

              <div className="space-y-3">
                {/* Native Share (iPhone/Android) */}
                {navigator.share && (
                  <button
                    onClick={async () => {
                      try {
                        const businessName = language === 'ta' && shareBusinessData.name_ta ? shareBusinessData.name_ta : shareBusinessData.name
                        const businessAddress = language === 'ta' && shareBusinessData.address_ta ? shareBusinessData.address_ta : shareBusinessData.address
                        await navigator.share({
                          title: businessName,
                          text: `${businessName}\n📍 ${businessAddress}`,
                          url: `${window.location.origin}/directory/${shareBusinessData.id}`
                        })
                        setShowShareModal(false)
                      } catch (error) {
                        console.log('Native sharing cancelled or failed')
                      }
                    }}
                    className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                )}

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
                  <span>Copy Link</span>
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