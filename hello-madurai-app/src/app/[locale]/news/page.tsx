// import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { CalendarIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// Mock data - will be replaced with Supabase data
const newsCategories = [
  { id: 'all', name: 'All News', name_ta: 'அனைத்து செய்திகள்' },
  { id: 'collector', name: 'Collector', name_ta: 'கலெக்டர்' },
  { id: 'corporation', name: 'Corporation', name_ta: 'மாநகராட்சி' },
  { id: 'police', name: 'Police', name_ta: 'போலீஸ்' },
  { id: 'agriculture', name: 'Agriculture', name_ta: 'விவசாயம்' },
  { id: 'cinema', name: 'Cinema', name_ta: 'சினிமா' },
  { id: 'articles', name: 'Articles', name_ta: 'கட்டுரைகள்' },
  { id: 'jobs', name: 'Job Opportunities', name_ta: 'வேலை வாய்ப்பு' },
]

const mockNews = [
  {
    id: '1',
    title: 'Madurai Corporation Announces New Development Projects',
    title_ta: 'மதுரை மாநகராட்சி புதிய வளர்ச்சி திட்டங்களை அறிவித்தது',
    excerpt: 'The Madurai Corporation has announced several new infrastructure development projects for the upcoming fiscal year.',
    excerpt_ta: 'மதுரை மாநகராட்சி வரவிருக்கும் நிதியாண்டுக்கான பல புதிய உள்கட்டமைப்பு வளர்ச்சி திட்டங்களை அறிவித்துள்ளது.',
    category: 'corporation',
    featured_image: '/images/news/corporation-news.jpg',
    author: 'Admin',
    views_count: 245,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'New Agricultural Scheme Launched for Farmers',
    title_ta: 'விவசாயிகளுக்கு புதிய வேளாண் திட்டம் தொடங்கப்பட்டது',
    excerpt: 'A new agricultural support scheme has been launched to help local farmers improve their crop yields.',
    excerpt_ta: 'உள்ளூர் விவசாயிகள் தங்கள் பயிர் விளைச்சலை மேம்படுத்த உதவும் வகையில் புதிய வேளாண் ஆதரவு திட்டம் தொடங்கப்பட்டுள்ளது.',
    category: 'agriculture',
    featured_image: '/images/news/agriculture-news.jpg',
    author: 'Reporter',
    views_count: 189,
    created_at: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    title: 'Traffic Police Implements New Safety Measures',
    title_ta: 'போக்குவரத்து போலீசார் புதிய பாதுகாப்பு நடவடிக்கைகளை அமல்படுத்தினர்',
    excerpt: 'The traffic police department has introduced new safety measures to reduce accidents in the city.',
    excerpt_ta: 'நகரத்தில் விபத்துகளை குறைக்க போக்குவரத்து போலீஸ் துறை புதிய பாதுகாப்பு நடவடிக்கைகளை அறிமுகப்படுத்தியுள்ளது.',
    category: 'police',
    featured_image: '/images/news/police-news.jpg',
    author: 'News Team',
    views_count: 156,
    created_at: '2024-01-13T09:15:00Z'
  }
]

export default async function NewsPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  // const t = await getTranslations()
  const selectedCategory = category || 'all'

  const filteredNews = selectedCategory === 'all' 
    ? mockNews 
    : mockNews.filter(news => news.category === selectedCategory)

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
            {locale === 'ta' ? 'செய்திகள்' : 'News'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {locale === 'ta' 
              ? 'மதுரை மற்றும் சுற்றுவட்டார பகுதிகளின் சமீபத்திய செய்திகள்'
              : 'Latest news from Madurai and surrounding areas'
            }
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {newsCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/news${category.id !== 'all' ? `?category=${category.id}` : ''}`}
              >
                <Button
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  size="sm"
                >
                  {locale === 'ta' ? category.name_ta : category.name}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((news) => (
            <Link key={news.id} href={`/${locale}/news/${news.id}`}>
              <Card hover className="h-full">
                {news.featured_image && (
                  <div className="mb-4 -mx-6 -mt-6">
                    <img
                      src={news.featured_image || '/images/placeholder-news.jpg'}
                      alt={locale === 'ta' ? news.title_ta : news.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                      {locale === 'ta' 
                        ? newsCategories.find(cat => cat.id === news.category)?.name_ta
                        : newsCategories.find(cat => cat.id === news.category)?.name
                      }
                    </span>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {news.views_count}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">
                    {locale === 'ta' ? news.title_ta : news.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-600 line-clamp-3 mb-4">
                    {locale === 'ta' ? news.excerpt_ta : news.excerpt}
                  </p>
                </CardContent>

                <CardFooter>
                  <div className="flex items-center justify-between text-sm text-gray-500 w-full">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      {news.author}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(news.created_at)}
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        {filteredNews.length > 0 && (
          <div className="mt-12 text-center">
            <Button variant="outline" size="lg">
              {locale === 'ta' ? 'மேலும் செய்திகள் ஏற்றவும்' : 'Load More News'}
            </Button>
          </div>
        )}

        {/* No News Found */}
        {filteredNews.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {locale === 'ta' ? 'செய்திகள் இல்லை' : 'No News Found'}
            </h3>
            <p className="text-gray-600">
              {locale === 'ta' 
                ? 'இந்த பிரிவில் தற்போது செய்திகள் எதுவும் இல்லை.'
                : 'There are currently no news articles in this category.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
