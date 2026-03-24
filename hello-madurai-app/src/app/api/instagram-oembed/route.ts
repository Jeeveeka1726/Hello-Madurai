import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  let url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // Normalize Instagram URL - convert /reels/ to /reel/ (Instagram oEmbed expects singular)
    url = url.replace('/reels/', '/reel/')

    // Instagram oEmbed API endpoint
    const oembedUrl = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=YOUR_ACCESS_TOKEN&omitscript=true&hidecaption=true`

    // For public posts, we can try without access token (limited functionality)
    const publicOembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&omitscript=true&hidecaption=true`

    console.log('Fetching Instagram oEmbed for URL:', url)

    const response = await fetch(publicOembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HelloMadurai/1.0)',
      },
    })

    console.log('Instagram API response status:', response.status)
    console.log('Instagram API response content-type:', response.headers.get('content-type'))

    // Check if response is actually JSON
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      const errorText = await response.text()
      console.error('Instagram API returned non-JSON response (first 1000 chars):')
      console.error(errorText.substring(0, 1000))
      console.error('\n--- End of response preview ---\n')
      throw new Error(`Instagram API returned HTML instead of JSON. The URL may not be accessible or the oEmbed API is restricted.`)
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Instagram API error:', errorText)
      throw new Error(`Instagram API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('Instagram oEmbed data received successfully')

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Instagram oEmbed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Instagram embed data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

