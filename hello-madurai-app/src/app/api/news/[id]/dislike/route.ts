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

    // Update dislikes count in Hostinger MySQL
    const news = await prisma.news.update({
      where: { id: newsId },
      data: {
        dislikes: {
          increment: action === 'dislike' ? 1 : -1
        }
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
