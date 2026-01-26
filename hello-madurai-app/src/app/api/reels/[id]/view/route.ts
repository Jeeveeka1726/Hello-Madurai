import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// POST /api/reels/[id]/view - Increment view count
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reel = await prisma.reel.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ views: reel.views })
  } catch (error) {
    console.error('Error incrementing reel views:', error)
    return NextResponse.json(
      { error: 'Failed to increment views' },
      { status: 500 }
    )
  }
}

