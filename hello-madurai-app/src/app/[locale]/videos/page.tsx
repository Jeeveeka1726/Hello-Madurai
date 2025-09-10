import Link from 'next/link'
import { PlayIcon, EyeIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface VideosPageProps {
  params: Promise<{ locale: string }>
}

const videos = [
  {
    id: 1,
    title: 'Madurai Agriculture Fair 2024',
    title_ta: 'மதுரை விவசாய கண்காட்சி 2024',
    description: 'Latest farming techniques and equipment showcase at Madurai Agricultural College',
    description_ta: 'மதுரை விவசாய கல்லூரியில் சமீபத்திய விவசாய நுட்பங்கள் மற்றும் உபகரணங்கள் காட்சி',
    thumbnail: '/videos/agriculture-fair.jpg',
    duration: '15:30',
    views: '12,500',
    uploadDate: '2024-03-15',
    category: 'agriculture',
    videoUrl: 'https://www.youtube.com/watch?v=example1'
  },
  {
    id: 2,
    title: 'Local Business Success Stories',
    title_ta: 'உள்ளூர் வணிக வெற்றிக் கதைகள்',
    description: 'Inspiring stories of successful local entrepreneurs in Madurai',
    description_ta: 'மதுரையில் வெற்றிகரமான உள்ளூர் தொழில்முனைவோரின் ஊக்கமளிக்கும் கதைகள்',
    thumbnail: '/videos/business-stories.jpg',
    duration: '22:45',
    views: '8,200',
    uploadDate: '2024-03-10',
    category: 'business',
    videoUrl: 'https://www.youtube.com/watch?v=example2'
  },
  {
    id: 3,
    title: 'Traditional Crafts of Madurai',
    title_ta: 'மதுரையின் பாரம்பரிய கைவினைகள்',
    description: 'Exploring the rich heritage of traditional crafts and artisans',
    description_ta: 'பாரம்பரிய கைவினைகள் மற்றும் கைவினைஞர்களின் வளமான பாரம்பரியத்தை ஆராய்தல்',
    thumbnail: '/videos/traditional-crafts.jpg',
    duration: '18:20',
    views: '15,800',
    uploadDate: '2024-03-08',
    category: 'culture',
    videoUrl: 'https://www.youtube.com/watch?v=example3'
  },
  {
    id: 4,
    title: 'Meenakshi Temple Festival Highlights',
    title_ta: 'மீனாக்ஷி கோவில் திருவிழா சிறப்பம்சங்கள்',
    description: 'Beautiful moments from the recent Meenakshi Temple festival celebrations',
    description_ta: 'சமீபத்திய மீனாக்ஷி கோவில் திருவிழா கொண்டாட்டங்களின் அழகான தருணங்கள்',
    thumbnail: '/videos/temple-festival.jpg',
    duration: '25:15',
    views: '32,400',
    uploadDate: '2024-03-05',
    category: 'religious',
    videoUrl: 'https://www.youtube.com/watch?v=example4'
  },
  {
    id: 5,
    title: 'Modern Farming Techniques',
    title_ta: 'நவீன விவசாய நுட்பங்கள்',
    description: 'Learn about innovative farming methods being adopted by local farmers',
    description_ta: 'உள்ளூர் விவசாயிகளால் பின்பற்றப்படும் புதுமையான விவசாய முறைகளைப் பற்றி அறியுங்கள்',
    thumbnail: '/videos/modern-farming.jpg',
    duration: '20:30',
    views: '9,600',
    uploadDate: '2024-03-01',
    category: 'agriculture',
    videoUrl: 'https://www.youtube.com/watch?v=example5'
  },
  {
    id: 6,
    title: 'Street Food Tour of Madurai',
    title_ta: 'மதுரை தெரு உணவு சுற்றுலா',
    description: 'Discover the delicious street food culture of Madurai',
    description_ta: 'மதுரையின் சுவையான தெரு உணவு கலாச்சாரத்தை கண்டறியுங்கள்',
    thumbnail: '/videos/street-food.jpg',
    duration: '16:45',
    views: '28,900',
    uploadDate: '2024-02-28',
    category: 'culture',
    videoUrl: 'https://www.youtube.com/watch?v=example6'
  }
]

const categories = [
  { id: 'all', name: 'All Videos', name_ta: 'அனைத்து வீடியோக்கள்' },
  { id: 'agriculture', name: 'Agriculture', name_ta: 'விவசாயம்' },
  { id: 'business', name: 'Business', name_ta: 'வணிகம்' },
  { id: 'culture', name: 'Culture', name_ta: 'கலாசாரம்' },
  { id: 'religious', name: 'Religious', name_ta: 'மத நிகழ்ச்சிகள்' }
]

export default async function VideosPage({ params }: VideosPageProps) {
  const { locale } = await params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {locale === 'ta' ? 'வீடியோக்கள்' : 'Videos'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {locale === 'ta' 
              ? 'மதுரையின் விவசாயம், வணிகம், கலாசாரம் மற்றும் மத நிகழ்ச்சிகள் பற்றிய வீடியோக்கள்'
              : 'Videos about agriculture, business, culture and religious events in Madurai'
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

        {/* Featured Video */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === 'ta' ? 'சிறப்பு வீடியோ' : 'Featured Video'}
          </h2>
          <Card className="overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-900 relative">
              <div className="flex items-center justify-center">
                <div className="text-center text-white">
                  <PlayIcon className="h-16 w-16 mx-auto mb-4 opacity-80" />
                  <h3 className="text-xl font-bold mb-2">
                    {locale === 'ta' ? videos[3].title_ta : videos[3].title}
                  </h3>
                  <p className="text-gray-300">
                    {locale === 'ta' ? videos[3].description_ta : videos[3].description}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                {videos[3].duration}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    {videos[3].views} {locale === 'ta' ? 'பார்வைகள்' : 'views'}
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {formatDate(videos[3].uploadDate)}
                  </div>
                </div>
                <Button>
                  <PlayIcon className="h-4 w-4 mr-2" />
                  {locale === 'ta' ? 'பார்க்க' : 'Watch Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Video Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === 'ta' ? 'அனைத்து வீடியோக்கள்' : 'All Videos'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 relative">
                  <div className="flex items-center justify-center text-gray-400">
                    <PlayIcon className="h-12 w-12" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {locale === 'ta' ? video.title_ta : video.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {locale === 'ta' ? video.description_ta : video.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      {video.views}
                    </div>
                    <span>{formatDate(video.uploadDate)}</span>
                  </div>
                  <Button size="sm" className="w-full">
                    <PlayIcon className="h-4 w-4 mr-2" />
                    {locale === 'ta' ? 'பார்க்க' : 'Watch'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscribe Section */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {locale === 'ta' ? 'எங்கள் சேனலை சந்தா செய்யுங்கள்' : 'Subscribe to Our Channel'}
          </h3>
          <p className="text-gray-600 mb-6">
            {locale === 'ta' 
              ? 'புதிய வீடியோக்கள் வெளியாகும் போது அறிவிப்பு பெற சந்தா செய்யுங்கள்'
              : 'Subscribe to get notified when new videos are published'
            }
          </p>
          <Button size="lg">
            {locale === 'ta' ? 'சந்தா செய்யுங்கள்' : 'Subscribe Now'}
          </Button>
        </div>
      </div>
    </div>
  )
}
