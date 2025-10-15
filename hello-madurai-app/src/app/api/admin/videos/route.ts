import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/videos - Get all videos
export async function GET() {
  try {
    // Fetch all videos from Hostinger MySQL
    const videos = await prisma.video.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(videos || [])
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
        const urlParams = new URLSearchParams(body.videoUrl.split('?')[1])
        youtubeId = urlParams.get('v')
      } else if (body.videoUrl.includes('youtu.be/')) {
        youtubeId = body.videoUrl.split('youtu.be/')[1]?.split(/[?#]/)[0]
      } else if (body.videoUrl.includes('youtube.com/embed/')) {
        youtubeId = body.videoUrl.split('embed/')[1]?.split(/[?#]/)[0]
      } else if (body.videoUrl.length === 11 && !body.videoUrl.includes('/')) {
        youtubeId = body.videoUrl
      }
      
      if (youtubeId) {
        cleanVideoUrl = `https://www.youtube.com/watch?v=${youtubeId}`
      }
    }

    // Create video in Hostinger MySQL
    const video = await prisma.video.create({
      data: {
        title: body.title,
        title_ta: body.title_ta,
        description: body.description || '',
        description_ta: body.description_ta,
        videoUrl: cleanVideoUrl,
        youtubeId: youtubeId || undefined,
        thumbnail: body.thumbnail,
        category: body.category || 'general',
        duration: body.duration,
        featured: body.featured || false
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
