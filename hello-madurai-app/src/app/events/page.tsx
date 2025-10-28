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
  endDate?: string
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
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set())

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
          
          // Sort by start date (soonest first)
          upcomingEvents.sort((a: Event, b: Event) => 
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          )
          
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

  const toggleDescription = (eventId: string) => {
    const newExpanded = new Set(expandedDescriptions)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedDescriptions(newExpanded)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t('events.title', 'Upcoming Events', 'வரவிருக்கும் நிகழ்வுகள்')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {t('events.subtitle', 'Discover upcoming festivals, exhibitions, and cultural events in Madurai', 'மதுரையில் வரவிருக்கும் திருவிழாக்கள், கண்காட்சிகள் மற்றும் கலாச்சார நிகழ்வுகளைக் கண்டறியுங்கள்')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t('events.loading', 'Loading events...', 'நிகழ்வுகள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* All Events */}
        {!loading && events.length > 0 && (
        <div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/events/${event.id}`
              const eventTitle = language === 'ta' && event.title_ta ? event.title_ta : event.title
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-6">
                    {/* Title First */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      {eventTitle}
                    </h3>
                    
                    {/* Featured Image */}
                    {event.featuredImage && (
                      <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
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
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              {t('events.time', 'Time', 'நேரம்')}
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {formatTime(event.startDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-5 w-5 mr-3 text-red-600 dark:text-red-400 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              {t('events.location', 'Location', 'இடம்')}
                            </p>
                            <p className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                              {language === 'ta' && event.location_ta ? event.location_ta : event.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Description with Read More */}
                    <div className="mb-4">
                      <div 
                        className={`text-gray-600 dark:text-gray-300 text-sm ${!expandedDescriptions.has(event.id) ? 'line-clamp-3' : ''}`}
                        dangerouslySetInnerHTML={{ 
                          __html: language === 'ta' && event.description_ta ? event.description_ta : event.description 
                        }}
                      />
                      <button
                        onClick={() => toggleDescription(event.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mt-2 flex items-center"
                      >
                        {expandedDescriptions.has(event.id) 
                          ? t('events.readLess', 'Read Less', 'குறைவாக படிக்கவும்')
                          : t('events.readMore', 'Read More', 'மேலும் படிக்கவும்')
                        }
                        <svg 
                          className={`ml-1 h-4 w-4 transform transition-transform ${expandedDescriptions.has(event.id) ? 'rotate-180' : ''}`}
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
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
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleBookNow(event)} 
                        className="flex-1 text-xs"
                      >
                        {t('events.bookNow', 'Book Now', 'இப்போது பதிவு செய்க')}
                      </Button>
                      
                      {/* Share Button */}
                      <div className="relative">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleShare(event.id)}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                        >
                          <ShareIcon className="h-4 w-4" />
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
            <p className="text-gray-500 dark:text-gray-400">
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
