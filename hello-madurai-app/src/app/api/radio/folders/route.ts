import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const folders = await prisma.radioFolder.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        shows: true
      }
    })

    return NextResponse.json(folders)
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
    const { name, name_ta, description, description_ta } = body

    const folder = await prisma.radioFolder.create({
      data: {
        name,
        name_ta: name_ta || undefined,
        description: description || undefined,
        description_ta: description_ta || undefined
      }
    })

    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    console.error('Error creating radio folder:', error)
    return NextResponse.json(
      { error: 'Failed to create radio folder' },
      { status: 500 }
    )
  }
}
