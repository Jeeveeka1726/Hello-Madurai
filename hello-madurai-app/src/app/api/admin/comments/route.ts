import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all comments (for admin) with replies
export async function GET(request: NextRequest) {
  try {
    // Fetch all top-level comments (no approval filtering needed)
    const comments = await prisma.newsComment.findMany({
      where: {
        parentId: null, // Only get top-level comments
      },
      include: {
        news: {
          select: {
            id: true,
            title: true,
            title_ta: true,
          },
        },
        replies: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        _count: {
          select: {
            replies: true,
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
