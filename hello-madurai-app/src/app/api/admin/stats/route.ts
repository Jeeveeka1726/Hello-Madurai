import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get counts from all tables
    const [
      newsCount,
      eventsCount,
      videosCount,
      businessesCount,
      podcastsCount,
      magazinesCount
    ] = await Promise.all([
      prisma.news.count(),
      prisma.event.count(),
      prisma.video.count(),
      prisma.business.count(),
      prisma.podcast.count(),
      prisma.magazine.count()
    ])

    return NextResponse.json({
      newsCount,
      eventsCount,
      videosCount,
      businessesCount: businessesCount, // This is what the homepage expects
      podcastsCount,
      magazinesCount,
      total: newsCount + eventsCount + videosCount + businessesCount + podcastsCount + magazinesCount
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
