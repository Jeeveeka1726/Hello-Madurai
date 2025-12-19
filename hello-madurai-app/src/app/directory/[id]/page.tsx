import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface Business {
  id: string
  name: string
  name_ta: string
  address: string
  address_ta: string
  phone?: string
  email?: string
  website?: string
  mainImage?: string
  mainVideoUrl?: string
  youtubeUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  bookingUrl?: string
  profileContent?: string
  profileContent_ta?: string
  profileImage?: string
  profileVideo?: string
  verified: boolean
}

interface PageProps {
  params: { id: string }
}

async function getBusiness(id: string): Promise<Business | null> {
  try {
    const business = await prisma.business.findUnique({
      where: { id }
    })
    return business as Business | null
  } catch (error) {
    console.error('Error fetching business:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const business = await getBusiness(params.id)

  if (!business) {
    return {
      title: 'Business Not Found - Hello Madurai',
      description: 'The requested business could not be found.'
    }
  }

  const businessName = business.name
  const businessAddress = business.address
  const businessImage = business.mainImage || '/images/hello-madurai-logo.png'
  const businessUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://hellomadurai.vercel.app'}/directory/${business.id}`

  return {
    title: `${businessName} - Hello Madurai Directory`,
    description: `${businessName} located at ${businessAddress}. Find contact details, services, and more on Hello Madurai business directory.`,
    openGraph: {
      title: businessName,
      description: `${businessName} - ${businessAddress}`,
      url: businessUrl,
      siteName: 'Hello Madurai',
      images: [
        {
          url: businessImage,
          width: 1200,
          height: 630,
          alt: businessName,
        }
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: businessName,
      description: `${businessName} - ${businessAddress}`,
      images: [businessImage],
    },
    alternates: {
      canonical: businessUrl,
    }
  }
}

export default async function BusinessPage({ params }: PageProps) {
  const business = await getBusiness(params.id)

  if (!business) {
    notFound()
  }

  // Redirect to directory with business parameter for popup display
  redirect(`/directory?business=${params.id}`)

}



