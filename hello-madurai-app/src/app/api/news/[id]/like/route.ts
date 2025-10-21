import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: newsId } = await params
    const body = await request.json()
    const { action } = body // 'like' or 'unlike'

    // Get current news item first
    const currentNews = await prisma.news.findUnique({
      where: { id: newsId },
      select: { likes: true }
    })

    if (!currentNews) {
      return NextResponse.json(
        { error: 'News item not found' },
        { status: 404 }
      )
    }

    // Calculate new like count with bounds checking
    const currentLikes = currentNews.likes || 0
    let newLikes = currentLikes
    
    if (action === 'like') {
      newLikes = currentLikes + 1
    } else if (action === 'unlike') {
      newLikes = Math.max(0, currentLikes - 1) // Never go below 0
    }

    // Update likes count in Hostinger MySQL
    const news = await prisma.news.update({
      where: { id: newsId },
      data: {
        likes: newLikes
      }
    })

    return NextResponse.json({ likes: news.likes, success: true })
  } catch (error) {
    console.error('Error updating news likes:', error)
    return NextResponse.json(
      { error: 'Failed to update likes' },
      { status: 500 }
    )
  }
}
