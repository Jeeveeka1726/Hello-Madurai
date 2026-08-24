import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 5 minutes
export const revalidate = 300

// GET: Fetch all directory categories for public use
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.directoryCategory.findMany({
      include: {
        subcategories: {
          include: {
            _count: {
              select: { businesses: true }
            }
          },
          orderBy: { orderNumber: 'asc' }
        },
        _count: {
          select: {
            businesses: true,
            subcategories: true
          }
        }
      },
      orderBy: { orderNumber: 'asc' }
    })

    return NextResponse.json({ categories }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, must-revalidate',
        'Vary': 'Accept-Encoding',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Error fetching directory categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

