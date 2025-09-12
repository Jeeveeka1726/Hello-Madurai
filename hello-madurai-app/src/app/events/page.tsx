'use client'

import { useState } from 'react'
import { CalendarIcon, MapPinIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import AppWrapper from '@/components/AppWrapper'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

function EventsPageContent() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Fetch events from database - no hardcoded data
  const events = [
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
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
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
                          'bg-gray-100 text-gray-800 dark:bg-purple-900 dark:text-purple-200'
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
                        'bg-gray-100 text-gray-800 dark:bg-purple-900 dark:text-purple-200'
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

export default function EventsPage() {
  return (
    <AppWrapper>
      <EventsPageContent />
    </AppWrapper>
  )
}
