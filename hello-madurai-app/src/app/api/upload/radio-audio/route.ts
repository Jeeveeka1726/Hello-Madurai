import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type - accept common audio formats
    const allowedTypes = [
      'audio/mpeg',      // MP3
      'audio/mp3',       // MP3 (alternative)
      'audio/wav',       // WAV
      'audio/wave',      // WAV (alternative)
      'audio/ogg',       // OGG
      'audio/aac',       // AAC
      'audio/m4a',       // M4A
      'audio/x-m4a',     // M4A (alternative)
      'audio/mp4',       // MP4 audio
      'audio/webm',      // WebM audio
      'audio/flac'       // FLAC
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Only audio files (MP3, WAV, OGG, AAC, M4A, FLAC) are allowed.` },
        { status: 400 }
      )
    }

    // Validate file size (max 100MB for audio)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get file extension
    const originalFilename = file.name
    const extension = originalFilename.split('.').pop() || 'mp3'

    // Generate filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const filename = `radio-audio-${timestamp}-${randomString}.${extension}`

    // Save to database using Audio model
    const audioRecord = await prisma.audio.create({
      data: {
        filename: filename,
        data: buffer,
        mimeType: file.type,
        size: buffer.length
      }
    })

    // Return URL to access the audio
    const publicUrl = `/api/audio/${audioRecord.id}`

    return NextResponse.json({
      url: publicUrl,
      filename: filename,
      size: buffer.length,
      mimeType: file.type,
      duration: null // We don't calculate duration server-side
    })
  } catch (error) {
    console.error('Error uploading audio:', error)
    return NextResponse.json(
      { error: 'Failed to upload audio file' },
      { status: 500 }
    )
  }
}

