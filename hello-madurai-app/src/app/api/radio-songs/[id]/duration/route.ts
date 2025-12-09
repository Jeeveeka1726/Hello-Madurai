import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH: Update song duration
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { duration } = body

    if (!duration) {
      return NextResponse.json(
        { error: 'Duration is required' },
        { status: 400 }
      )
    }

    const song = await prisma.radioSong.update({
      where: { id },
      data: { duration }
    })

    return NextResponse.json({ success: true, duration: song.duration })
  } catch (error) {
    console.error('Error updating song duration:', error)
    return NextResponse.json(
      { error: 'Failed to update duration' },
      { status: 500 }
    )
  }
}

