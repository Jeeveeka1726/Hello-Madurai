import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

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
        singer: {
          select: {
            id: true,
            name: true,
            name_ta: true,
            imageUrl: true,
            slug: true
          }
        }
      }
    })

    if (!song || !song.singer) {
      return {
        title: 'Hello Madurai Digital FM',
        description: 'Listen to Digital FM on Hello Madurai',
      }
    }

    // Prefer Tamil title and artist name if available
    const title = song.title_ta || song.title
    const artistName = song.singer.name_ta || song.singer.name
    const description = `Listen to ${title} by ${artistName} on Hello Madurai Digital FM`

    // Generate absolute URL for artist image
    // Try multiple environment variables and fallback to production URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
      || process.env.NEXT_PUBLIC_SITE_URL
      || process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://hellomadurai.com'

    const imageUrl = song.singer.imageUrl
      ? (song.singer.imageUrl.startsWith('http')
        ? song.singer.imageUrl
        : `${baseUrl}${song.singer.imageUrl}`)
      : `${baseUrl}/logo.jpg`

    console.log('🖼️ FM Share Metadata (layout.tsx):', {
      songId,
      title,
      artist: artistName,
      imageUrl,
      baseUrl,
      rawImageUrl: song.singer.imageUrl,
      env: {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        VERCEL_URL: process.env.VERCEL_URL
      }
    })

    return {
      title: `${title} - ${artistName} | Hello Madurai Digital FM`,
      description,
      openGraph: {
        title: `${title} - ${artistName}`,
        description: 'Hello Madurai Digital FM',
        type: 'music.song',
        siteName: 'Hello Madurai',
        url: `${baseUrl}/radio/share/${songId}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - ${artistName}`,
        description: 'Hello Madurai Digital FM',
      },
    }
  } catch (error) {
    console.error('❌ Error generating FM share metadata:', error)
    return {
      title: 'Hello Madurai Digital FM',
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

