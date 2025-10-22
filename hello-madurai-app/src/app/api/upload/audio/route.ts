import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('audio') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload MP3, WAV, OGG, or M4A files.' },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Check if we're in production (Vercel) - use base64 data URLs
    const isProduction = process.env.NODE_ENV === 'production'
    
    let url: string
    let filename: string
    
    if (isProduction) {
      // In production, use base64 data URLs (Vercel has read-only file system)
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      url = `data:${file.type};base64,${base64}`
      filename = `base64_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    } else {
      // In development, save as files
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'audio')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      filename = `${timestamp}_${originalName}`
      const filepath = join(uploadsDir, filename)

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)

      // Return the public URL
      url = `/uploads/audio/${filename}`
    }
    
    return NextResponse.json({ 
      url,
      filename,
      size: file.size,
      type: file.type
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading audio file:', error)
    return NextResponse.json(
      { error: 'Failed to upload audio file' },
      { status: 500 }
    )
  }
}
