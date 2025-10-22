import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { writeFile } from 'fs/promises'
import { IMAGE_CONFIG } from '@/lib/utils/imageResize'

const allowedFileTypes = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  pdf: ['application/pdf'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
}

const maxFileSizes = {
  image: 5 * 1024 * 1024, // 5MB
  pdf: 10 * 1024 * 1024, // 10MB
  audio: 50 * 1024 * 1024, // 50MB
  document: 10 * 1024 * 1024 // 10MB
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File
    const fileType = (data.get('type') as string) || 'image'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = allowedFileTypes[fileType as keyof typeof allowedFileTypes] || allowedFileTypes.image
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types for ${fileType}: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Validate file size
    const maxSize = maxFileSizes[fileType as keyof typeof maxFileSizes] || maxFileSizes.image
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return NextResponse.json({ 
        error: `File too large. Maximum size for ${fileType} is ${maxSizeMB}MB.` 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let processedBuffer = buffer
    let resized = false
    let originalWidth = 0
    let originalHeight = 0

    // Process images with sharp (resize + optimize)
    if (fileType === 'image' && file.type !== 'image/svg+xml') {
      try {
        const metadata = await sharp(buffer).metadata()
        originalWidth = metadata.width || 0
        originalHeight = metadata.height || 0

        // Check if resize is needed (for featured images, use news config)
        const needsResize = 
          originalWidth !== IMAGE_CONFIG.news.width || 
          originalHeight !== IMAGE_CONFIG.news.height

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
      } catch (sharpError) {
        console.error('Sharp processing error:', sharpError)
        // Continue with original buffer if sharp fails
      }
    }

    // Check if we're in production (Vercel) - use base64 data URLs
    const isProduction = process.env.NODE_ENV === 'production'
    
    let publicUrl: string
    let filename: string
    let mimeType = resized ? 'image/webp' : file.type
    
    if (isProduction) {
      // In production, use base64 data URLs (Vercel has read-only file system)
      const base64 = processedBuffer.toString('base64')
      publicUrl = `data:${mimeType};base64,${base64}`
      filename = `base64_${Date.now()}.${resized ? 'webp' : file.name.split('.').pop() || 'jpg'}`
    } else {
      // In development, save as files
      const timestamp = Date.now()
      const fileExtension = resized ? 'webp' : file.name.split('.').pop() || 'jpg'
      filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.${fileExtension}`
      
      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'image')
      if (!existsSync(uploadsDir)) {
        mkdirSync(uploadsDir, { recursive: true })
      }
      
      const filePath = join(uploadsDir, filename)
      await writeFile(filePath, processedBuffer)
      publicUrl = `/uploads/image/${filename}`
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: filename,
      size: processedBuffer.length,
      type: mimeType,
      category: fileType,
      originalDimensions: originalWidth && originalHeight ? {
        width: originalWidth,
        height: originalHeight,
      } : undefined,
      targetDimensions: resized ? {
        width: IMAGE_CONFIG.news.width,
        height: IMAGE_CONFIG.news.height,
      } : undefined,
      resized,
      isBase64: isProduction, // true in production, false in development
    })

  } catch (error) {
    console.error('Upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json(
      { error: errorMessage, details: error instanceof Error ? error.stack : undefined }, 
      { status: 500 }
    )
  }
}

// Handle file deletion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
    }

    // Security: Only allow deletion of files in uploads directory
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
    }

    const filepath = join(process.cwd(), 'public', 'uploads', filename)
    
    if (existsSync(filepath)) {
      const { unlink } = await import('fs/promises')
      await unlink(filepath)
      return NextResponse.json({ success: true, message: 'File deleted' })
    } else {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
