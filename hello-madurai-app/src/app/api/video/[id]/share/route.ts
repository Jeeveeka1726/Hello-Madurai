import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { platform } = body

    // Record the share
    await prisma.videoShare.create({
      data: {
        videoId: id,
        platform: platform || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    // Get updated share count
    const shareCount = await prisma.videoShare.count({
      where: { videoId: id }
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
