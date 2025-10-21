import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: newsId } = await params
    const body = await request.json()
    const { action } = body // 'dislike' or 'undislike'

    // Get current news item first
    const currentNews = await prisma.news.findUnique({
      where: { id: newsId },
      select: { dislikes: true }
    })

    if (!currentNews) {
      return NextResponse.json(
        { error: 'News item not found' },
        { status: 404 }
      )
    }

    // Calculate new dislike count with bounds checking
    const currentDislikes = currentNews.dislikes || 0
    let newDislikes = currentDislikes
    
    if (action === 'dislike') {
      newDislikes = currentDislikes + 1
    } else if (action === 'undislike') {
      newDislikes = Math.max(0, currentDislikes - 1) // Never go below 0
    }

    // Update dislikes count in Hostinger MySQL
    const news = await prisma.news.update({
      where: { id: newsId },
      data: {
        dislikes: newDislikes
      }
    })

    return NextResponse.json({ dislikes: news.dislikes, success: true })
  } catch (error) {
    console.error('Error updating news dislikes:', error)
    return NextResponse.json(
      { error: 'Failed to update dislikes' },
      { status: 500 }
    )
  }
}
