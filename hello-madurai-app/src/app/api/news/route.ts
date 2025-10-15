import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 60 seconds, revalidate in background
export const revalidate = 60

export async function GET() {
  try {
    // Fetch all news articles from Hostinger MySQL
    // Only select necessary fields for list view (not full content)
    const news = await prisma.news.findMany({
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
      take: 100 // Limit to 100 most recent articles
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

