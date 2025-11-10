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

  // Fix YouTube iframes to use youtube-nocookie.com domain and ensure proper sizing
  useEffect(() => {
    setTimeout(() => {
      const iframes = document.querySelectorAll('.event-description iframe')
      iframes.forEach((iframe) => {
        const src = iframe.getAttribute('src')

        // Fix YouTube domain
        if (src && src.includes('youtube.com') && !src.includes('youtube-nocookie.com')) {
          const newSrc = src.replace('youtube.com', 'youtube-nocookie.com')
          iframe.setAttribute('src', newSrc)
        }

        // Remove inline width/height attributes - let CSS handle sizing
        if (src && src.includes('youtube')) {
          iframe.removeAttribute('width')
          iframe.removeAttribute('height')
          iframe.removeAttribute('style')
        }
      })

      // Load Instagram embed script if there are Instagram embeds
      const instagramEmbeds = document.querySelectorAll('.event-description blockquote.instagram-media')
      if (instagramEmbeds.length > 0) {
        if (!document.querySelector('script[src*="instagram.com/embed.js"]')) {
          const script = document.createElement('script')
          script.async = true
          script.src = 'https://www.instagram.com/embed.js'
          document.body.appendChild(script)
        } else {
          // If script already loaded, process embeds
          if (window.instgrm) {
            window.instgrm.Embeds.process()
          }
        }
      }
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Super aggressive CSS to force black text on ALL event details */}
      <style dangerouslySetInnerHTML={{ __html: `
        .event-details-wrapper,
        .event-details-wrapper *,
        .event-details-wrapper p,
        .event-details-wrapper div,
        .event-details-wrapper span,
        .event-details-wrapper h1,
        .event-details-wrapper h2,
        .event-details-wrapper h3,
        .event-details-wrapper h4,
        .event-details-wrapper h5,
        .event-details-wrapper h6 {
          color: #000000 !important;
        }
      `}} />

      <NewHeader />

      <main className="container mx-auto px-4 py-8 mt-20">
        {/* Back Button */}
        <button
          onClick={() => router.push('/events')}
          className="flex items-center gap-2 text-blue-600 hover:underline mb-6"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span suppressHydrationWarning>
            {t('events.backToEvents', 'Back to Events', 'நிகழ்வுகளுக்குத் திரும்பு')}
          </span>
        </button>

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden bg-white border-gray-200">
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

              <div className="p-6 md:p-8 event-details-wrapper" style={{ color: '#000000' }}>
                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#000000' }}>
                  {eventTitle}
                </h1>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs mb-1" suppressHydrationWarning style={{ color: '#000000', fontWeight: '600' }}>
                        {t('events.date', 'Date', 'தேதி')}
                      </p>
                      <p className="text-base font-semibold" style={{ color: '#000000' }}>
                        {formatDate(event.startDate)}
                        {event.endDate && event.endDate !== event.startDate && (
                          <> - {formatDate(event.endDate)}</>
                        )}
                      </p>
                      {event.duration && (
                        <p className="text-sm mt-1" style={{ color: '#000000' }}>
                          {event.duration}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  {event.startTime && (
                    <div className="flex items-start gap-3">
                      <ClockIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-xs mb-1" suppressHydrationWarning style={{ color: '#000000', fontWeight: '600' }}>
                          {t('events.time', 'Time', 'நேரம்')}
                        </p>
                        <p className="text-base font-semibold" style={{ color: '#000000' }}>
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
                    <MapPinIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="text-xs mb-1" suppressHydrationWarning style={{ color: '#000000', fontWeight: '600' }}>
                        {t('events.location', 'Location', 'இடம்')}
                      </p>
                      <p className="text-base font-semibold" style={{ color: '#000000' }}>
                        {eventLocation}
                      </p>
                    </div>
                  </div>

                  {/* Views */}
                  <div className="flex items-start gap-3">
                    <svg className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <div>
                      <p className="text-xs mb-1" suppressHydrationWarning style={{ color: '#000000', fontWeight: '600' }}>
                        {t('events.views', 'Views', 'பார்வைகள்')}
                      </p>
                      <p className="text-base font-semibold" style={{ color: '#000000' }}>
                        {event.views.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3" suppressHydrationWarning style={{ color: '#000000 !important' }}>
                    {t('events.about', 'About This Event', 'இந்த நிகழ்வு பற்றி')}
                  </h2>

                  {/* Inline styles for event details AND description */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    /* Force ALL event details to be black */
                    .event-details-wrapper,
                    .event-details-wrapper *,
                    .event-details-wrapper p,
                    .event-details-wrapper div,
                    .event-details-wrapper span,
                    .event-details-wrapper h1,
                    .event-details-wrapper h2,
                    .event-details-wrapper h3,
                    .event-details-wrapper .text-gray-500,
                    .event-details-wrapper .text-gray-600,
                    .event-details-wrapper .text-gray-900 {
                      color: #000000 !important;
                    }

                    `}} />

                  {/* Inline styles for event description - same as news content */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    .event-description-content {
                      word-wrap: break-word !important;
                      overflow-wrap: break-word !important;
                      color: #000000 !important;
                    }
                    .event-description-content * {
                      color: #000000 !important;
                    }
                    .event-description-content img {
                      max-width: 100% !important;
                      height: auto !important;
                      margin: 1rem auto !important;
                      display: block !important;
                      border-radius: 8px !important;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
                      opacity: 1 !important;
                      visibility: visible !important;
                      background-color: transparent !important;
                    }
                    .event-description-content img[src^="/api/image/"] {
                      max-width: 100% !important;
                      height: auto !important;
                      object-fit: contain !important;
                    }
                    .event-description-content p {
                      margin: 0.75rem 0 !important;
                      line-height: 1.7 !important;
                      color: #000000 !important;
                    }
                    .event-description-content h1,
                    .event-description-content h2,
                    .event-description-content h3,
                    .event-description-content h4,
                    .event-description-content h5,
                    .event-description-content h6 {
                      margin: 1rem 0 0.5rem 0 !important;
                      line-height: 1.3 !important;
                      color: #000000 !important;
                      font-weight: bold !important;
                    }
                    .event-description-content ul {
                      list-style-type: disc !important;
                      padding-left: 1.5rem !important;
                      margin: 0.75rem 0 !important;
                      color: #000000 !important;
                    }
                    .event-description-content ol {
                      list-style-type: decimal !important;
                      padding-left: 1.5rem !important;
                      margin: 0.75rem 0 !important;
                      color: #000000 !important;
                    }
                    .event-description-content li {
                      display: list-item !important;
                      margin: 0.5rem 0 !important;
                      color: #000000 !important;
                    }
                    .event-description-content strong,
                    .event-description-content b {
                      color: #000000 !important;
                    }
                    .event-description-content a {
                      color: #2563eb !important;
                      text-decoration: underline !important;
                    }
                  `}} />

                  <div
                    className="prose prose-blue max-w-none event-description-content"
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
                      className="w-full sm:w-auto bg-white border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 h-auto"
                    >
                      <ShareIcon className="h-5 w-5 mr-2" />
                      <span suppressHydrationWarning>
                        {t('events.share', 'Share', 'பகிர்')}
                      </span>
                    </Button>
                    
                    {/* Share Menu */}
                    {shareMenuOpen && (
                      <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-4 z-10 min-w-[200px]">
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
                              <span className="text-sm text-gray-600">WhatsApp</span>
                            </div>
                          </button>
                          
                          {/* Facebook */}
                          <FacebookShareButton url={eventUrl} title={eventTitle}>
                            <div className="flex items-center gap-2 transform hover:scale-110 transition-transform">
                              <FacebookIcon size={32} round />
                              <span className="text-sm text-gray-600">Facebook</span>
                            </div>
                          </FacebookShareButton>
                          
                          {/* Copy Link */}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(eventUrl)
                              alert(t('share.copied', '✅ Copied!', '✅ நகலெடுக்கப்பட்டது!'))
                              setShareMenuOpen(false)
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900"
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
          color: #000000 !important;
        }

        .event-description *,
        .event-description p,
        .event-description div,
        .event-description span,
        .event-description li,
        .event-description strong,
        .event-description em,
        .event-description b,
        .event-description i {
          color: #000000 !important;
        }

        .event-description p {
          margin-bottom: 1rem;
          line-height: 1.75;
          color: #000000 !important;
        }

        .event-description h1,
        .event-description h2,
        .event-description h3 {
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #000000 !important;
        }

        .event-description ul,
        .event-description ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
          color: #000000 !important;
        }

        .event-description li {
          color: #000000 !important;
        }

        .event-description a {
          color: #2563eb !important;
          text-decoration: underline !important;
        }

        /* Images in event description - MUST BE VISIBLE */
        .event-description img {
          display: block !important;
          max-width: 100% !important;
          height: auto !important;
          margin: 1.5rem auto !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
          opacity: 1 !important;
          visibility: visible !important;
          background-color: transparent !important;
        }

        /* Base styles for all iframes */
        .event-description iframe {
          border-radius: 0.5rem !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          margin: 1.5rem auto !important;
          display: block !important;
        }

        /* YouTube videos - 1280x720 max, responsive */
        .event-description iframe[src*="youtube"],
        .event-description iframe[src*="youtube-nocookie"] {
          width: 100% !important;
          max-width: 1280px !important;
          height: auto !important;
          aspect-ratio: 16 / 9 !important;
        }

        /* Instagram Reels - RESPONSIVE - Using blockquote embed */
        .event-description blockquote.instagram-media {
          margin: 1rem auto !important;
          max-width: 540px !important;
          min-width: 326px !important;
        }

        /* Mobile - full width with padding */
        @media (max-width: 639px) {
          .event-description blockquote.instagram-media {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 0.5rem !important;
          }
        }

        /* Tablet - limit width to 400px */
        @media (min-width: 640px) and (max-width: 1023px) {
          .event-description blockquote.instagram-media {
            max-width: 400px !important;
          }
        }

        /* Desktop - full Instagram Reel size (540px) */
        @media (min-width: 1024px) {
          .event-description blockquote.instagram-media {
            max-width: 540px !important;
          }
        }
      `}</style>
    </div>
  )
}

