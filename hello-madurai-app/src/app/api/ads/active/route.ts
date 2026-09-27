import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Always serve live ads - admin changes must appear on the next page load.
// (previously: revalidate=300 + in-memory 3min TTL + 5min browser/CDN
// headers made ad updates take 10+ minutes to show everywhere)
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'news'

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

    return NextResponse.json(ads, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
        'X-Cache': 'MISS'
      }
    })
  } catch (error) {
    console.error('❌ Error fetching active ads:', error)
    // Return empty array instead of error to prevent page breaks
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  }
}





