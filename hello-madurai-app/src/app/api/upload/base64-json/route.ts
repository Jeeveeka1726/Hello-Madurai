import { NextRequest, NextResponse } from 'next/server'

const allowedFileTypes = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  pdf: ['application/pdf'],
  audio: ['audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/m4a'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
}

const maxFileSizes = {
  image: 5 * 1024 * 1024, // 5MB
  pdf: 10 * 1024 * 1024, // 10MB for database storage
  audio: 50 * 1024 * 1024, // 50MB
  document: 10 * 1024 * 1024 // 10MB
}

export async function POST(request: NextRequest) {
  try {
    const { file, filename, mimeType, fileType = 'pdf' } = await request.json()

    if (!file) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 })
    }

    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
    }

    if (!mimeType) {
      return NextResponse.json({ error: 'No mimeType provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = allowedFileTypes[fileType as keyof typeof allowedFileTypes] || allowedFileTypes.pdf
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed types for ${fileType}: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Estimate file size from base64 (base64 is ~33% larger than binary)
    const estimatedSize = (file.length * 3) / 4
    const maxSize = maxFileSizes[fileType as keyof typeof maxFileSizes] || maxFileSizes.pdf
    
    if (estimatedSize > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024))
      return NextResponse.json({ 
        error: `File too large. Maximum size for ${fileType} is ${maxSizeMB}MB.` 
      }, { status: 400 })
    }

    // Create data URL
    const publicUrl = `data:${mimeType};base64,${file}`
    const processedFilename = `base64_${Date.now()}.${filename.split('.').pop() || 'pdf'}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: processedFilename,
      size: Math.round(estimatedSize),
      type: mimeType,
      category: fileType,
      isBase64: true,
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
