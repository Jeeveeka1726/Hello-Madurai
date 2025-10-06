'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  GlobeAltIcon,
  VideoCameraIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Comments from '@/components/Comments'

// Dynamic import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

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

export default function BusinessProfilePage() {
  const params = useParams()
  const { t, language } = useLanguage()
  const businessId = params.id as string
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)

  // Helper function to extract YouTube ID from URL
  const getYouTubeId = (url: string): string | null => {
    if (!url) return null
    
    try {
      // Handle different YouTube URL formats
      if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1])
        return urlParams.get('v')
      } else if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1]?.split(/[?#]/)[0] || null
      } else if (url.includes('youtube.com/embed/')) {
        return url.split('embed/')[1]?.split(/[?#]/)[0] || null
      } else if (url.length === 11 && !url.includes('/')) {
        // Just the ID
        return url
      }
    } catch (error) {
      console.error('Error extracting YouTube ID:', error)
    }
    
    return null
  }

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const response = await fetch(`/api/admin/directory/${businessId}`)
        if (response.ok) {
          const data = await response.json()
          setBusiness(data)
        }
      } catch (error) {
        console.error('Error fetching business:', error)
      } finally {
        setLoading(false)
      }
    }

    if (businessId) {
      fetchBusiness()
    }
  }, [businessId])

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

  const handleDirections = () => {
    if (!business) return
    
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

  const handleDownload = async () => {
    if (!business) return
    
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

  const handleShare = () => {
    if (!business) return
    
    const url = window.location.href
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

  const getAverageRating = () => {
    if (!business?.comments?.length) return 0
    const ratings = business.comments.filter(c => c.rating).map(c => c.rating!)
    if (ratings.length === 0) return 0
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
  }

  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <StarSolid key={i} className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarIcon key={i} className="h-5 w-5 text-gray-300" />
        )
      )
    }
    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-blue-950">
        <NewHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-blue-950">
        <NewHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('directory.businessNotFound', 'Business Not Found', 'வணிகம் கிடைக்கவில்லை')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {t('directory.businessNotFoundDesc', 'The business you are looking for does not exist or has been removed.', 'நீங்கள் தேடும் வணிகம் இல்லை அல்லது அகற்றப்பட்டுள்ளது.')}
              </p>
              <Link href="/directory">
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  {t('directory.backToDirectory', 'Back to Directory', 'அடைவுக்கு திரும்பு')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const averageRating = getAverageRating()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950">
      <NewHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/directory">
            <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('directory.backToDirectory', 'Back to Directory', 'அடைவுக்கு திரும்பு')}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardContent className="p-8">
                {/* Business Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {language === 'ta' && business.name_ta ? business.name_ta : business.name}
                      </h1>
                      {business.verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                          ✓ {t('directory.verified', 'Verified', 'சரிபார்க்கப்பட்டது')}
                        </span>
                      )}
                      {business.featured && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          ⭐ {t('directory.featured', 'Featured', 'சிறப்பு')}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-lg text-gray-600 dark:text-gray-400 capitalize mb-4">
                      {business.category}
                    </p>

                    {/* Rating */}
                    {business.comments && business.comments.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {renderStars(Math.round(averageRating))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {averageRating.toFixed(1)} ({business.comments.length} {t('directory.reviews', 'reviews', 'மதிப்புரைகள்')})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
                  {language === 'ta' && business.description_ta ? business.description_ta : business.description}
                </p>

                {/* Video */}
                {business.videoUrl && (() => {
                  const youtubeId = getYouTubeId(business.videoUrl)
                  return (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {t('directory.promotionalVideo', 'Promotional Video', 'விளம்பர வீடியோ')}
                      </h3>
                      <div className="bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9', position: 'relative' }}>
                        {youtubeId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&playsinline=1`}
                            title={`${business.name} promotional video`}
                            width="100%"
                            height="100%"
                            style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              border: 'none'
                            }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            onLoad={() => {
                              console.log('✅ Business video loaded:', business.name)
                              console.log('YouTube ID:', youtubeId)
                            }}
                          />
                        ) : (
                          // Fallback to ReactPlayer for non-YouTube videos
                          <ReactPlayer
                            url={business.videoUrl}
                            width="100%"
                            height="100%"
                            controls={true}
                            playing={false}
                            playsinline={true}
                            style={{ backgroundColor: '#000' }}
                          />
                        )}
                      </div>
                    </div>
                  )
                })()}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <Button onClick={() => handleCall(business.phone)} className="flex flex-col items-center py-4">
                    <PhoneIcon className="h-6 w-6 mb-2" />
                    {t('directory.call', 'Call', 'அழை')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleDirections}
                    className="flex flex-col items-center py-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <MapPinIcon className="h-6 w-6 mb-2" />
                    {t('directory.directions', 'Directions', 'திசைகள்')}
                  </Button>
                  
                  {business.website && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleWebsite(business.website!)}
                      className="flex flex-col items-center py-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <GlobeAltIcon className="h-6 w-6 mb-2" />
                      {t('directory.website', 'Website', 'வலைத்தளம்')}
                    </Button>
                  )}
                  
                  {business.bookingUrl && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleBooking(business.bookingUrl!)}
                      className="flex flex-col items-center py-4 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <CalendarIcon className="h-6 w-6 mb-2" />
                      {t('directory.booking', 'Book', 'முன்பதிவு')}
                    </Button>
                  )}
                </div>

                {/* Social Media */}
                {(business.instagramUrl || business.facebookUrl) && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                      {t('directory.followUs', 'Follow Us', 'எங்களைப் பின்தொடரவும்')}
                    </h3>
                    <div className="flex gap-4">
                      {business.instagramUrl && (
                        <Button 
                          onClick={() => handleInstagram(business.instagramUrl!)}
                          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                        >
                          📷 Instagram
                        </Button>
                      )}
                      
                      {business.facebookUrl && (
                        <Button 
                          onClick={() => handleFacebook(business.facebookUrl!)}
                          className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                        >
                          📘 Facebook
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Actions */}
                <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    onClick={handleDownload}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    {t('directory.download', 'Download Info', 'தகவல் பதிவிறக்கம்')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleShare}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ShareIcon className="h-4 w-4 mr-2" />
                    {t('directory.share', 'Share', 'பகிர்')}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowComments(true)}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                    {t('directory.writeReview', 'Write Review', 'மதிப்புரை எழுதுங்கள்')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('directory.contactInfo', 'Contact Information', 'தொடர்பு தகவல்')}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {t('directory.address', 'Address', 'முகவரி')}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {language === 'ta' && business.address_ta ? business.address_ta : business.address}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {t('directory.phone', 'Phone', 'தொலைபேசி')}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300">
                        {business.phone}
                      </p>
                    </div>
                  </div>
                  
                  {business.email && (
                    <div className="flex items-start gap-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {t('directory.email', 'Email', 'மின்னஞ்சல்')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 break-all">
                          {business.email}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-start gap-3">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {t('directory.website', 'Website', 'வலைத்தளம்')}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 break-all">
                          {business.website}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Map Embed */}
                {(business.latitude && business.longitude) && (
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                      {t('directory.location', 'Location', 'இடம்')}
                    </h4>
                    <div className="aspect-w-16 aspect-h-12 rounded-lg overflow-hidden">
                      <iframe
                        src={`https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15720.65!2d${business.longitude}!3d${business.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1234567890`}
                        width="100%"
                        height="200"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Comments Modal */}
        <Comments
          itemId={business.id}
          itemType="business"
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      </div>
    </div>
  )
}

