'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CalendarIcon, EyeIcon, UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { ArrowDownTrayIcon as DownloadIcon } from '@heroicons/react/24/outline'
import AppWrapper from '@/components/AppWrapper'
import NewspaperHeader from '@/components/NewspaperHeader'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import InteractionButtons from '@/components/InteractionButtons'
import CommentsSection from '@/components/news/CommentsSection'
import ContentWithAds from '@/components/news/ContentWithAds'
import { BannerAd, ResponsiveAd } from '@/components/ads/GoogleAdsense'

// Dynamic import ReactPlayer to avoid SSR issues with lazy loading
const ReactPlayer = dynamic(() => import('react-player'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
})

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
  const [videoLoaded, setVideoLoaded] = useState(false)

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

  // Intersection Observer for video lazy loading
  useEffect(() => {
    if (article?.videoUrl) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVideoLoaded(true)
              observer.disconnect()
            }
          })
        },
        { threshold: 0.1 }
      )

      const videoContainer = document.getElementById('video-ultimate-container')
      if (videoContainer) {
        observer.observe(videoContainer)
      }

      return () => observer.disconnect()
    }
  }, [article?.videoUrl])

  // Force video responsiveness with JavaScript
  useEffect(() => {
    const forceVideoResponsiveness = () => {
      const videoContainer = document.getElementById('video-ultimate-container')
      const videoPlayer = document.getElementById('video-ultimate-player')
      
      if (videoContainer && videoPlayer) {
        // Force container to be full width
        videoContainer.style.width = '100vw'
        videoContainer.style.maxWidth = '100vw'
        videoContainer.style.marginLeft = '-50vw'
        videoContainer.style.marginRight = '-50vw'
        videoContainer.style.left = '50%'
        videoContainer.style.right = '50%'
        
        // Calculate responsive height
        const viewportWidth = window.innerWidth
        let height = '56.25vw'
        
        if (viewportWidth <= 360) {
          height = '35vh'
        } else if (viewportWidth <= 480) {
          height = '40vh'
        } else if (viewportWidth <= 768) {
          height = '50vh'
        }
        
        videoContainer.style.height = height
        videoContainer.style.maxHeight = height
        
        // Force player to fill container
        videoPlayer.style.width = '100%'
        videoPlayer.style.height = '100%'
        videoPlayer.style.maxWidth = '100%'
        videoPlayer.style.maxHeight = '100%'
        
        // Force all iframes to be responsive
        const iframes = videoPlayer.querySelectorAll('iframe')
        iframes.forEach(iframe => {
          iframe.style.width = '100%'
          iframe.style.height = '100%'
          iframe.style.maxWidth = '100%'
          iframe.style.maxHeight = '100%'
          iframe.style.position = 'absolute'
          iframe.style.top = '0'
          iframe.style.left = '0'
        })
        
        // Force all images (thumbnails) to fill completely
        const images = videoPlayer.querySelectorAll('img')
        images.forEach(img => {
          img.style.width = '100%'
          img.style.height = '100%'
          img.style.maxWidth = '100%'
          img.style.maxHeight = '100%'
          img.style.objectFit = 'cover'
          img.style.position = 'absolute'
          img.style.top = '0'
          img.style.left = '0'
        })
        
        // Force all divs to fill completely
        const divs = videoPlayer.querySelectorAll('div')
        divs.forEach(div => {
          div.style.width = '100%'
          div.style.height = '100%'
          div.style.maxWidth = '100%'
          div.style.maxHeight = '100%'
          div.style.objectFit = 'cover'
          div.style.position = 'absolute'
          div.style.top = '0'
          div.style.left = '0'
        })
        
        // Force all video elements to fill completely
        const videos = videoPlayer.querySelectorAll('video')
        videos.forEach(video => {
          video.style.width = '100%'
          video.style.height = '100%'
          video.style.maxWidth = '100%'
          video.style.maxHeight = '100%'
          video.style.objectFit = 'cover'
          video.style.position = 'absolute'
          video.style.top = '0'
          video.style.left = '0'
        })
        
        // Force all elements with video/player classes
        const videoElements = videoPlayer.querySelectorAll('[class*="video"], [class*="player"], [class*="preview"]')
        videoElements.forEach(element => {
          element.style.width = '100%'
          element.style.height = '100%'
          element.style.maxWidth = '100%'
          element.style.maxHeight = '100%'
          element.style.objectFit = 'cover'
          element.style.position = 'absolute'
          element.style.top = '0'
          element.style.left = '0'
        })
      }
    }

    // Run on mount and resize
    forceVideoResponsiveness()
    window.addEventListener('resize', forceVideoResponsiveness)
    
    // Run after video loads
    if (videoLoaded) {
      setTimeout(forceVideoResponsiveness, 100)
    }

    return () => {
      window.removeEventListener('resize', forceVideoResponsiveness)
    }
  }, [videoLoaded, article?.videoUrl])

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
    <div className="min-h-screen bg-gray-50 dark:bg-blue-950 py-4 sm:py-8">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link href="/news">
            <Button variant="outline" className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 touch-target">
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              {t('news.backToNews', 'Back to News', 'செய்திகளுக்கு திரும்பு')}
            </Button>
          </Link>
        </div>

        {/* Article Layout with External Sidebar Ads */}
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
          {/* Left Sidebar Ad - Outside Article */}
          <div className="hidden xl:block w-40 flex-shrink-0">
            <div className="sticky top-4">
              <ResponsiveAd />
            </div>
          </div>

          {/* Article Card */}
          <div className="flex-1 w-full">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              {/* Featured Image or Video */}
              {article.videoUrl ? (
                <>
                  {/* ULTIMATE NUCLEAR CSS - VIEWPORT UNITS */}
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      /* RESET EVERYTHING */
                      * {
                        box-sizing: border-box !important;
                      }
                      
                      /* VIDEO CONTAINER - VIEWPORT UNITS */
                      #video-ultimate-container {
                        position: relative !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        height: 0 !important;
                        padding-bottom: 56.25% !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                      }
                      
                      /* LAPTOP VIEW - FIX CUTTING ISSUE */
                      @media (min-width: 1024px) {
                        #video-ultimate-container {
                          width: 100% !important;
                          max-width: 100% !important;
                          height: 0 !important;
                          padding-bottom: 56.25% !important;
                          margin: 0 !important;
                          left: 0 !important;
                          right: 0 !important;
                          margin-left: 0 !important;
                          margin-right: 0 !important;
                        }
                      }
                      
                      /* VIDEO PLAYER WRAPPER */
                      #video-ultimate-player {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                      }
                      
                      /* REACT PLAYER */
                      #video-ultimate-player > div {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                        object-fit: cover !important;
                      }
                      
                      /* VIDEO THUMBNAIL/COVER */
                      #video-ultimate-player > div > div {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                        object-fit: cover !important;
                      }
                      
                      /* VIDEO THUMBNAIL IMAGE */
                      #video-ultimate-player img,
                      #video-ultimate-player > div img,
                      #video-ultimate-player > div > div img {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        object-fit: cover !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                      }
                      
                      /* IFRAME OVERRIDE */
                      #video-ultimate-player iframe,
                      #video-ultimate-player > div iframe {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                        border: none !important;
                      }
                      
                      /* MOBILE OVERRIDES */
                      @media (max-width: 768px) {
                        #video-ultimate-container {
                          width: 100vw !important;
                          max-width: 100vw !important;
                          height: 50vh !important;
                          max-height: 50vh !important;
                          margin-left: -50vw !important;
                          margin-right: -50vw !important;
                          left: 50% !important;
                          right: 50% !important;
                        }
                      }
                      
                      @media (max-width: 480px) {
                        #video-ultimate-container {
                          width: 100vw !important;
                          max-width: 100vw !important;
                          height: 40vh !important;
                          max-height: 40vh !important;
                          margin-left: -50vw !important;
                          margin-right: -50vw !important;
                          left: 50% !important;
                          right: 50% !important;
                        }
                      }
                      
                      /* EXTRA SMALL MOBILE */
                      @media (max-width: 360px) {
                        #video-ultimate-container {
                          width: 100vw !important;
                          max-width: 100vw !important;
                          height: 35vh !important;
                          max-height: 35vh !important;
                          margin-left: -50vw !important;
                          margin-right: -50vw !important;
                          left: 50% !important;
                          right: 50% !important;
                        }
                      }
                      
                      /* FORCE ALL ELEMENTS TO BEHAVE */
                      #video-ultimate-container *,
                      #video-ultimate-player *,
                      #video-ultimate-player > div *,
                      #video-ultimate-player iframe,
                      #video-ultimate-player > div iframe {
                        max-width: 100% !important;
                        max-height: 100% !important;
                        overflow: hidden !important;
                        box-sizing: border-box !important;
                        transform: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                      }
                      
                      /* VIDEO THUMBNAIL FULL COVERAGE */
                      #video-ultimate-player .react-player__preview,
                      #video-ultimate-player .react-player__shadow,
                      #video-ultimate-player .react-player__poster {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        object-fit: cover !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                      }
                      
                      /* YOUTUBE THUMBNAIL OVERRIDE */
                      #video-ultimate-player .ytp-cued-thumbnail-overlay,
                      #video-ultimate-player .ytp-thumbnail-overlay {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        object-fit: cover !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                      }
                      
                      /* FORCE VIDEO TO FILL CONTAINER */
                      #video-ultimate-player video,
                      #video-ultimate-player > div video,
                      #video-ultimate-player .react-player__preview video {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        object-fit: cover !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                      }
                      
                      /* FORCE ALL VIDEO ELEMENTS */
                      #video-ultimate-player [class*="video"],
                      #video-ultimate-player [class*="player"],
                      #video-ultimate-player [class*="preview"] {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        max-width: 100% !important;
                        max-height: 100% !important;
                        object-fit: cover !important;
                        overflow: hidden !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        transform: none !important;
                        box-sizing: border-box !important;
                      }
                    `
                  }} />
                  
                  <div 
                    id="video-ultimate-container" 
                    className="bg-black rounded-t-xl relative w-full"
                    style={{
                      aspectRatio: '16/9',
                      width: '100%',
                      height: 'auto'
                    }}
                  >
                    {videoLoaded ? (
                      <div id="video-ultimate-player">
                  <ReactPlayer
                    url={article.videoUrl}
                    width="100%"
                    height="100%"
                    controls={true}
                    playing={false}
                    playsinline={true}
                    light={false}
                    pip={false}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%'
                    }}
                    config={{
                      youtube: {
                        playerVars: { 
                          rel: 0,
                          modestbranding: 1,
                                fs: 1,
                                cc_load_policy: 0,
                                iv_load_policy: 3,
                                autohide: 0,
                                autoplay: 0,
                                controls: 1,
                                disablekb: 0,
                                enablejsapi: 1,
                                end: 0,
                                hl: 'en',
                                loop: 0,
                                modestbranding: 1,
                                origin: typeof window !== 'undefined' ? window.location.origin : '',
                                playlist: '',
                                playsinline: 1,
                                start: 0
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
                    ) : (
                      <div 
                        className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading video...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
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

              <CardContent className="p-4 sm:p-6 lg:p-8">
                {/* Article Header */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 w-fit">
                      {article.category}
                    </span>
                    {article.allowDownload && (
                      <Button variant="outline" onClick={handleDownload} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 touch-target w-full sm:w-auto">
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        {t('news.download', 'Download', 'பதிவிறக்கம்')}
                      </Button>
                    )}
                  </div>
                  
                  
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
                    {t(`news.${article.id}.title`, article.title, article.title_ta)}
                  </h1>
                  
                  <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed">
                    {t(`news.${article.id}.excerpt`, article.excerpt, article.excerpt_ta)}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-2" />
                      <span className="truncate">{article.author}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      <span className="truncate">{formatDate(article.publishedAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <EyeIcon className="h-4 w-4 mr-2" />
                      <span className="truncate">{article.views.toLocaleString()} {t('news.views', 'views', 'பார்வைகள்')}</span>
                    </div>
                  </div>
                </div>

                {/* Article Content with Auto-Inserted Ads */}
                <div className="mb-8">
                  <ContentWithAds 
                    content={t(`news.${article.id}.content`, article.content, article.content_ta)}
                    newsId={article.id}
                  />
                </div>

                {/* Interaction Buttons */}
                <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
                  <InteractionButtons
                    itemId={article.id}
                    itemType="news"
                    title={article.title}
                    url={typeof window !== 'undefined' ? window.location.href : ''}
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

            {/* Ad Space Below Comments */}
            <div className="mt-6 sm:mt-8">
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
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
            {t('news.relatedArticles', 'Related Articles', 'தொடர்புடைய கட்டுரைகள்')}
          </h2>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
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
      </div>
    </div>
  )
}

export default function NewsDetailPage() {
  return (
    <div>
      <NewspaperHeader />
    <AppWrapper>
      <NewsDetailPageContent />
    </AppWrapper>
    </div>
  )
}
