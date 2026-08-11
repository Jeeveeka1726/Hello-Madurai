import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 5 minutes (increased for better performance)
export const revalidate = 300

// In-memory cache for ads
let adsCache: { data: any[], timestamp: number, category: string } | null = null
const CACHE_TTL = 180000 // 3 minutes in milliseconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'news'

    // Check in-memory cache
    if (adsCache &&
        adsCache.category === category &&
        Date.now() - adsCache.timestamp < CACHE_TTL) {
      console.log('📢 Returning cached ads for category:', category)
      return NextResponse.json(adsCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
          'X-Cache': 'HIT'
        }
      })
    }

    // Fetch only active ads with imageUrl (skip HTML ads for faster loading)
    const ads = await prisma.ad.findMany({
      where: {
        active: true,
        imageUrl: { not: null }, // Only get image ads
        OR: [
          { category },
          { category: 'all' }
        ]
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
        link: true,
        impressions: true,
        clicks: true
      },
      orderBy: {
        position: 'asc'
      },
      take: 5 // Reduced from 10 to 5 for faster loading
    })

    // Update cache
    adsCache = {
      data: ads,
      timestamp: Date.now(),
      category
    }

    console.log('📢 Fetched and cached', ads.length, 'ads for category:', category)

    return NextResponse.json(ads, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        'X-Cache': 'MISS'
      }
    })
  } catch (error) {
    console.error('Error fetching active ads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}





