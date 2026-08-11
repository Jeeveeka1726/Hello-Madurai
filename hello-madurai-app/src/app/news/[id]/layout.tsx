import { Metadata } from 'next'
import prisma from '@/lib/prisma'

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  try {
    const { id: idOrSlug } = await params

    // Detect if the parameter is a slug (contains hyphen) or an ID
    const isSlug = idOrSlug.includes('-')

    // Fetch news by slug or ID
    const news = isSlug
      ? await prisma.news.findUnique({
          where: { slug: idOrSlug },
          select: {
            slug: true,
            title: true,
            title_ta: true,
            excerpt: true,
            excerpt_ta: true,
            content: true,
            featuredImage: true,
          },
        })
      : await prisma.news.findUnique({
          where: { id: idOrSlug },
          select: {
            slug: true,
            title: true,
            title_ta: true,
            excerpt: true,
            excerpt_ta: true,
            content: true,
            featuredImage: true,
          },
        })

    if (!news) {
      return {
        title: 'News Article - Hello Madurai',
        description: 'Read the latest news from Madurai',
      }
    }

    // Prefer Tamil title and description if available
    const title = news.title_ta || news.title
    const description = news.excerpt_ta || news.excerpt || news.content.substring(0, 160).replace(/<[^>]*>/g, '')

    // Generate absolute URL for featured image
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hello-madurai-c5xr.vercel.app'

    // Build absolute image URL for Open Graph
    let imageUrl = `${baseUrl}/logo.jpg` // Default fallback

    if (news.featuredImage) {
      if (news.featuredImage.startsWith('http')) {
        // External URLs - use proxy for better social media compatibility
        imageUrl = `${baseUrl}/api/og-image-proxy?url=${encodeURIComponent(news.featuredImage)}`
      } else {
        // Local images (including /api/images/) - make absolute with base URL
        imageUrl = news.featuredImage.startsWith('/')
          ? `${baseUrl}${news.featuredImage}`
          : `${baseUrl}/${news.featuredImage}`
      }
    }

    // Use slug for SEO-friendly URL if available, otherwise use ID
    const urlPath = news.slug || idOrSlug

    console.log('🖼️ News Share Metadata:', {
      slug: urlPath,
      title,
      originalImage: news.featuredImage,
      finalImageUrl: imageUrl,
    })

    return {
      title: `${title} - Hello Madurai`,
      description,
      metadataBase: new URL(baseUrl),
      openGraph: {
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1280,
            height: 720,
            alt: title,
          },
        ],
        type: 'article',
        siteName: 'Hello Madurai',
        url: `${baseUrl}/news/${urlPath}`,
        locale: 'en_US',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@hellomadurai',
      },
      other: {
        'og:image': imageUrl,
        'og:image:width': '1280',
        'og:image:height': '720',
        'og:image:alt': title,
        'og:image:secure_url': imageUrl,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'News Article - Hello Madurai',
      description: 'Read the latest news from Madurai',
    }
  }
}

export default function NewsDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

