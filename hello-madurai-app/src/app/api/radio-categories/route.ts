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
          orderBy: [
            { featured: 'desc' },    // Featured singers first
            { orderNumber: 'asc' },  // Then by manual order
            { updatedAt: 'desc' }    // Finally by latest updated
          ],
          include: {
            _count: {
              select: { songs: true }
            }
          }
        }
      }
    })

    console.log('[Radio API] Found categories:', categories.length)
    console.log('[Radio API] Total singers:', categories.reduce((sum, cat) => sum + (cat.singers?.length || 0), 0))
    console.log('[Radio API] Featured singers:', categories.reduce((sum, cat) => sum + (cat.singers?.filter(s => s.featured).length || 0), 0))

    return NextResponse.json(categories || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
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

