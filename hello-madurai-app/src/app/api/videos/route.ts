import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 2 minutes
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 500 // Default to 500 videos (show all)

    const videos = await prisma.video.findMany({
      orderBy: [
        { orderNumber: 'asc' },  // Manual order first (if set)
        { publishedAt: 'desc' }, // Then by publish date (newest first)
      ],
      take: Math.min(limit, 1000) // Maximum 1000 videos
    })

    return NextResponse.json(videos || [], {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error in videos API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

