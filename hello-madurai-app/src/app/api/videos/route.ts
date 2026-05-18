import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: [
        { orderNumber: 'asc' },  // Manual order first (if set)
        { publishedAt: 'desc' }, // Then by publish date (newest first)
      ]
    })

    return NextResponse.json(videos || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
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

