import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const song = await prisma.radioSong.update({
      where: { id },
      data: {
        plays: {
          increment: 1
        }
      }
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error incrementing play count:', error)
    return NextResponse.json({ error: 'Failed to increment play count' }, { status: 500 })
  }
}

