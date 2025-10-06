import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const radioShowId = params.id
    const body = await request.json()
    const { platform } = body

    // Record the share
    await prisma.radioShare.create({
      data: {
        radioShowId,
        platform: platform || 'unknown',
        userAgent: request.headers.get('user-agent') || undefined
      }
    })

    // Get updated share count
    const shareCount = await prisma.radioShare.count({
      where: { radioShowId }
    })

    return NextResponse.json({ shares: shareCount })
  } catch (error) {
    console.error('Error recording radio share:', error)
    return NextResponse.json(
      { error: 'Failed to record share' },
      { status: 500 }
    )
  }
}

