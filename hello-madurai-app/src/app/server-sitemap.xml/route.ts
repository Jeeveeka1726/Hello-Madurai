import { getServerSideSitemap } from 'next-sitemap'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  // Fetch all news articles
  const news = await prisma.news.findMany({
    select: {
      id: true,
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: 'desc'
    },
    take: 1000 // Limit to most recent 1000 articles
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
    take: 1000 // Limit to most recent 1000 businesses
  })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hello-madurai-c5xr.vercel.app'

  // Generate news URLs
  const newsUrls = news.map((article) => ({
    loc: `${baseUrl}/news/${article.slug || article.id}`,
    lastmod: article.updatedAt.toISOString(),
    changefreq: 'daily',
    priority: 0.9,
  }))

  // Generate business URLs
  const businessUrls = businesses.map((business) => ({
    loc: `${baseUrl}/directory/${business.slug || business.id}`,
    lastmod: business.updatedAt.toISOString(),
    changefreq: 'weekly',
    priority: 0.8,
  }))

  // Combine all URLs
  const allUrls = [...newsUrls, ...businessUrls]

  return getServerSideSitemap(allUrls)
}
