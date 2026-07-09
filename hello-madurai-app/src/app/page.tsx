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
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

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
        // Fetch all data in parallel for faster loading
        const [featuresResponse, newsResponse] = await Promise.all([
          fetch('/api/home-features', { next: { revalidate: 300 } }), // Cache for 5 minutes
          fetch('/api/news/latest', { next: { revalidate: 60 } }) // Optimized endpoint, cache for 1 minute
        ])

        if (featuresResponse.ok) {
          const featuresData = await featuresResponse.json()
          setFeatures(featuresData)
        }

        if (newsResponse.ok) {
          const newsData = await newsResponse.json()
          setLatestNews(newsData)
        }

        // Use static stats for faster initial load - these don't change often
        setStats({
          news: 49,
          videos: 141,
          businesses: 12
        })
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

  // Handle search from navbar
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setIsSearching(true)

    try {
      const response = await fetch('/api/news')
      if (response.ok) {
        const allNews = await response.json()
        const queryLower = query.toLowerCase()

        // Filter articles
        const filtered = allNews.filter((article: any) => {
          const titleMatch = article.title?.toLowerCase().includes(queryLower)
          const titleTaMatch = article.title_ta?.toLowerCase().includes(queryLower)
          const excerptMatch = article.excerpt?.toLowerCase().includes(queryLower)
          const excerptTaMatch = article.excerpt_ta?.toLowerCase().includes(queryLower)
          const contentMatch = article.content?.toLowerCase().includes(queryLower)
          const contentTaMatch = article.content_ta?.toLowerCase().includes(queryLower)

          return titleMatch || titleTaMatch || excerptMatch || excerptTaMatch || contentMatch || contentTaMatch
        })

        setSearchResults(filtered)
      }
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <NewHeader showSearch={true} onSearch={handleSearch} />
      <CategoryNavigation />
      <div className="min-h-screen bg-white">
        {/* Hero Section - Premium Modern Design */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-300 to-blue-400 rounded-full blur-3xl opacity-20 animate-pulse transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full blur-3xl opacity-20 animate-pulse transform translate-x-1/2 translate-y-1/2" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-sky-400 to-blue-500 rounded-full blur-3xl opacity-15 animate-pulse transform -translate-x-1/2 -translate-y-1/2" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* Geometric Grid Pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}></div>

          {/* Floating Icons/Badges - More Visible */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-10 left-10 text-white/30 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>📰</div>
            <div className="absolute top-20 right-20 text-white/30 text-6xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>📻</div>
            <div className="absolute bottom-20 left-20 text-white/30 text-6xl animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>🎥</div>
            <div className="absolute bottom-10 right-10 text-white/30 text-6xl animate-bounce" style={{ animationDuration: '4.5s', animationDelay: '1.5s' }}>🎯</div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
            <div className="text-center">
              {/* Main Heading with Gradient Text */}
              <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white drop-shadow-2xl animate-fade-in">
                <TranslatedText tamil="ஹலோ மதுரை">Hello Madurai</TranslatedText>
              </h1>

              {/* Subheading */}
              <p className="text-base md:text-xl mb-8 max-w-2xl mx-auto text-white/90 font-light leading-relaxed">
                <TranslatedText tamil="மதுரைக்கான உங்கள் நுழைவாயில் - செய்திகள், வானொலி மற்றும் பலவும்">Your gateway to Madurai - News, Radio & More</TranslatedText>
              </p>

              {/* CTA Buttons with Enhanced Effects */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Primary Button - Explore News */}
                <Link
                  href="/news"
                  className="group inline-flex items-center gap-3 px-8 py-3.5 border-2 rounded-full transition-all duration-300 hover:scale-110 font-bold text-base"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    boxShadow: '0 0 40px rgba(96, 165, 250, 0.6), 0 0 80px rgba(59, 130, 246, 0.4), 0 0 120px rgba(37, 99, 235, 0.3)',
                    outline: 'none',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    const link = e.currentTarget
                    link.style.background = 'white'
                    link.style.boxShadow = '0 0 60px rgba(96, 165, 250, 0.9), 0 0 120px rgba(59, 130, 246, 0.7), 0 0 180px rgba(37, 99, 235, 0.5)'
                    // Change color of all child spans to BLUE
                    const spans = link.querySelectorAll('span')
                    spans.forEach(span => {
                      const htmlSpan = span as HTMLElement
                      htmlSpan.style.setProperty('color', '#3b82f6', 'important')
                    })
                  }}
                  onMouseLeave={(e) => {
                    const link = e.currentTarget
                    link.style.background = 'rgba(255, 255, 255, 0.1)'
                    link.style.boxShadow = '0 0 40px rgba(96, 165, 250, 0.6), 0 0 80px rgba(59, 130, 246, 0.4), 0 0 120px rgba(37, 99, 235, 0.3)'
                    // Reset color of all child spans to WHITE
                    const spans = link.querySelectorAll('span')
                    spans.forEach(span => {
                      const htmlSpan = span as HTMLElement
                      htmlSpan.style.setProperty('color', 'white', 'important')
                    })
                  }}
                >
                  {/* Button content */}
                  <span className="group-hover:scale-110 transition-transform duration-200" style={{ color: 'white' }}>📰</span>
                  <span style={{ color: 'white' }}><TranslatedText tamil="செய்திகள் ஆராயுங்கள்">Explore News</TranslatedText></span>
                  <span className="group-hover:translate-x-2 transition-transform duration-300" style={{ color: 'white' }}>→</span>
                </Link>

                {/* Secondary Button - Listen FM */}
                <Link
                  href="/radio"
                  className="group inline-flex items-center gap-3 px-8 py-3.5 text-base font-semibold rounded-full transition-all duration-300 hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 30px rgba(96, 165, 250, 0.5), 0 0 60px rgba(59, 130, 246, 0.3), 0 0 90px rgba(37, 99, 235, 0.2)',
                    color: 'white',
                    outline: 'none',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.8)'
                    e.currentTarget.style.boxShadow = '0 0 40px rgba(96, 165, 250, 0.7), 0 0 80px rgba(59, 130, 246, 0.5), 0 0 120px rgba(37, 99, 235, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(96, 165, 250, 0.5), 0 0 60px rgba(59, 130, 246, 0.3), 0 0 90px rgba(37, 99, 235, 0.2)'
                  }}
                >
                  {/* Button content */}
                  <span className="group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">📻</span>
                  <span className="font-semibold" style={{ color: 'white' }}><TranslatedText tamil="FM கேளுங்கள்">Listen FM</TranslatedText></span>
                </Link>
              </div>

              {/* Stats Bar */}
              <div className="mt-10 flex flex-wrap justify-center gap-8 text-white/80">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">1000+</div>
                  <div className="text-sm"><TranslatedText tamil="செய்திகள்">News</TranslatedText></div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-sm"><TranslatedText tamil="வானொலி">Radio</TranslatedText></div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm"><TranslatedText tamil="வீடியோக்கள்">Videos</TranslatedText></div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave Decoration */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </div>



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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              displayFeatures.map((feature: any, index: number) => {
                const Icon = feature.icon || getIconForHref(feature.href)

                // Premium gradient backgrounds matching the luxury design
                const getBackgroundClass = (href: string) => {
                  if (href.includes('/news')) return 'from-red-900 via-red-800 to-red-900'
                  if (href.includes('/radio')) return 'from-green-900 via-green-800 to-green-900'
                  if (href.includes('/videos')) return 'from-purple-900 via-purple-800 to-purple-900'
                  if (href.includes('/tourism') || href.includes('/directory')) return 'from-gray-900 via-gray-800 to-gray-900'
                  if (href.includes('/events')) return 'from-orange-900 via-orange-800 to-orange-900'
                  if (href.includes('/epaper') || href.includes('/magazines')) return 'from-teal-900 via-teal-800 to-teal-900'
                  if (href.includes('/helpline')) return 'from-red-900 via-red-800 to-red-900'
                  if (href.includes('/contact')) return 'from-blue-900 via-blue-800 to-blue-900'
                  if (href.includes('/discount') || href.includes('/offers')) return 'from-yellow-800 via-yellow-700 to-yellow-800'
                  return 'from-blue-900 via-blue-800 to-blue-900'
                }

                // Get decorative image based on href - use uploaded images or fallback to feature.backgroundImage
                const getDecorativeImage = (href: string) => {
                  if (href.includes('/news')) return '/feature-images/news.png'
                  if (href.includes('/radio')) return '/feature-images/FM.png'
                  if (href.includes('/videos')) return '/feature-images/Video.png'
                  if (href.includes('/tourism') || href.includes('/directory')) return '/feature-images/Directory.png'
                  if (href.includes('/events')) return '/feature-images/events.png'
                  if (href.includes('/epaper') || href.includes('/magazines')) return '/feature-images/epaper.png'
                  if (href.includes('/helpline')) return '/feature-images/helpline.png'
                  if (href.includes('/contact')) return '/feature-images/contact.png'
                  if (href.includes('/discount') || href.includes('/offers')) return '/feature-images/discounts.png'
                  return feature.backgroundImage || null
                }

                const backgroundClass = getBackgroundClass(feature.href)
                const decorativeImage = getDecorativeImage(feature.href)

                return (
                  <Link key={feature.id || feature.nameEn} href={feature.href} className="no-underline group block">
                    {/* Just the image - no box */}
                    {decorativeImage && (
                      <img
                        src={decorativeImage}
                        alt={language === 'ta' && feature.nameTa ? feature.nameTa : feature.nameEn}
                        className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300 rounded-xl"
                        style={{
                          display: 'block',
                          margin: 0,
                          padding: 0
                        }}
                      />
                    )}
                  </Link>
                )
              })
            )}
          </div>
        </div>

        {/* Reels Section */}
        <ReelsSection />

        {/* Social Media Follow Section */}
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center bg-white rounded-3xl shadow-xl p-10 md:p-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                <TranslatedText tamil="எங்களைப் பின்தொடருங்கள்">Follow Us</TranslatedText>
              </h2>
              <p className="text-gray-600 text-base md:text-lg mb-10">
                <TranslatedText tamil="எங்கள் சமீபத்திய உள்ளடக்கம் மற்றும் செய்திகளுடன் புதுப்பித்து வைத்திருங்கள்">
                  Stay updated with our latest content and news
                </TranslatedText>
              </p>
              <div className="flex justify-center items-center gap-4 md:gap-6">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/hellomaduraimedia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#1877F2] hover:bg-[#0d65d9] rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="Facebook"
                >
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/hello_madurai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#E1306C] via-[#C13584] to-[#833AB4] hover:from-[#d1205c] hover:via-[#b1257c] hover:to-[#732aa4] rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="Instagram"
                >
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@hellomadurai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#FF0000] hover:bg-[#e60000] rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="YouTube"
                >
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* X (Twitter) */}
                <a
                  href="https://x.com/hellomadurai?s=21"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-black hover:bg-gray-800 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="bg-gray-900 text-white py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-400 text-sm flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                <span>Copyright © 2026 Hello Madurai</span>
                <span>|</span>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
                <span>|</span>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
                <span>|</span>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Terms of Conditions
                </Link>
                <span>|</span>
                <Link href="/editorial-policy" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {language === 'ta' ? 'ஆசிரியர் கொள்கை' : 'Editorial Policy'}
                </Link>
                <span>|</span>
                <Link href="/fact-check" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {language === 'ta' ? 'உண்மை சரிபார்ப்பு' : 'Fact Check'}
                </Link>
                <span>|</span>
                <Link href="/corrections" className="text-gray-400 hover:text-white transition-colors duration-200">
                  {language === 'ta' ? 'திருத்தக் கொள்கை' : 'Corrections'}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Floating Subscription Button */}
        <SubscriptionButton variant="floating" />
      </div>
    </div>
  )
}
