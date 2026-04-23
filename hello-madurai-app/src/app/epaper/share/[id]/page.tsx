import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const magazine = await prisma.magazine.findUnique({
      where: { id }
    })

    if (!magazine) {
      return {
        title: 'Magazine Not Found',
      }
    }

    const title = magazine.title
    const description = magazine.title_ta || magazine.title || 'E-Paper from Hello Madurai'
    const imageUrl = magazine.coverImage || magazine.featuredImage || ''

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'

    // Default fallback image if no cover image
    const fallbackImage = `${baseUrl}/hellomadurai_logo.png`

    // Use image proxy for Google Drive and other URLs to ensure they work with Open Graph
    let absoluteImageUrl = fallbackImage
    if (imageUrl) {
      if (!imageUrl.startsWith('http')) {
        // Local images - make absolute
        absoluteImageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
      } else {
        // External images (Google Drive, etc) - use proxy
        absoluteImageUrl = `${baseUrl}/api/og-image-proxy?url=${encodeURIComponent(imageUrl)}`
      }
    }

    console.log('🖼️ E-Paper Share Metadata:', {
      id,
      title,
      originalImage: imageUrl || 'NO IMAGE',
      proxiedImage: absoluteImageUrl,
      hasImage: !!imageUrl
    })

    const shareUrl = `${baseUrl}/epaper/share/${id}`

    return {
      title: `${title} - Hello Madurai`,
      description: description,
      metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'),
      openGraph: {
        title: title,
        description: description,
        url: shareUrl,
        siteName: 'Hello Madurai',
        images: [
          {
            url: absoluteImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
        type: 'website',
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [absoluteImageUrl],
        creator: '@hellomadurai',
      },
      other: {
        'og:image': absoluteImageUrl,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': title,
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Hello Madurai E-Paper',
    }
  }
}

export default async function MagazineSharePage({ params }: Props) {
  const { id } = await params

  try {
    const magazine = await prisma.magazine.findUnique({
      where: { id }
    })

    if (!magazine) {
      redirect('/epaper')
    }

    const title = magazine.title
    const description = magazine.title_ta || magazine.title || 'E-Paper from Hello Madurai'
    const imageUrl = magazine.coverImage || magazine.featuredImage || ''

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'
    const fallbackImage = `${baseUrl}/hellomadurai_logo.png`

    // Display image - use original URL for display, proxy handles Open Graph
    let absoluteImageUrl = fallbackImage
    if (imageUrl) {
      if (!imageUrl.startsWith('http')) {
        absoluteImageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
      } else if (imageUrl.includes('drive.google.com')) {
        // For Google Drive, use thumbnail format for display
        const fileId = imageUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1] || imageUrl.match(/id=([a-zA-Z0-9-_]+)/)?.[1]
        if (fileId) {
          absoluteImageUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`
        }
      } else {
        // Use proxy for external images
        absoluteImageUrl = `${baseUrl}/api/og-image-proxy?url=${encodeURIComponent(imageUrl)}`
      }
    }

    // Render a simple page that redirects but allows crawlers to see metadata
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          {imageUrl ? (
            <div className="mb-4">
              <img
                src={absoluteImageUrl}
                alt={title}
                className="w-full h-48 object-cover rounded-lg mb-4"
                onError={(e) => {
                  console.error('Image failed to load:', absoluteImageUrl)
                  e.currentTarget.src = fallbackImage
                }}
              />
            </div>
          ) : (
            <div className="mb-4 h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">No preview available</p>
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-4">{description}</p>
          <p className="text-sm text-gray-500">Redirecting to e-paper...</p>
          <meta httpEquiv="refresh" content="2;url=/epaper" />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in epaper share page:', error)
    redirect('/epaper')
  }
}
