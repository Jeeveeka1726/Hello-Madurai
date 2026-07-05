import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/news-categories - Get all news categories
export async function GET() {
  try {
    const categories = await prisma.newsCategory.findMany({
      orderBy: {
        orderNumber: 'asc'
      }
    })

    return NextResponse.json(categories || [])
  } catch (error) {
    console.error('Error fetching news categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news categories' },
      { status: 500 }
    )
  }
}

// POST /api/admin/news-categories - Create new news category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      )
    }

    const category = await prisma.newsCategory.create({
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        slug: body.slug,
        orderNumber: body.orderNumber || 0,
        active: body.active ?? true
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating news category:', error)
    return NextResponse.json(
      { error: 'Failed to create news category' },
      { status: 500 }
    )
  }
}
