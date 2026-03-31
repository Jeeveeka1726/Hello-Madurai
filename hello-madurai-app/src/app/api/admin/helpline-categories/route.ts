import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all helpline categories (admin)
export async function GET() {
  try {
    const categories = await prisma.helplineCategory.findMany({
      orderBy: {
        orderNumber: 'asc'
      },
      include: {
        _count: {
          select: { helplines: true }
        }
      }
    })

    return NextResponse.json(categories || [])
  } catch (error) {
    console.error('Error fetching helpline categories:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST create new helpline category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, name_ta, orderNumber, active } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const category = await prisma.helplineCategory.create({
      data: {
        name,
        name_ta: name_ta || null,
        orderNumber: orderNumber || 0,
        active: active !== undefined ? active : true
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating helpline category:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

