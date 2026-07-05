import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT /api/admin/news-categories/[id] - Update news category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Get the current category to check if slug is changing
    const currentCategory = await prisma.newsCategory.findUnique({
      where: { id }
    })

    if (!currentCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if the slug is changing
    const slugChanged = currentCategory.slug !== body.slug

    // Update the category
    const category = await prisma.newsCategory.update({
      where: { id },
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        slug: body.slug,
        orderNumber: body.orderNumber,
        active: body.active
      }
    })

    // If slug changed, update all news articles with the old slug to use the new slug
    if (slugChanged) {
      console.log(`📝 Category slug changed from "${currentCategory.slug}" to "${body.slug}"`)
      console.log('📝 Updating all news articles with this category...')

      const updateResult = await prisma.news.updateMany({
        where: {
          category: currentCategory.slug
        },
        data: {
          category: body.slug
        }
      })

      console.log(`✅ Updated ${updateResult.count} news articles to use new category slug`)
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating news category:', error)
    return NextResponse.json({ error: 'Failed to update news category' }, { status: 500 })
  }
}

// DELETE /api/admin/news-categories/[id] - Delete news category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get the category to be deleted
    const categoryToDelete = await prisma.newsCategory.findUnique({
      where: { id }
    })

    if (!categoryToDelete) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check how many news articles are using this category
    const newsCount = await prisma.news.count({
      where: {
        category: categoryToDelete.slug
      }
    })

    console.log(`🗑️ Attempting to delete category "${categoryToDelete.name}" (${categoryToDelete.slug})`)
    console.log(`📊 Found ${newsCount} news articles using this category`)

    if (newsCount > 0) {
      // Find a default category to move the articles to
      // Try to find "Others" category, or the first active category
      const defaultCategory = await prisma.newsCategory.findFirst({
        where: {
          id: { not: id },
          active: true,
          OR: [
            { slug: 'others' },
            { slug: 'general' }
          ]
        }
      })

      // If no "others" or "general" found, just get the first active category
      const targetCategory = defaultCategory || await prisma.newsCategory.findFirst({
        where: {
          id: { not: id },
          active: true
        },
        orderBy: {
          orderNumber: 'asc'
        }
      })

      if (!targetCategory) {
        return NextResponse.json({
          error: `Cannot delete category. ${newsCount} news articles are using this category and no other active category exists to move them to.`,
          newsCount
        }, { status: 400 })
      }

      // Move all news articles to the target category
      console.log(`📝 Moving ${newsCount} news articles to category "${targetCategory.name}" (${targetCategory.slug})`)

      await prisma.news.updateMany({
        where: {
          category: categoryToDelete.slug
        },
        data: {
          category: targetCategory.slug
        }
      })

      console.log(`✅ Successfully moved all news articles to "${targetCategory.name}"`)
    }

    // Now delete the category
    await prisma.newsCategory.delete({
      where: { id }
    })

    console.log(`✅ Category "${categoryToDelete.name}" deleted successfully`)

    return NextResponse.json({
      success: true,
      movedArticles: newsCount,
      movedTo: newsCount > 0 ? (await prisma.newsCategory.findFirst({
        where: {
          id: { not: id },
          active: true
        },
        orderBy: {
          orderNumber: 'asc'
        }
      }))?.name : null
    })
  } catch (error) {
    console.error('Error deleting news category:', error)
    return NextResponse.json({ error: 'Failed to delete news category' }, { status: 500 })
  }
}
