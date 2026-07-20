import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'jpg'
    const filename = `banner_${timestamp}.${ext}`

    // Save to database (works on Hostinger production)
    console.log('📤 Saving banner image to database...')

    const imageRecord = await prisma.image.create({
      data: {
        filename: filename,
        data: buffer,
        mimeType: file.type,
        size: buffer.length
      }
    })

    const publicUrl = `/api/images/${imageRecord.id}`
    console.log('✅ Banner image saved successfully:', publicUrl)

    return NextResponse.json({
      url: publicUrl,
      message: 'Image uploaded successfully (saved to database)',
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


