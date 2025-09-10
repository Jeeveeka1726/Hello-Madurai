import Link from 'next/link'
import { CalendarIcon, MapPinIcon, ClockIcon, UsersIcon } from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface EventsPageProps {
  params: Promise<{ locale: string }>
}

const events = [
  {
    id: 1,
    title: 'Chithirai Festival',
    title_ta: 'சித்திரை திருவிழா',
    date: '2024-04-15',
    time: '6:00 AM - 10:00 PM',
    location: 'Meenakshi Amman Temple',
    location_ta: 'மீனாக்ஷி அம்மன் கோவில்',
    description: 'Annual festival celebrating the divine marriage of Meenakshi and Sundareswarar',
    description_ta: 'மீனாக்ஷி மற்றும் சுந்தரேஸ்வரர் திருக்கல்யாணத்தை கொண்டாடும் வருடாந்திர திருவிழா',
    category: 'religious',
    image: '/events/chithirai.jpg',
    attendees: '50000+',
    featured: true
  },
  {
    id: 2,
    title: 'Madurai Food Festival',
    title_ta: 'மதுரை உணவு திருவிழா',
    date: '2024-03-20',
    time: '5:00 PM - 11:00 PM',
    location: 'Tamukkam Grounds',
    location_ta: 'தமுக்கம் மைதானம்',
    description: 'Taste the authentic flavors of Madurai cuisine',
    description_ta: 'மதுரையின் உண்மையான சுவைகளை அனுபவியுங்கள்',
    category: 'cultural',
    image: '/events/food-festival.jpg',
    attendees: '5000+',
    featured: false
  },
  {
    id: 3,
    title: 'Business Expo 2024',
    title_ta: 'வணிக கண்காட்சி 2024',
    date: '2024-03-25',
    time: '9:00 AM - 6:00 PM',
    location: 'Trade Center',
    location_ta: 'வர்த்தக மையம்',
    description: 'Connect with local businesses and entrepreneurs',
    description_ta: 'உள்ளூர் வணிகங்கள் மற்றும் தொழில்முனைவோருடன் இணைந்து கொள்ளுங்கள்',
    category: 'business',
    image: '/events/business-expo.jpg',
    attendees: '2000+',
    featured: false
  },
  {
    id: 4,
    title: 'Classical Music Concert',
    title_ta: 'கர்நாடக இசை நிகழ்ச்சி',
    date: '2024-04-05',
    time: '7:00 PM - 10:00 PM',
    location: 'Rajaji Hall',
    location_ta: 'ராஜாஜி மண்டபம்',
    description: 'Evening of classical Carnatic music by renowned artists',
    description_ta: 'புகழ்பெற்ற கலைஞர்களின் கர்நாடக இசை நிகழ்ச்சி',
    category: 'cultural',
    image: '/events/music-concert.jpg',
    attendees: '800+',
    featured: true
  },
  {
    id: 5,
    title: 'Agriculture Fair',
    title_ta: 'விவசாய கண்காட்சி',
    date: '2024-04-10',
    time: '8:00 AM - 5:00 PM',
    location: 'Agricultural College',
    location_ta: 'விவசாய கல்லூரி',
    description: 'Latest farming techniques and equipment showcase',
    description_ta: 'சமீபத்திய விவசாய நுட்பங்கள் மற்றும் உபகரணங்கள் காட்சி',
    category: 'business',
    image: '/events/agriculture-fair.jpg',
    attendees: '3000+',
    featured: false
  },
  {
    id: 6,
    title: 'Youth Cultural Program',
    title_ta: 'இளைஞர் கலாசார நிகழ்ச்சி',
    date: '2024-03-30',
    time: '6:00 PM - 9:00 PM',
    location: 'Corporation Stadium',
    location_ta: 'மாநகராட்சி அரங்கம்',
    description: 'Dance, music and drama performances by local youth',
    description_ta: 'உள்ளூர் இளைஞர்களின் நடனம், இசை மற்றும் நாடக நிகழ்ச்சிகள்',
    category: 'cultural',
    image: '/events/youth-program.jpg',
    attendees: '1500+',
    featured: false
  }
]

const categories = [
  { id: 'all', name: 'All Events', name_ta: 'அனைத்து நிகழ்ச்சிகள்' },
  { id: 'religious', name: 'Religious', name_ta: 'மத நிகழ்ச்சிகள்' },
  { id: 'cultural', name: 'Cultural', name_ta: 'கலாசார நிகழ்ச்சிகள்' },
  { id: 'business', name: 'Business', name_ta: 'வணிக நிகழ்ச்சிகள்' }
]

export default async function EventsPage({ params }: EventsPageProps) {
  const { locale } = await params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const featuredEvents = events.filter(event => event.featured)
  const upcomingEvents = events.filter(event => !event.featured)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {locale === 'ta' ? 'நிகழ்ச்சிகள்' : 'Events'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {locale === 'ta' 
              ? 'மதுரையில் நடைபெறும் திருவிழாக்கள், கலாசார நிகழ்ச்சிகள் மற்றும் வணிக கண்காட்சிகள்'
              : 'Festivals, cultural events and business exhibitions in Madurai'
            }
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="text-sm"
              >
                {locale === 'ta' ? category.name_ta : category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ta' ? 'முக்கிய நிகழ்ச்சிகள்' : 'Featured Events'}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredEvents.map((event) => (
                <Card key={event.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <div className="flex items-center justify-center text-gray-400">
                      <CalendarIcon className="h-12 w-12" />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                        {event.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {locale === 'ta' ? event.title_ta : event.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {locale === 'ta' ? event.description_ta : event.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {locale === 'ta' ? event.location_ta : event.location}
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        {event.attendees} {locale === 'ta' ? 'பங்கேற்பாளர்கள்' : 'attendees'}
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button className="w-full">
                        {locale === 'ta' ? 'மேலும் அறிக' : 'Learn More'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === 'ta' ? 'வரவிருக்கும் நிகழ்ச்சிகள்' : 'Upcoming Events'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {event.category}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <CardTitle className="text-lg">
                    {locale === 'ta' ? event.title_ta : event.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    {locale === 'ta' ? event.description_ta : event.description}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {event.time}
                    </div>
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {locale === 'ta' ? event.location_ta : event.location}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    {locale === 'ta' ? 'விவரங்கள்' : 'Details'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
