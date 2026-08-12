import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 5 minutes (increased for better performance)
export const revalidate = 300

// In-memory cache for ads - optimized with multiple category support
const adsCache = new Map<string, { data: any[], timestamp: number }>()
const CACHE_TTL = 180000 // 3 minutes in milliseconds

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'news'
    const cacheKey = `ads_${category}`

    // Check in-memory cache
    const cached = adsCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log('📢 ✅ Cache HIT for category:', category)
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
          'CDN-Cache-Control': 'public, max-age=300',
          'X-Cache': 'HIT',
          'X-Cache-Age': Math.floor((Date.now() - cached.timestamp) / 1000).toString()
        }
      })
    }

    console.log('📢 ❌ Cache MISS for category:', category, '- fetching from database')

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
    adsCache.set(cacheKey, {
      data: ads,
      timestamp: Date.now()
    })

    console.log('📢 ✅ Fetched and cached', ads.length, 'ads for category:', category)

    return NextResponse.json(ads, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS'
      }
    })
  } catch (error) {
    console.error('❌ Error fetching active ads:', error)
    // Return empty array instead of error to prevent page breaks
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'public, max-age=60', // Cache errors for 1 minute
      }
    })
  }
}





