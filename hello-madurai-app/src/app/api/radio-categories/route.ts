import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all radio categories (public)
export async function GET() {
  try {
    const categories = await prisma.radioCategory.findMany({
      orderBy: {
        orderNumber: 'asc'
      },
      include: {
        singers: {
          include: {
            _count: {
              select: { songs: true }
            }
          }
        }
      }
    })

    return NextResponse.json(categories || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('Error in radio categories API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

