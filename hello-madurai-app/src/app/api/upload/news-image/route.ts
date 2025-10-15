import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { IMAGE_CONFIG } from '@/lib/utils/imageResize'

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

    // Convert to base64 data URL
    const base64 = processedBuffer.toString('base64')
    const mimeType = resized ? 'image/webp' : file.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({
      url: dataUrl,
      originalDimensions: {
        width: originalWidth,
        height: originalHeight,
      },
      targetDimensions: {
        width: IMAGE_CONFIG.news.width,
        height: IMAGE_CONFIG.news.height,
      },
      resized,
      isBase64: true,
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

