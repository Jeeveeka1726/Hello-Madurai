import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const videoId = params.id

    // Update views count
    const video = await prisma.video.update({
      where: { id: videoId },
      data: {
        views: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ views: video.views, success: true })
  } catch (error) {
    console.error('Error updating video views:', error)
    return NextResponse.json(
      { error: 'Failed to update views' },
      { status: 500 }
    )
  }
}

