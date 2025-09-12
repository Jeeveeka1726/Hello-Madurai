'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarIcon, EyeIcon, UserIcon, ArrowLeftIcon, ShareIcon } from '@heroicons/react/24/outline'
import AppWrapper from '@/components/AppWrapper'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardContent } from '@/components/ui/Card'
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
}

function NewsDetailPageContent() {
  const params = useParams()
  const { t } = useLanguage()
  const newsId = params.id as string
  const [article, setArticle] = useState<NewsArticle | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch article and related articles from database
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // Fetch specific article
        const articleResponse = await fetch(`/api/admin/news/${newsId}`)
        if (articleResponse.ok) {
          const articleData = await articleResponse.json()
          setArticle(articleData)

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



  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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
      <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t(`news.${article.id}.title`, article.title, article.title_ta),
        text: t(`news.${article.id}.excerpt`, article.excerpt, article.excerpt_ta),
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert(t('news.linkCopied', 'Link copied to clipboard!', 'இணைப்பு கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!'))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/news">
            <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('news.backToNews', 'Back to News', 'செய்திகளுக்கு திரும்பு')}
            </Button>
          </Link>
        </div>

        {/* Article */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          {/* Featured Image Placeholder */}
          <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
            <div className="flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">
                {t('news.imageComingSoon', 'Featured Image Coming Soon', 'சிறப்பு படம் விரைவில்')}
              </span>
            </div>
          </div>

          <CardContent className="p-8">
            {/* Article Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                  {article.category}
                </span>
                <Button variant="outline" onClick={handleShare} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  {t('news.share', 'Share', 'பகிர்')}
                </Button>
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
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {t(`news.${article.id}.content`, article.content, article.content_ta)}
              </div>
            </div>

            {/* Article Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {t('news.publishedOn', 'Published on', 'வெளியிடப்பட்ட தேதி')} {formatDate(article.publishedAt)}
                </div>
                <Button onClick={handleShare} className="bg-primary-600 hover:bg-primary-700 text-white">
                  <ShareIcon className="h-4 w-4 mr-2" />
                  {t('news.shareArticle', 'Share Article', 'கட்டுரையைப் பகிர்')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('news.relatedArticles', 'Related Articles', 'தொடர்புடைய கட்டுரைகள்')}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {relatedArticles.map((relatedArticle) => (
                <Link key={relatedArticle.id} href={`/news/${relatedArticle.id}`}>
                  <Card className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200 dark:bg-gray-700">
                      <div className="flex items-center justify-center">
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          {t('news.imageComingSoon', 'Image Coming Soon', 'படம் விரைவில்')}
                        </span>
                      </div>
                    </div>
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
