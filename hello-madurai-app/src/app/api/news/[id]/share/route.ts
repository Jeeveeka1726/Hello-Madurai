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
    const { platform } = body

    // Record the share in Hostinger MySQL
    await prisma.newsShare.create({
      data: {
        newsId,
        platform: platform || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    // Get updated share count
    const shareCount = await prisma.newsShare.count({
      where: { newsId }
    })

    return NextResponse.json({ shares: shareCount, success: true })
  } catch (error) {
    console.error('Error recording news share:', error)
    return NextResponse.json(
      { error: 'Failed to record share' },
      { status: 500 }
    )
  }
}
