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
        likes: {
          increment: 1
        }
      }
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error liking song:', error)
    return NextResponse.json({ error: 'Failed to like song' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const song = await prisma.radioSong.update({
      where: { id: params.id },
      data: {
        likes: {
          decrement: 1
        }
      }
    })

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error unliking song:', error)
    return NextResponse.json({ error: 'Failed to unlike song' }, { status: 500 })
  }
}

