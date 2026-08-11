'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CalendarIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import CategoryNavigation from '@/components/CategoryNavigation'
import TodaysNewsCarousel from '@/components/TodaysNewsCarousel'
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card'
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

  // Fetch categories and news in parallel with caching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both in parallel for maximum speed
        const [categoriesRes, newsRes] = await Promise.all([
          fetch('/api/news-categories', { next: { revalidate: 300 }, cache: 'force-cache' }), // Cache for 5 minutes
          fetch('/api/news?limit=50', { next: { revalidate: 60 }, cache: 'force-cache' }) // Cache for 1 minute, limit to 50 news for faster load
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
    return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Category Filter */}
        {!searchQuery && (
          <div className="mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4" suppressHydrationWarning>
              {t('news.selectCategory', 'Select Category', 'வகையைத் தேர்ந்தெடுக்கவும்')}
            </h2>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold transition-all duration-200 text-xs sm:text-sm ${
                    selectedCategory === category.slug
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                  suppressHydrationWarning
                >
                  {language === 'ta' && category.name_ta ? category.name_ta : category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {searchQuery && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900" suppressHydrationWarning>
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
              <Link href="/news">
                <Button variant="outline" size="sm">
                  {language === 'ta' ? 'அழி' : 'Clear'}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Today's News Carousel - Only show when All News is selected and no search active */}
      {selectedCategory === 'all' && !searchQuery && <TodaysNewsCarousel />}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-6 sm:pb-8">

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600" suppressHydrationWarning>
              {t('news.loading', 'Loading news...', 'செய்திகள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* News Grid */}
        {!loading && filteredArticles.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              {filteredArticles.map((article) => (
                <Link key={article.id} href={`/news/${article.slug || article.id}`}>
                  <div className="h-full news-card bg-white rounded-xl shadow-lg border-2 border-blue-400 hover:border-blue-600 hover:shadow-xl transition-all duration-200 overflow-hidden">
                    {/* Image Section - Full Width */}
                    {article.featuredImage && (
                      <div className="w-full relative bg-gray-100">
                        <img
                          src={article.featuredImage}
                          alt={language === 'ta' && article.title_ta ? article.title_ta : article.title}
                          className="w-full h-56 sm:h-64 md:h-72 lg:h-80 object-cover"
                          loading="lazy"
                          decoding="async"
                          onLoad={(e) => e.currentTarget.classList.add('loaded')}
                          style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                          onLoadCapture={(e) => {
                            (e.target as HTMLImageElement).style.opacity = '1'
                          }}
                        />
                      </div>
                    )}

                    {/* Content Section - With Padding */}
                    <div className="p-4 sm:p-5 md:p-6">
                      {/* Category and Views */}
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold" suppressHydrationWarning>
                          {getCategoryName(article.category)}
                        </span>
                        <div className="flex items-center">
                          <EyeIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          <span className="text-xs sm:text-sm">{article.views.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="line-clamp-2 text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight" suppressHydrationWarning>
                        {language === 'ta' && article.title_ta ? article.title_ta : article.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 line-clamp-3 sm:line-clamp-4 text-sm sm:text-base leading-relaxed mb-4" suppressHydrationWarning>
                        {language === 'ta' && article.excerpt_ta ? article.excerpt_ta : article.excerpt}
                      </p>

                      {/* Footer - Author and Date */}
                      <div className="pt-3 sm:pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center">
                            <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                            <span className="truncate">{article.author}</span>
                          </div>
                          <div className="flex items-center">
                            <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                            <span className="truncate text-xs sm:text-sm">{formatDate(article.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Total count display */}
            <div className="mt-6 sm:mt-8 text-center text-gray-600">
              <p className="text-sm sm:text-base" suppressHydrationWarning>
                {language === 'ta'
                  ? `மொத்தம் ${filteredArticles.length} செய்திகள் காட்டப்படுகின்றன`
                  : `Showing ${filteredArticles.length} total articles`
                }
              </p>
            </div>
          </>
        )}

        {/* No results message */}
        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2" suppressHydrationWarning>
              {language === 'ta' ? 'செய்திகள் இல்லை' : 'No News Found'}
            </h3>
            <p className="text-gray-600" suppressHydrationWarning>
              {selectedCategory === 'all'
                ? (language === 'ta' ? 'தற்போது செய்திகள் எதுவும் இல்லை.' : 'There are currently no news articles.')
                : (language === 'ta' ? 'இந்த பிரிவில் தற்போது செய்திகள் எதுவும் இல்லை.' : 'There are currently no news articles in this category.')
              }
            </p>
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
