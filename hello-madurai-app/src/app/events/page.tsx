'use client'

import { useState } from 'react'
import { CalendarIcon, MapPinIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function EventsPage() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const events = [
    {
      id: 1,
      title: 'Meenakshi Temple Annual Festival',
      title_ta: 'மீனாக்ஷி கோவில் வருடாந்திர திருவிழா',
      description: 'Grand celebration of Meenakshi Amman with traditional rituals and cultural programs',
      description_ta: 'பாரம்பரிய சடங்குகள் மற்றும் கலாச்சார நிகழ்ச்சிகளுடன் மீனாக்ஷி அம்மனின் பெரும் கொண்டாட்டம்',
      eventType: 'festival',
      startDate: '2024-04-15T06:00:00',
      endDate: '2024-04-25T22:00:00',
      location: 'Meenakshi Amman Temple, Madurai',
      location_ta: 'மீனாக்ஷி அம்மன் கோவில், மதுரை',
      featured: true,
      organizer: 'Temple Committee',
      capacity: 50000
    },
    {
      id: 2,
      title: 'Madurai Trade Fair 2024',
      title_ta: 'மதுரை வர்த்தக கண்காட்சி 2024',
      description: 'Annual trade exhibition showcasing local businesses and products',
      description_ta: 'உள்ளூர் வணிகங்கள் மற்றும் தயாரிப்புகளை காட்சிப்படுத்தும் வருடாந்திர வர்த்தக கண்காட்சி',
      eventType: 'exhibition',
      startDate: '2024-03-20T10:00:00',
      endDate: '2024-03-30T20:00:00',
      location: 'Tamukkam Grounds, Madurai',
      location_ta: 'தமுக்கம் மைதானம், மதுரை',
      featured: false,
      organizer: 'Madurai Chamber of Commerce',
      capacity: 10000
    },
    {
      id: 3,
      title: 'Classical Music Concert',
      title_ta: 'கர்நாடக இசை நிகழ்ச்சி',
      description: 'Evening of Carnatic music featuring renowned artists',
      description_ta: 'புகழ்பெற்ற கலைஞர்களைக் கொண்ட கர்நாடக இசையின் மாலை',
      eventType: 'cultural',
      startDate: '2024-03-25T18:00:00',
      endDate: '2024-03-25T21:00:00',
      location: 'Rajaji Hall, Madurai',
      location_ta: 'ராஜாஜி மண்டபம், மதுரை',
      featured: true,
      organizer: 'Madurai Music Academy',
      capacity: 500
    },
    {
      id: 4,
      title: 'Government Health Camp',
      title_ta: 'அரசு சுகாதார முகாம்',
      description: 'Free health checkup and medical consultation for all',
      description_ta: 'அனைவருக்கும் இலவச சுகாதார பரிசோதனை மற்றும் மருத்துவ ஆலோசனை',
      eventType: 'government',
      startDate: '2024-03-18T08:00:00',
      endDate: '2024-03-18T17:00:00',
      location: 'Government Hospital, Madurai',
      location_ta: 'அரசு மருத்துவமனை, மதுரை',
      featured: false,
      organizer: 'District Health Department',
      capacity: 1000
    },
    {
      id: 5,
      title: 'Startup Pitch Competition',
      title_ta: 'ஸ்டார்ட்அப் பிட்ச் போட்டி',
      description: 'Young entrepreneurs showcase their innovative business ideas',
      description_ta: 'இளம் தொழில்முனைவோர் தங்கள் புதுமையான வணிக யோசனைகளை காட்சிப்படுத்துகின்றனர்',
      eventType: 'business',
      startDate: '2024-03-22T14:00:00',
      endDate: '2024-03-22T18:00:00',
      location: 'Hotel Heritage, Madurai',
      location_ta: 'ஹோட்டல் ஹெரிடேஜ், மதுரை',
      featured: false,
      organizer: 'Madurai Entrepreneurs Club',
      capacity: 200
    },
    {
      id: 6,
      title: 'Chithirai Festival',
      title_ta: 'சித்திரை திருவிழா',
      description: 'Traditional Tamil New Year celebration with cultural events',
      description_ta: 'கலாச்சார நிகழ்வுகளுடன் பாரம்பரிய தமிழ் புத்தாண்டு கொண்டாட்டம்',
      eventType: 'festival',
      startDate: '2024-04-14T06:00:00',
      endDate: '2024-04-14T22:00:00',
      location: 'Various locations in Madurai',
      location_ta: 'மதுரையின் பல்வேறு இடங்கள்',
      featured: true,
      organizer: 'Tamil Cultural Association',
      capacity: 25000
    }
  ]

  const categories = [
    { id: 'all', name: t('events.categories.all', 'All Events', 'அனைத்து நிகழ்வுகள்') },
    { id: 'festival', name: t('events.categories.festival', 'Festivals', 'திருவிழாக்கள்') },
    { id: 'exhibition', name: t('events.categories.exhibition', 'Exhibitions', 'கண்காட்சிகள்') },
    { id: 'cultural', name: t('events.categories.cultural', 'Cultural', 'கலாச்சாரம்') },
    { id: 'government', name: t('events.categories.government', 'Government', 'அரசு') },
    { id: 'business', name: t('events.categories.business', 'Business', 'வணிகம்') }
  ]

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.eventType === selectedCategory)

  const featuredEvents = filteredEvents.filter(event => event.featured)
  const regularEvents = filteredEvents.filter(event => !event.featured)

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

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  const getEventStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (now < start) return 'upcoming'
    if (now >= start && now <= end) return 'ongoing'
    return 'completed'
  }

  const handleRegister = (eventId: number) => {
    // In a real app, this would handle event registration
    alert(t('events.registerSuccess', 'Registration successful! You will receive confirmation details.', 'பதிவு வெற்றிகரமாக முடிந்தது! உறுதிப்படுத்தல் விவரங்களைப் பெறுவீர்கள்.'))
  }

  const handleReminder = (eventId: number) => {
    // In a real app, this would set up a reminder
    alert(t('events.reminderSet', 'Reminder set! You will be notified before the event.', 'நினைவூட்டல் அமைக்கப்பட்டது! நிகழ்வுக்கு முன் உங்களுக்கு அறிவிப்பு வரும்.'))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t('events.title', 'Events', 'நிகழ்வுகள்')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {t('events.subtitle', 'Discover upcoming festivals, exhibitions, and cultural events in Madurai', 'மதுரையில் வரவிருக்கும் திருவிழாக்கள், கண்காட்சிகள் மற்றும் கலாச்சார நிகழ்வுகளைக் கண்டறியுங்கள்')}
          </p>
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

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('events.featured', 'Featured Events', 'சிறப்பு நிகழ்வுகள்')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredEvents.map((event) => {
                const status = getEventStatus(event.startDate, event.endDate)
                return (
                  <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900 dark:to-secondary-900">
                      <div className="flex items-center justify-center">
                        <div className="text-center">
                          <CalendarIcon className="h-16 w-16 text-primary-600 dark:text-primary-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {t(`events.categories.${event.eventType}`, event.eventType, event.eventType)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                          {t('events.featured', 'Featured', 'சிறப்பு')}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === 'upcoming' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          status === 'ongoing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {t(`events.status.${status}`, status, status)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {t(`events.${event.id}.title`, event.title, event.title_ta)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {t(`events.${event.id}.description`, event.description, event.description_ta)}
                      </p>
                      <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(event.startDate)} - {formatDate(event.endDate)}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {formatTime(event.startDate)} - {formatTime(event.endDate)}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {t(`events.${event.id}.location`, event.location, event.location_ta)}
                        </div>
                        <div className="flex items-center">
                          <UserGroupIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {event.organizer} • {event.capacity.toLocaleString()} {t('events.capacity', 'capacity', 'திறன்')}
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        {status === 'upcoming' && (
                          <>
                            <Button onClick={() => handleRegister(event.id)} className="flex-1">
                              {t('events.register', 'Register', 'பதிவு செய்க')}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => handleReminder(event.id)}
                              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              {t('events.remind', 'Remind Me', 'நினைவூட்டு')}
                            </Button>
                          </>
                        )}
                        {status === 'ongoing' && (
                          <Button className="w-full">
                            {t('events.joinNow', 'Join Now', 'இப்போது சேரவும்')}
                          </Button>
                        )}
                        {status === 'completed' && (
                          <Button variant="outline" disabled className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                            {t('events.completed', 'Event Completed', 'நிகழ்வு முடிந்தது')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* All Events */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {selectedCategory === 'all' 
              ? t('events.allEvents', 'All Events', 'அனைத்து நிகழ்வுகள்')
              : categories.find(cat => cat.id === selectedCategory)?.name
            }
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(selectedCategory === 'all' ? regularEvents : filteredEvents.filter(e => !e.featured)).map((event) => {
              const status = getEventStatus(event.startDate, event.endDate)
              return (
                <Card key={event.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="aspect-w-16 aspect-h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {t(`events.categories.${event.eventType}`, event.eventType, event.eventType)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        status === 'upcoming' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        status === 'ongoing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {t(`events.status.${status}`, status, status)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(event.startDate)}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {t(`events.${event.id}.title`, event.title, event.title_ta)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                      {t(`events.${event.id}.description`, event.description, event.description_ta)}
                    </p>
                    <div className="space-y-1 mb-3 text-xs text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1 text-gray-400" />
                        {formatTime(event.startDate)}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                        <span className="line-clamp-1">{t(`events.${event.id}.location`, event.location, event.location_ta)}</span>
                      </div>
                    </div>
                    {status === 'upcoming' && (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleRegister(event.id)} className="flex-1 text-xs">
                          {t('events.register', 'Register', 'பதிவு')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleReminder(event.id)}
                          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs"
                        >
                          {t('events.remind', 'Remind', 'நினைவூட்டு')}
                        </Button>
                      </div>
                    )}
                    {status === 'ongoing' && (
                      <Button size="sm" className="w-full text-xs">
                        {t('events.joinNow', 'Join Now', 'இப்போது சேரவும்')}
                      </Button>
                    )}
                    {status === 'completed' && (
                      <Button size="sm" variant="outline" disabled className="w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs">
                        {t('events.completed', 'Completed', 'முடிந்தது')}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* No events message */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('events.noEvents', 'No events found in this category', 'இந்த வகையில் நிகழ்வுகள் எதுவும் கிடைக்கவில்லை')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
