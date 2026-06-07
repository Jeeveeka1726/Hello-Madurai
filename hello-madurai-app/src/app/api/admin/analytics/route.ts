import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // ── Content Counts ──────────────────────────────────────────────────────────
    const [
      newsCount,
      radioCount,
      businessCount,
      eventCount,
      magazineCount,
      videoCount,
      reelCount,
    ] = await Promise.all([
      prisma.news.count(),
      prisma.radioShow.count(),
      prisma.business.count(),
      prisma.event.count(),
      prisma.magazine.count(),
      prisma.video.count(),
      prisma.reel.count(),
    ])

    // ── Engagement Totals (within date range) ───────────────────────────────────
    const [newsItems, radioItems, videoItems] = await Promise.all([
      prisma.news.findMany({
        where: { createdAt: { gte: startDate } },
        select: { id: true, title: true, views: true, likes: true, dislikes: true, createdAt: true, category: true },
        orderBy: { views: 'desc' },
      }),
      prisma.radioShow.findMany({
        where: { createdAt: { gte: startDate } },
        select: { id: true, title: true, plays: true, createdAt: true },
      }),
      prisma.video.findMany({
        where: { createdAt: { gte: startDate } },
        select: { id: true, title: true, views: true, likes: true, createdAt: true },
        orderBy: { views: 'desc' },
      }),
    ])

    const totalViews =
      newsItems.reduce((s, i) => s + (i.views || 0), 0) +
      radioItems.reduce((s, i) => s + (i.plays || 0), 0) +
      videoItems.reduce((s, i) => s + (i.views || 0), 0)

    const totalLikes =
      newsItems.reduce((s, i) => s + (i.likes || 0), 0) +
      videoItems.reduce((s, i) => s + (i.likes || 0), 0)

    const totalDislikes = newsItems.reduce((s, i) => s + (i.dislikes || 0), 0)

    const [commentsCount, subscriptionsCount, discountCardsCount, newsSharesCount] =
      await Promise.all([
        prisma.newsComment.count({ where: { createdAt: { gte: startDate } } }),
        prisma.subscription.count({ where: { createdAt: { gte: startDate } } }),
        prisma.discountCard.count(),
        prisma.newsShare.count({ where: { createdAt: { gte: startDate } } }),
      ])

    // ── Top Performing Content ──────────────────────────────────────────────────
    // Merge news + videos and sort by views descending
    const topNewsItems = newsItems.slice(0, 10).map((n) => ({
      id: n.id,
      title: n.title,
      type: 'news' as const,
      views: n.views || 0,
      likes: n.likes || 0,
      comments: 0, // filled below if needed
    }))

    const topVideoItems = videoItems.slice(0, 5).map((v) => ({
      id: v.id,
      title: v.title,
      type: 'video' as const,
      views: v.views || 0,
      likes: v.likes || 0,
      comments: 0,
    }))

    const topContent = [...topNewsItems, ...topVideoItems]
      .sort((a, b) => b.views - a.views)
      .slice(0, 8)

    // ── Recent Activity ─────────────────────────────────────────────────────────
    const [recentNews, recentComments, recentSubscriptions] = await Promise.all([
      prisma.news.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, createdAt: true, author: true },
      }),
      prisma.newsComment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, content: true, author: true, createdAt: true },
      }),
      prisma.subscription.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, email: true, createdAt: true },
      }),
    ])

    const recentActivity = [
      ...recentNews.map((n) => ({
        id: `news-${n.id}`,
        type: 'news' as const,
        title: n.title,
        action: 'published',
        timestamp: n.createdAt.toISOString(),
        user: n.author,
      })),
      ...recentComments.map((c) => ({
        id: `comment-${c.id}`,
        type: 'comment' as const,
        title: c.content.slice(0, 60),
        action: 'commented',
        timestamp: c.createdAt.toISOString(),
        user: c.author,
      })),
      ...recentSubscriptions.map((s) => ({
        id: `sub-${s.id}`,
        type: 'subscription' as const,
        title: s.email || s.name || 'Unknown',
        action: 'subscribed',
        timestamp: s.createdAt.toISOString(),
        user: s.name || undefined,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 15)

    // ── Daily Engagement (last N days, bucketed by day) ─────────────────────────
    // Build a simple day-bucket array for charts
    const userEngagement: Array<{
      date: string
      views: number
      likes: number
      comments: number
      shares: number
    }> = []

    for (let i = daysBack - 1; i >= 0; i--) {
      const day = new Date(now)
      day.setDate(day.getDate() - i)
      const dayStr = day.toISOString().split('T')[0]
      const dayStart = new Date(`${dayStr}T00:00:00.000Z`)
      const dayEnd = new Date(`${dayStr}T23:59:59.999Z`)

      const dayNews = newsItems.filter(
        (n) => n.createdAt >= dayStart && n.createdAt <= dayEnd
      )
      userEngagement.push({
        date: dayStr,
        views: dayNews.reduce((s, n) => s + (n.views || 0), 0),
        likes: dayNews.reduce((s, n) => s + (n.likes || 0), 0),
        comments: 0,
        shares: 0,
      })
    }

    // ── Response ─────────────────────────────────────────────────────────────────
    return NextResponse.json({
      totalViews,
      totalLikes,
      totalDislikes,
      totalComments: commentsCount,
      totalSubscriptions: subscriptionsCount,
      totalDiscountCards: discountCardsCount,
      totalShares: newsSharesCount,
      contentStats: {
        news: newsCount,
        videos: videoCount,
        radio: radioCount,
        businesses: businessCount,
        events: eventCount,
        magazines: magazineCount,
        reels: reelCount,
      },
      topContent,
      recentActivity,
      userEngagement,
      summary: {
        totalContent:
          newsCount + radioCount + businessCount + eventCount + magazineCount + videoCount,
        totalEngagement: totalViews + totalLikes + commentsCount,
        averageViewsPerContent: totalViews / Math.max(1, newsCount + radioCount + videoCount),
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
