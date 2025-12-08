import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const song = await prisma.radioSong.findUnique({
      where: { id: params.id },
      include: {
        singer: true
      }
    })

    if (!song || !song.singer) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    // Return the artist image URL
    return NextResponse.json({
      imageUrl: song.singer.imageUrl || `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hellomadurai.com'}/logo.jpg`,
      title: song.title,
      title_ta: song.title_ta,
      artistName: song.singer.name,
      artistName_ta: song.singer.name_ta
    })
  } catch (error) {
    console.error('Error fetching song OG data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

