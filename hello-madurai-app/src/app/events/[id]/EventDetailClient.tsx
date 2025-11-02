'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarIcon, MapPinIcon, ClockIcon, PhoneIcon, GlobeAltIcon, ShareIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  FacebookShareButton,
  WhatsappShareButton,
  FacebookIcon,
  WhatsappIcon
} from 'react-share'
import Image from 'next/image'

interface Event {
  id: string
  title: string
  title_ta?: string | null
  description: string
  description_ta?: string | null
  startDate: string
  startTime?: string | null
  endDate?: string | null
  endTime?: string | null
  duration?: string | null
  location: string
  location_ta?: string | null
  category: string
  featuredImage?: string | null
  website?: string | null
  phone?: string | null
  status: string
  views: number
  createdAt: string
  updatedAt: string
}

interface Props {
  event: Event
}

export default function EventDetailClient({ event }: Props) {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [shareMenuOpen, setShareMenuOpen] = useState(false)

  // Increment view count on mount
  useEffect(() => {
    const incrementView = async () => {
      try {
        await fetch(`/api/admin/events/${event.id}/view`, { method: 'POST' })
      } catch (error) {
        console.error('Error incrementing view:', error)
      }
    }
    incrementView()
  }, [event.id])

  // Fix YouTube iframes to use youtube-nocookie.com domain
  useEffect(() => {
    setTimeout(() => {
      const iframes = document.querySelectorAll('iframe[src*="youtube.com"]')
      iframes.forEach((iframe) => {
        const src = iframe.getAttribute('src')
        if (src && src.includes('youtube.com') && !src.includes('youtube-nocookie.com')) {
          const newSrc = src.replace('youtube.com', 'youtube-nocookie.com')
          iframe.setAttribute('src', newSrc)
        }
      })
    }, 100)
  }, [event])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const handleBookNow = () => {
    if (event.website) {
      window.open(event.website, '_blank')
    } else if (event.phone) {
      window.location.href = `tel:${event.phone}`
    } else {
      alert(t('events.noBooking', 'No booking information available', 'முன்பதிவு தகவல் இல்லை'))
    }
  }

  const eventUrl = typeof window !== 'undefined' ? window.location.href : ''
  const eventTitle = language === 'ta' && event.title_ta ? event.title_ta : event.title
  const eventDescription = language === 'ta' && event.description_ta ? event.description_ta : event.description
  const eventLocation = language === 'ta' && event.location_ta ? event.location_ta : event.location

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 dark:from-blue-950 dark:via-gray-900 dark:to-blue-900">
      <NewHeader />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Back Button */}
        <button
          onClick={() => router.push('/events')}
          className="flex items-center gap-2 text-blue-600 dark:text-yellow-400 hover:underline mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span suppressHydrationWarning>
            {t('events.backToEvents', 'Back to Events', 'நிகழ்வுகளுக்குத் திரும்பு')}
          </span>
        </button>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-0">
              {/* Featured Image */}
              {event.featuredImage && (
                <div className="relative w-full h-64 md:h-96">
                  <Image
                    src={event.featuredImage}
                    alt={eventTitle}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="p-6 md:p-8">
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {eventTitle}
                </h1>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1" suppressHydrationWarning>
                        {t('events.date', 'Date', 'தேதி')}
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {formatDate(event.startDate)}
                        {event.endDate && event.endDate !== event.startDate && (
                          <> - {formatDate(event.endDate)}</>
                        )}
                      </p>
                      {event.duration && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          ({event.duration})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  {event.startTime && (
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-6 w-6 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1" suppressHydrationWarning>
                          {t('events.time', 'Time', 'நேரம்')}
                        </p>
                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                          {formatTime12Hour(event.startTime)}
                          {event.endTime && event.endTime !== event.startTime && (
                            <> - {formatTime12Hour(event.endTime)}</>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-start gap-3">
                    <MapPinIcon className="h-6 w-6 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1" suppressHydrationWarning>
                        {t('events.location', 'Location', 'இடம்')}
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {eventLocation}
                      </p>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="flex items-start gap-3">
                    <svg className="h-6 w-6 text-blue-600 dark:text-yellow-400 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1" suppressHydrationWarning>
                        {t('events.views', 'Views', 'பார்வைகள்')}
                      </p>
                      <p className="text-base font-semibold text-gray-900 dark:text-white">
                        {event.views.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3" suppressHydrationWarning>
                    {t('events.about', 'About This Event', 'இந்த நிகழ்வு பற்றி')}
                  </h2>
                  <div 
                    className="prose prose-blue dark:prose-invert max-w-none event-description"
                    dangerouslySetInnerHTML={{ __html: eventDescription }}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleBookNow}
                    className="flex-1 text-base md:text-lg font-semibold py-3 px-6 h-auto"
                    suppressHydrationWarning
                  >
                    {t('events.bookNow', 'Book Now', 'இப்போது பதிவு செய்க')}
                  </Button>
                  
                  {/* Share Button */}
                  <div className="relative">
                    <Button 
                      variant="outline"
                      onClick={() => setShareMenuOpen(!shareMenuOpen)}
                      className="w-full sm:w-auto bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 px-6 h-auto"
                    >
                      <ShareIcon className="h-5 w-5 mr-2" />
                      <span suppressHydrationWarning>
                        {t('events.share', 'Share', 'பகிர்')}
                      </span>
                    </Button>
                    
                    {/* Share Menu */}
                    {shareMenuOpen && (
                      <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 min-w-[200px]">
                        <div className="flex flex-col gap-3">
                          {/* WhatsApp */}
                          <button
                            onClick={() => {
                              const text = encodeURIComponent(`${eventTitle}\n\n${eventUrl}`)
                              window.open(`https://wa.me/?text=${text}`, '_blank')
                              setShareMenuOpen(false)
                            }}
                            className="transform hover:scale-110 transition-transform cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <WhatsappIcon size={32} round />
                              <span className="text-sm text-gray-600 dark:text-gray-400">WhatsApp</span>
                            </div>
                          </button>
                          
                          {/* Facebook */}
                          <FacebookShareButton url={eventUrl} title={eventTitle}>
                            <div className="flex items-center gap-2 transform hover:scale-110 transition-transform">
                              <FacebookIcon size={32} round />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Facebook</span>
                            </div>
                          </FacebookShareButton>
                          
                          {/* Copy Link */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(eventUrl)
                              alert(t('share.copied', '✅ Copied!', '✅ நகலெடுக்கப்பட்டது!'))
                              setShareMenuOpen(false)
                            }}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            suppressHydrationWarning
                          >
                            {t('share.copyLink', 'Copy Link', 'இணைப்பை நகலெடுக்கவும்')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <style jsx global>{`
        .event-description {
          color: inherit;
        }
        
        .event-description p {
          margin-bottom: 1rem;
          line-height: 1.75;
        }
        
        .event-description h1,
        .event-description h2,
        .event-description h3 {
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .event-description ul,
        .event-description ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .event-description iframe,
        .event-description iframe[src*="youtube"] {
          width: 100% !important;
          max-width: 1280px !important;
          height: auto !important;
          aspect-ratio: 16 / 9 !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          margin: 1.5rem auto !important;
          display: block !important;
        }
      `}</style>
    </div>
  )
}

