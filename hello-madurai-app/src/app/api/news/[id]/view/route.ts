import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userAgent = request.headers.get('user-agent') || undefined

    // Create a view record with timestamp AND increment the counter
    await Promise.all([
      // Create timestamped view record for analytics
      prisma.newsView.create({
        data: {
          newsId: id,
          userAgent,
        }
      }),
      // Also increment the counter for backward compatibility
      prisma.news.update({
        where: { id },
        data: {
          views: {
            increment: 1
          }
        }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




