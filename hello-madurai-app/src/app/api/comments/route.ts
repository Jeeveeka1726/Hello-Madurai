import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET: Fetch approved comments for a news article (with replies)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const newsId = searchParams.get('newsId')

    if (!newsId) {
      return NextResponse.json({ error: 'newsId required' }, { status: 400 })
    }

    // Fetch all top-level comments (parentId is null) with their replies
    const comments = await prisma.newsComment.findMany({
      where: {
        newsId,
        parentId: null, // Only get parent comments
      },
      include: {
        replies: {
          orderBy: {
            createdAt: 'asc', // Replies in chronological order
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

// POST: Submit new comment or reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.newsId || !body.author || !body.content) {
      return NextResponse.json(
        { error: 'newsId, author, and content are required' },
        { status: 400 }
      )
    }

    // Check if this is a reply
    const isReply = !!body.parentId
    const isAdminReply = body.isAdminReply === true

    const comment = await prisma.newsComment.create({
      data: {
        newsId: body.newsId,
        author: body.author,
        email: body.email,
        content: body.content,
        parentId: body.parentId || null,
        isAdminReply: isAdminReply,
        approved: true, // All comments are auto-approved
      },
    })

    return NextResponse.json(
      {
        comment,
        message: 'Comment posted successfully!',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}

