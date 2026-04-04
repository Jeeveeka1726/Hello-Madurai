import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  try {
    const offer = await prisma.offer.findUnique({
      where: { id }
    })

    if (!offer) {
      return {
        title: 'Offer Not Found',
      }
    }

    const title = offer.title
    const description = offer.title_ta || offer.title || 'Special offer from Hello Madurai'

    // Ensure absolute URL for image
    let imageUrl = offer.imageUrl
    if (!imageUrl.startsWith('http')) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'
      imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
    }

    console.log('🖼️ Offer Share Metadata:', { id, title, imageUrl })

    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}/offers/share/${id}`

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
            url: imageUrl,
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
        images: [imageUrl],
        creator: '@hellomadurai',
      },
      other: {
        'og:image': imageUrl,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': title,
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Hello Madurai Offers',
    }
  }
}

export default async function OfferSharePage({ params }: Props) {
  const { id } = await params

  try {
    const offer = await prisma.offer.findUnique({
      where: { id }
    })

    if (!offer) {
      redirect('/offers')
    }

    const title = offer.title
    const description = offer.title_ta || offer.title || 'Special offer from Hello Madurai'

    let imageUrl = offer.imageUrl
    if (!imageUrl.startsWith('http')) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'
      imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
    }

    // Render a simple page that redirects but allows crawlers to see metadata
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <div className="mb-4">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600 mb-4">{description}</p>
          <p className="text-sm text-gray-500">Redirecting to offers...</p>
          <meta httpEquiv="refresh" content="2;url=/offers" />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in offer share page:', error)
    redirect('/offers')
  }
}
