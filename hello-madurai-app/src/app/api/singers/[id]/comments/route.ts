import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/singers/[id]/comments
 * Get all comments for a singer/artist
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: singerId } = await params

    // Fetch top-level comments with their replies
    const comments = await prisma.singerComment.findMany({
      where: {
        singerId,
        parentId: null // Only top-level comments
      },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/singers/[id]/comments
 * Add a comment to a singer/artist page
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: singerId } = await params
    const body = await request.json()
    const { content, author, parentId, isAdminReply } = body

    // Validate input
    if (!content || !author) {
      return NextResponse.json(
        { error: 'Content and author name are required' },
        { status: 400 }
      )
    }

    if (content.trim().length < 2) {
      return NextResponse.json(
        { error: 'Comment is too short' },
        { status: 400 }
      )
    }

    if (author.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name is too short' },
        { status: 400 }
      )
    }

    // For admin replies, skip session validation
    let userId = null
    if (!isAdminReply) {
      // Get session token from cookie
      const sessionToken = request.cookies.get('session_token')?.value

      if (!sessionToken) {
        return NextResponse.json(
          { error: 'No session found. Please refresh the page.' },
          { status: 401 }
        )
      }

      // Find user by session token
      const user = await prisma.anonymousUser.findUnique({
        where: { sessionToken }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid session. Please refresh the page.' },
          { status: 401 }
        )
      }

      userId = user.id
    }

    // Verify singer exists
    const singer = await prisma.singer.findUnique({
      where: { id: singerId }
    })

    if (!singer) {
      return NextResponse.json(
        { error: 'Singer not found' },
        { status: 404 }
      )
    }

    // Create comment or reply
    const comment = await prisma.singerComment.create({
      data: {
        content: content.trim(),
        author: author.trim(),
        userId: userId,
        singerId,
        parentId: parentId || null,
        isAdminReply: isAdminReply || false
      },
      include: {
        replies: true
      }
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

