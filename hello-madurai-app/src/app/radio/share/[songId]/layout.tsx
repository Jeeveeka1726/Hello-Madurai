import { Metadata } from 'next'
import prisma from '@/lib/prisma'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ songId: string }> 
}): Promise<Metadata> {
  try {
    const { songId } = await params

    const song = await prisma.radioSong.findUnique({
      where: { id: songId },
      include: {
        singer: true
      }
    })

    if (!song || !song.singer) {
      return {
        title: 'Digital FM - Hello Madurai',
        description: 'Listen to Digital FM on Hello Madurai',
      }
    }

    // Prefer Tamil title if available
    const title = song.title_ta || song.title
    const artistName = song.singer.name_ta || song.singer.name
    const description = `${title} - ${artistName} | Hello Madurai Digital FM`
    
    // Generate absolute URL for artist image
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hellomadurai.com'
    let imageUrl = song.singer.imageUrl

    if (!imageUrl) {
      imageUrl = `${baseUrl}/logo.jpg`
    } else if (imageUrl.startsWith('/api/')) {
      // Convert relative database image URLs to absolute URLs
      imageUrl = `${baseUrl}${imageUrl}`
    } else if (!imageUrl.startsWith('http')) {
      // Handle any other relative URLs
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }

    console.log('🎵 FM Share Metadata - Title:', title)
    console.log('🎵 FM Share Metadata - Artist:', artistName)
    console.log('🎵 FM Share Metadata - Image URL:', imageUrl)

    return {
      title: `${title} - ${artistName} - Hello Madurai`,
      description,
      openGraph: {
        title: `${title} - ${artistName}`,
        description: 'Hello Madurai Digital FM',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${artistName} - ${title}`,
          },
        ],
        type: 'music.song',
        siteName: 'Hello Madurai',
        url: `${baseUrl}/radio/share/${songId}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - ${artistName}`,
        description: 'Hello Madurai Digital FM',
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error('❌ Error generating FM share metadata:', error)
    return {
      title: 'Digital FM - Hello Madurai',
      description: 'Listen to Digital FM on Hello Madurai',
    }
  }
}

export default function RadioShareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

