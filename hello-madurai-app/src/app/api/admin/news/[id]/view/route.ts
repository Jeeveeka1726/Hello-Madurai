import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/admin/news/[id]/view - Increment view count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Increment view count
    const news = await prisma.news.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ 
      success: true, 
      views: news.views 
    })
  } catch (error) {
    console.error('Error incrementing views:', error)
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 }
    )
  }
}




