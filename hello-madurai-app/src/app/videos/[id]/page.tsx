'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon, EyeIcon, ClockIcon, ShareIcon } from '@heroicons/react/24/outline'
import AppWrapper from '@/components/AppWrapper'
import NewspaperHeader from '@/components/NewspaperHeader'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface Video {
  id: string
  title: string
  title_ta?: string
  videoUrl: string
  videoType: string
  thumbnailUrl?: string
  category: string
  duration?: string
  views: number
  publishedAt: string
  featured: boolean
}

// Video helper functions
const getYouTubeId = (url: string): string | null => {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) return match[1]
  }
  return null
}

const getArchiveEmbedUrl = (url: string): string | null => {
  if (!url) return null
  try {
    const match = url.match(/archive\.org\/details\/([^\/\?]+)/)
    if (match && match[1]) {
      return `https://archive.org/embed/${match[1]}`
    }
  } catch (error) {
    console.error('Error extracting Archive.org ID:', error)
  }
  return null
}

const getDriveEmbedUrl = (url: string): string | null => {
  if (!url) return null
  try {
    let fileId: string | null = null
    if (url.includes('/file/d/')) {
      const match = url.match(/\/file\/d\/([^\/\?]+)/)
      if (match && match[1]) fileId = match[1]
    } else if (url.includes('id=')) {
      const match = url.match(/[?&]id=([^&]+)/)
      if (match && match[1]) fileId = match[1]
    }
    if (fileId) {
      return `https://drive.google.com/file/d/${fileId}/preview`
    }
  } catch (error) {
    console.error('Error extracting Drive ID:', error)
  }
  return null
}

function VideoDetailPageContent() {
  const params = useParams()
  const router = useRouter()
  const { language } = useLanguage()
  const videoId = params.id as string
  const [video, setVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await fetch(`/api/videos`)
        if (response.ok) {
          const videos = await response.json()
          const foundVideo = videos.find((v: Video) => v.id === videoId)
          if (foundVideo) {
            setVideo(foundVideo)
            // Increment view count
            await fetch(`/api/videos/${videoId}/view`, { method: 'POST' })
          }
        }
      } catch (error) {
        console.error('Error fetching video:', error)
      } finally {
        setLoading(false)
      }
    }

    if (videoId) {
      fetchVideo()
    }
  }, [videoId])

  const handleShare = async () => {
    const shareUrl = window.location.href
    try {
      // Try native share first (mobile)
      if (navigator.share) {
        await navigator.share({
          title: videoTitle,
          text: `Watch ${videoTitle} on Hello Madurai`,
          url: shareUrl,
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareUrl)
        alert(language === 'ta' ? '✅ இணைப்பு நகலெடுக்கப்பட்டது!' : '✅ Link copied!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <AppWrapper>
        <NewspaperHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="aspect-video bg-gray-300 rounded"></div>
          </div>
        </div>
      </AppWrapper>
    )
  }

  if (!video) {
    return (
      <AppWrapper>
        <NewspaperHeader />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">
            {language === 'ta' ? 'வீடியோ கிடைக்கவில்லை' : 'Video not found'}
          </h1>
          <Button onClick={() => router.push('/videos')}>
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {language === 'ta' ? 'வீடியோக்களுக்குத் திரும்பு' : 'Back to Videos'}
          </Button>
        </div>
      </AppWrapper>
    )
  }

  const videoTitle = language === 'ta' && video.title_ta ? video.title_ta : video.title
  const isYouTube = video.videoType === 'youtube'
  const isArchive = video.videoType === 'archive'
  const isDrive = video.videoType === 'drive'
  const youtubeId = isYouTube ? getYouTubeId(video.videoUrl) : null
  const archiveEmbedUrl = isArchive ? getArchiveEmbedUrl(video.videoUrl) : null
  const driveEmbedUrl = isDrive ? getDriveEmbedUrl(video.videoUrl) : null

  // Get thumbnail URL
  const getThumbnailUrl = (): string => {
    if (video.thumbnailUrl) return video.thumbnailUrl
    if (isYouTube && youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    }
    return ''
  }

  const handlePlayClick = () => {
    setIsPlaying(true)
  }

  return (
    <AppWrapper>
      <NewspaperHeader />
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        {/* Back Button */}
        <Link href="/videos">
          <Button variant="outline" className="mb-4">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            {language === 'ta' ? 'வீடியோக்களுக்குத் திரும்பு' : 'Back to Videos'}
          </Button>
        </Link>

        {/* Video Player Card */}
        <Card className="mb-6">
          <CardContent className="p-0">
            {/* Video Player */}
            <div className="relative w-full aspect-video bg-black">
              {isPlaying ? (
                // Show video player after clicking play
                <>
                  {isYouTube && youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                      title={videoTitle}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : isArchive && archiveEmbedUrl ? (
                    <iframe
                      src={archiveEmbedUrl}
                      title={videoTitle}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="fullscreen"
                      allowFullScreen
                    />
                  ) : isDrive && driveEmbedUrl ? (
                    <iframe
                      src={driveEmbedUrl}
                      title={videoTitle}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white">
                      {language === 'ta' ? 'வீடியோ கிடைக்கவில்லை' : 'Video not available'}
                    </div>
                  )}
                </>
              ) : (
                // Show thumbnail with YouTube-style play button
                <div
                  className="absolute inset-0 cursor-pointer group"
                  onClick={handlePlayClick}
                >
                  {/* Thumbnail Image */}
                  <img
                    src={getThumbnailUrl()}
                    alt={videoTitle}
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* YouTube-style Play Button - Hidden by default, shows on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    {/* Dark transparent overlay */}
                    <div className="absolute inset-0 bg-black opacity-30"></div>
                    {/* Play button */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-black bg-opacity-60 rounded-full flex items-center justify-center backdrop-blur-sm border-3 sm:border-4 border-white border-opacity-80 shadow-2xl">
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white ml-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Duration Badge (if available) */}
                  {video.duration && (
                    <div className="absolute bottom-3 right-3 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs sm:text-sm font-semibold">
                      {video.duration}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video Info */}
            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {videoTitle}
              </h1>

              {/* Stats & Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <EyeIcon className="h-5 w-5 mr-1" />
                  <span>{video.views} {language === 'ta' ? 'பார்வைகள்' : 'views'}</span>
                </div>
                {video.duration && (
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-1" />
                    <span>{video.duration}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs font-medium">
                    {video.category}
                  </span>
                </div>
              </div>

              {/* Share Button */}
              <Button onClick={handleShare} className="flex items-center">
                <ShareIcon className="h-5 w-5 mr-2" />
                {language === 'ta' ? 'பகிர்' : 'Share'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppWrapper>
  )
}

export default function VideoDetailPage() {
  return <VideoDetailPageContent />
}
