import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Batch fetch like statuses for multiple songs
export async function POST(request: NextRequest) {
  try {
    const { songIds } = await request.json()

    if (!Array.isArray(songIds) || songIds.length === 0) {
      return NextResponse.json(
        { error: 'songIds array is required' },
        { status: 400 }
      )
    }

    // Get session token from cookie
    const sessionToken = request.cookies.get('session_token')?.value

    if (!sessionToken) {
      // Return empty results if no session
      const results = songIds.reduce((acc, songId) => {
        acc[songId] = { liked: false, likeCount: 0 }
        return acc
      }, {} as Record<string, { liked: boolean; likeCount: number }>)

      return NextResponse.json(results)
    }

    // Find user
    const user = await prisma.anonymousUser.findUnique({
      where: { sessionToken }
    })

    if (!user) {
      // Return empty results if user not found
      const results = songIds.reduce((acc, songId) => {
        acc[songId] = { liked: false, likeCount: 0 }
        return acc
      }, {} as Record<string, { liked: boolean; likeCount: number }>)

      return NextResponse.json(results)
    }

    // Fetch all likes for these songs in one query
    const [userLikes, likeCounts] = await Promise.all([
      // Get user's likes for these songs
      prisma.songLike.findMany({
        where: {
          userId: user.id,
          songId: { in: songIds }
        },
        select: { songId: true }
      }),
      // Get like counts for all songs
      prisma.songLike.groupBy({
        by: ['songId'],
        where: { songId: { in: songIds } },
        _count: { songId: true }
      })
    ])

    // Create lookup maps
    const userLikedSongIds = new Set(userLikes.map(like => like.songId))
    const likeCountMap = likeCounts.reduce((acc, item) => {
      acc[item.songId] = item._count.songId
      return acc
    }, {} as Record<string, number>)

    // Build results
    const results = songIds.reduce((acc, songId) => {
      acc[songId] = {
        liked: userLikedSongIds.has(songId),
        likeCount: likeCountMap[songId] || 0
      }
      return acc
    }, {} as Record<string, { liked: boolean; likeCount: number }>)

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching batch like statuses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch like statuses' },
      { status: 500 }
    )
  }
}

