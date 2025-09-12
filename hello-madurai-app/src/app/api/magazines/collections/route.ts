import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const collections = await prisma.magazineCollection.findMany({
      include: {
        magazines: {
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

    return NextResponse.json(collections)
  } catch (error) {
    console.error('Error fetching magazine collections:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magazine collections' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, name_ta, description, description_ta, coverImage, featured } = body

    const collection = await prisma.magazineCollection.create({
      data: {
        name,
        name_ta,
        description,
        description_ta,
        coverImage,
        featured: featured || false
      }
    })

    return NextResponse.json(collection, { status: 201 })
  } catch (error) {
    console.error('Error creating magazine collection:', error)
    return NextResponse.json(
      { error: 'Failed to create magazine collection' },
      { status: 500 }
    )
  }
}
