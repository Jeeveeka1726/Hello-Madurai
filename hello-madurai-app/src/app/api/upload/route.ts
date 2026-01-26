import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import { writeFile } from 'fs/promises'
import { IMAGE_CONFIG } from '@/lib/utils/imageResize'
import prisma from '@/lib/prisma'

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
    const skipResize = data.get('skipResize') === 'true'

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
    if (fileType === 'image' && file.type !== 'image/svg+xml' && !skipResize) {
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

    // Use a simple approach that works in both development and production
    const timestamp = Date.now()
    const fileExtension = resized ? 'webp' : file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.${fileExtension}`
    
    // For production, use a placeholder URL that works
    // This avoids the long base64 URLs and file system issues
    const isProduction = process.env.NODE_ENV === 'production'
    let publicUrl: string
    
    // For both production and development, use a simple approach
    // Store the image data and return a clean URL
    const mimeType = resized ? 'image/webp' : file.type
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'image')
    
    // Always try to save to Hostinger database first
    try {
      // Save image to Hostinger MySQL database
      const imageRecord = await prisma.image.create({
        data: {
          filename: filename,
          data: processedBuffer,
          mimeType: mimeType,
          size: processedBuffer.length,
          width: IMAGE_CONFIG.news.width,
          height: IMAGE_CONFIG.news.height,
        }
      })
      
      // Return API route to serve the image
      publicUrl = `/api/image/${imageRecord.id}`
      console.log('✅ Image saved to Hostinger database:', imageRecord.id)
    } catch (dbError) {
      console.error('Database save error:', dbError)
      
      // Fallback to local file system (development only)
      try {
        if (!existsSync(uploadsDir)) {
          mkdirSync(uploadsDir, { recursive: true })
        }
        
        const filePath = join(uploadsDir, filename)
        await writeFile(filePath, processedBuffer)
        publicUrl = `/uploads/image/${filename}`
        console.log('✅ Image saved to local file system:', filename)
      } catch (fileError) {
        console.error('File system write also failed:', fileError)
        return NextResponse.json(
          { error: 'Failed to save image. Please try again.' },
          { status: 500 }
        )
      }
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
