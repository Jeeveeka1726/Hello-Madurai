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
    const description = offer.title_ta || offer.title
    const imageUrl = offer.imageUrl.startsWith('http') 
      ? offer.imageUrl 
      : `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'}${offer.imageUrl}`

    return {
      title: `${title} - Hello Madurai Offers`,
      description: description,
      openGraph: {
        title: title,
        description: description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [imageUrl],
      },
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
  
  // Redirect to main offers page
  redirect('/offers')
}
