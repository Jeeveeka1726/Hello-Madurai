import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/news/[id] - Fetch single news article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const news = await prisma.news.findUnique({
      where: { id }
    })

    if (!news) {
      return NextResponse.json({ error: 'News not found' }, { status: 404 })
    }

    return NextResponse.json(news)
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}

// PUT /api/admin/news/[id] - Update news article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('📝 Received PUT request to update news:', id)
    
    const body = await request.json()
    console.log('📝 Update body:', { ...body, content: body.content?.substring(0, 50) + '...' })
    
    const {
      title,
      title_ta,
      content,
      content_ta,
      excerpt,
      excerpt_ta,
      category,
      author,
      featured,
      featuredImage
    } = body

    if (!title || !content || !category || !author) {
      console.error('❌ Validation failed:', { title: !!title, content: !!content, category: !!category, author: !!author })
      return NextResponse.json(
        { error: 'Title, content, category, and author are required' },
        { status: 400 }
      )
    }

    // Auto-generate excerpt from content if not provided
    const finalExcerpt = excerpt || content.substring(0, 200).replace(/<[^>]*>/g, '') + '...'

    console.log('💾 Attempting to update news in database...')
    const news = await prisma.news.update({
      where: { id },
      data: {
        title,
        title_ta: title_ta || undefined,
        content,
        content_ta: content_ta || undefined,
        excerpt: finalExcerpt,
        excerpt_ta: excerpt_ta || undefined,
        category,
        author,
        featured: featured || false,
        featuredImage: featuredImage || undefined
      }
    })

    console.log('✅ News updated successfully:', news.id)
    return NextResponse.json(news)
  } catch (error) {
    console.error('❌ Error updating news:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json({ 
      error: 'Failed to update news',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : 'Unknown'
    }, { status: 500 })
  }
}

// DELETE /api/admin/news/[id] - Delete news article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // First delete all comment replies (child comments)
    await prisma.newsComment.deleteMany({
      where: { 
        newsId: id,
        parentId: { not: null }
      }
    })

    // Then delete all parent comments
    await prisma.newsComment.deleteMany({
      where: { 
        newsId: id,
        parentId: null
      }
    })

    // Delete all shares
    await prisma.newsShare.deleteMany({
      where: { newsId: id }
    })

    // Finally delete the news article
    await prisma.news.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'News deleted successfully' })
  } catch (error) {
    console.error('Error deleting news:', error)
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 })
  }
}
