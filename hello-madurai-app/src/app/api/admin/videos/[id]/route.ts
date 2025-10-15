import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/videos/[id] - Get single video
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const video = await prisma.video.findUnique({
      where: { id },
      include: {
        comments: true,
        shares: true
      }
    })

    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/videos/[id] - Update video
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Extract YouTube ID from URL if provided
    let youtubeId = null
    let cleanVideoUrl = body.videoUrl
    
    // Try to extract YouTube ID from various URL formats
    if (body.videoUrl) {
      if (body.videoUrl.includes('youtube.com/watch')) {
        // https://www.youtube.com/watch?v=VIDEO_ID
        const urlParams = new URLSearchParams(body.videoUrl.split('?')[1])
        youtubeId = urlParams.get('v')
      } else if (body.videoUrl.includes('youtu.be/')) {
        // https://youtu.be/VIDEO_ID
        youtubeId = body.videoUrl.split('youtu.be/')[1]?.split(/[?#]/)[0]
      } else if (body.videoUrl.includes('youtube.com/embed/')) {
        // https://www.youtube.com/embed/VIDEO_ID
        youtubeId = body.videoUrl.split('embed/')[1]?.split(/[?#]/)[0]
      } else if (body.videoUrl.length === 11 && !body.videoUrl.includes('/')) {
        // Just the video ID
        youtubeId = body.videoUrl
      }
      
      // If we found a YouTube ID, normalize the URL
      if (youtubeId) {
        cleanVideoUrl = `https://www.youtube.com/watch?v=${youtubeId}`
      }
    }

    const video = await prisma.video.update({
      where: { id },
      data: {
        title: body.title,
        title_ta: body.title_ta || undefined,
        description: body.description || undefined,
        description_ta: body.description_ta || undefined,
        videoUrl: cleanVideoUrl,
        youtubeId: youtubeId || undefined,
        thumbnail: body.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : undefined),
        category: body.category,
        duration: body.duration || undefined,
        featured: body.featured,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined
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

// DELETE /api/admin/videos/[id] - Delete video
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Delete the video (will cascade delete comments and shares)
    await prisma.video.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Video deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    )
  }
}
