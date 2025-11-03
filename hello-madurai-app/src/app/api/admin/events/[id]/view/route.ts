import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Increment view count
    const event = await prisma.event.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    })
    
    return NextResponse.json({ success: true, views: event.views })
  } catch (error) {
    console.error('Error incrementing view:', error)
    return NextResponse.json({ error: 'Failed to increment view' }, { status: 500 })
  }
}





