import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all businesses from Hostinger MySQL
    const businesses = await prisma.business.findMany({
      orderBy: {
        orderNumber: 'asc'
      },
      include: {
        mainCategory: true,
        subcategory: true,
        comments: true
      }
    })

    return NextResponse.json(businesses || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}
