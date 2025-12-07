import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const song = await prisma.radioSong.update({
      where: { id: params.id },
      data: {
        shares: {
          increment: 1
        }
      }
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error sharing song:', error)
    return NextResponse.json({ error: 'Failed to share song' }, { status: 500 })
  }
}

