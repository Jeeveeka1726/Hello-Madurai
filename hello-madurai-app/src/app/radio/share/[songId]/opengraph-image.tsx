import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Hello Madurai Digital FM'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ songId: string }> }) {
  try {
    const { songId } = await params

    // Fetch song data from API instead of using Prisma (to reduce bundle size)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hellomadurai.com'
    const response = await fetch(`${baseUrl}/api/radio-songs/${songId}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    })

    if (!response.ok) {
      console.error('Failed to fetch song:', response.status, response.statusText)
      throw new Error('Song not found')
    }

    const song = await response.json()
    console.log('🎵 OG Image - Song data:', {
      id: song.id,
      title: song.title,
      singer: song.singer?.name,
      imageUrl: song.singer?.imageUrl
    })

    if (!song || !song.singer) {
      console.error('Invalid song data:', song)
      throw new Error('Invalid song data')
    }

    // Get image URL - convert relative URLs to absolute
    let imageUrl = song.singer.imageUrl

    // If no image, use default
    if (!imageUrl) {
      imageUrl = `${baseUrl}/logo.jpg`
    } else if (imageUrl.startsWith('/api/')) {
      // Convert relative database image URLs to absolute URLs
      imageUrl = `${baseUrl}${imageUrl}`
    }

    console.log('🖼️ OG Image - Using image URL:', imageUrl)

    // Fetch the image as a buffer for better compatibility
    let imageBuffer: ArrayBuffer | null = null
    if (imageUrl) {
      try {
        const imgResponse = await fetch(imageUrl, {
          cache: 'no-store',
          headers: {
            'Accept': 'image/*',
          }
        })
        if (imgResponse.ok) {
          imageBuffer = await imgResponse.arrayBuffer()
          console.log('✅ OG Image - Successfully fetched image buffer, size:', imageBuffer.byteLength)
        } else {
          console.error('❌ OG Image - Failed to fetch image, status:', imgResponse.status)
        }
      } catch (err) {
        console.error('❌ OG Image - Failed to fetch image:', err)
      }
    }

    // Create image with artist photo
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #1e40af, #3b82f6)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            padding: 40,
          }}
        >
          {imageBuffer && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 30,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                // @ts-ignore
                src={imageBuffer}
                alt={song.singer.name}
                width={300}
                height={300}
                style={{
                  borderRadius: '50%',
                  border: '8px solid white',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}
          <div style={{ fontSize: 48, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 }}>
            {song.title}
          </div>
          <div style={{ fontSize: 32, textAlign: 'center', opacity: 0.9 }}>
            {song.singer.name}
          </div>
          <div style={{ fontSize: 24, textAlign: 'center', marginTop: 20, opacity: 0.8 }}>
            Hello Madurai Digital FM
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)

    // Return default image
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom right, #1e40af, #3b82f6)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 72, fontWeight: 'bold', marginBottom: 20 }}>
            Hello Madurai
          </div>
          <div style={{ fontSize: 36 }}>
            Digital FM
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  }
}

