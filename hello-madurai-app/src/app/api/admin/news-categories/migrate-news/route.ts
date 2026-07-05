import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/admin/news-categories/migrate-news - Migrate news articles from old category to new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { oldCategorySlug, newCategorySlug } = body

    if (!oldCategorySlug || !newCategorySlug) {
      return NextResponse.json(
        { error: 'Both oldCategorySlug and newCategorySlug are required' },
        { status: 400 }
      )
    }

    // Check if the new category exists
    const newCategory = await prisma.newsCategory.findUnique({
      where: { slug: newCategorySlug }
    })

    if (!newCategory) {
      return NextResponse.json(
        { error: `Category with slug "${newCategorySlug}" does not exist` },
        { status: 404 }
      )
    }

    // Count articles to be migrated
    const count = await prisma.news.count({
      where: {
        category: oldCategorySlug
      }
    })

    console.log(`📝 Migrating ${count} news articles from "${oldCategorySlug}" to "${newCategorySlug}"`)

    // Update all news articles
    const result = await prisma.news.updateMany({
      where: {
        category: oldCategorySlug
      },
      data: {
        category: newCategorySlug
      }
    })

    console.log(`✅ Successfully migrated ${result.count} news articles`)

    return NextResponse.json({
      success: true,
      count: result.count,
      from: oldCategorySlug,
      to: newCategorySlug,
      categoryName: newCategory.name
    })
  } catch (error) {
    console.error('Error migrating news articles:', error)
    return NextResponse.json(
      { error: 'Failed to migrate news articles' },
      { status: 500 }
    )
  }
}

// GET /api/admin/news-categories/migrate-news - Get migration stats
export async function GET() {
  try {
    // Get all categories
    const categories = await prisma.newsCategory.findMany({
      orderBy: { orderNumber: 'asc' }
    })

    // Get all unique category values from news articles
    const newsCategories = await prisma.news.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    })

    // Find orphaned categories (categories in news that don't exist in NewsCategory)
    const validSlugs = new Set(categories.map(c => c.slug))
    const orphaned = newsCategories.filter(nc => !validSlugs.has(nc.category))

    // Find unused categories (categories that exist but have no news)
    const usedSlugs = new Set(newsCategories.map(nc => nc.category))
    const unused = categories.filter(c => !usedSlugs.has(c.slug))

    return NextResponse.json({
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        newsCount: newsCategories.find(nc => nc.category === c.slug)?._count.category || 0
      })),
      orphanedCategories: orphaned.map(o => ({
        slug: o.category,
        newsCount: o._count.category
      })),
      unusedCategories: unused.map(u => ({
        id: u.id,
        name: u.name,
        slug: u.slug
      })),
      totalNews: newsCategories.reduce((sum, nc) => sum + nc._count.category, 0)
    })
  } catch (error) {
    console.error('Error getting migration stats:', error)
    return NextResponse.json(
      { error: 'Failed to get migration stats' },
      { status: 500 }
    )
  }
}
