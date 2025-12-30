import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/magazines/[id]/download - Track download for magazine
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Increment downloads count
    const magazine = await prisma.magazine.update({
      where: { id },
      data: {
        downloads: {
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
      downloads: magazine.downloads,
      magazine 
    })
  } catch (error) {
    console.error('Error updating magazine downloads:', error)
    return NextResponse.json(
      { error: 'Failed to update downloads' },
      { status: 500 }
    )
  }
}
