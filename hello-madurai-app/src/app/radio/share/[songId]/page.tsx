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
    const imageUrl = song.singer.imageUrl || `${baseUrl}/logo.jpg`

    return {
      title: `${song.title} - ${song.singer.name} | Hello Madurai Digital FM`,
      description: `Listen to ${song.title} by ${song.singer.name} on Hello Madurai Digital FM`,
      openGraph: {
        title: `${song.title} - ${song.singer.name}`,
        description: `Listen to ${song.title} by ${song.singer.name} on Hello Madurai Digital FM`,
        images: [
          {
            url: imageUrl,
            width: 400,
            height: 400,
            alt: song.singer.name
          }
        ],
        type: 'music.song',
        url: `${baseUrl}/radio/share/${songId}`
      },
      twitter: {
        card: 'summary_large_image',
        title: `${song.title} - ${song.singer.name}`,
        description: `Listen to ${song.title} by ${song.singer.name} on Hello Madurai Digital FM`,
        images: [imageUrl]
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
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

