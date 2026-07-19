import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 5 minutes
export const revalidate = 300

export async function GET() {
  try {
    const banners = await prisma.noticeBanner.findMany({
      where: { active: true },
      orderBy: {
        orderNumber: 'asc'
      }
    })

    return NextResponse.json(banners || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching notice banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notice banners' },
      { status: 500 }
    )
  }
}
