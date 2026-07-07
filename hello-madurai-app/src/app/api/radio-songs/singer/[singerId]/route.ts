import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache for 3 minutes
export const revalidate = 180

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
          select: {
            id: true,
            name: true,
            name_ta: true,
            slug: true,
            imageUrl: true,
            category: {
              select: {
                id: true,
                name: true,
                name_ta: true,
                slug: true
              }
            }
          }
        }
      },
      take: 100 // Limit to 100 songs per singer
    })

    return NextResponse.json(songs, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360'
      }
    })
  } catch (error) {
    console.error('Error fetching songs for singer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch songs' },
      { status: 500 }
    )
  }
}

