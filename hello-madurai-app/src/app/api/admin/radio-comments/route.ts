import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all radio comments (for admin) with replies
export async function GET(request: NextRequest) {
  try {
    // Fetch all top-level comments (no parentId)
    const comments = await prisma.singerComment.findMany({
      where: {
        parentId: null, // Only get top-level comments
      },
      include: {
        singer: {
          select: {
            id: true,
            name: true,
            name_ta: true,
            imageUrl: true,
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
    console.error('Error fetching radio comments:', error)
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 })
  }
}

