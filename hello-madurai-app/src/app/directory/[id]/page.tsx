import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BusinessProfilePage from '@/components/BusinessProfilePage'

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
  videoType?: string
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
  params: Promise<{ id: string }>
}

async function getBusiness(idOrSlug: string): Promise<Business | null> {
  try {
    // URL decode the parameter in case it contains encoded characters (like Tamil)
    const decodedParam = decodeURIComponent(idOrSlug)

    console.log('🔍 getBusiness called with:', {
      original: idOrSlug,
      decoded: decodedParam
    })

    // Detect if the parameter is a slug (contains hyphen) or an ID
    const isSlug = decodedParam.includes('-')

    const business = isSlug
      ? await prisma.business.findUnique({
          where: { slug: decodedParam },
          select: {
            id: true,
            name: true,
            name_ta: true,
            slug: true,
            address: true,
            address_ta: true,
            phone: true,
            email: true,
            website: true,
            mainImage: true,
            mainVideoUrl: true,
            videoType: true,
            youtubeUrl: true,
            instagramUrl: true,
            facebookUrl: true,
            bookingUrl: true,
            profileContent: true,
            profileContent_ta: true,
            profileImage: true,
            profileVideo: true,
            verified: true,
          }
        })
      : await prisma.business.findUnique({
          where: { id: decodedParam },
          select: {
            id: true,
            name: true,
            name_ta: true,
            slug: true,
            address: true,
            address_ta: true,
            phone: true,
            email: true,
            website: true,
            mainImage: true,
            mainVideoUrl: true,
            videoType: true,
            youtubeUrl: true,
            instagramUrl: true,
            facebookUrl: true,
            bookingUrl: true,
            profileContent: true,
            profileContent_ta: true,
            profileImage: true,
            profileVideo: true,
            verified: true,
          }
        })

    console.log('📊 Query result:', {
      found: !!business,
      businessId: business?.id,
      businessSlug: business?.slug,
      businessName: business?.name
    })

    return business as Business | null
  } catch (error) {
    console.error('❌ Error fetching business:', error)
    return null
  }
}

// Helper function to get YouTube ID from URL (for metadata only)
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) return match[1]
  }
  return null
}

function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
}



export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: idOrSlug } = await params
  const business = await getBusiness(idOrSlug)

  if (!business) {
    return {
      title: 'Business Not Found - Hello Madurai',
      description: 'The requested business could not be found.'
    }
  }

  const businessName = business.name
  const businessAddress = business.address
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://hello-madurai-c5xr.vercel.app'

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

  // Use slug for SEO-friendly URL if available, otherwise use ID
  const urlPath = (business as any).slug || idOrSlug
  const businessUrl = `${baseUrl}/directory/${urlPath}`
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
  const { id: idOrSlug } = await params
  const business = await getBusiness(idOrSlug)

  if (!business) {
    notFound()
  }

  // Always show the business page for SEO optimization
  // No more redirects - this is a dedicated business profile page
  return <BusinessProfilePage business={business} />
}



