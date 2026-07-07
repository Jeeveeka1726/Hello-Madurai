import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 1 minute (popup ads should refresh frequently)
export const revalidate = 60

export async function GET() {
  try {
    const now = new Date()

    // Fetch active popup ads from Hostinger MySQL
    const ads = await prisma.popupAd.findMany({
      where: {
        active: true,
        startDate: { lte: now },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 1 // Only get the most recent active ad
    })

    return NextResponse.json(ads[0] || null, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('Error fetching active popup ads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popup ads' },
      { status: 500 }
    )
  }
}
