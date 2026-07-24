import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 3 minutes
export const revalidate = 180

// GET /api/directory/slug/[slug] - Get business by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const startTime = Date.now()
  
  try {
    const { slug } = await params

    // Fetch specific business by slug with related data
    const business = await prisma.business.findUnique({
      where: { slug },
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
            name_ta: true
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
          take: 20 // Limit to latest 20 comments
        }
      }
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const duration = Date.now() - startTime
    console.log(`✅ Business with slug ${slug} fetched in ${duration}ms`)

    return NextResponse.json(business, {
      headers: {
        'Cache-Control': 'public, s-maxage=180, stale-while-revalidate=360',
        'X-Response-Time': `${duration}ms`
      }
    })
  } catch (error) {
    console.error('Error fetching business by slug:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
