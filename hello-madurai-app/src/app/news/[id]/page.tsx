'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarIcon, EyeIcon, UserIcon, ArrowLeftIcon, DownloadIcon } from '@heroicons/react/24/outline'
import AppWrapper from '@/components/AppWrapper'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import InteractionButtons from '@/components/InteractionButtons'
import Comments from '@/components/Comments'
import { BannerAd, ResponsiveAd } from '@/components/ads/GoogleAdsense'

// Dynamic import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false })

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
  likes: number
  dislikes: number
  featured: boolean
  featuredImage?: string
  videoUrl?: string
  videoType?: string
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
  const { t } = useLanguage()
  const newsId = params.id as string
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [showComments, setShowComments] = useState(false)

  // Fetch article and related articles from database
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Fetch specific article
        const articleResponse = await fetch(`/api/admin/news/${newsId}`)
        if (articleResponse.ok) {
          const articleData = await articleResponse.json()
          setArticle(articleData)

          // Increment view count
          await fetch(`/api/admin/news/${newsId}/view`, { method: 'POST' })

          // Fetch all articles for related articles
          const allResponse = await fetch('/api/admin/news')
          if (allResponse.ok) {
            const allData = await allResponse.json()
            // Filter out current article and get related ones
            const related = allData
              .filter((a: NewsArticle) => a.id !== newsId)
              .slice(0, 2)
            setRelatedArticles(related)
          }
        }
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }

    if (newsId) {
      fetchArticle()
    }
  }, [newsId])

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
      <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              {t('news.loading', 'Loading article...', 'கட்டுரை ஏற்றப்படுகிறது...')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Card className="text-center py-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {t('news.notFound', 'Article Not Found', 'கட்டுரை கிடைக்கவில்லை')}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/news">
            <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('news.backToNews', 'Back to News', 'செய்திகளுக்கு திரும்பு')}
            </Button>
          </Link>
        </div>

        {/* Article Layout with External Sidebar Ads */}
        <div className="flex gap-6">
          {/* Left Sidebar Ad - Outside Article */}
          <div className="hidden xl:block w-40 flex-shrink-0">
            <div className="sticky top-4">
              <ResponsiveAd />
            </div>
          </div>

          {/* Article Card */}
          <div className="flex-1">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {/* Featured Image or Video */}
              {article.videoUrl ? (
                <div className="bg-black" style={{ aspectRatio: '16/9' }}>
                  <ReactPlayer
                    url={article.videoUrl}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false}
                    playsinline={true}
                    style={{ backgroundColor: '#000' }}
                    config={{
                      youtube: {
                        playerVars: { 
                          rel: 0,
                          modestbranding: 1,
                          fs: 1
                        }
                      }
                    }}
                    onReady={() => {
                      console.log('✅ News video ready:', article.title)
                    }}
                    onError={(error) => {
                      console.error('❌ News video error:', error)
                    }}
                  />
                </div>
              ) : article.featuredImage ? (
                <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                  <img
                    src={article.featuredImage}
                    alt={t(`news.${article.id}.title`, article.title, article.title_ta)}
                    className="w-full h-full object-cover"
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              ) : (
                <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                  <div className="flex items-center justify-center">
                    <span className="text-gray-400 dark:text-gray-500">
                      {t('news.imageComingSoon', 'Featured Image Coming Soon', 'சிறப்பு படம் விரைவில்')}
                    </span>
                  </div>
                </div>
              )}

              <CardContent className="p-8">
                {/* Article Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                      {article.category}
                    </span>
                    {article.allowDownload && (
                      <Button variant="outline" onClick={handleDownload} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        {t('news.download', 'Download', 'பதிவிறக்கம்')}
                      </Button>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {t(`news.${article.id}.title`, article.title, article.title_ta)}
                  </h1>
                  
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                    {t(`news.${article.id}.excerpt`, article.excerpt, article.excerpt_ta)}
                  </p>

                  <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      {article.author}
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {formatDate(article.publishedAt)}
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      {article.views.toLocaleString()} {t('news.views', 'views', 'பார்வைகள்')}
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert news-content mb-8">
                  <div 
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: t(`news.${article.id}.content`, article.content, article.content_ta)
                    }}
                  />
                </div>

                {/* Interaction Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <InteractionButtons
                    itemId={article.id}
                    itemType="news"
                    title={article.title}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
                    likes={article.likes}
                    dislikes={article.dislikes}
                    comments={article.comments?.length || 0}
                    shares={article.shares?.length || 0}
                    onComment={() => setShowComments(true)}
                    className="mb-6"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Ad Space Below Article */}
            <div className="mt-6">
              <BannerAd />
            </div>
          </div>

          {/* Right Sidebar Ad - Outside Article */}
          <div className="hidden xl:block w-40 flex-shrink-0">
            <div className="sticky top-4">
              <ResponsiveAd />
            </div>
          </div>
        </div>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('news.relatedArticles', 'Related Articles', 'தொடர்புடைய கட்டுரைகள்')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedArticles.map((relatedArticle) => (
                <Link key={relatedArticle.id} href={`/news/${relatedArticle.id}`}>
                  <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    {relatedArticle.featuredImage ? (
                      <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                        <img
                          src={relatedArticle.featuredImage}
                          alt={t(`news.${relatedArticle.id}.title`, relatedArticle.title, relatedArticle.title_ta)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                        <div className="flex items-center justify-center">
                          <span className="text-sm text-gray-400 dark:text-gray-500">
                            {t('news.imageComingSoon', 'Image Coming Soon', 'படம் விரைவில்')}
                          </span>
                        </div>
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {t(`news.${relatedArticle.id}.title`, relatedArticle.title, relatedArticle.title_ta)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                        {t(`news.${relatedArticle.id}.excerpt`, relatedArticle.excerpt, relatedArticle.excerpt_ta)}
                      </p>
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{formatDate(relatedArticle.publishedAt)}</span>
                        <span>{relatedArticle.views.toLocaleString()} {t('news.views', 'views', 'பார்வைகள்')}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </div>

        {/* Comments Modal */}
        <Comments
          itemId={article.id}
          itemType="news"
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      </div>
    </div>
  )
}

export default function NewsDetailPage() {
  return (
    <AppWrapper>
      <NewsDetailPageContent />
    </AppWrapper>
  )
}
