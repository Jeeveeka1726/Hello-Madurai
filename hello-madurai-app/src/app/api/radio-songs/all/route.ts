import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('Fetching all radio songs...')

    const songs = await prisma.radioSong.findMany({
      include: {
        singer: {
          include: {
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${songs.length} radio songs`)

    return NextResponse.json(songs)
  } catch (error) {
    console.error('Error fetching all radio songs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch songs', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

