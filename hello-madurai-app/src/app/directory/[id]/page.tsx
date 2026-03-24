import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import BusinessVideoHeader from '@/components/BusinessVideoHeader'

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

// Helper function to get YouTube ID from URL (including Shorts)
function getYouTubeId(url: string): string | null {
  // Handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,           // Standard watch URL
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,                       // Shortened URL
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,             // Embed URL
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,            // Shorts URL
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

// Helper function to get Instagram Reel ID from URL
function getInstagramReelId(url: string): string | null {
  const match = url.match(/instagram\.com\/reel\/([^/?#]+)/)
  return match ? match[1] : null
}

// Helper function to determine video type
function getVideoType(url: string, videoType?: string): 'YOUTUBE_VIDEO' | 'YOUTUBE_SHORTS' | 'INSTAGRAM_REEL' | null {
  if (videoType) {
    return videoType as 'YOUTUBE_VIDEO' | 'YOUTUBE_SHORTS' | 'INSTAGRAM_REEL'
  }

  if (url.includes('youtube.com/shorts') || url.includes('shorts/')) {
    return 'YOUTUBE_SHORTS'
  } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'YOUTUBE_VIDEO'
  } else if (url.includes('instagram.com/reel')) {
    return 'INSTAGRAM_REEL'
  }

  return null
}

// Helper function to get YouTube thumbnail
function getYouTubeThumbnail(youtubeId: string): string {
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const business = await getBusiness(id)

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
  const { id } = await params
  const business = await getBusiness(id)

  if (!business) {
    notFound()
  }

  // For social media crawlers and direct access, show business page
  // For user navigation, redirect to directory with popup
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || ''
  const isCrawler = /bot|crawler|spider|crawling/i.test(userAgent) ||
                   /facebookexternalhit|twitterbot|linkedinbot|whatsapp/i.test(userAgent)

  if (!isCrawler) {
    // Redirect to directory and navigate to the specific subcategory where this business is located
    const params = new URLSearchParams()

    if (business.categoryId) {
      params.set('category', business.categoryId)

      // If business has a subcategory, navigate to that subcategory
      if (business.subcategoryId) {
        params.set('subcategory', business.subcategoryId)
        params.set('viewSubcategory', 'true')
      }
    }

    const redirectUrl = params.toString() ? `/directory?${params.toString()}` : '/directory'
    redirect(redirectUrl)
  }

  // Show business page for crawlers and direct metadata access
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Business Header with Video/Image */}
          <BusinessVideoHeader business={business} />

          {/* Business Details */}
          <div className="p-6">
            {business.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-gray-700 leading-relaxed">{business.description}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2">
                  {business.phone && (
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Phone:</span>
                      <a href={`tel:${business.phone}`} className="text-blue-600 hover:underline">
                        {business.phone}
                      </a>
                    </p>
                  )}
                  {business.email && (
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Email:</span>
                      <a href={`mailto:${business.email}`} className="text-blue-600 hover:underline">
                        {business.email}
                      </a>
                    </p>
                  )}
                  {business.website && (
                    <p className="flex items-center">
                      <span className="font-medium mr-2">Website:</span>
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Social Media</h3>
                <div className="space-y-2">
                  {business.facebookUrl && (
                    <p>
                      <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Facebook
                      </a>
                    </p>
                  )}
                  {business.instagramUrl && (
                    <p>
                      <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Instagram
                      </a>
                    </p>
                  )}
                  {business.youtubeUrl && (
                    <p>
                      <a href={business.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        YouTube
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={`/directory`}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Directory
              </a>
              {business.bookingUrl && (
                <a
                  href={business.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Book Now
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

}



