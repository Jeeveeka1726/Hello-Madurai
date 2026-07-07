import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 5 minutes
export const revalidate = 300

export async function GET() {
  try {
    const features = await prisma.homeFeature.findMany({
      where: { active: true },
      orderBy: {
        orderNumber: 'asc'
      }
    })

    return NextResponse.json(features || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching home features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home features' },
      { status: 500 }
    )
  }
}
