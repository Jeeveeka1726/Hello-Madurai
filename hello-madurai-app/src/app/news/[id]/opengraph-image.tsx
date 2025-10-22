import { ImageResponse } from 'next/og'
import prisma from '@/lib/prisma'
 
export const runtime = 'edge'
export const alt = 'News Article'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image({ params }: { params: { id: string } }) {
  try {
    const news = await prisma.news.findUnique({
      where: { id: params.id },
      select: {
        title: true,
        title_ta: true,
        featuredImage: true,
      },
    })

    if (!news) {
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 60,
              background: '#1d4ed8',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            Hello Madurai News
          </div>
        ),
        { ...size }
      )
    }

    // If there's a featured image, try to use it
    if (news.featuredImage) {
      // For now, return a simple text image with the title
      // The actual featured image will be used in metadata
      return new ImageResponse(
        (
          <div
            style={{
              fontSize: 48,
              background: '#1d4ed8',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              padding: '40px',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 20 }}>🗞️ Hello Madurai</div>
            <div style={{ textAlign: 'center' }}>{news.title}</div>
          </div>
        ),
        { ...size }
      )
    }

    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: '#1d4ed8',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 20 }}>🗞️ Hello Madurai</div>
          <div style={{ textAlign: 'center', padding: 40 }}>{news.title}</div>
        </div>
      ),
      { ...size }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 60,
            background: '#1d4ed8',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Hello Madurai News
        </div>
      ),
      { ...size }
    )
  }
}

