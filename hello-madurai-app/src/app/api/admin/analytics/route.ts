import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    const daysBack = range === '7d' ? 7 : range === '30d' ? 30 : 90
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get total views, likes, comments, shares
    const [
      newsStats,
      videoStats,
      radioStats,
      businessStats,
      subscriptions,
      discountCards,
      newsCount,
      videoCount,
      radioCount,
      businessCount
    ] = await Promise.all([
      // News statistics
      prisma.news.aggregate({
        _sum: {
          views: true,
          likes: true,
          dislikes: true
        },
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Video statistics
      prisma.video.aggregate({
        _sum: {
          views: true
        },
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Radio statistics
      prisma.radioShow.aggregate({
        _sum: {
          plays: true
        },
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Business statistics
      prisma.business.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Subscriptions
      prisma.subscription.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Discount cards
      prisma.discountCard.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),

      // Content counts
      prisma.news.count(),
      prisma.video.count(),
      prisma.radioShow.count(),
      prisma.business.count()
    ])

    // Get comments count across all content types
    const [newsComments, videoComments, radioComments, businessComments] = await Promise.all([
      prisma.newsComment.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.videoComment.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.radioComment.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.businessComment.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
    ])

    // Get shares count across all content types
    const [newsShares, videoShares, radioShares] = await Promise.all([
      prisma.newsShare.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.videoShare.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.radioShare.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
    ])

    // Get top performing content
    const [topNews, topVideos, topRadio] = await Promise.all([
      prisma.news.findMany({
        select: {
          id: true,
          title: true,
          views: true,
          likes: true,
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: [
          { views: 'desc' },
          { likes: 'desc' }
        ],
        take: 10,
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.video.findMany({
        select: {
          id: true,
          title: true,
          views: true,
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: {
          views: 'desc'
        },
        take: 10,
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.radioShow.findMany({
        select: {
          id: true,
          title: true,
          plays: true,
          _count: {
            select: {
              comments: true
            }
          }
        },
        orderBy: {
          plays: 'desc'
        },
        take: 10,
        where: {
          createdAt: {
            gte: startDate
          }
        }
      })
    ])

    // Get recent activity
    const recentActivity = await Promise.all([
      // Recent news
      prisma.news.findMany({
        select: {
          id: true,
          title: true,
          author: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      // Recent comments
      prisma.newsComment.findMany({
        select: {
          id: true,
          content: true,
          author: true,
          createdAt: true,
          news: {
            select: {
              title: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      }),
      // Recent subscriptions
      prisma.subscription.findMany({
        select: {
          id: true,
          email: true,
          phone: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 5
      })
    ])

    // Combine and format top content
    const topContent = [
      ...topNews.map(item => ({
        id: item.id,
        title: item.title,
        type: 'news' as const,
        views: item.views,
        likes: item.likes,
        comments: item._count.comments
      })),
      ...topVideos.map(item => ({
        id: item.id,
        title: item.title,
        type: 'video' as const,
        views: item.views,
        likes: 0,
        comments: item._count.comments
      })),
      ...topRadio.map(item => ({
        id: item.id,
        title: item.title,
        type: 'radio' as const,
        views: item.plays,
        likes: 0,
        comments: item._count.comments
      }))
    ].sort((a, b) => b.views - a.views)

    // Format recent activity
    const formattedActivity = [
      ...recentActivity[0].map(item => ({
        id: item.id,
        type: 'news' as const,
        title: item.title,
        action: 'Published',
        timestamp: item.createdAt.toISOString(),
        user: item.author
      })),
      ...recentActivity[1].map(item => ({
        id: item.id,
        type: 'comment' as const,
        title: item.news.title,
        action: 'Commented on',
        timestamp: item.createdAt.toISOString(),
        user: item.author
      })),
      ...recentActivity[2].map(item => ({
        id: item.id,
        type: 'subscription' as const,
        title: 'New Subscription',
        action: 'Subscribed',
        timestamp: item.createdAt.toISOString(),
        user: item.email || item.phone
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    const analytics = {
      totalViews: (newsStats._sum.views || 0) + (videoStats._sum.views || 0) + (radioStats._sum.plays || 0),
      totalLikes: (newsStats._sum.likes || 0),
      totalComments: newsComments + videoComments + radioComments + businessComments,
      totalShares: newsShares + videoShares + radioShares,
      totalSubscriptions: subscriptions,
      totalDiscountCards: discountCards,
      contentStats: {
        news: newsCount,
        videos: videoCount,
        radio: radioCount,
        businesses: businessCount
      },
      topContent: topContent.slice(0, 10),
      recentActivity: formattedActivity.slice(0, 20),
      userEngagement: [] // This would require more complex queries for time-series data
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

