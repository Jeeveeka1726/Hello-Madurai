import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ songId: string }>
}

// Metadata is in layout.tsx (same pattern as news section)
// This page shows the actual content so social media crawlers can see it
export default async function SharePage({ params }: Props) {
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
    notFound()
  }

  // Prefer Tamil title and artist name if available
  const title = song.title_ta || song.title
  const artistName = song.singer.name_ta || song.singer.name

  // Generate absolute URL for artist image
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://hellomadurai.com'
  const imageUrl = song.singer.imageUrl
    ? (song.singer.imageUrl.startsWith('http')
      ? song.singer.imageUrl
      : `${baseUrl}${song.singer.imageUrl}`)
    : `${baseUrl}/logo.jpg`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Artist Image */}
        <div className="relative w-full h-80 bg-gradient-to-br from-blue-100 to-purple-100">
          <Image
            src={imageUrl}
            alt={artistName}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Song Title */}
          <h1 className="text-3xl font-bold mb-3 text-gray-800 leading-tight">
            {title}
          </h1>

          {/* Artist Name */}
          <p className="text-xl text-gray-600 mb-6 flex items-center justify-center gap-2">
            <span className="text-2xl">🎙️</span>
            {artistName}
          </p>

          {/* Listen Now Button */}
          <Link
            href={`/radio?song=${songId}`}
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            🎧 Listen Now
          </Link>

          {/* Tamil Text */}
          <p className="text-sm text-gray-500 mt-4">
            இப்போது கேளுங்கள்
          </p>

          {/* Hello Madurai Branding */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-400">
              Hello Madurai Digital FM
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ஹலோ மதுரை டிஜிட்டல் எஃப்எம்
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

