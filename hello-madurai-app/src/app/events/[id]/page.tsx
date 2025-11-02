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

    // Prefer Tamil content for social sharing
    const title = event.title_ta || event.title

    // Strip HTML tags from description for clean preview
    const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
    }
    const description = stripHtml(event.description_ta || event.description).substring(0, 160)

    // Use absolute URL for image (required for social media)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hello-madurai-c5xr.vercel.app'
    const imageUrl = event.featuredImage
      ? (event.featuredImage.startsWith('http') ? event.featuredImage : `${baseUrl}${event.featuredImage}`)
      : `${baseUrl}/logo.jpg`

    // Format date in Tamil
    const formatDateTamil = (dateString: string) => {
      const date = new Date(dateString)
      return date.toLocaleDateString('ta-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    const eventDate = formatDateTamil(event.startDate.toISOString())
    const location = event.location_ta || event.location

    // Create rich description with date and location in Tamil
    const richDescription = `📅 ${eventDate} | 📍 ${location}\n\n${description}`

    console.log('Event Metadata - Title:', title)
    console.log('Event Metadata - Image URL:', imageUrl)

    return {
      title: `${title} - Hello Madurai`,
      description: richDescription,
      openGraph: {
        title,
        description: richDescription,
        images: [
          {
            url: imageUrl,
            width: 1280,
            height: 720,
            alt: title,
          }
        ],
        type: 'article',
        siteName: 'Hello Madurai',
        url: `${baseUrl}/events/${id}`,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description: richDescription,
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

