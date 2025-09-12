import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/magazines - Get all magazines with collections
export async function GET() {
  try {
    const magazines = await prisma.magazine.findMany({
      include: {
        collection: true
      },
      orderBy: {
        publishedAt: 'desc'
      }
    })
    return NextResponse.json(magazines)
  } catch (error) {
    console.error('Error fetching magazines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    )
  }
}

// POST /api/admin/magazines - Create new magazine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.collectionId) {
      return NextResponse.json(
        { error: 'Title and collection ID are required' },
        { status: 400 }
      )
    }

    const magazine = await prisma.magazine.create({
      data: {
        title: body.title,
        title_ta: body.title_ta,
        description: body.description,
        description_ta: body.description_ta,
        pdfUrl: body.pdfUrl,
        coverImage: body.coverImage,
        issueNumber: body.issueNumber,
        featured: body.featured || false,
        collectionId: body.collectionId,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date()
      },
      include: {
        collection: true
      }
    })

    return NextResponse.json(magazine, { status: 201 })
  } catch (error) {
    console.error('Error creating magazine:', error)
    return NextResponse.json(
      { error: 'Failed to create magazine' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/magazines - Delete magazine
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Magazine ID is required' },
        { status: 400 }
      )
    }

    await prisma.magazine.delete({
      where: { id }
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting magazine:', error)
    return NextResponse.json(
      { error: 'Failed to delete magazine' },
      { status: 500 }
    )
  }
}
