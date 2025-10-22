import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Get counts from all tables in Hostinger MySQL
    const [
      newsCount,
      eventsCount,
      businessesCount,
      radioCount,
      magazinesCount
    ] = await Promise.all([
      prisma.news.count(),
      prisma.event.count(),
      prisma.business.count(),
      prisma.radioShow.count(),
      prisma.magazine.count()
    ])

    return NextResponse.json({
      newsCount,
      eventsCount,
      businessesCount,
      podcastsCount: radioCount,
      magazinesCount,
      total: newsCount + eventsCount + businessesCount + radioCount + magazinesCount
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
