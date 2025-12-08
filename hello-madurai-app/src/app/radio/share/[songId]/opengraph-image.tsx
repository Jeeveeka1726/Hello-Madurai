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
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Song not found')
    }

    const song = await response.json()

    if (!song || !song.singer) {
      throw new Error('Invalid song data')
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
          {song.singer.imageUrl && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 30,
              }}
            >
              <img
                src={song.singer.imageUrl}
                alt={song.singer.name}
                width={400}
                height={400}
                style={{
                  borderRadius: '50%',
                  border: '8px solid white',
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

