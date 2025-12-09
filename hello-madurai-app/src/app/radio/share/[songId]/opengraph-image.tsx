import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'edge'
export const alt = 'Hello Madurai Digital FM'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ songId: string }> }) {
  const { songId } = await params

  try {
    const song = await prisma.radioSong.findUnique({
      where: { id: songId },
      include: {
        singer: {
          select: {
            id: true,
            name: true,
            name_ta: true,
            imageUrl: true,
          }
        }
      }
    })

    if (!song || !song.singer) {
      // Return default image
      return new ImageResponse(
        (
          <div
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'white',
            }}
          >
            <div style={{ fontSize: 80, fontWeight: 'bold' }}>🎙️</div>
            <div style={{ fontSize: 60, fontWeight: 'bold', marginTop: 20 }}>
              Hello Madurai
            </div>
            <div style={{ fontSize: 40, marginTop: 10 }}>Digital FM</div>
          </div>
        ),
        {
          ...size,
        }
      )
    }

    const title = song.title_ta || song.title
    const artistName = song.singer.name_ta || song.singer.name

    // Get artist image data from database
    let artistImageData: string | null = null
    if (song.singer.imageUrl && song.singer.imageUrl.startsWith('/api/images/')) {
      const imageId = song.singer.imageUrl.replace('/api/images/', '')
      try {
        const imageRecord = await prisma.image.findUnique({
          where: { id: imageId }
        })
        if (imageRecord && imageRecord.data) {
          // Convert Buffer to base64
          const base64 = Buffer.from(imageRecord.data).toString('base64')
          artistImageData = `data:${imageRecord.mimeType};base64,${base64}`
        }
      } catch (err) {
        console.error('Error fetching artist image:', err)
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '30px',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              padding: '60px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            {/* Artist Image */}
            {artistImageData && (
              <img
                src={artistImageData}
                alt={artistName}
                width={400}
                height={400}
                style={{
                  borderRadius: '200px',
                  marginRight: '60px',
                  objectFit: 'cover',
                }}
              />
            )}

            {/* Text Content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: 60,
                  fontWeight: 'bold',
                  color: '#1a1a1a',
                  marginBottom: 20,
                  lineHeight: 1.2,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 40,
                  color: '#666',
                  marginBottom: 40,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                🎙️ {artistName}
              </div>
              <div
                style={{
                  fontSize: 30,
                  color: '#999',
                }}
              >
                Hello Madurai Digital FM
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    
    // Return error fallback
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 80, fontWeight: 'bold' }}>🎙️</div>
          <div style={{ fontSize: 60, fontWeight: 'bold', marginTop: 20 }}>
            Hello Madurai
          </div>
          <div style={{ fontSize: 40, marginTop: 10 }}>Digital FM</div>
        </div>
      ),
      {
        ...size,
      }
    )
  }
}

