import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 2 minutes
export const revalidate = 120

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = limitParam ? parseInt(limitParam, 10) : 50 // Default to 50 videos

    const videos = await prisma.video.findMany({
      orderBy: [
        { orderNumber: 'asc' },  // Manual order first (if set)
        { publishedAt: 'desc' }, // Then by publish date (newest first)
      ],
      take: Math.min(limit, 100) // Maximum 100 videos
    })

    return NextResponse.json(videos || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240'
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

