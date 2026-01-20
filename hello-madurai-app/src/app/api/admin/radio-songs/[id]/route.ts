import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT update radio song
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Get the current song to check if audio URL changed
    const currentSong = await prisma.radioSong.findUnique({
      where: { id },
      select: { audioUrl: true, singerId: true }
    })

    const audioUrlChanged = currentSong?.audioUrl !== body.audioUrl

    const song = await prisma.radioSong.update({
      where: { id },
      data: {
        title: body.title,
        title_ta: body.title_ta || null,
        audioUrl: body.audioUrl,
        audioType: body.audioType || 'direct',
        duration: body.duration || null,
        singerId: body.singerId,
        // Auto-update timestamp when audio URL changes
        ...(audioUrlChanged && { updatedAt: new Date() })
      },
      include: {
        singer: {
          include: {
            category: true
          }
        }
      }
    })

    // Also update the singer's updatedAt timestamp when audio is updated
    if (audioUrlChanged) {
      await prisma.radioSinger.update({
        where: { id: body.singerId },
        data: { updatedAt: new Date() }
      })
      console.log('✅ Updated radio song with auto-updated timestamps:', song.title)
    }

    return NextResponse.json(song)
  } catch (error) {
    console.error('Error updating radio song:', error)
    return NextResponse.json(
      { error: 'Failed to update radio song' },
      { status: 500 }
    )
  }
}

// DELETE radio song
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.radioSong.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting radio song:', error)
    return NextResponse.json(
      { error: 'Failed to delete radio song' },
      { status: 500 }
    )
  }
}

