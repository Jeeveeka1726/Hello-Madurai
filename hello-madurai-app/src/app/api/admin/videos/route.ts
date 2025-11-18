import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET all videos (admin)
export async function GET() {
  try {
    const videos = await prisma.video.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(videos || [])
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new video
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const video = await prisma.video.create({
      data: {
        title: body.title,
        title_ta: body.title_ta || null,
        description: body.description,
        description_ta: body.description_ta || null,
        videoUrl: body.videoUrl,
        thumbnailUrl: body.thumbnailUrl || null,
        category: body.category,
        duration: body.duration || null,
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

