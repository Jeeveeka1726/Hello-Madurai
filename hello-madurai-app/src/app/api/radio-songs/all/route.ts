import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Cache for 3 minutes
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const songs = await prisma.radioSong.findMany({
      include: {
        singer: {
          select: {
            id: true,
            name: true,
            name_ta: true,
            slug: true,
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
      orderBy: {
        createdAt: 'desc'
      },
      take: 200 // Limit to 200 songs for better performance
    })

    return NextResponse.json(songs, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error fetching all radio songs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch songs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

