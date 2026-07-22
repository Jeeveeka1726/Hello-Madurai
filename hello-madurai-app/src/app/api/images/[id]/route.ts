import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import sharp from 'sharp'

// Enable edge runtime for faster response
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const image = await prisma.image.findUnique({
      where: { id },
      select: {
        data: true,
        mimeType: true,
        size: true,
        updatedAt: true
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Generate ETag based on image ID and update time
    const etag = crypto
      .createHash('md5')
      .update(`${id}-${image.updatedAt.getTime()}`)
      .digest('hex')

    // Check if client already has this version (ETag validation)
    const clientETag = request.headers.get('if-none-match')
    if (clientETag === etag) {
      return new NextResponse(null, { status: 304 })
    }

    // Check if client supports WebP
    const acceptHeader = request.headers.get('accept') || ''
    const supportsWebP = acceptHeader.includes('image/webp')

    let finalData = image.data
    let finalMimeType = image.mimeType
    let finalSize = image.size

    // Convert to WebP if supported and not already WebP
    if (supportsWebP && !image.mimeType.includes('webp')) {
      try {
        const webpBuffer = await sharp(Buffer.from(image.data))
          .webp({ quality: 85, effort: 1 }) // effort: 1 for faster conversion
          .toBuffer()

        finalData = webpBuffer
        finalMimeType = 'image/webp'
        finalSize = webpBuffer.length
      } catch (conversionError) {
        console.error('WebP conversion error, serving original:', conversionError)
        // Fall back to original image
      }
    }

    // Return the image file with aggressive caching
    return new NextResponse(finalData, {
      headers: {
        'Content-Type': finalMimeType,
        'Content-Length': finalSize.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
        'ETag': etag,
        'Accept-Ranges': 'bytes',
        'X-Content-Type-Options': 'nosniff',
        'Vary': 'Accept', // Important for WebP negotiation
      }
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 }
    )
  }
}

