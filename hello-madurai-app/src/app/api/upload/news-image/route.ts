import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import sharp from 'sharp'
import { IMAGE_CONFIG } from '@/lib/utils/imageResize'
import prisma from '@/lib/prisma'

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

    // Get file buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get original image metadata
    const metadata = await sharp(buffer).metadata()
    const originalWidth = metadata.width || 0
    const originalHeight = metadata.height || 0

    // Check if resize is needed
    const needsResize =
      originalWidth !== IMAGE_CONFIG.news.width ||
      originalHeight !== IMAGE_CONFIG.news.height

    let processedBuffer = buffer
    let resized = false

    // Resize if needed
    if (needsResize) {
      processedBuffer = await sharp(buffer)
        .resize(IMAGE_CONFIG.news.width, IMAGE_CONFIG.news.height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .webp({ quality: IMAGE_CONFIG.news.quality })
        .toBuffer()
      resized = true
    }

    // Save to database and return proper URL (same as /api/upload)
    const timestamp = Date.now()
    const fileExtension = resized ? 'webp' : file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.${fileExtension}`
    const mimeType = resized ? 'image/webp' : file.type

    let publicUrl: string

    try {
      // Try to save to Hostinger database
      console.log('📤 Attempting to save to database...')
      const imageRecord = await prisma.image.create({
        data: {
          filename: filename,
          data: processedBuffer,
          mimeType: mimeType,
          size: processedBuffer.length,
          category: 'image'
        }
      })

      // Return API route to serve the image
      publicUrl = `/api/image/${imageRecord.id}`
      console.log('✅ Image saved to Hostinger database:', imageRecord.id)
    } catch (dbError) {
      console.error('❌ Database save error:', dbError)
      console.error('Error details:', {
        name: dbError instanceof Error ? dbError.name : 'Unknown',
        message: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined
      })

      // Fallback to local file system (development only)
      try {
        console.log('📁 Attempting fallback to local file system...')
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'image')
        if (!existsSync(uploadsDir)) {
          console.log('📁 Creating uploads directory:', uploadsDir)
          mkdirSync(uploadsDir, { recursive: true })
        }

        const filePath = join(uploadsDir, filename)
        console.log('📁 Writing file to:', filePath)
        await writeFile(filePath, processedBuffer)
        publicUrl = `/uploads/image/${filename}`
        console.log('✅ Image saved to local file system:', filename)
      } catch (fileError) {
        console.error('❌ File system write also failed:', fileError)
        console.error('File error details:', {
          name: fileError instanceof Error ? fileError.name : 'Unknown',
          message: fileError instanceof Error ? fileError.message : String(fileError),
          stack: fileError instanceof Error ? fileError.stack : undefined
        })
        return NextResponse.json(
          {
            error: 'Failed to save image. Please try again.',
            details: {
              dbError: dbError instanceof Error ? dbError.message : String(dbError),
              fileError: fileError instanceof Error ? fileError.message : String(fileError)
            }
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      url: publicUrl,
      originalDimensions: {
        width: originalWidth,
        height: originalHeight,
      },
      targetDimensions: {
        width: IMAGE_CONFIG.news.width,
        height: IMAGE_CONFIG.news.height,
      },
      resized,
      isBase64: false,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    )
  }
}

