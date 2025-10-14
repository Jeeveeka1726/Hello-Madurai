import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/news/[id]/comments - Fetch comments for a news article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: newsId } = await params

    // Fetch only top-level comments (parentId is null) with their replies
    const comments = await prisma.newsComment.findMany({
      where: {
        newsId,
        approved: true,
        parentId: null, // Only get parent comments
      },
      include: {
        replies: {
          where: {
            approved: true,
          },
          orderBy: {
            createdAt: 'asc', // Replies in chronological order
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(comments || [])
  } catch (error) {
    console.error('Error fetching news comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

// POST /api/news/[id]/comments - Create a comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: newsId } = await params
    const body = await request.json()
    const { content, author, email, parentId } = body

    if (!content || !author) {
      return NextResponse.json(
        { error: 'Content and author are required' },
        { status: 400 }
      )
    }

    const comment = await prisma.newsComment.create({
      data: {
        content,
        author,
        email: email || undefined,
        newsId,
        parentId: parentId || undefined,
        approved: false, // Requires admin approval
      },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating news comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
