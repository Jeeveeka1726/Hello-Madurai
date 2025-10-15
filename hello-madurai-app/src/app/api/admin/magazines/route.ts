import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/magazines - Get all magazines
export async function GET() {
  try {
    // Fetch all magazines from Hostinger MySQL
    const magazines = await prisma.magazine.findMany({
      include: {
        collection: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(magazines || [])
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
        { error: 'Title and collectionId are required' },
        { status: 400 }
      )
    }

    // Create magazine in Hostinger MySQL
    const magazine = await prisma.magazine.create({
      data: {
        title: body.title,
        title_ta: body.title_ta,
        description: body.description || '',
        description_ta: body.description_ta,
        pdfUrl: body.pdfUrl || '',
        coverImage: body.coverImage,
        featuredImage: body.featuredImage,
        issueNumber: body.issueNumber || '',
        collectionId: body.collectionId,
        featured: body.featured || false
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
