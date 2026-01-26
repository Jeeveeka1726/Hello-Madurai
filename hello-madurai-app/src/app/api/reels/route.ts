import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/reels - Get all reels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    
    const reels = await prisma.reel.findMany({
      where: active === 'true' ? { active: true } : undefined,
      orderBy: { orderNumber: 'asc' },
      take: 10 // Limit to 10 reels for homepage
    })

    return NextResponse.json(reels)
  } catch (error) {
    console.error('Error fetching reels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reels' },
      { status: 500 }
    )
  }
}

// POST /api/reels - Create a new reel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      title_ta,
      videoUrl,
      thumbnailUrl,
      reelType = 'youtube',
      duration,
      orderNumber = 0
    } = body

    // Validate required fields
    if (!title || !videoUrl) {
      return NextResponse.json(
        { error: 'Title and video URL are required' },
        { status: 400 }
      )
    }

    // No auto-generation - use only manually provided thumbnails
    const reel = await prisma.reel.create({
      data: {
        title,
        title_ta,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        reelType,
        duration,
        orderNumber
      }
    })

    return NextResponse.json(reel, { status: 201 })
  } catch (error) {
    console.error('Error creating reel:', error)
    return NextResponse.json(
      { error: 'Failed to create reel' },
      { status: 500 }
    )
  }
}

// PUT /api/reels - Update reel order
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { reels } = body

    if (!Array.isArray(reels)) {
      return NextResponse.json(
        { error: 'Reels array is required' },
        { status: 400 }
      )
    }

    // Update order numbers for all reels
    const updatePromises = reels.map((reel: any, index: number) =>
      prisma.reel.update({
        where: { id: reel.id },
        data: { orderNumber: index }
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ message: 'Reel order updated successfully' })
  } catch (error) {
    console.error('Error updating reel order:', error)
    return NextResponse.json(
      { error: 'Failed to update reel order' },
      { status: 500 }
    )
  }
}
