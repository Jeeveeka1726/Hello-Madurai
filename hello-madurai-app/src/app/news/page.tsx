'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface NewsArticle {
  id: string
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

function NewsPageContent() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch news from database
  useEffect(() => {
    const fetchNews = async () => {
      try {
        console.log('Fetching news from API...')
        const response = await fetch('/api/news')
        console.log('Response status:', response.status)
        if (response.ok) {
          const data = await response.json()
          console.log('Fetched news data:', data)
          setNewsArticles(data)
        } else {
          console.error('Failed to fetch news, status:', response.status)
        }
      } catch (error) {
        console.error('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])



  const categories = [
    { id: 'all', name: t('categories.all', 'All News', 'அனைத்து செய்திகள்') },
    { id: 'general', name: t('categories.general', 'General', 'பொதுவானது') },
    { id: 'collector', name: t('categories.collector', 'Collector', 'கலெக்டர்') },
    { id: 'corporation', name: t('categories.corporation', 'Corporation', 'மாநகராட்சி') },
    { id: 'education', name: t('categories.education', 'Education', 'கல்வி') },
    { id: 'religious', name: t('categories.religious', 'Religious', 'மதம்') },
    { id: 'cinema', name: t('categories.cinema', 'Cinema', 'சினிமா') },
    { id: 'games', name: t('categories.games', 'Games', 'விளையாட்டு') },
    { id: 'political', name: t('categories.political', 'Political', 'அரசியல்') },
    { id: 'police', name: t('categories.police', 'Police', 'போலீஸ்') },
    { id: 'agri', name: t('categories.agri', 'Agriculture', 'விவசாயம்') },
    { id: 'jobs', name: t('categories.jobs', 'Jobs', 'வேலைவாய்ப்பு') },
    { id: 'article', name: t('categories.article', 'Article', 'கட்டுரை') },
    { id: 'others', name: t('categories.others', 'Others', 'மற்றவை') }
  ]

  // Filter articles based on selected category
  const filteredArticles = selectedCategory === 'all'
    ? newsArticles
    : newsArticles.filter(article => article.category === selectedCategory)

  // Get last 2 updated news for first row, rest for remaining rows
  const latestTwo = filteredArticles.slice(0, 2)
  const remainingNews = filteredArticles.slice(2)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <style jsx>{`
        .news-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .news-card-content {
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          justify-content: flex-start;
        }
        .news-card-content > div:first-child {
          flex-grow: 0;
        }
        .news-card-content > div:last-child {
          margin-top: auto;
        }
        .news-card-content .content-section {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
      `}</style>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">


        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600" suppressHydrationWarning>
              {t('news.loading', 'Loading news...', 'செய்திகள் ஏற்றப்படுகின்றன...')}
            </p>
          </div>
        )}

        {/* Category Filter */}
        {!loading && (
          <>
            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "primary" : "outline"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id
                      ? "text-sm bg-primary-600 text-white"
                      : "text-sm bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Latest 2 News - First Row (2 columns) */}
            {latestTwo.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {selectedCategory === 'all'
                    ? t('news.allNews', 'All News', 'அனைத்து செய்திகள்')
                    : categories.find(cat => cat.id === selectedCategory)?.name
                  }
                </h2>
                <div className="grid gap-6 md:grid-cols-2 mb-6">
                  {latestTwo.map((article) => (
                    <Card key={article.id} className="news-card hover:shadow-lg transition-shadow bg-white border-gray-200 h-full flex flex-col">
                      {article.featuredImage ? (
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                          <img
                            src={article.featuredImage}
                            alt={t(`news.${article.id}.title`, article.title, article.title_ta)}
                            className="featured-image w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          <div className="flex items-center justify-center text-gray-400">
                            <span className="text-sm">
                              {t('news.imageComingSoon', 'Image Coming Soon', 'படம் விரைவில்')}
                            </span>
                          </div>
                        </div>
                      )}
                      <CardContent className="news-card-content p-6 flex flex-col flex-grow">
                        <div className="content-section">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500 capitalize">
                                {article.category}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              {t(`news.${article.id}.title`, article.title, article.title_ta)}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {t(`news.${article.id}.excerpt`, article.excerpt, article.excerpt_ta)}
                            </p>
                          </div>
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 text-sm text-gray-500 mb-4">
                              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                <div className="flex items-center">
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  <span className="truncate">Hello Madurai</span>
                                </div>
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 mr-1" />
                                  <span className="truncate">{formatDate(article.publishedAt)}</span>
                                </div>
                                <div className="flex items-center">
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  <span className="truncate">{article.views.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <Link href={`/news/${article.id}`}>
                              <Button className="w-full">
                                {t('news.readMore', 'Read More', 'மேலும் படிக்க')}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Remaining News - 3 columns per row */}
            {remainingNews.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {remainingNews.map((article) => (
              <Card key={article.id} className="news-card hover:shadow-lg transition-shadow bg-white border-gray-200 h-full flex flex-col">
                {article.featuredImage ? (
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                    <img
                      src={article.featuredImage}
                      alt={t(`news.${article.id}.title`, article.title, article.title_ta)}
                      className="featured-image w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                    <div className="flex items-center justify-center text-gray-400">
                      <span className="text-sm">
                        {t('news.imageComingSoon', 'Image Coming Soon', 'படம் விரைவில்')}
                      </span>
                    </div>
                  </div>
                )}
                <CardContent className="news-card-content p-4 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 capitalize">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                    {t(`news.${article.id}.title`, article.title, article.title_ta)}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                    {t(`news.${article.id}.excerpt`, article.excerpt, article.excerpt_ta)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Hello Madurai</span>
                    <div className="flex items-center">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      {article.views.toLocaleString()}
                    </div>
                  </div>
                  <Link href={`/news/${article.id}`} className="mt-auto">
                    <Button size="sm" className="w-full">
                      {t('news.readMore', 'Read More', 'மேலும் படிக்க')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
                ))}
              </div>
            )}

            {/* No results message */}
            {filteredArticles.length === 0 && newsArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {t('news.noData', 'No news articles found. Add some articles via the admin panel!', 'செய்தி கட்டுரைகள் எதுவும் கிடைக்கவில்லை. நிர்வாக பேனல் வழியாக சில கட்டுரைகளைச் சேர்க்கவும்!')}
                </p>
                <a
                  href="/admin/news"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  {t('news.addArticles', 'Add Articles', 'கட்டுரைகளைச் சேர்க்கவும்')}
                </a>
              </div>
            )}

            {filteredArticles.length === 0 && newsArticles.length > 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {t('news.noResults', 'No news articles found in this category', 'இந்த வகையில் செய்தி கட்டுரைகள் எதுவும் கிடைக்கவில்லை')}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function NewsPage() {
  return (
    <div>
      <NewspaperHeader />
      <NewHeader />
      <NewsPageContent />
    </div>
  )
}
