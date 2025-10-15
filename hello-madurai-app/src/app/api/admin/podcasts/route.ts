import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const podcasts = await prisma.podcast.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(podcasts)
  } catch (error) {
    console.error('Error fetching podcasts:', error)
    return NextResponse.json({ error: 'Failed to fetch podcasts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      title_ta,
      description,
      description_ta,
      host,
      duration,
      audio_file_url,
      featured
    } = body

    const podcast = await prisma.podcast.create({
      data: {
        title,
        title_ta: title_ta || undefined,
        description: description || undefined,
        description_ta: description_ta || undefined,
        host,
        duration,
        audioFileUrl: audio_file_url,
        featured: featured || false
      }
    })

    return NextResponse.json(podcast, { status: 201 })
  } catch (error) {
    console.error('Error creating podcast:', error)
    return NextResponse.json({ error: 'Failed to create podcast' }, { status: 500 })
  }
}
