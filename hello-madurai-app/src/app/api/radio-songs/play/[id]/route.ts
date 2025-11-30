import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST increment play count for a song
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.radioSong.update({
      where: { id },
      data: {
        plays: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error incrementing song plays:', error)
    return NextResponse.json(
      { error: 'Failed to increment plays' },
      { status: 500 }
    )
  }
}

