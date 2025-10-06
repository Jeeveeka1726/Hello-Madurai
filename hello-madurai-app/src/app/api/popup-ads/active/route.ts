import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    
    const activeAds = await prisma.popupAd.findMany({
      where: {
        active: true,
        startDate: {
          lte: now
        },
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(activeAds)
  } catch (error) {
    console.error('Error fetching active popup ads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popup ads' },
      { status: 500 }
    )
  }
}

