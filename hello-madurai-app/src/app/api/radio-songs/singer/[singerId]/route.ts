import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/radio-songs/singer/[singerId]
 * Get all songs for a specific singer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { singerId: string } }
) {
  try {
    const { singerId } = await params

    const songs = await prisma.radioSong.findMany({
      where: { singerId },
      orderBy: { createdAt: 'desc' },
      include: {
        singer: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching songs for singer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    )
  }
}

