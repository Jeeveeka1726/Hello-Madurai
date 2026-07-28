import { NextRequest, NextResponse } from 'next/server'

// Enable caching
export const revalidate = 86400 // Cache for 24 hours

// GET /api/proxy-image?url=ENCODED_URL - Proxy images from Google Drive and other sources
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl)

    console.log('🖼️ Proxying image:', decodedUrl.substring(0, 100) + '...')

    // Fetch the image with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://drive.google.com',
      },
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText)
      return new NextResponse('Failed to fetch image', {
        status: response.status,
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const duration = Date.now() - startTime

    console.log(`✅ Image proxied in ${duration}ms, size: ${imageBuffer.byteLength} bytes, type: ${contentType}`)

    // Return the image with aggressive caching
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800', // 24h cache
        'Access-Control-Allow-Origin': '*',
        'X-Response-Time': `${duration}ms`,
      },
    })
  } catch (error: any) {
    const duration = Date.now() - startTime

    if (error.name === 'AbortError') {
      console.error(`❌ Image proxy timeout after ${duration}ms`)
      return new NextResponse('Image request timeout', {
        status: 504,
        headers: {
          'Cache-Control': 'no-cache',
        }
      })
    }

    console.error('❌ Error proxying image:', error?.message || error)
    return new NextResponse('Internal server error', {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache',
      }
    })
  }
}
