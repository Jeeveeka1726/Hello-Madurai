'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  NewspaperIcon,
  VideoCameraIcon,
  MicrophoneIcon,
  DocumentIcon,
  PhoneIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  GiftIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import NewHeader from '@/components/layout/NewHeader'
import CategoryNavigation from '@/components/CategoryNavigation'
import SubscriptionButton from '@/components/SubscriptionButton'
import TranslatedText from '@/components/TranslatedText'
import ReelsSection from '@/components/ReelsSection'

interface HomeFeature {
  id: string
  nameEn: string
  nameTa?: string
  descEn: string
  descTa?: string
  href: string
  iconColor: string
  backgroundImage?: string
  orderNumber: number
  active: boolean
}

export default function RootPage() {
  const { t, language } = useLanguage()
  const [features, setFeatures] = useState<HomeFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [latestNews, setLatestNews] = useState<any[]>([])
  const [stats, setStats] = useState({ news: 0, videos: 0, businesses: 0 })

  // Default fallback features
  const defaultFeatures = [
    {
      nameEn: 'News',
      nameTa: 'செய்திகள்',
      descEn: 'Latest news from Madurai',
      descTa: 'மதுரையின் சமீபத்திய செய்திகள்',
      href: '/news',
      icon: NewspaperIcon,
      color: 'bg-red-500'
    },
    {
      nameEn: 'Digital FM',
      nameTa: 'டிஜிட்டல் எஃப்.எம்',
      descEn: 'Listen to Digital FM',
      descTa: 'டிஜிட்டல் எஃப்.எம் கேளுங்கள்',
      href: '/radio',
      icon: MicrophoneIcon,
      color: 'bg-green-500'
    },
    {
      nameEn: 'Videos',
      nameTa: 'வீடியோக்கள்',
      descEn: 'Watch videos from Madurai',
      descTa: 'மதுரையின் வீடியோக்களைப் பார்க்கவும்',
      href: '/videos',
      icon: VideoCameraIcon,
      color: 'bg-purple-500'
    },
    {
      nameEn: 'Directory',
      nameTa: 'வணிக முகவரி',
      descEn: 'Business listings and contacts',
      descTa: 'வணிக பட்டியல்கள் மற்றும் தொடர்புகள்',
      href: '/directory',
      icon: BuildingOfficeIcon,
      color: 'bg-indigo-500'
    },
    {
      nameEn: 'Events',
      nameTa: 'நிகழ்வுகள்',
      descEn: 'Discover local events',
      descTa: 'உள்ளூர் நிகழ்வுகளைக் கண்டறியுங்கள்',
      href: '/events',
      icon: CalendarIcon,
      color: 'bg-orange-500'
    },
    {
      nameEn: 'E-Paper',
      nameTa: 'பத்திரிகை',
      descEn: 'Read digital newspapers',
      descTa: 'டிஜிட்டல் பத்திரிகைகளைப் படியுங்கள்',
      href: '/epaper',
      icon: DocumentIcon,
      color: 'bg-blue-500'
    },
    {
      nameEn: 'Discounts',
      nameTa: 'தள்ளுபடிகள்',
      descEn: 'Discount On All Days',
      descTa: 'எல்லா நாட்களிலும் தள்ளுபடி',
      href: '/offers',
      icon: GiftIcon,
      color: 'bg-yellow-500'
    },
    {
      nameEn: 'Help Line',
      nameTa: 'உதவி எண்',
      descEn: 'Emergency and helpline numbers',
      descTa: 'அவசர மற்றும் உதவி எண்கள்',
      href: '/helpline',
      icon: PhoneIcon,
      color: 'bg-red-600'
    },
    {
      nameEn: 'Contact',
      nameTa: 'தொடர்பு',
      descEn: 'Get in touch with us',
      descTa: 'எங்களுடன் தொடர்பு கொள்ளுங்கள்',
      href: '/contact',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-blue-500'
    }
  ]

  // Icon mapping based on href
  const getIconForHref = (href: string) => {
    const iconMap: { [key: string]: any } = {
      '/news': NewspaperIcon,
      '/radio': MicrophoneIcon,
      '/videos': VideoCameraIcon,
      '/directory': BuildingOfficeIcon,
      '/events': CalendarIcon,
      '/epaper': DocumentIcon,
      '/offers': GiftIcon,
      '/helpline': PhoneIcon,
      '/contact': ChatBubbleLeftRightIcon
    }
    return iconMap[href] || NewspaperIcon
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch features
        const featuresResponse = await fetch('/api/home-features')
        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json()
          setFeatures(featuresData)
        }

        // Fetch latest news for homepage
        const newsResponse = await fetch('/api/news')
        if (newsResponse.ok) {
          const newsData = await newsResponse.json()
          setLatestNews(newsData.slice(0, 6)) // Get first 6 news items
        }

        // Fetch stats
        const analyticsResponse = await fetch('/api/admin/analytics?range=30d')
        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json()
          setStats({
            news: analyticsData.contentStats?.news || 49,
            videos: analyticsData.contentStats?.videos || 141,
            businesses: analyticsData.contentStats?.businesses || 12
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Use fetched features or default ones
  const displayFeatures = features.length > 0 ? features : defaultFeatures

  return (
    <div className="min-h-screen bg-white">
      <NewHeader />
      <CategoryNavigation />
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: '#ffffff' }}>
                <TranslatedText tamil="ஹலோ மதுரை">Hello Madurai</TranslatedText>
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: '#ffffff' }}>
                <TranslatedText tamil="மதுரைக்கான உங்கள் நுழைவாயில் - செய்திகள், வானொலி மற்றும் பலவும்">Your gateway to Madurai - News, Radio & More</TranslatedText>
              </p>
              <Link
                href="/news"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 transition-colors duration-200"
              >
                <TranslatedText tamil="சமீபத்திய செய்திகளை ஆராயுங்கள்">Explore Latest News</TranslatedText>
              </Link>
            </div>
          </div>
        </div>

        {/* About Section - Rich Content for SEO */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              <TranslatedText tamil="ஹலோ மதுரை பற்றி">About Hello Madurai</TranslatedText>
            </h2>
            <div className="prose prose-lg mx-auto text-gray-700 space-y-4">
              <p>
                <TranslatedText tamil="ஹலோ மதுரை என்பது மதுரை மற்றும் சுற்றியுள்ள பகுதிகளுக்கான முழுமையான டிஜிட்டல் தகவல் தளமாகும். நாங்கள் உள்ளூர் செய்திகள், நிகழ்வுகள், வணிக தகவல் மற்றும் பலவற்றை வழங்குகிறோம்.">
                  Hello Madurai is a comprehensive digital information platform for Madurai and surrounding areas. We provide local news, events, business information, and more, serving as your complete gateway to everything happening in and around the temple city of Madurai.
                </TranslatedText>
              </p>
              <p>
                <TranslatedText tamil="எங்கள் இயங்குதளம் செய்திகள், வீடியோக்கள், டிஜிட்டல் எஃப்எம், பத்திரிகை, வணிக முகவரி, நிகழ்வுகள் மற்றும் உதவி எண்களை உள்ளடக்கியது. மதுரையின் பல்வேறு தகவல்களை ஒரே இடத்தில் பெறுங்கள்.">
                  Our platform includes news articles, videos, digital FM radio, e-paper magazines, business directory, local events, and helpline services. We are committed to keeping Madurai connected with timely, accurate, and relevant local information that matters to our community.
                </TranslatedText>
              </p>
              <p className="font-semibold text-gray-900">
                <TranslatedText tamil="தற்போது எங்களிடம் {stats.news}+ செய்தி கட்டுரைகள், {stats.videos}+ வீடியோக்கள், மற்றும் {stats.businesses}+ வணிக பட்டியல்கள் உள்ளன.">
                  Currently featuring over {stats.news} news articles, {stats.videos} videos, and {stats.businesses} business listings, we continue to grow as Madurai's most trusted local information source.
                </TranslatedText>
              </p>
            </div>
          </div>
        </div>

        {/* Latest News Section - Content for SEO */}
        {latestNews.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                <TranslatedText tamil="சமீபத்திய செய்திகள்">Latest News</TranslatedText>
              </h2>
              <Link href="/news" className="text-blue-600 hover:text-blue-700 font-medium">
                <TranslatedText tamil="அனைத்தும் காண்க →">View All →</TranslatedText>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestNews.map((news: any) => (
                <Link key={news.id} href={`/news/${news.id}`} className="group">
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                    {news.featuredImage && (
                      <img
                        src={news.featuredImage}
                        alt={language === 'ta' && news.title_ta ? news.title_ta : news.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-600">
                        {language === 'ta' && news.title_ta ? news.title_ta : news.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {language === 'ta' && news.excerpt_ta ? news.excerpt_ta : news.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                        <span>{news.category}</span>
                        <span>{news.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50">
          <div className="text-center mb-12">
            <TranslatedText as="h2" className="text-3xl font-bold text-gray-900 mb-4" tamil="மதுரையை கண்டறியுங்கள்">
              Discover Madurai
            </TranslatedText>
            <TranslatedText as="p" className="text-lg text-gray-600 max-w-2xl mx-auto" tamil="உங்கள் நகரத்துடன் இணைந்திருக்க தேவையான அனைத்தும்">
              Everything you need to stay connected with your city
            </TranslatedText>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              displayFeatures.map((feature: any) => {
                const Icon = feature.icon || getIconForHref(feature.href)
                const backgroundStyle = feature.backgroundImage
                  ? {
                      backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.85), rgba(29, 78, 216, 0.9)), url(${feature.backgroundImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat'
                    }
                  : {}

                return (
                  <Link key={feature.id || feature.nameEn} href={feature.href} className="no-underline">
                    <div
                      className="bg-blue-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 p-6 cursor-pointer group h-full flex flex-col border-2 border-blue-700 hover:border-blue-800 relative overflow-hidden"
                      style={backgroundStyle}
                    >
                      <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.iconColor || feature.color} rounded-lg mb-4 group-hover:scale-110 transition-transform duration-200 relative z-10`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-white relative z-10">
                        {language === 'ta' && feature.nameTa ? feature.nameTa : feature.nameEn}
                      </h3>
                      <p className="flex-grow text-white relative z-10">
                        {language === 'ta' && feature.descTa ? feature.descTa : feature.descEn}
                      </p>
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Reels Section */}
        <ReelsSection />

        {/* Social Media Follow Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                <TranslatedText tamil="எங்களைப் பின்தொடருங்கள்">Follow Us</TranslatedText>
              </h2>
              <div className="flex justify-center items-center gap-4 md:gap-6">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/hellomadurai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-blue-50 rounded-lg p-3 md:p-4 transition-all duration-200 hover:scale-110 shadow-lg"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/hello_madurai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-pink-50 rounded-lg p-3 md:p-4 transition-all duration-200 hover:scale-110 shadow-lg"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@hellomadurai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-red-50 rounded-lg p-3 md:p-4 transition-all duration-200 hover:scale-110 shadow-lg"
                  aria-label="YouTube"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="https://twitter.com/hellomadurai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-gray-100 rounded-lg p-3 md:p-4 transition-all duration-200 hover:scale-110 shadow-lg"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Banner */}
        <SubscriptionButton variant="banner" />

        {/* Floating Subscription Button */}
        <SubscriptionButton variant="floating" />
      </div>
    </div>
  )
}
