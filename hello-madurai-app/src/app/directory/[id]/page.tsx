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

// Helper function to get YouTube ID from URL
function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)
  return match ? match[1] : null
}

// Helper function to get YouTube thumbnail
function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://hellomadurai.vercel.app'

  // Determine the best image for sharing - Prioritize YouTube thumbnails
  let businessImage = '' // Start empty

  // Priority 1: YouTube thumbnail from main video (always preferred for sharing)
  if (business.mainVideoUrl) {
    const youtubeId = getYouTubeId(business.mainVideoUrl)
    if (youtubeId) {
      businessImage = getYouTubeThumbnail(youtubeId)
      console.log('✅ Business has YouTube video - Using thumbnail:', businessImage)
    } else {
      console.log('⚠️ Business has video URL but not YouTube:', business.mainVideoUrl)
    }
  }
  // Priority 2: Main business image (if no YouTube video)
  else if (business.mainImage) {
    businessImage = business.mainImage.startsWith('http')
      ? business.mainImage
      : `${baseUrl}${business.mainImage}`
    console.log('✅ Using main business image:', businessImage)
  }
  // Priority 3: Profile image (if no YouTube video or main image)
  else if (business.profileImage) {
    businessImage = business.profileImage.startsWith('http')
      ? business.profileImage
      : `${baseUrl}${business.profileImage}`
    console.log('✅ Using profile image:', businessImage)
  }

  // Fallback to logo if no image found
  if (!businessImage) {
    businessImage = `${baseUrl}/logo.jpg`
    console.log('⚠️ No business image found, using logo fallback:', businessImage)
  }

  // Ensure absolute URL for image (YouTube thumbnails are already absolute)
  const absoluteImageUrl = businessImage.startsWith('http')
    ? businessImage
    : `${baseUrl}${businessImage}`

  const businessUrl = `${baseUrl}/directory/${business.id}`
  const description = `${businessName} located at ${businessAddress}. Find contact details, services, and more on Hello Madurai business directory.`

  console.log('🔍 Business Metadata Generation:')
  console.log('📍 Business Name:', businessName)
  console.log('🌐 Base URL:', baseUrl)
  console.log('🖼️ Final Image URL:', absoluteImageUrl)
  console.log('🔗 Business URL:', businessUrl)

  return {
    title: `${businessName} - Hello Madurai`,
    description,
    openGraph: {
      title: businessName,
      description: `${businessName} - ${businessAddress}`,
      url: businessUrl,
      siteName: 'Hello Madurai',
      images: [
        {
          url: absoluteImageUrl,
          width: 1280,
          height: 720,
          alt: businessName,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: businessName,
      description: `${businessName} - ${businessAddress}`,
      images: [absoluteImageUrl],
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



