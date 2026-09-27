import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Always serve the live banner list - no Next.js route caching, no CDN
// caching, no browser caching. Admin banner changes must be visible on the
// very next page load on every device (phone / tablet / laptop).
export const dynamic = 'force-dynamic'

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
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache'
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
