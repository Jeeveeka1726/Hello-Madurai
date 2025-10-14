import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📹 Like API called for video:', id)
    
    const body = await request.json()
    const { action } = body // 'like' or 'unlike'
    console.log('Action:', action)

    // Check if video exists first
    const existingVideo = await prisma.video.findUnique({
      where: { id }
    })

    if (!existingVideo) {
      console.error('❌ Video not found:', id)
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    console.log('Video found, current likes:', existingVideo.likes)

    // Update likes count based on action
    const video = await prisma.video.update({
      where: { id },
      data: {
        likes: {
          increment: action === 'like' ? 1 : -1
        }
      }
    })

    console.log('✅ Video likes updated:', video.likes)
    return NextResponse.json({ likes: video.likes, success: true })
  } catch (error: any) {
    console.error('❌ Error updating video likes:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json(
      { 
        error: 'Failed to update likes',
        details: error.message,
        code: error.code
      },
      { status: 500 }
    )
  }
}
