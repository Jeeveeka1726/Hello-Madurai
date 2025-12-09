import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const song = await prisma.radioSong.findUnique({
      where: { id },
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

    if (!song) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error fetching song:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

