import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/magazines/[id]/like - Like / Unlike magazine
export async function POST(
	  request: NextRequest,
	  { params }: { params: Promise<{ id: string }> }
	) {
	  try {
	    const { id } = await params

	    // Default action is "like" to keep backwards compatibility
	    let action: 'like' | 'unlike' = 'like'

	    try {
	      const body = await request.json()
	      if (body?.action === 'unlike') {
	        action = 'unlike'
	      }
	    } catch {
	      // If there is no/invalid JSON body, fall back to "like"
	    }

	    // Get current likes to safely clamp at 0
	    const existing = await prisma.magazine.findUnique({
	      where: { id }
	    })

	    if (!existing) {
	      return NextResponse.json(
	        { error: 'Magazine not found' },
	        { status: 404 }
	      )
	    }

	    let newLikes = existing.likes || 0

	    if (action === 'like') {
	      newLikes += 1
	    } else {
	      newLikes = Math.max(newLikes - 1, 0)
	    }

	    const magazine = await prisma.magazine.update({
	      where: { id },
	      data: {
	        likes: newLikes
	      },
	      include: {
	        collection: true
	      }
	    })

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
