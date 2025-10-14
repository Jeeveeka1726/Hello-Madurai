import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all videos from Hostinger MySQL
    const videos = await prisma.video.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(videos || [])
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}
