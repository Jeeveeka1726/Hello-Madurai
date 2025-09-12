import Link from 'next/link'
import { PlayIcon, PauseIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

interface RadioPageProps {
  params: Promise<{ locale: string }>
}

const radioShows = [
  {
    id: 1,
    title: 'Morning News',
    title_ta: 'காலை செய்திகள்',
    time: '6:00 AM - 8:00 AM',
    description: 'Start your day with the latest local news and updates',
    description_ta: 'சமீபத்திய உள்ளூர் செய்திகள் மற்றும் புதுப்பிப்புகளுடன் உங்கள் நாளைத் தொடங்குங்கள்',
    host: 'Ravi Kumar',
    host_ta: 'ரவி குமார்',
    isLive: true
  },
  {
    id: 2,
    title: 'Cultural Hour',
    title_ta: 'கலாசார நேரம்',
    time: '10:00 AM - 11:00 AM',
    description: 'Traditional music and cultural discussions',
    description_ta: 'பாரம்பரிய இசை மற்றும் கலாசார விவாதங்கள்',
    host: 'Meera Devi',
    host_ta: 'மீரா தேவி',
    isLive: false
  },
  {
    id: 3,
    title: 'Business Talk',
    title_ta: 'வணிக பேச்சு',
    time: '2:00 PM - 3:00 PM',
    description: 'Local business news and market updates',
    description_ta: 'உள்ளூர் வணிக செய்திகள் மற்றும் சந்தை புதுப்பிப்புகள்',
    host: 'Suresh Babu',
    host_ta: 'சுரேஷ் பாபு',
    isLive: false
  },
  {
    id: 4,
    title: 'Evening Entertainment',
    title_ta: 'மாலை பொழுதுபோக்கு',
    time: '6:00 PM - 8:00 PM',
    description: 'Music, entertainment and listener requests',
    description_ta: 'இசை, பொழுதுபோக்கு மற்றும் கேட்போர் கோரிக்கைகள்',
    host: 'Priya Sharma',
    host_ta: 'பிரியா ஷர்மா',
    isLive: false
  }
]

export default async function RadioPage({ params }: RadioPageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="/fm-logo.jpg" 
              alt="Hello Madurai FM Logo" 
              className="h-24 w-24 rounded-full object-cover shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            {locale === 'ta' ? 'ஹலோ மதுரை FM' : 'Hello Madurai FM'}
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            {locale === 'ta' 
              ? 'உங்கள் உள்ளூர் வானொலி நிலையம்'
              : 'Your Local Radio Station'
            }
          </p>
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-4 bg-white dark:bg-purple-900 rounded-lg shadow-md p-4">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-900">
                  {locale === 'ta' ? 'நேரலை' : 'LIVE'}
                </span>
              </div>
              <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
                <PlayIcon className="h-5 w-5" />
                <span>{locale === 'ta' ? 'கேளுங்கள்' : 'Listen Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Current Show */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === 'ta' ? 'தற்போது ஒளிபரப்பு' : 'Now Playing'}
          </h2>
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">
                    {locale === 'ta' ? radioShows[0].title_ta : radioShows[0].title}
                  </h3>
                  <p className="text-indigo-100 mb-2">
                    {locale === 'ta' ? radioShows[0].description_ta : radioShows[0].description}
                  </p>
                  <p className="text-sm text-indigo-200">
                    {locale === 'ta' ? 'தொகுப்பாளர்:' : 'Host:'} {locale === 'ta' ? radioShows[0].host_ta : radioShows[0].host}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <SpeakerWaveIcon className="h-8 w-8 animate-pulse" />
                  <div className="text-right">
                    <div className="text-sm text-indigo-200">
                      {locale === 'ta' ? 'நேரம்' : 'Time'}
                    </div>
                    <div className="font-bold">{radioShows[0].time}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schedule */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === 'ta' ? 'இன்றைய அட்டவணை' : "Today's Schedule"}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {radioShows.map((show) => (
              <Card key={show.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {locale === 'ta' ? show.title_ta : show.title}
                    </CardTitle>
                    {show.isLive && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <div className="h-2 w-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                        {locale === 'ta' ? 'நேரலை' : 'LIVE'}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">
                    {locale === 'ta' ? show.description_ta : show.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{show.time}</span>
                    <span>
                      {locale === 'ta' ? 'தொகுப்பாளர்:' : 'Host:'} {locale === 'ta' ? show.host_ta : show.host}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-12 bg-white dark:bg-purple-900 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {locale === 'ta' ? 'தொடர்பு கொள்ளுங்கள்' : 'Get in Touch'}
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {locale === 'ta' ? 'கேட்போர் கோரிக்கைகள்' : 'Listener Requests'}
              </h4>
              <p className="text-gray-600">
                {locale === 'ta' ? 'தொலைபேசி:' : 'Phone:'} +91 452 123 4567
              </p>
              <p className="text-gray-600">
                {locale === 'ta' ? 'மின்னஞ்சல்:' : 'Email:'} requests@hellomaduraifm.com
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {locale === 'ta' ? 'விளம்பரங்கள்' : 'Advertisements'}
              </h4>
              <p className="text-gray-600">
                {locale === 'ta' ? 'தொலைபேசி:' : 'Phone:'} +91 452 765 4321
              </p>
              <p className="text-gray-600">
                {locale === 'ta' ? 'மின்னஞ்சல்:' : 'Email:'} ads@hellomaduraifm.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
