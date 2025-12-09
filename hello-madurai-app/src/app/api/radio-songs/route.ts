import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET: Fetch all radio songs (for search functionality)
export async function GET(request: NextRequest) {
  try {
    const songs = await prisma.radioSong.findMany({
      include: {
        singer: {
          select: {
            id: true,
            name: true,
            name_ta: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching all songs:', error)
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}

