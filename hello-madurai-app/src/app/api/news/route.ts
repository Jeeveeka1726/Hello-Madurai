import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 60 seconds, revalidate in background
export const revalidate = 60

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const searchQuery = searchParams.get('search')
    const limit = limitParam ? parseInt(limitParam, 10) : 100

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
      take: Math.min(limit, 100) // Maximum 100 articles
    })

    return NextResponse.json(news || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
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

