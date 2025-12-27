import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const streamUrl = searchParams.get('url')
    
    if (!streamUrl) {
      return NextResponse.json({ error: 'Stream URL is required' }, { status: 400 })
    }

    console.log('🎵 Proxying radio stream:', streamUrl)

    // Fetch the stream with proper headers
    const response = await fetch(streamUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'audio/*,*/*;q=0.9',
        'Accept-Language': 'en-US,en;q=0.5',
        'Range': 'bytes=0-',
      }
    })

    if (!response.ok) {
      console.error('❌ Stream fetch failed:', response.status, response.statusText)
      return NextResponse.json({ 
        error: 'Failed to fetch stream',
        status: response.status,
        statusText: response.statusText
      }, { status: response.status })
    }

    console.log('✅ Stream response received:', response.status, response.headers.get('content-type'))

    // Get the stream data
    const stream = response.body
    
    if (!stream) {
      return NextResponse.json({ error: 'No stream data' }, { status: 500 })
    }

    // Return the stream with proper CORS headers
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'audio/mpeg',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Accept, Content-Type',
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
        // Forward any range headers for streaming
        ...(response.headers.get('content-length') && {
          'Content-Length': response.headers.get('content-length')!
        }),
        ...(response.headers.get('content-range') && {
          'Content-Range': response.headers.get('content-range')!
        }),
      }
    })

  } catch (error) {
    console.error('❌ Error proxying radio stream:', error)
    return NextResponse.json({ 
      error: 'Failed to proxy radio stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Accept, Content-Type',
    }
  })
}
