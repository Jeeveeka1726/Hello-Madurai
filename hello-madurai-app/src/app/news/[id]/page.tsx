'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarIcon, EyeIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ArrowDownTrayIcon as DownloadIcon } from '@heroicons/react/24/outline'
import AppWrapper from '@/components/AppWrapper'
import NewspaperHeader from '@/components/NewspaperHeader'
import CategoryNavigation from '@/components/CategoryNavigation'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import InteractionButtons from '@/components/InteractionButtons'
import CommentsSection from '@/components/news/CommentsSection'
import ContentWithAds from '@/components/news/ContentWithAds'
import NewsStructuredData from '@/components/seo/NewsStructuredData'
// Using featured images only

// Video functionality removed - using featured images only

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
  likes: number
  dislikes: number
  featured: boolean
  featuredImage?: string
  allowDownload: boolean
  comments: Comment[]
  shares: Share[]
}

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
}

interface Share {
  id: string
  platform: string
  createdAt: string
}

function NewsDetailPageContent() {
  const params = useParams()
  const { t, language } = useLanguage()
  const idOrSlug = params.id as string
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([])
  const [ads, setAds] = useState<any[]>([]) // Pre-fetched ads
  const [loading, setLoading] = useState(true)
  // Using featured images only

  // Fetch article, related articles, and ads in parallel - OPTIMIZED
  // Now supports both ID and slug-based URLs for SEO
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Detect if the parameter is a slug (contains hyphen) or an ID (alphanumeric only)
        const isSlug = idOrSlug.includes('-')
        const apiUrl = isSlug ? `/api/news/slug/${idOrSlug}` : `/api/news/${idOrSlug}`

        // Fetch article, related articles, AND ads in parallel (much faster!)
        const [articleResponse, relatedResponse, adsResponse] = await Promise.all([
          fetch(apiUrl, { next: { revalidate: 60 } }), // Cache for 1 minute
          fetch(`/api/news?limit=20`, { next: { revalidate: 60 } }), // Fetch limited news for related
          fetch('/api/ads/active?category=news', { cache: 'force-cache', next: { revalidate: 180 } }) // Pre-fetch ads
        ])

        if (articleResponse.ok) {
          const articleData = await articleResponse.json()
          setArticle(articleData)

          // Increment view count in background (don't wait) - always use ID for this
          const newsId = articleData.id
          fetch(`/api/news/${newsId}/view`, { method: 'POST' }).catch(() => {})

          // Get related articles from the parallel fetch
          if (relatedResponse.ok) {
            const allData = await relatedResponse.json()
            // Filter articles by same category, exclude current article, and get 4 related ones
            const related = allData
              .filter((a: NewsArticle) =>
                a.id !== newsId &&
                a.category === articleData.category
              )
              .slice(0, 4)
            setRelatedArticles(related)
          }

          // Get ads from the parallel fetch
          if (adsResponse.ok) {
            const adsData = await adsResponse.json()
            console.log('📢 Pre-fetched ads on page load:', adsData.length)
            setAds(adsData)
          }
        }
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }

    if (idOrSlug) {
      fetchArticle()
    }
  }, [idOrSlug])

  // Using featured images only

  const handleDownload = async () => {
    if (!article) return
    
    try {
      const response = await fetch(`/api/news/${article.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${article.title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading article:', error)
    }
  }



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600" suppressHydrationWarning>
              {t('news.loading', 'Loading article...', 'கட்டுரை ஏற்றப்படுகிறது...')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12 bg-white border-gray-200">
            <CardContent>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {t('news.notFound', 'Article Not Found', 'கட்டுரை கிடைக்கவில்லை')}
              </h1>
              <p className="text-gray-600 mb-6">
                {t('news.notFoundDesc', 'The article you are looking for does not exist or has been removed.', 'நீங்கள் தேடும் கட்டுரை இல்லை அல்லது அகற்றப்பட்டுள்ளது.')}
              </p>
              <Link href="/news">
                <Button>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  {t('news.backToNews', 'Back to News', 'செய்திகளுக்கு திரும்பு')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    const dateStr = date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const timeStr = date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return `${dateStr} at ${timeStr}`
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      {/* SEO: Structured Data for News Article */}
      {article && <NewsStructuredData article={article} />}

      <div className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link href="/news">
            <Button variant="outline" className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 touch-target">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('news.backToNews', 'Back to News', 'செய்திகளுக்கு திரும்பு')}
            </Button>
          </Link>
        </div>

        {/* Article Layout */}
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
          {/* Article Card */}
          <div className="flex-1 w-full max-w-4xl mx-auto">
            <Card className="bg-white border-gray-200">
              <CardContent className="p-4 sm:p-6 lg:p-8 select-none" style={{
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none',
                userSelect: 'none'
              }}>
                {/* Article Header - Above Image */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 w-fit">
                      {article.category}
                    </span>
                    {article.allowDownload && (
                      <Button variant="outline" onClick={handleDownload} className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50 touch-target w-full sm:w-auto">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        {t('news.download', 'Download', 'பதிவிறக்கம்')}
                      </Button>
                    )}
                  </div>

                  {/* Title - H3 size */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight" suppressHydrationWarning>
                    {language === 'ta' && article.title_ta ? article.title_ta : article.title}
                  </h1>

                  {/* Excerpt - Only show if exists */}
                  {article.excerpt && (
                    <p className="text-base sm:text-lg text-gray-600 mb-4 leading-relaxed" suppressHydrationWarning>
                      {language === 'ta' && article.excerpt_ta ? article.excerpt_ta : article.excerpt}
                    </p>
                  )}
                </div>

                {/* Featured Image - Below Title */}
                {article.featuredImage ? (
                  <div className="overflow-hidden rounded-lg mb-4">
                    <img
                      src={article.featuredImage}
                      alt={language === 'ta' && article.title_ta ? article.title_ta : article.title}
                      className="w-full h-auto object-cover rounded-lg news-featured-image"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                    />
                  </div>
                ) : (
                  <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg mb-4">
                    <div className="flex items-center justify-center">
                      <span className="text-gray-400" suppressHydrationWarning>
                        {language === 'ta' ? 'சிறப்பு படம் விரைவில்' : 'Featured Image Coming Soon'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Metadata - Below Image: Author, Date, Views */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-2" />
                    {article.authorSlug ? (
                      <Link
                        href={`/reporters/${article.authorSlug}`}
                        className="truncate hover:text-blue-600 hover:underline transition-colors"
                      >
                        {article.author}
                      </Link>
                    ) : (
                      <span className="truncate">{article.author}</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    <span className="truncate">{formatDateTime(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <EyeIcon className="h-4 w-4 mr-2" />
                    <span className="truncate">{article.views.toLocaleString()} {t('news.views', 'views', 'பார்வைகள்')}</span>
                  </div>
                </div>

                {/* Article Content with Auto-Inserted Ads */}
                <div className="mb-8">
                  <ContentWithAds
                    content={language === 'ta' && article.content_ta ? article.content_ta : article.content}
                    newsId={article.id}
                    initialAds={ads}
                    language={language}
                  />
                </div>

                {/* Interaction Buttons */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                  <InteractionButtons
                    itemId={article.id}
                    itemType="news"
                    title={language === 'ta' && article.title_ta ? article.title_ta : article.title}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                    imageUrl={article.featuredImage}
                    likes={article.likes}
                    dislikes={article.dislikes}
                    comments={article.comments?.length || 0}
                    shares={article.shares?.length || 0}
                    className="mb-4 sm:mb-6"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Comments Section - Inline below article */}
            <div className="mt-6 sm:mt-8">
              <CommentsSection newsId={article.id} />
            </div>
          </div>
        </div>

        {/* Related News - 2x2 Grid */}
        {relatedArticles.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              {t('news.relatedNews', 'Related News', 'தொடர்புடைய செய்திகள்')}
            </h2>
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2">
              {relatedArticles.map((relatedArticle) => (
                  <Link key={relatedArticle.id} href={`/news/${relatedArticle.slug || relatedArticle.id}`}>
                    <Card className="hover:shadow-lg transition-shadow bg-white border-gray-200 h-full">
                      {relatedArticle.featuredImage ? (
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                          <img
                            src={relatedArticle.featuredImage}
                            alt={t(`news.${relatedArticle.id}.title`, relatedArticle.title, relatedArticle.title_ta)}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : (
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                          <div className="flex items-center justify-center">
                            <span className="text-sm text-gray-400">
                              {t('news.imageComingSoon', 'Image Coming Soon', 'படம் விரைவில்')}
                            </span>
                          </div>
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2">
                          {t(`news.${relatedArticle.id}.title`, relatedArticle.title, relatedArticle.title_ta)}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {t(`news.${relatedArticle.id}.excerpt`, relatedArticle.excerpt, relatedArticle.excerpt_ta)}
                        </p>
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                          <span>{formatDate(relatedArticle.publishedAt)}</span>
                          <span>{relatedArticle.views.toLocaleString()} {t('news.views', 'views', 'பார்வைகள்')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function NewsDetailPage() {
  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <CategoryNavigation />
    <AppWrapper showFooter={false}>
      <NewsDetailPageContent />
    </AppWrapper>
    </div>
  )
}
