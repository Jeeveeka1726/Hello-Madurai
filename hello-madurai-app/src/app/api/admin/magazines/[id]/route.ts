import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE /api/admin/magazines/[id] - Delete magazine by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Magazine ID is required' },
        { status: 400 }
      )
    }

    // Check if magazine exists
    const magazine = await prisma.magazine.findUnique({
      where: { id }
    })

    if (!magazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      )
    }

    // Delete the magazine
    await prisma.magazine.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Magazine deleted successfully'
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error deleting magazine:', error)
    return NextResponse.json(
      { error: 'Failed to delete magazine' },
      { status: 500 }
    )
  }
}

// GET /api/admin/magazines/[id] - Get magazine by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const magazine = await prisma.magazine.findUnique({
      where: { id },
      include: {
        collection: true
      }
    })

    if (!magazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(magazine)
  } catch (error) {
    console.error('Error fetching magazine:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magazine' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/magazines/[id] - Update magazine by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    // Check if magazine exists
    const existingMagazine = await prisma.magazine.findUnique({
      where: { id }
    })

    if (!existingMagazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      )
    }

    // Update the magazine
    const magazine = await prisma.magazine.update({
      where: { id },
      data: {
        title: body.title,
        title_ta: body.title_ta,
        description: body.description,
        description_ta: body.description_ta,
        pdfUrl: body.pdfUrl,
        coverImage: body.coverImage,
        issueNumber: body.issueNumber,
        featured: body.featured,
        collectionId: body.collectionId,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined
      },
      include: {
        collection: true
      }
    })

    return NextResponse.json(magazine)
  } catch (error) {
    console.error('Error updating magazine:', error)
    return NextResponse.json(
      { error: 'Failed to update magazine' },
      { status: 500 }
    )
  }
}
