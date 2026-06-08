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
      radioSongsCount,
      businessCount,
      eventCount,
      magazineCount,
      videoCount,
      reelCount,
    ] = await Promise.all([
      prisma.news.count(),
      prisma.radioShow.count(),
      prisma.radioSong.count(),
      prisma.business.count(),
      prisma.event.count(),
      prisma.magazine.count(),
      prisma.video.count(),
      prisma.reel.count(),
    ])

    // ── Engagement Totals (ALL TIME - not filtered by date) ────────────────────
    // Get ALL content to count total views/likes across all time
    const [allNewsItems, allRadioItems, allVideoItems, allMagazines, allReels, allRadioSongs] = await Promise.all([
      prisma.news.findMany({
        select: { id: true, title: true, views: true, likes: true, dislikes: true, createdAt: true, category: true },
        orderBy: { views: 'desc' },
      }),
      prisma.radioShow.findMany({
        select: { id: true, title: true, plays: true, createdAt: true },
      }),
      prisma.video.findMany({
        select: { id: true, title: true, views: true, likes: true, createdAt: true },
        orderBy: { views: 'desc' },
      }),
      prisma.magazine.findMany({
        select: { id: true, title: true, downloads: true, likes: true, createdAt: true },
        orderBy: { downloads: 'desc' },
      }),
      prisma.reel.findMany({
        select: { id: true, title: true, views: true, likes: true, createdAt: true },
        orderBy: { views: 'desc' },
      }),
      prisma.radioSong.findMany({
        select: { id: true, title: true, plays: true, createdAt: true },
      }),
    ])

    // Count all song likes and comments
    const [songLikesCount, videoCommentsCount, radioCommentsCount, businessCommentsCount] = await Promise.all([
      prisma.songLike.count(),
      prisma.videoComment.count(),
      prisma.radioComment.count(),
      prisma.businessComment.count(),
    ])

    // Calculate TOTAL views/likes from ALL content (not just new content)
    const totalViews =
      allNewsItems.reduce((s, i) => s + (i.views || 0), 0) +
      allRadioItems.reduce((s, i) => s + (i.plays || 0), 0) +
      allVideoItems.reduce((s, i) => s + (i.views || 0), 0) +
      allMagazines.reduce((s, i) => s + (i.downloads || 0), 0) +
      allReels.reduce((s, i) => s + (i.views || 0), 0) +
      allRadioSongs.reduce((s, i) => s + (i.plays || 0), 0)

    const totalLikes =
      allNewsItems.reduce((s, i) => s + (i.likes || 0), 0) +
      allVideoItems.reduce((s, i) => s + (i.likes || 0), 0) +
      allMagazines.reduce((s, i) => s + (i.likes || 0), 0) +
      allReels.reduce((s, i) => s + (i.likes || 0), 0) +
      songLikesCount // Add radio song likes!

    const totalDislikes = allNewsItems.reduce((s, i) => s + (i.dislikes || 0), 0)

    // Count ALL comments, subscriptions, shares (TOTAL - not filtered by date)
    // Add all comment types together
    const totalCommentsCount = (await prisma.newsComment.count()) +
                                videoCommentsCount +
                                radioCommentsCount +
                                businessCommentsCount

    const [
      totalSubscriptionsCount,
      totalDiscountCardsCount,
      totalNewsSharesCount,
      // Period-based counts (NEW activity in the selected period)
      periodNewsCommentsCount,
      periodSubscriptionsCount,
      periodSharesCount,
    ] = await Promise.all([
      prisma.subscription.count(), // ALL subscriptions (total)
      prisma.discountCard.count(), // ALL discount cards
      prisma.newsShare.count(), // ALL shares (total)
      // NEW activity within the date range
      prisma.newsComment.count({ where: { createdAt: { gte: startDate } } }),
      prisma.subscription.count({ where: { createdAt: { gte: startDate } } }),
      prisma.newsShare.count({ where: { createdAt: { gte: startDate } } }),
    ])

    // Period comments from all sources
    const periodCommentsCount = periodNewsCommentsCount +
      (await prisma.videoComment.count({ where: { createdAt: { gte: startDate } } })) +
      (await prisma.radioComment.count({ where: { createdAt: { gte: startDate } } })) +
      (await prisma.businessComment.count({ where: { createdAt: { gte: startDate } } }))

    // NEW views and likes tracking (with fallback for old Prisma client)
    let periodViewsCount = 0
    let periodLikesCount = 0

    try {
      const [periodNewsViews, periodVideoViews, periodNewsLikes, periodVideoLikes] = await Promise.all([
        (prisma as any).newsView?.count({ where: { createdAt: { gte: startDate } } }) ?? Promise.resolve(0),
        (prisma as any).videoView?.count({ where: { createdAt: { gte: startDate } } }) ?? Promise.resolve(0),
        (prisma as any).newsLike?.count({ where: { createdAt: { gte: startDate } } }) ?? Promise.resolve(0),
        (prisma as any).videoLike?.count({ where: { createdAt: { gte: startDate } } }) ?? Promise.resolve(0),
      ])
      periodViewsCount = periodNewsViews + periodVideoViews
      periodLikesCount = periodNewsLikes + periodVideoLikes
    } catch (e) {
      console.log('Note: View/Like tracking not available yet. Please restart dev server.')
      periodViewsCount = 0
      periodLikesCount = 0
    }

    // For top content and charts, filter by date range
    const newsItems = allNewsItems.filter(n => n.createdAt >= startDate)
    const radioItems = allRadioItems.filter(r => r.createdAt >= startDate)
    const videoItems = allVideoItems.filter(v => v.createdAt >= startDate)

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
      // TOTAL metrics (all time)
      totalViews,
      totalLikes,
      totalDislikes,
      totalComments: totalCommentsCount,
      totalSubscriptions: totalSubscriptionsCount,
      totalDiscountCards: totalDiscountCardsCount,
      totalShares: totalNewsSharesCount,
      // PERIOD metrics (NEW activity in selected time range)
      periodMetrics: {
        views: periodViewsCount,
        likes: periodLikesCount,
        comments: periodCommentsCount,
        subscriptions: periodSubscriptionsCount,
        shares: periodSharesCount,
        range: range, // '7d', '30d', or '90d'
      },
      contentStats: {
        news: newsCount,
        videos: videoCount,
        radio: radioCount,
        radioSongs: radioSongsCount,
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
        totalEngagement: totalViews + totalLikes + totalCommentsCount,
        averageViewsPerContent: totalViews / Math.max(1, newsCount + radioCount + videoCount),
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    console.error('Error details:', error instanceof Error ? error.message : String(error))
    console.error('Error stack:', error instanceof Error ? error.stack : '')
    return NextResponse.json({
      error: 'Failed to fetch analytics',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
