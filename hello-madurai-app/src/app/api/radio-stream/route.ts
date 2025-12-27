import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { radioUrl } = await request.json()
    
    if (!radioUrl) {
      return NextResponse.json({ error: 'Radio URL is required' }, { status: 400 })
    }

    console.log('🎵 Extracting stream URL from:', radioUrl)

    // Fetch the radio station webpage
    const response = await fetch(radioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch radio page: ${response.status}`)
    }

    const html = await response.text()
    console.log('📄 Fetched HTML content, length:', html.length)

    // Extract audio stream URLs from the HTML
    const streamUrls: string[] = []
    
    // Look for common audio stream patterns
    const patterns = [
      // Direct MP3/AAC stream URLs
      /https?:\/\/[^"'\s]+\.(?:mp3|aac|m3u8|pls)/gi,
      // Radio stream URLs
      /https?:\/\/[^"'\s]*(?:stream|radio|live)[^"'\s]*\.(?:mp3|aac|m3u8|pls)/gi,
      // M3U8 playlist URLs
      /https?:\/\/[^"'\s]+\.m3u8[^"'\s]*/gi,
      // Common radio streaming domains
      /https?:\/\/(?:stream|radio|live)[^"'\s]+/gi,
    ]

    patterns.forEach(pattern => {
      const matches = html.match(pattern)
      if (matches) {
        streamUrls.push(...matches)
      }
    })

    // Look for audio elements and their src attributes
    const audioSrcMatches = html.match(/<audio[^>]+src=["']([^"']+)["']/gi)
    if (audioSrcMatches) {
      audioSrcMatches.forEach(match => {
        const srcMatch = match.match(/src=["']([^"']+)["']/)
        if (srcMatch && srcMatch[1]) {
          streamUrls.push(srcMatch[1])
        }
      })
    }

    // Look for JavaScript variables that might contain stream URLs
    const jsStreamMatches = html.match(/(?:stream|audio|radio)(?:Url|URL|_url)\s*[:=]\s*["']([^"']+)["']/gi)
    if (jsStreamMatches) {
      jsStreamMatches.forEach(match => {
        const urlMatch = match.match(/["']([^"']+)["']/)
        if (urlMatch && urlMatch[1]) {
          streamUrls.push(urlMatch[1])
        }
      })
    }

    // Remove duplicates and filter valid URLs
    const uniqueUrls = [...new Set(streamUrls)]
      .filter(url => url && url.startsWith('http'))
      .filter(url => !url.includes('.js') && !url.includes('.css') && !url.includes('.png') && !url.includes('.jpg'))

    console.log('🎵 Found potential stream URLs:', uniqueUrls)

    if (uniqueUrls.length === 0) {
      // If no direct stream found, try to find iframe sources or embedded players
      const iframeMatches = html.match(/<iframe[^>]+src=["']([^"']+)["']/gi)
      if (iframeMatches) {
        iframeMatches.forEach(match => {
          const srcMatch = match.match(/src=["']([^"']+)["']/)
          if (srcMatch && srcMatch[1] && srcMatch[1].includes('stream')) {
            uniqueUrls.push(srcMatch[1])
          }
        })
      }
    }

    if (uniqueUrls.length > 0) {
      // Return the first valid stream URL
      const streamUrl = uniqueUrls[0]
      console.log('✅ Using stream URL:', streamUrl)

      // Test if the stream URL is accessible
      try {
        const testResponse = await fetch(streamUrl, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        })
        console.log('🔍 Stream URL test response:', testResponse.status, testResponse.statusText)
        console.log('🔍 Stream URL headers:', Object.fromEntries(testResponse.headers.entries()))
      } catch (testError) {
        console.log('⚠️ Stream URL test failed (but continuing anyway):', testError)
      }

      return NextResponse.json({
        success: true,
        streamUrl,
        allUrls: uniqueUrls,
        proxyUrl: `/api/radio-proxy?url=${encodeURIComponent(streamUrl)}`
      })
    } else {
      console.log('❌ No stream URLs found')
      return NextResponse.json({ 
        error: 'No audio stream found',
        html: html.substring(0, 1000) + '...' // Return first 1000 chars for debugging
      }, { status: 404 })
    }

  } catch (error) {
    console.error('❌ Error extracting radio stream:', error)
    return NextResponse.json({ 
      error: 'Failed to extract radio stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
