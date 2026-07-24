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
    const imageUrl = news.featuredImage
      ? (news.featuredImage.startsWith('http')
        ? news.featuredImage
        : `${baseUrl}${news.featuredImage}`)
      : `${baseUrl}/logo.jpg`

    // Use slug for SEO-friendly URL if available, otherwise use ID
    const urlPath = news.slug || idOrSlug

    console.log('Metadata - Title:', title)
    console.log('Metadata - Image URL:', imageUrl)
    console.log('Metadata - URL Path:', urlPath)

    return {
      title: `${title} - Hello Madurai`,
      description,
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
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
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

