import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const podcasts = await prisma.podcast.findMany({
      orderBy: { createdAt: 'desc' }
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
      audioUrl,
      featured
    } = body

    const podcast = await prisma.podcast.create({
      data: {
        title,
        title_ta,
        description,
        description_ta,
        host,
        duration,
        audioUrl,
        featured: featured || false
      }
    })

    return NextResponse.json(podcast, { status: 201 })
  } catch (error) {
    console.error('Error creating podcast:', error)
    return NextResponse.json({ error: 'Failed to create podcast' }, { status: 500 })
  }
}
