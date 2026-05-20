import { Metadata } from 'next'
import prisma from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

// Helper function to get YouTube thumbnail
const getYouTubeThumbnail = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`
    }
  }
  return null
}

// Helper function to get Archive.org thumbnail
const getArchiveThumbnail = (url: string): string | null => {
  const match = url.match(/archive\.org\/details\/([^\/\?]+)/)
  if (match && match[1]) {
    return `https://archive.org/services/img/${match[1]}`
  }
  return null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params
    
    // Fetch video from database
    const videos = await prisma.video.findMany()
    const video = videos.find((v) => v.id === id)

    if (!video) {
      return {
        title: 'Video Not Found | Hello Madurai',
      }
    }

    const title = video.title
    const description = `Watch ${title} on Hello Madurai`
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hellomadurai.com'
    const videoUrl = `${baseUrl}/videos/${video.id}`
    
    // Get thumbnail URL
    let thumbnailUrl = video.thumbnailUrl || ''
    
    if (!thumbnailUrl) {
      if (video.videoType === 'youtube') {
        thumbnailUrl = getYouTubeThumbnail(video.videoUrl) || ''
      } else if (video.videoType === 'archive') {
        thumbnailUrl = getArchiveThumbnail(video.videoUrl) || ''
      }
    }
    
    // Make thumbnail URL absolute
    const absoluteThumbnailUrl = thumbnailUrl.startsWith('http') 
      ? thumbnailUrl 
      : `${baseUrl}${thumbnailUrl}`

    return {
      title: `${title} | Hello Madurai`,
      description,
      openGraph: {
        type: 'video.other',
        title,
        description,
        url: videoUrl,
        siteName: 'Hello Madurai',
        images: [
          {
            url: absoluteThumbnailUrl,
            width: 1280,
            height: 720,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [absoluteThumbnailUrl],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Video | Hello Madurai',
    }
  }
}

export default function VideoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
