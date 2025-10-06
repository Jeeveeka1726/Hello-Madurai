import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/videos - Get all videos
export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      include: {
        comments: {
          orderBy: { createdAt: 'desc' }
        },
        shares: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })
    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

// POST /api/admin/videos - Create new video
export async function POST(request: NextRequest) {
  try {
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

    const video = await prisma.video.create({
      data: {
        title: body.title,
        title_ta: body.title_ta,
        description: body.description,
        description_ta: body.description_ta,
        videoUrl: cleanVideoUrl,
        youtubeId: youtubeId,
        thumbnail: body.thumbnail || (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null),
        category: body.category,
        duration: body.duration,
        featured: body.featured || false,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date()
      }
    })
    
    return NextResponse.json(video, { status: 201 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    )
  }
}
