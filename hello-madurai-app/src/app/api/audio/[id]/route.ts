import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const audio = await prisma.audio.findUnique({
      where: { id }
    })

    if (!audio) {
      return NextResponse.json(
        { error: 'Audio not found' },
        { status: 404 }
      )
    }

    // Return the audio file with appropriate headers
    return new NextResponse(audio.data, {
      headers: {
        'Content-Type': audio.mimeType,
        'Content-Length': audio.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes'
      }
    })
  } catch (error) {
    console.error('Error serving audio:', error)
    return NextResponse.json(
      { error: 'Failed to serve audio' },
      { status: 500 }
    )
  }
}

