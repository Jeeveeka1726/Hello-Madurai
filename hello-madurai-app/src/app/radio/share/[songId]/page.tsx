import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

type Props = {
  params: Promise<{ songId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { songId } = await params
    const song = await prisma.radioSong.findUnique({
      where: { id: songId },
      include: { singer: true }
    })

    if (!song || !song.singer) {
      return {
        title: 'Hello Madurai Digital FM',
        description: 'Listen to Digital FM on Hello Madurai'
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hellomadurai.com'

    // Prefer Tamil titles
    const title = song.title_ta || song.title
    const artistName = song.singer.name_ta || song.singer.name

    // Ensure image URL is absolute
    let imageUrl = song.singer.imageUrl || `${baseUrl}/logo.jpg`

    // Convert relative URLs to absolute
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      imageUrl = `${baseUrl}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    }

    console.log('🖼️ FM Share Metadata:', {
      title,
      artist: artistName,
      imageUrl,
      songId
    })

    return {
      title: `${title} - ${artistName} | Hello Madurai Digital FM`,
      description: `Listen to ${title} by ${artistName} on Hello Madurai Digital FM`,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title: `${title} - ${artistName}`,
        description: `Hello Madurai Digital FM`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${artistName} - ${title}`,
            type: 'image/jpeg'
          }
        ],
        type: 'music.song',
        url: `${baseUrl}/radio/share/${songId}`,
        siteName: 'Hello Madurai'
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} - ${artistName}`,
        description: `Hello Madurai Digital FM`,
        images: [imageUrl],
        site: '@hellomadurai'
      }
    }
  } catch (error) {
    console.error('❌ Error generating FM share metadata:', error)
    return {
      title: 'Hello Madurai Digital FM',
      description: 'Listen to Digital FM on Hello Madurai'
    }
  }
}

export default async function SharePage({ params }: Props) {
  const { songId } = await params
  // Redirect to the main radio page with the song ID
  redirect(`/radio?song=${songId}`)
}

