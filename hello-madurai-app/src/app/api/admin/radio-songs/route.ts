import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all radio songs (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const singerId = searchParams.get('singerId')

    const songs = await prisma.radioSong.findMany({
      where: singerId ? { singerId } : undefined,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        singer: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json(songs || [])
  } catch (error) {
    console.error('Error fetching radio songs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new radio song
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const song = await prisma.radioSong.create({
      data: {
        title: body.title,
        title_ta: body.title_ta || null,
        audioUrl: body.audioUrl,
        audioType: body.audioType || 'direct',
        duration: body.duration || null,
        singerId: body.singerId
      },
      include: {
        singer: {
          include: {
            category: true
          }
        }
      }
    })

    return NextResponse.json(song, { status: 201 })
  } catch (error) {
    console.error('Error creating radio song:', error)
    return NextResponse.json(
      { error: 'Failed to create radio song' },
      { status: 500 }
    )
  }
}

