import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const radioFolders = await prisma.radioFolder.findMany({
      include: {
        radioShows: {
          orderBy: {
            publishedAt: 'desc'
          }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(radioFolders)
  } catch (error) {
    console.error('Error fetching radio folders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch radio folders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, name_ta, description, description_ta, coverImage, featured } = body

    const radioFolder = await prisma.radioFolder.create({
      data: {
        name,
        name_ta,
        description,
        description_ta,
        coverImage,
        featured: featured || false
      }
    })

    return NextResponse.json(radioFolder, { status: 201 })
  } catch (error) {
    console.error('Error creating radio folder:', error)
    return NextResponse.json(
      { error: 'Failed to create radio folder' },
      { status: 500 }
    )
  }
}
