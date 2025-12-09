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

    // Use environment variable or fallback to Vercel URL
    // Once hellomadurai.com DNS points to Vercel, set NEXT_PUBLIC_SITE_URL=https://hellomadurai.com
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hello-madurai-c5xr.vercel.app'
    const imageUrl = song.singer.imageUrl
      ? (song.singer.imageUrl.startsWith('http')
        ? song.singer.imageUrl
        : `${baseUrl}${song.singer.imageUrl}`)
      : `${baseUrl}/logo.jpg`

    console.log('🖼️ FM Share Metadata:', {
      songId,
      title,
      artist: artistName,
      imageUrl,
      baseUrl,
      rawImageUrl: song.singer.imageUrl
    })

    return {
      title: `${title} - ${artistName} | Hello Madurai Digital FM`,
      description,
      openGraph: {
        title: `${title} - ${artistName}`,
        description: 'Hello Madurai Digital FM',
        images: [
          {
            url: imageUrl,
            width: 1280,
            height: 720,
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

