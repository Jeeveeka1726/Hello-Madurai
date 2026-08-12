import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 3 minutes
export const revalidate = 180

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = searchParams.get('limit')

    // Fetch all businesses from Hostinger MySQL
    const businesses = await prisma.business.findMany({
      orderBy: {
        orderNumber: 'asc'
      },
      include: {
        mainCategory: {
          select: {
            id: true,
            name: true,
            name_ta: true
          }
        },
        subcategory: {
          select: {
            id: true,
            name: true,
            name_ta: true,
            icon: true
          }
        },
        comments: {
          select: {
            id: true,
            content: true,
            author: true,
            rating: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 5 // Only fetch latest 5 comments per business
        }
      },
      // Remove the hard limit - fetch ALL businesses
      // Only apply limit if explicitly requested (for admin/testing)
      ...(limit ? { take: parseInt(limit) } : {})
    })

    console.log(`📊 Directory API: Fetched ${businesses.length} businesses`)

    return NextResponse.json(businesses || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360'
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
