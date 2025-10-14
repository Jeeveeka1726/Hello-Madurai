import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: newsId } = await params
    const body = await request.json()
    const { action } = body // 'like' or 'unlike'

    // Update likes count based on action in Hostinger MySQL
    const news = await prisma.news.update({
      where: { id: newsId },
      data: {
        likes: {
          increment: action === 'like' ? 1 : -1
        }
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
