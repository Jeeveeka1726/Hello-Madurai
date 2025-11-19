import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT update video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const video = await prisma.video.update({
      where: { id },
      data: {
        title: body.title,
        title_ta: body.title_ta || null,
        videoUrl: body.videoUrl,
        videoType: body.videoType || 'upload',
        thumbnailUrl: body.thumbnailUrl || null,
        category: body.category,
        orderNumber: body.orderNumber || 0,
        duration: body.duration || null,
        featured: body.featured || false
      }
    })

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    )
  }
}

// DELETE video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}

