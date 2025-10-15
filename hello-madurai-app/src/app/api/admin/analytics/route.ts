import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get content counts from Hostinger MySQL
    const [
      newsCount,
      videoCount,
      radioCount,
      businessCount,
      eventCount,
      magazineCount
    ] = await Promise.all([
      prisma.news.count(),
      prisma.video.count(),
      prisma.radioShow.count(),
      prisma.business.count(),
      prisma.event.count(),
      prisma.magazine.count()
    ])

    // Get recent content counts
    const [
      recentNewsCount,
      recentVideoCount,
      recentRadioCount,
      recentBusinessCount
    ] = await Promise.all([
      prisma.news.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.video.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.radioShow.count({
        where: { createdAt: { gte: startDate } }
      }),
      prisma.business.count({
        where: { createdAt: { gte: startDate } }
      })
    ])

    // Get total views and interactions
    const [newsData, videoData, radioData] = await Promise.all([
      prisma.news.findMany({
        where: { createdAt: { gte: startDate } },
        select: { views: true, likes: true, dislikes: true }
      }),
      prisma.video.findMany({
        where: { createdAt: { gte: startDate } },
        select: { views: true }
      }),
      prisma.radioShow.findMany({
        where: { createdAt: { gte: startDate } },
        select: { plays: true }
      })
    ])

    // Calculate totals
    const totalViews = 
      newsData.reduce((sum, item) => sum + (item.views || 0), 0) +
      videoData.reduce((sum, item) => sum + (item.views || 0), 0) +
      radioData.reduce((sum, item) => sum + (item.plays || 0), 0)

    const totalLikes = newsData.reduce((sum, item) => sum + (item.likes || 0), 0)
    const totalDislikes = newsData.reduce((sum, item) => sum + (item.dislikes || 0), 0)

    // Get comments count
    const commentsCount = await prisma.newsComment.count({
      where: { createdAt: { gte: startDate } }
    })

    // Get subscriptions count
    const subscriptionsCount = await prisma.subscription.count({
      where: { createdAt: { gte: startDate } }
    })

    return NextResponse.json({
      period: range,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      content: {
        total: {
          news: newsCount,
          videos: videoCount,
          radio: radioCount,
          businesses: businessCount,
          events: eventCount,
          magazines: magazineCount
        },
        recent: {
          news: recentNewsCount,
          videos: recentVideoCount,
          radio: recentRadioCount,
          businesses: recentBusinessCount
        }
      },
      engagement: {
        totalViews,
        totalLikes,
        totalDislikes,
        totalComments: commentsCount,
        totalSubscriptions: subscriptionsCount
      },
      summary: {
        totalContent: newsCount + videoCount + radioCount + businessCount + eventCount + magazineCount,
        totalEngagement: totalViews + totalLikes + commentsCount,
        averageViewsPerContent: totalViews / Math.max(1, newsCount + videoCount + radioCount)
      }
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
