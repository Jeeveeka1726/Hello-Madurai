'use client'

import { useState, useEffect } from 'react'
import { CalendarIcon, MapPinIcon, ClockIcon, PhoneIcon, GlobeAltIcon, EyeIcon, ShareIcon } from '@heroicons/react/24/outline'
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

interface Event {
  id: string
  title: string
  title_ta?: string
  description: string
  description_ta?: string
  startDate: string
  startTime?: string
  endDate?: string
  endTime?: string
  duration?: string
  location: string
  location_ta?: string
  category: string
  featuredImage?: string
  website?: string
  phone?: string
  status: string
  views: number
  createdAt: string
  updatedAt: string
}

function EventsPageContent() {
  const { t, language } = useLanguage()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null)
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  // Fetch events from database
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/admin/events')
        if (response.ok) {
          const data = await response.json()

          // Filter to show only upcoming events (not ended)
          const now = new Date()
          const upcomingEvents = data.filter((event: Event) => {
            const eventEndDate = event.endDate ? new Date(event.endDate) : new Date(event.startDate)
            // Show event if end date hasn't passed yet
            return eventEndDate >= now
          })

          // Sort by start date and time (soonest first, morning to evening)
          upcomingEvents.sort((a: Event, b: Event) => {
            const dateA = new Date(a.startDate)
            const dateB = new Date(b.startDate)

            // First sort by date
            const dateDiff = dateA.getTime() - dateB.getTime()
            if (dateDiff !== 0) return dateDiff

            // If same date, sort by time (morning to evening)
            // This ensures events are ordered chronologically throughout the day
            return dateA.getHours() * 60 + dateA.getMinutes() - (dateB.getHours() * 60 + dateB.getMinutes())
          })

          setEvents(upcomingEvents)
        } else {
          console.error('Failed to fetch events')
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Fix YouTube iframes to use youtube-nocookie.com domain and ensure proper sizing
  useEffect(() => {
    if (!loading && events.length > 0) {
      // Wait for DOM to render
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
          if (src && (src.includes('youtube') || src.includes('instagram'))) {
            iframe.removeAttribute('width')
            iframe.removeAttribute('height')
            iframe.removeAttribute('style')
          }
        })
      }, 100)
    }
  }, [loading, events])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Convert 24-hour time (HH:mm) to 12-hour format with AM/PM
  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const hours12 = hours % 12 || 12 // Convert 0 to 12 for midnight
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  const handleBookNow = (event: Event) => {
    // If has both, show options
    if (event.website && event.phone) {
      const choice = confirm(
        `${t('events.bookingOptions', 'Choose booking method:', 'முன்பதிவு முறையைத் தேர்ந்தெடுக்கவும்:')}\n\n` +
        `1. ${t('events.website', 'Website', 'வலைத்தளம்')}\n` +
        `2. ${t('events.phone', 'Phone', 'தொலைபேசி')}\n\n` +
        `${t('events.clickOk', 'Click OK for Website, Cancel for Phone', 'வலைத்தளத்திற்கு OK, தொலைபேசிக்கு Cancel')}`
      )
      if (choice) {
        window.open(event.website, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = `tel:${event.phone}`
      }
    } else if (event.website) {
      window.open(event.website, '_blank', 'noopener,noreferrer')
    } else if (event.phone) {
      window.location.href = `tel:${event.phone}`
    } else {
      alert(t('events.noBooking', 'No booking information available', 'முன்பதிவு தகவல் இல்லை'))
    }
  }

  const handleShare = (eventId: string) => {
    setShareMenuOpen(shareMenuOpen === eventId ? null : eventId)
  }

  const toggleReadMore = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  const incrementView = async (eventId: string) => {
    try {
      await fetch(`/api/admin/events/${eventId}/view`, { method: 'POST' })
    } catch (error) {
      console.error('Error incrementing view:', error)
    }
  }

  // Call incrementView when component mounts for each visible event
  useEffect(() => {
    events.forEach(event => {
      incrementView(event.id)
    })
  }, [events])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl" suppressHydrationWarning>
            {t('events.title', 'Upcoming Events', 'வரவிருக்கும் நிகழ்வுகள்')}
          </h1>
          <p className="mt-2 text-lg text-gray-600" suppressHydrationWarning>
            {t('events.subtitle', 'Discover upcoming festivals, exhibitions, and cultural events in Madurai', 'மதுரையில் வரவிருக்கும் திருவிழாக்கள், கண்காட்சிகள் மற்றும் கலாச்சார நிகழ்வுகளைக் கண்டறியுங்கள்')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600" suppressHydrationWarning>
              {t('events.loading', 'Loading events...', 'நிகழ்வுகள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* All Events */}
        {!loading && events.length > 0 && (
        <div>
          <div className="flex flex-col gap-6 max-w-4xl mx-auto">
            {events.map((event) => {
              const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${event.id}`
              const eventTitle = language === 'ta' && event.title_ta ? event.title_ta : event.title
              
              return (
                <Card key={event.id} className="event-card overflow-hidden hover:shadow-lg transition-shadow bg-white border-gray-200">
                  <CardContent className="p-6">
                    {/* Title First - Centered */}
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center" suppressHydrationWarning>
                      {eventTitle}
                    </h3>
                    
                    {/* Featured Image */}
                    {event.featuredImage && (
                      <div className="w-full h-64 md:h-96 overflow-hidden rounded-lg mb-4">
                        <img 
                          src={event.featuredImage} 
                          alt={eventTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Date/Time Details Above Description - Highlighted */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-3 text-blue-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-700 font-medium mb-1" suppressHydrationWarning>
                              {t('events.date', 'Date', 'தேதி')}
                            </p>
                            <p className="font-bold text-gray-900 text-base">
                              {formatDate(event.startDate)}
                              {event.endDate && ` - ${formatDate(event.endDate)}`}
                            </p>
                            {event.duration && (
                              <span className="inline-block mt-1 text-sm font-semibold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                                {event.duration}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 mr-3 text-green-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-700 font-medium mb-1" suppressHydrationWarning>
                              {t('events.time', 'Time', 'நேரம்')}
                            </p>
                            <p className="font-bold text-gray-900 text-base">
                              {event.startTime ? formatTime12Hour(event.startTime) : formatTime(event.startDate)}
                              {event.endTime && ` - ${formatTime12Hour(event.endTime)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-5 w-5 mr-3 text-red-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1" suppressHydrationWarning>
                              {t('events.location', 'Location', 'இடம்')}
                            </p>
                            <p className="font-semibold text-gray-900 line-clamp-2">
                              {language === 'ta' && event.location_ta ? event.location_ta : event.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description with Read More - Enhanced styling */}
                    <div className="mb-6">
                      <style dangerouslySetInnerHTML={{ __html: `
                        .event-description {
                          font-size: 1.0625rem !important;
                          line-height: 1.8 !important;
                          letter-spacing: 0.01em !important;
                        }
                        .event-description p {
                          margin: 1rem 0 !important;
                          line-height: 1.8 !important;
                        }
                        .event-description h1, .event-description h2, .event-description h3 {
                          margin: 1.5rem 0 0.75rem 0 !important;
                          line-height: 1.4 !important;
                        }
                        .event-description ul, .event-description ol {
                          padding-left: 1.5rem !important;
                          margin: 1rem 0 !important;
                          list-style-position: outside !important;
                        }
                        .event-description li {
                          display: list-item !important;
                          margin: 0.5rem 0 !important;
                        }
                        .event-description img {
                          display: block !important;
                          max-width: 100% !important;
                          height: auto !important;
                          margin: 1.5rem auto !important;
                          border-radius: 0.5rem !important;
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

                        /* Instagram Reels - 540x720 max, responsive */
                        .event-description iframe[src*="instagram"] {
                          width: 100% !important;
                          max-width: 540px !important;
                          height: auto !important;
                          aspect-ratio: 9 / 16 !important;
                        }

                        .event-description div[data-youtube-video] {
                          width: 100% !important;
                          max-width: 1280px !important;
                          margin: 1.5rem auto !important;
                          display: block !important;
                        }
                        .event-description-collapsed {
                          max-height: 200px;
                          overflow: hidden;
                          position: relative;
                        }
                        .event-description-collapsed::after {
                          content: '';
                          position: absolute;
                          bottom: 0;
                          left: 0;
                          right: 0;
                          height: 80px;
                          background: linear-gradient(to bottom, transparent, white);
                        }
                        .dark .event-description-collapsed::after {
                          background: linear-gradient(to bottom, transparent, rgb(31, 41, 55));
                        }
                      `}} />
                      <div
                        className={`event-description text-gray-700 ${
                          !expandedEvents.has(event.id) ? 'event-description-collapsed' : ''
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: language === 'ta' && event.description_ta ? event.description_ta : event.description
                        }}
                      />
                      {/* Read More Button */}
                      {((language === 'ta' && event.description_ta && event.description_ta.length > 500) ||
                        (language !== 'ta' && event.description && event.description.length > 500)) && (
                        <button
                          onClick={() => toggleReadMore(event.id)}
                          className="mt-3 text-blue-600 hover:underline font-medium text-sm"
                          suppressHydrationWarning
                        >
                          {expandedEvents.has(event.id)
                            ? t('events.readLess', 'Read Less', 'குறைவாக படிக்கவும்')
                            : t('events.readMore', 'Read More', 'மேலும் படிக்கவும்')}
                        </button>
                      )}
                    </div>
                    
                    {/* Posted Date and Views at Bottom */}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-2 border-t border-gray-200">
                      <span>{formatDate(event.createdAt)}</span>
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        <span>{event.views}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button
                        onClick={() => handleBookNow(event)}
                        className="flex-1 text-base md:text-lg font-semibold py-3 px-6 h-auto"
                        suppressHydrationWarning
                      >
                        {t('events.bookNow', 'Book Now', 'இப்போது பதிவு செய்க')}
                      </Button>
                      
                      {/* Share Button */}
                      <div className="relative">
                        <Button 
                          variant="outline"
                          onClick={() => handleShare(event.id)}
                          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 h-auto"
                        >
                          <ShareIcon className="h-5 w-5" />
                        </Button>
                        
                        {/* Share Menu */}
                        {shareMenuOpen === event.id && (
                          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg p-4 z-10 min-w-[200px]">
                            <div className="flex flex-col gap-3">
                              {/* WhatsApp */}
                              <button
                                onClick={() => {
                                  const text = encodeURIComponent(`${eventTitle}\n\n${eventUrl}`)
                                  window.open(`https://wa.me/?text=${text}`, '_blank')
                                  setShareMenuOpen(null)
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
                                  setShareMenuOpen(null)
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
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
        )}

        {/* No events message */}
        {!loading && events.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500" suppressHydrationWarning>
              {t('events.noEvents', 'No upcoming events at the moment. Check back soon!', 'இப்போது வரவிருக்கும் நிகழ்வுகள் எதுவும் இல்லை. விரைவில் சரிபார்க்கவும்!')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function EventsPage() {
  return (
    <div>
      <NewHeader />
      <EventsPageContent />
    </div>
  )
}
