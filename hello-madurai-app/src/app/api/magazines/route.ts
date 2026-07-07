import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 5 minutes
export const revalidate = 300

export async function GET() {
  try {
    // Fetch all magazines from Hostinger MySQL with their collections
    const magazines = await prisma.magazine.findMany({
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            name_ta: true
          }
        }
      },
      orderBy: [
        { orderNumber: 'asc' },  // First by manual order
        { createdAt: 'desc' }    // Then by newest
      ],
      take: 100 // Limit to 100 magazines
    })

    return NextResponse.json(magazines || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
  } catch (error) {
    console.error('Error fetching magazines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    )
  }
}
