import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/magazines/[id]/like - Toggle like for magazine
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Increment likes count
    const magazine = await prisma.magazine.update({
      where: { id },
      data: {
        likes: {
          increment: 1
        }
      },
      include: {
        collection: true
      }
    })

    if (!magazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      likes: magazine.likes,
      magazine 
    })
  } catch (error) {
    console.error('Error updating magazine likes:', error)
    return NextResponse.json(
      { error: 'Failed to update likes' },
      { status: 500 }
    )
  }
}
