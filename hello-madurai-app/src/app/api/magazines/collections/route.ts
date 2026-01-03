import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const collections = await prisma.magazineCollection.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        _count: {
          select: {
            magazines: true
          }
        }
      }
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
    const { name, name_ta } = body

    const collection = await prisma.magazineCollection.create({
      data: {
        name,
        name_ta: name_ta || undefined
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
