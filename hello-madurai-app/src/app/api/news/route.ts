import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Always serve live news - admin changes must appear on the next page load.
// revalidate=0 disables ISR; force-dynamic makes every request hit the DB.
export const revalidate = 0
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const searchQuery = searchParams.get('search')
    // Remove default limit - fetch ALL articles unless explicitly limited
    const limit = limitParam ? parseInt(limitParam, 10) : null

    // Build where clause for search
    const where = searchQuery ? {
      OR: [
        { title: { contains: searchQuery, mode: 'insensitive' as const } },
        { title_ta: { contains: searchQuery, mode: 'insensitive' as const } },
        { excerpt: { contains: searchQuery, mode: 'insensitive' as const } },
        { excerpt_ta: { contains: searchQuery, mode: 'insensitive' as const } }
      ]
    } : undefined

    // Fetch news articles from Hostinger MySQL
    // Only select necessary fields for list view (not full content)
    const news = await prisma.news.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        title_ta: true,
        excerpt: true,
        excerpt_ta: true,
        category: true,
        author: true,
        publishedAt: true,
        views: true,
        featured: true,
        featuredImage: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      // Remove hard limit - fetch ALL articles unless explicitly limited
      ...(limit ? { take: limit } : {})
    })

    const duration = Date.now() - startTime
    console.log(`📰 News API completed in ${duration}ms (${news.length} articles)`)

    return NextResponse.json(news || [], {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'X-Response-Time': `${duration}ms`,
        'Vary': 'Accept-Encoding',
        'ETag': `"news-${Date.now()}"`,
        // Firefox-specific: prevent stale cache
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error in news API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

