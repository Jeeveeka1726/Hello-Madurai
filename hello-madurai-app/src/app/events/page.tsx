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

  // Fix YouTube iframes to use youtube-nocookie.com domain
  useEffect(() => {
    if (!loading && events.length > 0) {
      // Wait for DOM to render
      setTimeout(() => {
        const iframes = document.querySelectorAll('iframe[src*="youtube.com"]')
        iframes.forEach((iframe) => {
          const src = iframe.getAttribute('src')
          if (src && src.includes('youtube.com') && !src.includes('youtube-nocookie.com')) {
            // Replace youtube.com with youtube-nocookie.com
            const newSrc = src.replace('youtube.com', 'youtube-nocookie.com')
            iframe.setAttribute('src', newSrc)
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
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl" suppressHydrationWarning>
            {t('events.title', 'Upcoming Events', 'வரவிருக்கும் நிகழ்வுகள்')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300" suppressHydrationWarning>
            {t('events.subtitle', 'Discover upcoming festivals, exhibitions, and cultural events in Madurai', 'மதுரையில் வரவிருக்கும் திருவிழாக்கள், கண்காட்சிகள் மற்றும் கலாச்சார நிகழ்வுகளைக் கண்டறியுங்கள்')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300" suppressHydrationWarning>
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
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    {/* Title First - Centered */}
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg p-4 mb-4 border-l-4 border-blue-500">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1" suppressHydrationWarning>
                              {t('events.date', 'Date', 'தேதி')}
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatDate(event.startDate)}
                              {event.endDate && ` - ${formatDate(event.endDate)}`}
                              {event.duration && <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">({event.duration})</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-5 w-5 mr-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1" suppressHydrationWarning>
                              {t('events.time', 'Time', 'நேரம்')}
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {event.startTime ? formatTime12Hour(event.startTime) : formatTime(event.startDate)}
                              {event.endTime && ` - ${formatTime12Hour(event.endTime)}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-5 w-5 mr-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1" suppressHydrationWarning>
                              {t('events.location', 'Location', 'இடம்')}
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">
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
                          max-width: 100% !important;
                          height: auto !important;
                          margin: 1.5rem auto !important;
                          display: block !important;
                          border-radius: 0.5rem !important;
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
                        .event-description div[data-youtube-video] {
                          width: 100% !important;
                          max-width: 1280px !important;
                          margin: 1.5rem auto !important;
                          display: block !important;
                        }
                      `}} />
                      <div
                        className="event-description text-gray-700 dark:text-gray-200"
                        dangerouslySetInnerHTML={{
                          __html: language === 'ta' && event.description_ta ? event.description_ta : event.description
                        }}
                      />
                    </div>
                    
                    {/* Posted Date and Views at Bottom */}
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
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
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 py-3 px-4 h-auto"
                        >
                          <ShareIcon className="h-5 w-5" />
                        </Button>
                        
                        {/* Share Menu */}
                        {shareMenuOpen === event.id && (
                          <div className="absolute bottom-full mb-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-10 min-w-[200px]">
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
                                  setShareMenuOpen(null)
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
            <p className="text-gray-500 dark:text-gray-400" suppressHydrationWarning>
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
