import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 60 seconds
export const revalidate = 60

// GET /api/news/slug/[slug] - Get news article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now()
  
  try {
    const { slug } = await params

    // Fetch specific news article by slug with limited comments and shares for performance
    const article = await prisma.news.findUnique({
      where: { slug },
      include: {
        comments: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' },
          take: 20 // Limit to latest 20 comments for faster loading
        },
        shares: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Limit shares
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    const duration = Date.now() - startTime
    console.log(`✅ Article with slug ${slug} fetched in ${duration}ms`)

    return NextResponse.json(article, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Response-Time': `${duration}ms`
      }
    })
  } catch (error) {
    console.error('Error fetching article by slug:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
