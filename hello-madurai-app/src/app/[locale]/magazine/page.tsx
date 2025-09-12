import Link from 'next/link'
import { DocumentIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface MagazinePageProps {
  params: Promise<{ locale: string }>
}

// Fetch magazines from database - no hardcoded data
const magazines = []

export default async function MagazinePage({ params }: MagazinePageProps) {
  const { locale } = await params;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(locale === 'ta' ? 'ta-IN' : 'en-IN', {
      year: 'numeric',
      month: 'long'
    })
  }

  const featuredMagazines = magazines.filter(mag => mag.featured)
  const allMagazines = magazines

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
            {locale === 'ta' ? 'மாத இதழ்' : 'E-Magazine'}
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            {locale === 'ta' 
              ? 'மதுரையின் உள்ளூர் செய்திகள், கலாசாரம், வணிகம் மற்றும் சமூக நிகழ்வுகளை உள்ளடக்கிய மாத இதழ்'
              : 'Monthly magazine covering local news, culture, business and community events in Madurai'
            }
          </p>
        </div>

        {/* Featured Issues */}
        {featuredMagazines.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ta' ? 'சிறப்பு பதிப்புகள்' : 'Featured Issues'}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredMagazines.map((magazine) => (
                <Card key={magazine.id} className="overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-indigo-500 to-purple-600">
                    <div className="flex items-center justify-center text-white">
                      <div className="text-center">
                        <DocumentIcon className="h-16 w-16 mx-auto mb-4" />
                        <h3 className="text-xl font-bold">
                          {locale === 'ta' ? magazine.title_ta : magazine.title}
                        </h3>
                        <p className="text-indigo-100 mt-2">
                          {magazine.pages} {locale === 'ta' ? 'பக்கங்கள்' : 'pages'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(magazine.date)}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {locale === 'ta' ? 'சிறப்பு' : 'Featured'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {locale === 'ta' ? magazine.title_ta : magazine.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {locale === 'ta' ? magazine.description_ta : magazine.description}
                    </p>
                    <div className="flex space-x-3">
                      <Button 
                        className="flex-1"
                        onClick={() => window.open(magazine.pdfUrl, '_blank')}
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        {locale === 'ta' ? 'படிக்க' : 'Read'}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = magazine.pdfUrl
                          link.download = magazine.pdfUrl.split('/').pop() || 'magazine.pdf'
                          link.click()
                        }}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        {locale === 'ta' ? 'பதிவிறக்க' : 'Download'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Issues */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === 'ta' ? 'அனைத்து பதிப்புகள்' : 'All Issues'}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allMagazines.map((magazine) => (
              <Card key={magazine.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg mb-4">
                    <div className="flex items-center justify-center text-white">
                      <div className="text-center">
                        <DocumentIcon className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">
                          {magazine.pages} {locale === 'ta' ? 'பக்கங்கள்' : 'pages'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatDate(magazine.date)}
                    </span>
                    {magazine.featured && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {locale === 'ta' ? 'சிறப்பு' : 'Featured'}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-lg">
                    {locale === 'ta' ? magazine.title_ta : magazine.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 text-sm">
                    {locale === 'ta' ? magazine.description_ta : magazine.description}
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(magazine.pdfUrl, '_blank')}
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      {locale === 'ta' ? 'படிக்க' : 'Read'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = magazine.pdfUrl
                        link.download = magazine.pdfUrl.split('/').pop() || 'magazine.pdf'
                        link.click()
                      }}
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Subscription Info */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {locale === 'ta' ? 'சந்தா பெறுங்கள்' : 'Subscribe to Our Magazine'}
            </h3>
            <p className="text-gray-600 mb-6">
              {locale === 'ta' 
                ? 'புதிய பதிப்புகள் வெளியாகும் போது அறிவிப்பு பெற உங்கள் மின்னஞ்சல் முகவரியை பதிவு செய்யுங்கள்'
                : 'Register your email to get notified when new issues are published'
              }
            </p>
            <div className="max-w-md mx-auto flex space-x-3">
              <input
                type="email"
                placeholder={locale === 'ta' ? 'உங்கள் மின்னஞ்சல்' : 'Your email'}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Button>
                {locale === 'ta' ? 'சந்தா' : 'Subscribe'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
