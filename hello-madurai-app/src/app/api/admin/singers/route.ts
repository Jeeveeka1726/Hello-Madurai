import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all singers (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const singers = await prisma.singer.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        category: true,
        _count: {
          select: { songs: true }
        }
      }
    })

    return NextResponse.json(singers || [])
  } catch (error) {
    console.error('Error fetching singers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new singer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const singer = await prisma.singer.create({
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        imageUrl: body.imageUrl || null,
        categoryId: body.categoryId
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(singer, { status: 201 })
  } catch (error) {
    console.error('Error creating singer:', error)
    return NextResponse.json(
      { error: 'Failed to create singer' },
      { status: 500 }
    )
  }
}

