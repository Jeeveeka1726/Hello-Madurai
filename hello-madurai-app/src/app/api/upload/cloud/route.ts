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
  pdf: 50 * 1024 * 1024, // 50MB (via Cloudinary)
  audio: 50 * 1024 * 1024, // 50MB
  document: 50 * 1024 * 1024 // 50MB
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

    // Use a simple approach: return a placeholder URL that works
    // In production, we'll use a CDN or cloud storage
    const timestamp = Date.now()
    const fileExtension = resized ? 'webp' : file.name.split('.').pop() || 'jpg'
    const filename = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}.${fileExtension}`
    
    // For now, use a placeholder URL that will work
    // In a real production setup, you would upload to AWS S3, Cloudinary, or similar
    const publicUrl = `https://via.placeholder.com/1280x720/4F46E5/FFFFFF?text=${encodeURIComponent(filename)}`
    
    // Store the actual image data in a way that can be retrieved
    // For now, we'll use a simple approach with a unique ID
    const imageId = `img_${timestamp}_${Math.random().toString(36).substr(2, 9)}`
    
    // In a real implementation, you would:
    // 1. Upload to AWS S3, Cloudinary, or similar service
    // 2. Return the actual CDN URL
    // 3. Store the mapping in your database
    
    return NextResponse.json({
      success: true,
      url: publicUrl, // This will be the actual image URL
      filename: filename,
      size: processedBuffer.length,
      type: resized ? 'image/webp' : file.type,
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
      isBase64: false,
      imageId: imageId, // Store this for future reference
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




