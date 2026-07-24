import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hellomadurai.com'

  try {
    // Fetch all news articles with slugs
    const news = await prisma.news.findMany({
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 1000
    })

    // Fetch all businesses with profiles
    const businesses = await prisma.business.findMany({
      where: {
        hasProfile: true
      },
      select: {
        id: true,
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 1000
    })

    // Main pages
    const mainPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/news`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/directory`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/fm`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/events`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/videos`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/offers`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/epaper`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/helpline`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      },
    ]

    // News article pages
    const newsPages: MetadataRoute.Sitemap = news.map((article) => ({
      url: `${baseUrl}/news/${article.slug || article.id}`,
      lastModified: article.updatedAt,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    }))

    // Business profile pages
    const businessPages: MetadataRoute.Sitemap = businesses.map((business) => ({
      url: `${baseUrl}/directory/${business.slug || business.id}`,
      lastModified: business.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Combine all pages
    return [...mainPages, ...newsPages, ...businessPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    // Return at least main pages if database fails
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ]
  }
}
