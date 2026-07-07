import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 3 minutes
export const revalidate = 180

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'news'

    const ads = await prisma.ad.findMany({
      where: {
        active: true,
        OR: [
          { category },
          { category: 'all' }
        ]
      },
      orderBy: {
        position: 'asc'
      },
      take: 10 // Limit to 10 ads per request
    })

    return NextResponse.json(ads, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360'
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





