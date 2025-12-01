import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import sharp from 'sharp'

const IMAGE_CONFIG = {
  singer: {
    width: 400,
    height: 400,
    quality: 85
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
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

    // Get original dimensions
    const metadata = await sharp(buffer).metadata()
    const originalWidth = metadata.width || 0
    const originalHeight = metadata.height || 0

    console.log('📸 Processing singer image:', {
      originalWidth,
      originalHeight,
      targetWidth: IMAGE_CONFIG.singer.width,
      targetHeight: IMAGE_CONFIG.singer.height
    })

    // Resize to 400x400 square
    const processedBuffer = await sharp(buffer)
      .resize(IMAGE_CONFIG.singer.width, IMAGE_CONFIG.singer.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: IMAGE_CONFIG.singer.quality })
      .toBuffer()

    const resized = originalWidth !== IMAGE_CONFIG.singer.width || originalHeight !== IMAGE_CONFIG.singer.height

    // Save to database
    const timestamp = Date.now()
    const filename = `singer_${timestamp}.webp`
    const mimeType = 'image/webp'

    let publicUrl: string

    try {
      console.log('📤 Saving singer image to database...')
      
      const imageRecord = await prisma.image.create({
        data: {
          filename: filename,
          data: processedBuffer,
          mimeType: mimeType,
          size: processedBuffer.length
        }
      })

      publicUrl = `/api/images/${imageRecord.id}`
      console.log('✅ Singer image saved successfully:', publicUrl)

    } catch (dbError) {
      console.error('❌ Database save failed:', dbError)
      return NextResponse.json(
        {
          error: 'Failed to save image to database',
          details: dbError instanceof Error ? dbError.message : String(dbError)
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: publicUrl,
      originalDimensions: {
        width: originalWidth,
        height: originalHeight,
      },
      targetDimensions: {
        width: IMAGE_CONFIG.singer.width,
        height: IMAGE_CONFIG.singer.height,
      },
      resized,
      isBase64: false,
    })

  } catch (error) {
    console.error('Error uploading singer image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

