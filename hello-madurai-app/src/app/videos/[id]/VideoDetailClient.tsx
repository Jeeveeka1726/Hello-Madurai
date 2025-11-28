'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import Card, { CardContent } from '@/components/ui/Card'

interface Video {
  id: string
  title: string
  title_ta?: string
  videoUrl: string
  videoType: string
  thumbnailUrl?: string
  category: string
  orderNumber: number
  duration?: string
  views: number
  likes: number
  dislikes: number
  featured: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}

interface VideoDetailClientProps {
  video: Video
}

export default function VideoDetailClient({ video }: VideoDetailClientProps) {
  const { language, t } = useLanguage()
  const router = useRouter()
  const [viewIncremented, setViewIncremented] = useState(false)

  const videoTitle = language === 'ta' && video.title_ta ? video.title_ta : video.title
  const isYouTube = video.videoType === 'youtube'

  // Get YouTube ID
  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  const youtubeId = isYouTube ? getYouTubeId(video.videoUrl) : null

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (youtubeId: string): string => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
  }

  // Increment view count
  useEffect(() => {
    if (!viewIncremented) {
      fetch(`/api/videos/${video.id}/view`, { method: 'POST' })
        .catch(error => console.error('Error incrementing view:', error))
      setViewIncremented(true)
    }
  }, [video.id, viewIncremented])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(language === 'ta' ? 'ta-IN' : 'en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Share functions
  const handleWhatsAppShare = async () => {
    const shareUrl = window.location.href
    const shareText = `${videoTitle} - Hello Madurai\n${shareUrl}`
    await fetch(`/api/videos/${video.id}/share`, { method: 'POST' }).catch(() => {})
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank')
  }

  const handleFacebookShare = async () => {
    const shareUrl = window.location.href
    await fetch(`/api/videos/${video.id}/share`, { method: 'POST' }).catch(() => {})
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const handleCopyLink = async () => {
    const shareUrl = window.location.href
    try {
      await navigator.clipboard.writeText(shareUrl)
      await fetch(`/api/videos/${video.id}/share`, { method: 'POST' }).catch(() => {})
      alert(language === 'ta' ? '✅ இணைப்பு நகலெடுக்கப்பட்டது!' : '✅ Link copied!')
    } catch (error) {
      console.error('Error copying link:', error)
      alert(language === 'ta' ? '❌ இணைப்பை நகலெடுக்க முடியவில்லை' : '❌ Failed to copy link')
    }
  }

  return (
    <div>
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      
      <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/videos')}
            className="mb-4 md:mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm md:text-base"
          >
            <ArrowLeftIcon className="h-5 w-5 md:h-6 md:w-6" />
            {language === 'ta' ? 'வீடியோக்களுக்கு திரும்பு' : 'Back to Videos'}
          </button>

          <Card className="overflow-hidden bg-white border-gray-200">
            {/* Video Player */}
            <div className="relative w-full overflow-hidden bg-black" style={{ paddingBottom: '56.25%', height: 0 }}>
              {isYouTube && youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                  title={videoTitle}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={video.videoUrl}
                  controls
                  className="absolute top-0 left-0 w-full h-full"
                  style={{ objectFit: 'contain' }}
                />
              )}
            </div>

            <CardContent className="p-4 sm:p-6 md:p-8">
              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-6">
                {videoTitle}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base text-gray-600 mb-6 md:mb-8">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <EyeIcon className="h-5 w-5 md:h-6 md:w-6" />
                  <span>{video.views.toLocaleString()} {language === 'ta' ? 'பார்வைகள்' : 'views'}</span>
                </div>
                {video.duration && (
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <ClockIcon className="h-5 w-5 md:h-6 md:w-6" />
                    <span>{video.duration}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 md:gap-2">
                  <span>{formatDate(video.publishedAt)}</span>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex gap-2 sm:gap-3 md:gap-4">
                <button
                  onClick={handleWhatsAppShare}
                  className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 active:scale-95 text-white font-medium py-3 md:py-4 px-4 md:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 md:gap-3 shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  <span className="text-sm md:text-base font-semibold">WhatsApp</span>
                </button>

                <button
                  onClick={handleFacebookShare}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white font-medium py-3 md:py-4 px-4 md:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 md:gap-3 shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="text-sm md:text-base font-semibold">Facebook</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 active:scale-95 text-white font-medium py-3 md:py-4 px-4 md:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 md:gap-3 shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm md:text-base font-semibold">{language === 'ta' ? 'நகல்' : 'Copy'}</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

