import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/radio-songs/[id]/like
 * Like a song (creates a like record for the user)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: songId } = await params

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

    // Check if already liked
    const existingLike = await prisma.songLike.findUnique({
      where: {
        userId_songId: {
          userId: user.id,
          songId
        }
      }
    })

    if (existingLike) {
      return NextResponse.json(
        { error: 'Already liked', liked: true },
        { status: 400 }
      )
    }

    // Create like
    await prisma.songLike.create({
      data: {
        userId: user.id,
        songId
      }
    })

    // Get updated like count
    const likeCount = await prisma.songLike.count({
      where: { songId }
    })

    return NextResponse.json({
      success: true,
      liked: true,
      likeCount
    })
  } catch (error) {
    console.error('Error liking song:', error)
    return NextResponse.json(
      { error: 'Failed to like song' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/radio-songs/[id]/like
 * Unlike a song (removes the like record)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: songId } = await params

    // Get session token from cookie
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'No session found' },
        { status: 401 }
      )
    }

    // Find user by session token
    const user = await prisma.anonymousUser.findUnique({
      where: { sessionToken }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    // Delete like
    await prisma.songLike.deleteMany({
      where: {
        userId: user.id,
        songId
      }
    })

    // Get updated like count
    const likeCount = await prisma.songLike.count({
      where: { songId }
    })

    return NextResponse.json({
      success: true,
      liked: false,
      likeCount
    })
  } catch (error) {
    console.error('Error unliking song:', error)
    return NextResponse.json(
      { error: 'Failed to unlike song' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/radio-songs/[id]/like
 * Check if current user has liked this song
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: songId } = await params

    // Get session token from cookie
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      return NextResponse.json({ liked: false, likeCount: 0 })
    }

    // Find user by session token
    const user = await prisma.anonymousUser.findUnique({
      where: { sessionToken }
    })

    if (!user) {
      return NextResponse.json({ liked: false, likeCount: 0 })
    }

    // Check if liked
    const like = await prisma.songLike.findUnique({
      where: {
        userId_songId: {
          userId: user.id,
          songId
        }
      }
    })

    // Get total like count
    const likeCount = await prisma.songLike.count({
      where: { songId }
    })

    return NextResponse.json({
      liked: !!like,
      likeCount
    })
  } catch (error) {
    console.error('Error checking like status:', error)
    return NextResponse.json(
      { liked: false, likeCount: 0 },
      { status: 500 }
    )
  }
}

