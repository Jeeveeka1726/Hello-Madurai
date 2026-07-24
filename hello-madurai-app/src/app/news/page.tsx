'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CalendarIcon, EyeIcon, UserIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import CategoryNavigation from '@/components/CategoryNavigation'
import TodaysNewsCarousel from '@/components/TodaysNewsCarousel'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

// Fallback categories for instant display (like videos section)
// These show immediately while API loads
const fallbackCategories = [
  { id: 'all', name: 'All News', name_ta: 'அனைத்து செய்திகள்', slug: 'all', orderNumber: 0, active: true },
  { id: 'madurai', name: 'Madurai', name_ta: 'மதுரை', slug: 'madurai', orderNumber: 1, active: true },
  { id: 'religious', name: 'Devotion', name_ta: 'ஆன்மிகம்', slug: 'religious', orderNumber: 2, active: true },
  { id: 'agri', name: 'Agriculture', name_ta: 'விவசாயம்', slug: 'agri', orderNumber: 3, active: true },
  { id: 'education', name: 'Education', name_ta: 'கல்வி', slug: 'education', orderNumber: 4, active: true },
  { id: 'medical', name: 'Medical', name_ta: 'மருத்துவம்', slug: 'medical', orderNumber: 5, active: true },
  { id: 'cinema', name: 'Cinema', name_ta: 'சினிமா', slug: 'cinema', orderNumber: 6, active: true },
  { id: 'games', name: 'Games', name_ta: 'விளையாட்டு', slug: 'games', orderNumber: 7, active: true },
  { id: 'jobs', name: 'Jobs', name_ta: 'வேலைவாய்ப்பு', slug: 'jobs', orderNumber: 11, active: true },
  { id: 'article', name: 'Article', name_ta: 'கட்டுரை', slug: 'article', orderNumber: 12, active: true }
]

interface NewsArticle {
  id: string
  slug?: string
  title: string
  title_ta?: string
  content: string
  content_ta?: string
  excerpt: string
  excerpt_ta?: string
  category: string
  author: string
  publishedAt: string
  views: number
  featured: boolean
  featuredImage?: string
}

interface NewsCategory {
  id: string
  name: string
  name_ta?: string
  slug: string
  orderNumber: number
  active: boolean
}

