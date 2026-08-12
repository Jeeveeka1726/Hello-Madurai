import { NextRequest, NextResponse } from 'next/server'

/**
 * Image proxy for Open Graph images
 * Converts Google Drive and other image URLs to accessible URLs for social media sharing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 })
    }

    console.log('🖼️ Proxying image:', imageUrl)

    // Handle Google Drive URLs
    if (imageUrl.includes('drive.google.com')) {
      // Extract file ID from various Google Drive URL formats
      let fileId = null
      
      // Format 1: /file/d/{fileId}/
      const fileIdMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)
      if (fileIdMatch) {
        fileId = fileIdMatch[1]
      }
      
      // Format 2: id={fileId} in query params
      if (!fileId) {
        const urlObj = new URL(imageUrl)
        fileId = urlObj.searchParams.get('id')
      }

      if (fileId) {
        // Use Google Drive's thumbnail URL which works for Open Graph
        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`
        console.log('✅ Converted Google Drive URL to thumbnail:', thumbnailUrl)
        
        // Fetch the image
        const response = await fetch(thumbnailUrl)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status}`)
        }

        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        
        return new NextResponse(arrayBuffer, {
          headers: {
            'Content-Type': response.headers.get('content-type') || 'image/jpeg',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
    }

    // For other URLs, try to fetch directly
    console.log('📥 Fetching image directly:', imageUrl)
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HelloMadurai/1.0)',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, s-maxage=604800, immutable', // Cache for 7 days
        'Access-Control-Allow-Origin': '*',
        'CDN-Cache-Control': 'public, max-age=604800',
      },
    })

  } catch (error) {
    console.error('❌ Error proxying image:', error)
    return NextResponse.json(
      { 
        error: 'Failed to proxy image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}
