import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/authors - Get all authors
export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: {
        orderNumber: 'asc'
      }
    })

    return NextResponse.json(authors || [])
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}

// POST /api/admin/authors - Create new author
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate slug from name if not provided
    let slug = body.slug
    if (!slug) {
      slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
    }

    const author = await prisma.author.create({
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        slug: slug,
        imageUrl: body.imageUrl || null,
        description: body.description || null,
        description_ta: body.description_ta || null,
        active: body.active !== undefined ? body.active : true,
        featured: body.featured || false,
        orderNumber: body.orderNumber || 0
      }
    })

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error creating author:', error)
    return NextResponse.json({ error: 'Failed to create author' }, { status: 500 })
  }
}
