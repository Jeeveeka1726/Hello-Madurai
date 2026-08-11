import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// In-memory cache for frequently accessed images
const imageCache = new Map<string, { data: Buffer, mimeType: string, size: number, etag: string, timestamp: number }>()
const CACHE_TTL = 3600000 // 1 hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check in-memory cache first
    const cached = imageCache.get(id)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      // Check ETag
      const clientETag = request.headers.get('if-none-match')
      if (clientETag === cached.etag) {
        return new NextResponse(null, { status: 304 })
      }

      return new NextResponse(cached.data, {
        headers: {
          'Content-Type': cached.mimeType,
          'Content-Length': cached.size.toString(),
          'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
          'ETag': cached.etag,
          'Accept-Ranges': 'bytes',
          'X-Content-Type-Options': 'nosniff',
          'X-Cache': 'HIT',
        }
      })
    }

    const image = await prisma.image.findUnique({
      where: { id },
      select: {
        data: true,
        mimeType: true,
        size: true,
        createdAt: true
      }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Generate ETag based on image ID and creation time
    const etag = crypto
      .createHash('md5')
      .update(`${id}-${image.createdAt.getTime()}`)
      .digest('hex')

    // Store in cache
    imageCache.set(id, {
      data: image.data,
      mimeType: image.mimeType,
      size: image.size,
      etag,
      timestamp: Date.now()
    })

    // Limit cache size to 100 images
    if (imageCache.size > 100) {
      const firstKey = imageCache.keys().next().value
      imageCache.delete(firstKey)
    }

    // Check if client already has this version (ETag validation)
    const clientETag = request.headers.get('if-none-match')
    if (clientETag === etag) {
      return new NextResponse(null, { status: 304 })
    }

    // Return the image file with aggressive caching
    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.mimeType,
        'Content-Length': image.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable, stale-while-revalidate=86400',
        'ETag': etag,
        'Accept-Ranges': 'bytes',
        'X-Content-Type-Options': 'nosniff',
        'X-Cache': 'MISS',
      }
    })
  } catch (error) {
    console.error('❌ Error serving image:', error)
    return NextResponse.json(
      { error: 'Failed to serve image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

