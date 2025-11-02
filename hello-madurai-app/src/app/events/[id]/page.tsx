import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import EventDetailClient from './EventDetailClient'
import prisma from '@/lib/prisma'

interface Props {
  params: Promise<{ id: string }>
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  try {
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return {
        title: 'Event Not Found',
      }
    }

    const title = event.title_ta || event.title
    const description = event.description_ta || event.description
    const imageUrl = event.featuredImage || '/logo.jpg'

    return {
      title: `${title} | Hello Madurai`,
      description: description.substring(0, 160),
      openGraph: {
        title: title,
        description: description.substring(0, 160),
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
        type: 'website',
        locale: 'ta_IN',
        siteName: 'Hello Madurai',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description.substring(0, 160),
        images: [imageUrl],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Event | Hello Madurai',
    }
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params
  
  try {
    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      notFound()
    }

    // Convert dates to strings for client component
    const eventData = {
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() || null,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    }

    return <EventDetailClient event={eventData} />
  } catch (error) {
    console.error('Error fetching event:', error)
    notFound()
  }
}

