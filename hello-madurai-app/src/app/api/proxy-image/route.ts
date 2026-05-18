import { NextRequest, NextResponse } from 'next/server'

// GET /api/proxy-image?url=ENCODED_URL - Proxy images from Google Drive and other sources
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return new NextResponse('Missing url parameter', { status: 400 })
    }

    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl)
    
    console.log('🖼️ Proxying image:', decodedUrl)

    // Fetch the image
    const response = await fetch(decodedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText)
      return new NextResponse('Failed to fetch image', { status: response.status })
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    console.log('✅ Image fetched successfully, size:', imageBuffer.byteLength, 'type:', contentType)

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('❌ Error proxying image:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
