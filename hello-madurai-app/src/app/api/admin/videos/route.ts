import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/videos - Get all videos
export async function GET() {
  try {
    const videos = await prisma.video.findMany({
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
    let youtubeId = body.youtubeId
    if (body.videoUrl && body.videoUrl.includes('youtube.com')) {
      const urlParams = new URLSearchParams(body.videoUrl.split('?')[1])
      youtubeId = urlParams.get('v')
    } else if (body.videoUrl && body.videoUrl.includes('youtu.be')) {
      youtubeId = body.videoUrl.split('/').pop()
    }

    const video = await prisma.video.create({
      data: {
        title: body.title,
        title_ta: body.title_ta,
        description: body.description,
        description_ta: body.description_ta,
        videoUrl: body.videoUrl,
        youtubeId: youtubeId,
        thumbnail: body.thumbnail,
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
