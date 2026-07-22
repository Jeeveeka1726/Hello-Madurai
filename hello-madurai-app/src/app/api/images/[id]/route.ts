import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

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

