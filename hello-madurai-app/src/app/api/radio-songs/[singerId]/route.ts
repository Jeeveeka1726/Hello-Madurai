import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all songs for a singer (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ singerId: string }> }
) {
  try {
    const { singerId } = await params

    const songs = await prisma.radioSong.findMany({
      where: { singerId },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        singer: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json(songs || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('Error in radio songs API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

