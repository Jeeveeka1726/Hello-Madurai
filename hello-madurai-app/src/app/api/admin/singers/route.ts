import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all singers (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')

    const singers = await prisma.singer.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: [
        { featured: 'desc' },  // Featured singers first
        { updatedAt: 'desc' }  // Then latest updated first
      ],
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

    // Generate slug from name
    let slug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim()

    // Check if slug already exists and make it unique
    let counter = 1
    let uniqueSlug = slug
    while (await prisma.singer.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const singer = await prisma.singer.create({
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        slug: uniqueSlug,
        imageUrl: body.imageUrl || null,
        featured: body.featured || false,
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

