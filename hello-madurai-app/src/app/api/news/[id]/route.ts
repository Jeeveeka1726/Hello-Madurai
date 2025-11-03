import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch specific news article with comments and shares
    const article = await prisma.news.findUnique({
      where: { id },
      include: {
        comments: {
          where: { approved: true },
          orderBy: { createdAt: 'desc' }
        },
        shares: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (error) {
    console.error('Error fetching article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const { title, title_ta, content, content_ta, excerpt, excerpt_ta, category, author, featuredImage, featured } = body

    if (!title || !content || !category || !author) {
      return NextResponse.json(
        { error: 'Title, content, category, and author are required' },
        { status: 400 }
      )
    }

    // Auto-generate excerpt from content if not provided
    const finalExcerpt = excerpt || content.substring(0, 200).replace(/<[^>]*>/g, '') + '...'

    const updatedArticle = await prisma.news.update({
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
        featuredImage: featuredImage || undefined,
        featured: featured || false
      }
    })

    return NextResponse.json(updatedArticle)
  } catch (error) {
    console.error('Error updating article:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




