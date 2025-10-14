import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    return NextResponse.json(ads[0] || null)
  } catch (error) {
    console.error('Error fetching active popup ads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popup ads' },
      { status: 500 }
    )
  }
}
