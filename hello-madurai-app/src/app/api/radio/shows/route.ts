import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const radioShows = await prisma.radioShow.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        folder: true
      }
    })

    return NextResponse.json(radioShows)
  } catch (error) {
    console.error('Error fetching radio shows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch radio shows' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      title, 
      title_ta, 
      description, 
      description_ta, 
      audioFileUrl, 
      duration,
      folderId
    } = body

    const radioShow = await prisma.radioShow.create({
      data: {
        title,
        title_ta: title_ta || undefined,
        description: description || undefined,
        description_ta: description_ta || undefined,
        audioFileUrl,
        duration: duration || undefined,
        folderId: folderId || undefined
      }
    })

    return NextResponse.json(radioShow, { status: 201 })
  } catch (error) {
    console.error('Error creating radio show:', error)
    return NextResponse.json(
      { error: 'Failed to create radio show' },
      { status: 500 }
    )
  }
}
