import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 1 minute
export const revalidate = 60

// GET /api/news/latest - Get latest 6 news for homepage (optimized)
export async function GET() {
  try {
    // Fetch only 6 latest news for homepage
    const news = await prisma.news.findMany({
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
      take: 6 // Only 6 for homepage
    })

    return NextResponse.json(news || [], {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60, must-revalidate',
        'Vary': 'Accept-Encoding',
        'ETag': `"latest-news-${Date.now()}"`,
        // Firefox-specific: prevent stale cache
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error in latest news API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
