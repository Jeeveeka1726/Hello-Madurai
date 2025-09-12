'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CalendarIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline'
import AppWrapper from '@/components/AppWrapper'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { BannerAd, ResponsiveAd } from '@/components/ads/GoogleAdsense'

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
        const response = await fetch('/api/admin/news')
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
    { id: 'corporation', name: t('categories.corporation', 'Corporation', 'மாநகராட்சி') },
    { id: 'agriculture', name: t('categories.agriculture', 'Agriculture', 'விவசாயம்') },
    { id: 'religious', name: t('categories.religious', 'Religious', 'மத நிகழ்ச்சிகள்') },
    { id: 'business', name: t('categories.business', 'Business', 'வணிகம்') },
    { id: 'education', name: t('categories.education', 'Education', 'கல்வி') }
  ]

  // Filter articles based on selected category
  const filteredArticles = selectedCategory === 'all'
    ? newsArticles
    : newsArticles.filter(article => article.category === selectedCategory)

  const featuredNews = filteredArticles.filter(article => article.featured)
  const regularNews = filteredArticles.filter(article => !article.featured)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t('news.title', 'Latest News', 'சமீபத்திய செய்திகள்')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {t('news.subtitle', 'Stay updated with the latest happenings in Madurai', 'மதுரையில் நடக்கும் சமீபத்திய நிகழ்வுகளுடன் புதுப்பித்த நிலையில் இருங்கள்')}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
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
                      : "text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Top Banner Ad */}
            <BannerAd className="mb-8" />

            {/* Featured News */}
        {featuredNews.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('news.featured', 'Featured News', 'சிறப்பு செய்திகள்')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredNews.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                    <div className="flex items-center justify-center text-gray-400 dark:text-gray-500">
                      <span className="text-sm">
                        {t('news.imageComingSoon', 'Image Coming Soon', 'படம் விரைவில்')}
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                        {t('news.featured', 'Featured', 'சிறப்பு')}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {t(`news.${article.id}.title`, article.title, article.title_ta)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {t(`news.${article.id}.excerpt`, article.excerpt, article.excerpt_ta)}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {article.author}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(article.publishedAt)}
                        </div>
                        <div className="flex items-center">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          {article.views.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Link href={`/news/${article.id}`}>
                      <Button className="w-full">
                        {t('news.readMore', 'Read More', 'மேலும் படிக்க')}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Middle Banner Ad */}
        <ResponsiveAd className="mb-8" />

        {/* Regular News */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {selectedCategory === 'all'
              ? t('news.allNews', 'All News', 'அனைத்து செய்திகள்')
              : categories.find(cat => cat.id === selectedCategory)?.name
            }
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(selectedCategory === 'all' ? regularNews : filteredArticles.filter(a => !a.featured)).map((article) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                  <div className="flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <span className="text-sm">
                      {t('news.imageComingSoon', 'Image Coming Soon', 'படம் விரைவில்')}
                    </span>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(article.publishedAt)}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {t(`news.${article.id}.title`, article.title, article.title_ta)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {t(`news.${article.id}.excerpt`, article.excerpt, article.excerpt_ta)}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>{article.author}</span>
                    <div className="flex items-center">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      {article.views.toLocaleString()}
                    </div>
                  </div>
                  <Link href={`/news/${article.id}`}>
                    <Button size="sm" className="w-full">
                      {t('news.readMore', 'Read More', 'மேலும் படிக்க')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No results message */}
          {filteredArticles.length === 0 && newsArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
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
              <p className="text-gray-500 dark:text-gray-400">
                {t('news.noResults', 'No news articles found in this category', 'இந்த வகையில் செய்தி கட்டுரைகள் எதுவும் கிடைக்கவில்லை')}
              </p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function NewsPage() {
  return (
    <AppWrapper>
      <NewsPageContent />
    </AppWrapper>
  )
}
