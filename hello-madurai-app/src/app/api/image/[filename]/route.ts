import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Enable edge runtime for faster response
export const runtime = 'nodejs'
export const dynamic = 'force-static'
export const revalidate = 86400 // Cache for 24 hours

// In-memory cache for frequently accessed images (helps during dev)
const imageCache = new Map<string, { data: Buffer, mimeType: string, size: number, timestamp: number }>()
const CACHE_TTL = 3600000 // 1 hour in milliseconds

// Serve images from Hostinger database
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const startTime = Date.now()

  try {
    const { filename } = await params

    // Check in-memory cache first
    const cached = imageCache.get(filename)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`✅ Image cache HIT for ${filename} (${Date.now() - startTime}ms)`)
      return new NextResponse(cached.data, {
        headers: {
          'Content-Type': cached.mimeType,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          'Content-Length': cached.size.toString(),
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'X-Content-Type-Options': 'nosniff',
          'X-Cache': 'HIT',
        },
      })
    }

    console.log(`🔍 Fetching image ${filename} from database...`)

    // Retrieve image from Hostinger MySQL database with timeout
    const image = await Promise.race([
      prisma.image.findUnique({
        where: { id: filename }
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]) as any

    if (!image) {
      console.error(`❌ Image not found: ${filename}`)
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Store in cache
    imageCache.set(filename, {
      data: image.data,
      mimeType: image.mimeType,
      size: image.size,
      timestamp: Date.now()
    })

    // Clean up old cache entries (keep max 50 images)
    if (imageCache.size > 50) {
      const oldestKey = Array.from(imageCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
      imageCache.delete(oldestKey)
    }

    const duration = Date.now() - startTime
    console.log(`✅ Image served in ${duration}ms (${filename})`)

    // Return the actual image data with aggressive caching
    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800', // Cache for 24h
        'Content-Length': image.size.toString(),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'X-Content-Type-Options': 'nosniff',
        'X-Cache': 'MISS',
        'X-Response-Time': `${duration}ms`,
      },
    })

  } catch (error: any) {
    console.error('❌ Image serving error:', error?.message || error)

    // Return a simple error response
    return new NextResponse('Failed to load image', {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    })
  }
}
