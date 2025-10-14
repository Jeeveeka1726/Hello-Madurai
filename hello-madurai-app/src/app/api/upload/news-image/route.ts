import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { resizeImage, validateImageDimensions, IMAGE_CONFIG } from '@/lib/utils/imageResize'

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

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'news-images')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const ext = path.extname(file.name)
    const filename = `${timestamp}${ext}`
    const filepath = path.join(uploadDir, filename)

    // Save file temporarily
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Validate dimensions
    const validation = await validateImageDimensions(
      filepath,
      IMAGE_CONFIG.news.width,
      IMAGE_CONFIG.news.height
    )

    let finalPath = filepath
    let resized = false

    // Auto-resize if needed
    if (validation.needsResize) {
      const resizedFilename = `${timestamp}_resized.webp`
      const resizedPath = path.join(uploadDir, resizedFilename)

      const resizeResult = await resizeImage(filepath, resizedPath, IMAGE_CONFIG.news)

      if (resizeResult.success) {
        finalPath = resizedPath
        resized = true
      }
    }

    // Return public URL
    const publicPath = finalPath.replace(path.join(process.cwd(), 'public'), '')
    const url = publicPath.replace(/\\/g, '/')

    return NextResponse.json({
      url,
      originalDimensions: validation.actual,
      targetDimensions: {
        width: IMAGE_CONFIG.news.width,
        height: IMAGE_CONFIG.news.height,
      },
      resized,
    })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}

