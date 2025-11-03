import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
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

    // ALWAYS use base64 data URLs (no file system writes)
    const base64 = processedBuffer.toString('base64')
    const mimeType = resized ? 'image/webp' : file.type
    const publicUrl = `data:${mimeType};base64,${base64}`
    const filename = `base64_${Date.now()}.${resized ? 'webp' : file.name.split('.').pop() || 'jpg'}`

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
      isBase64: true, // Always true for this route
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




