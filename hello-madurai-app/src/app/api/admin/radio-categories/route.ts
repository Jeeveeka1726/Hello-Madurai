import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all radio categories (admin)
export async function GET() {
  try {
    const categories = await prisma.radioCategory.findMany({
      orderBy: {
        orderNumber: 'asc'
      },
      include: {
        _count: {
          select: { singers: true }
        }
      }
    })

    return NextResponse.json(categories || [])
  } catch (error) {
    console.error('Error fetching radio categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new radio category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const category = await prisma.radioCategory.create({
      data: {
        name: body.name,
        name_ta: body.name_ta,
        slug: body.slug,
        orderNumber: body.orderNumber || 0
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating radio category:', error)
    return NextResponse.json(
      { error: 'Failed to create radio category' },
      { status: 500 }
    )
  }
}

