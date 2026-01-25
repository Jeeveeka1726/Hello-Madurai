import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/reels/[id] - Get a specific reel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reel = await prisma.reel.findUnique({
      where: { id: params.id }
    })

    if (!reel) {
      return NextResponse.json(
        { error: 'Reel not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(reel)
  } catch (error) {
    console.error('Error fetching reel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reel' },
      { status: 500 }
    )
  }
}

// PUT /api/reels/[id] - Update a specific reel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      title,
      title_ta,
      videoUrl,
      thumbnailUrl,
      reelType,
      duration,
      active,
      orderNumber
    } = body

    // Auto-generate thumbnail for YouTube videos if not provided
    let finalThumbnailUrl = thumbnailUrl
    if (reelType === 'youtube' && videoUrl && !thumbnailUrl) {
      const videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
      if (videoId) {
        finalThumbnailUrl = `https://img.youtube.com/vi/${videoId[1]}/maxresdefault.jpg`
      }
    }

    const reel = await prisma.reel.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(title_ta !== undefined && { title_ta }),
        ...(videoUrl !== undefined && { videoUrl }),
        ...(finalThumbnailUrl !== undefined && { thumbnailUrl: finalThumbnailUrl }),
        ...(reelType !== undefined && { reelType }),
        ...(duration !== undefined && { duration }),
        ...(active !== undefined && { active }),
        ...(orderNumber !== undefined && { orderNumber })
      }
    })

    return NextResponse.json(reel)
  } catch (error) {
    console.error('Error updating reel:', error)
    return NextResponse.json(
      { error: 'Failed to update reel' },
      { status: 500 }
    )
  }
}

// DELETE /api/reels/[id] - Delete a specific reel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.reel.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Reel deleted successfully' })
  } catch (error) {
    console.error('Error deleting reel:', error)
    return NextResponse.json(
      { error: 'Failed to delete reel' },
      { status: 500 }
    )
  }
}
