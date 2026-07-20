import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save as files (works for both development and Hostinger production)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'image')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename - preserve original extension
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}.${ext}`
    const filepath = path.join(uploadDir, filename)

    // Save original image without modification
    await writeFile(filepath, buffer)

    // Return public URL
    const publicUrl = `/uploads/image/${filename}`

    return NextResponse.json({
      url: publicUrl,
      message: 'Image uploaded successfully (original size preserved)',
      originalSize: file.size
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


