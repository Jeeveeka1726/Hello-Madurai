import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import VideoDetailClient from './VideoDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const video = await prisma.video.findUnique({
      where: { id }
    })

    if (!video) {
      return {
        title: 'Video Not Found',
      }
    }

    // Prefer Tamil content for social sharing
    const title = video.title_ta || video.title

    // Get thumbnail URL
    let thumbnailUrl = video.thumbnailUrl || ''
    
    // If YouTube video, use YouTube thumbnail
    if (video.videoType === 'youtube' && video.videoUrl) {
      const youtubeId = video.videoUrl.split('v=')[1]?.split('&')[0] || video.videoUrl.split('/').pop() || ''
      if (youtubeId) {
        thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
      }
    }

    // Ensure absolute URL for thumbnail
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hellomadurai.vercel.app'
    const absoluteThumbnailUrl = thumbnailUrl.startsWith('http') 
      ? thumbnailUrl 
      : `${baseUrl}${thumbnailUrl}`

    const description = `Watch ${title} on Hello Madurai`

    console.log('Video Metadata - Title:', title)
    console.log('Video Metadata - Thumbnail URL:', absoluteThumbnailUrl)

    return {
      title: `${title} - Hello Madurai`,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: absoluteThumbnailUrl,
            width: 1280,
            height: 720,
            alt: title,
          }
        ],
        type: 'video.other',
        siteName: 'Hello Madurai',
        url: `${baseUrl}/videos/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [absoluteThumbnailUrl],
      },
    }
  } catch (error) {
    console.error('Error generating video metadata:', error)
    return {
      title: 'Video | Hello Madurai',
    }
  }
}

export default async function VideoDetailPage({ params }: Props) {
  const { id } = await params

  try {
    const video = await prisma.video.findUnique({
      where: { id }
    })

    if (!video) {
      notFound()
    }

    // Convert dates to strings for client component
    const videoData = {
      ...video,
      publishedAt: video.publishedAt.toISOString(),
      createdAt: video.createdAt.toISOString(),
      updatedAt: video.updatedAt.toISOString(),
    }

    return <VideoDetailClient video={videoData} />
  } catch (error) {
    console.error('Error fetching video:', error)
    notFound()
  }
}

