import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, publicId, filename, mimeType, size, duration } = body

    if (!url || !publicId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save metadata to database
    const audioRecord = await prisma.audio.create({
      data: {
        filename: filename || 'audio.mp3',
        url,
        publicId,
        mimeType: mimeType || 'audio/mpeg',
        size: size || 0,
        duration: duration || null,
      },
    })

    console.log('✅ Database record created:', audioRecord.id)

    return NextResponse.json({
      id: audioRecord.id,
      url: audioRecord.url,
      filename: audioRecord.filename,
    })
  } catch (error) {
    console.error('❌ Error saving metadata:', error)
    return NextResponse.json(
      { error: 'Failed to save audio metadata' },
      { status: 500 }
    )
  }
}

