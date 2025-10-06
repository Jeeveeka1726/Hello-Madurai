import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id
    const body = await request.json()
    const { platform } = body

    // Record the share
    await prisma.videoShare.create({
      data: {
        videoId,
        platform: platform || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    // Get updated share count
    const shareCount = await prisma.videoShare.count({
      where: { videoId }
    })

    return NextResponse.json({ shares: shareCount })
  } catch (error) {
    console.error('Error recording video share:', error)
    return NextResponse.json(
      { error: 'Failed to record share' },
      { status: 500 }
    )
  }
}

