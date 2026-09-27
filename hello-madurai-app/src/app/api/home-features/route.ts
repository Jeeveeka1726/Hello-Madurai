import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Always serve live feature config - admin changes must appear on the next
// page load (previously cached 5+ minutes at route, CDN and browser levels)
export const dynamic = 'force-dynamic'

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
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
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
