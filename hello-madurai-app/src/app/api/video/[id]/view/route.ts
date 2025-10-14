import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Update views count
    const video = await prisma.video.update({
      where: { id },
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