function NewsPageContent() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('search')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  // Start with fallback categories for instant display, then update with API data
  const [categories, setCategories] = useState<NewsCategory[]>(fallbackCategories)
  const [loading, setLoading] = useState(true)

  // Fetch categories and news in parallel with caching - OPTIMIZED for speed
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both in parallel for maximum speed
        const [categoriesRes, newsRes] = await Promise.all([
          fetch('/api/news-categories', { next: { revalidate: 300 } }), // Cache for 5 minutes
          fetch('/api/news?limit=20', { next: { revalidate: 60 } }) // Cache for 1 minute, limit to 20 articles for faster load
        ])

        if (categoriesRes.ok) {
          const apiCategories = await categoriesRes.json()
          // Add "All News" to the beginning of API categories
          setCategories([
            { id: 'all', name: 'All News', name_ta: 'அனைத்து செய்திகள்', slug: 'all', orderNumber: 0, active: true },
            ...apiCategories
          ])
        }

        if (newsRes.ok) {
          const newsData = await newsRes.json()
          setNewsArticles(newsData)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // When search query is present, set category to 'all'
  useEffect(() => {
    if (searchQuery) {
      setSelectedCategory('all')
    }
  }, [searchQuery])

  // Filter articles based on selected category and search query
  let filteredArticles = selectedCategory === 'all'
    ? newsArticles
    : newsArticles.filter(article => article.category === selectedCategory)

  // Apply search filter if search query exists
  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase()
    filteredArticles = filteredArticles.filter(article => {
      const titleMatch = article.title?.toLowerCase().includes(queryLower)
      const titleTaMatch = article.title_ta?.toLowerCase().includes(queryLower)
      const excerptMatch = article.excerpt?.toLowerCase().includes(queryLower)
      const excerptTaMatch = article.excerpt_ta?.toLowerCase().includes(queryLower)
      const contentMatch = article.content?.toLowerCase().includes(queryLower)
      const contentTaMatch = article.content_ta?.toLowerCase().includes(queryLower)

      return titleMatch || titleTaMatch || excerptMatch || excerptTaMatch || contentMatch || contentTaMatch
    })
  }

  // Helper function to get category display name from slug
  const getCategoryName = (categorySlug: string) => {
    const category = categories.find(c => c.slug === categorySlug)
    if (category) {
      return language === 'ta' && category.name_ta ? category.name_ta : category.name
    }
    // Fallback: capitalize the slug if category not found
    return categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return language === 'ta' ? 'இப்போது' : 'Just now'
    if (diffInHours < 24) return `${diffInHours}${language === 'ta' ? ' மணி நேரம் முன்பு' : 'h ago'}`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}${language === 'ta' ? ' நாட்களுக்கு முன்பு' : 'd ago'}`
    return formatDate(dateString)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-10">
        {/* Category Filter - Grid layout - Hidden when search is active */}
        {!searchQuery && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center" suppressHydrationWarning>
              {t('news.selectCategory', 'Select Category', 'வகையைத் தேர்ந்தெடுக்கவும்')}
            </h2>

            {/* Flex wrap of category buttons */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* Category buttons - starts with fallback, updates with API data */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-200 text-xs sm:text-sm shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap ${
                    selectedCategory === category.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400'
                  }`}
                  suppressHydrationWarning
                >
                  {language === 'ta' && category.name_ta ? category.name_ta : category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Today's News Carousel - Only show when All News is selected and no search active */}
      {selectedCategory === 'all' && !searchQuery && <TodaysNewsCarousel />}

      {/* Other News Section */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

        {/* Section Title with Search Indicator */}
        <div className="mb-4 sm:mb-6">
          {searchQuery ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900" suppressHydrationWarning>
                  {language === 'ta' ? (
                    <>தேடல் முடிவுகள்: <span className="text-blue-600">"{searchQuery}"</span></>
                  ) : (
                    <>Search Results: <span className="text-blue-600">"{searchQuery}"</span></>
                  )}
                </h2>
                <p className="text-sm text-gray-600 mt-1" suppressHydrationWarning>
                  {filteredArticles.length} {language === 'ta' ? 'செய்திகள் கண்டறியப்பட்டன' : 'articles found'}
                </p>
              </div>
              <Link
                href="/news"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:border-blue-700 hover:text-blue-700 transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap text-sm self-start flex-shrink-0"
                suppressHydrationWarning
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {language === 'ta' ? 'அழி' : 'Clear'}
              </Link>
            </div>
          ) : (
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-center sm:text-left" suppressHydrationWarning>
              {(() => {
                const cat = categories.find(c => c.slug === selectedCategory)
                return cat ? (language === 'ta' && cat.name_ta ? cat.name_ta : cat.name) : ''
              })()}
            </h2>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 sm:py-16">
            <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 text-base sm:text-lg" suppressHydrationWarning>
              {t('news.loading', 'Loading news...', 'செய்திகள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* News Grid - Responsive Grid Layout */}
        {!loading && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {filteredArticles.map((article) => (
              <Link key={article.id} href={`/news/${article.slug || article.id}`}>
                <Card className="group hover:shadow-2xl transition-all duration-300 bg-white border-0 overflow-hidden h-full flex flex-col transform hover:-translate-y-1 sm:hover:-translate-y-2">
                  {/* Image */}
                  {article.featuredImage ? (
                    <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                      <img
                        src={article.featuredImage}
                        alt={language === 'ta' && article.title_ta ? article.title_ta : article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                      {/* Category badge */}
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold shadow-lg" suppressHydrationWarning>
                          {getCategoryName(article.category)}
                        </span>
                      </div>

                      {/* Time badge */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                          <ClockIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                          <span className="hidden sm:inline">{getTimeAgo(article.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 sm:h-56 md:h-64 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                      <span className="text-blue-400 text-xs sm:text-sm" suppressHydrationWarning>
                        {t('news.imageComingSoon', 'Image Coming Soon', 'படம் விரைவில்')}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <CardContent className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
                    {/* Title - Full display */}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2 sm:mb-3 leading-tight group-hover:text-blue-600 transition-colors" suppressHydrationWarning>
                      {language === 'ta' && article.title_ta ? article.title_ta : article.title}
                    </h3>

                    {/* Excerpt - Full display */}
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed flex-grow" suppressHydrationWarning>
                      {language === 'ta' && article.excerpt_ta ? article.excerpt_ta : article.excerpt}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="font-medium">{article.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="truncate">{formatDate(article.publishedAt)}</span>
                      </div>
                    </div>

                    {/* Read More Button */}
                    <div className="mt-3 sm:mt-4">
                      <span className="inline-flex items-center text-blue-600 font-semibold text-xs sm:text-sm md:text-base group-hover:gap-2 transition-all" suppressHydrationWarning>
                        {t('news.readMore', 'Read More', 'மேலும் படிக்க')}
                        <svg className="w-0 group-hover:w-4 sm:group-hover:w-5 h-4 sm:h-5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* No results message */}
        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📰</div>
            <p className="text-gray-500 text-lg mb-4" suppressHydrationWarning>
              {selectedCategory === 'all'
                ? t('news.noData', 'No news articles found', 'செய்தி கட்டுரைகள் எதுவும் கிடைக்கவில்லை')
                : t('news.noResults', 'No news in this category', 'இந்த வகையில் செய்திகள் இல்லை')
              }
            </p>
            {selectedCategory !== 'all' && (
              <Button
                onClick={() => setSelectedCategory('all')}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                suppressHydrationWarning
              >
                {t('news.viewAll', 'View All News', 'அனைத்து செய்திகளையும் பார்க்கவும்')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function NewsPage() {
  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      <CategoryNavigation />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>}>
        <NewsPageContent />
      </Suspense>
    </div>
  )
}
