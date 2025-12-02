import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY || '187251687769698',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'yf7cHBXxd4qOc3e3wQy-ct1BLqM',
})

// Increase max duration for file uploads
export const maxDuration = 60 // 60 seconds

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

    // Validate file size (max 100MB with Cloudinary)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      )
    }

    console.log('📤 Uploading to Cloudinary:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to Cloudinary
    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // 'video' resource type works for audio files
          folder: 'hello-madurai/radio-audio',
          public_id: `audio-${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    console.log('✅ Cloudinary upload successful:', uploadResult.public_id)

    // Get file extension
    const originalFilename = file.name
    const extension = originalFilename.split('.').pop() || 'mp3'

    // Generate filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const filename = `radio-audio-${timestamp}-${randomString}.${extension}`

    // Save metadata to database (not the file itself)
    const audioRecord = await prisma.audio.create({
      data: {
        filename: filename,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        mimeType: file.type,
        size: file.size,
        duration: uploadResult.duration ? `${Math.floor(uploadResult.duration / 60)}:${String(Math.floor(uploadResult.duration % 60)).padStart(2, '0')}` : null
      }
    })

    console.log('✅ Database record created:', audioRecord.id)

    // Return URL to access the audio
    return NextResponse.json({
      url: uploadResult.secure_url, // Direct Cloudinary URL
      filename: filename,
      size: file.size,
      mimeType: file.type,
      duration: audioRecord.duration
    })
  } catch (error) {
    console.error('❌ Error uploading audio:', error)
    return NextResponse.json(
      { error: 'Failed to upload audio file' },
      { status: 500 }
    )
  }
}

