import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all news articles from Hostinger MySQL
    const news = await prisma.news.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(news || [])
  } catch (error) {
    console.error('Error in news API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log('📝 Received POST request to create news')
    const body = await request.json()
    console.log('📝 Request body:', { ...body, content: body.content?.substring(0, 50) + '...' })
    
    const { title, title_ta, content, content_ta, excerpt, excerpt_ta, category, author, authorSlug, featuredImage, featured } = body

    if (!title || !content || !category || !author) {
      console.error('❌ Validation failed:', { title: !!title, content: !!content, category: !!category, author: !!author })
      return NextResponse.json(
        { error: 'Title, content, category, and author are required' },
        { status: 400 }
      )
    }

    // Auto-generate excerpt from content if not provided
    const finalExcerpt = excerpt || content.substring(0, 200).replace(/<[^>]*>/g, '') + '...'

    console.log('💾 Attempting to create news in database...')
    // Create new news article in Hostinger MySQL
    const news = await prisma.news.create({
      data: {
        title,
        title_ta: title_ta || undefined,
        content,
        content_ta: content_ta || undefined,
        excerpt: finalExcerpt,
        excerpt_ta: excerpt_ta || undefined,
        category,
        author,
        authorSlug: authorSlug || undefined,
        featuredImage: featuredImage || undefined,
        featured: featured || false
      }
    })

    console.log('✅ News created successfully:', news.id)
    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error('❌ Error in news POST API:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    )
  }
}