import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/magazines/[id] - Get magazine by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
        title_ta: body.title_ta || undefined,
        description: body.description || undefined,
        description_ta: body.description_ta || undefined,
        pdfUrl: body.pdfUrl || undefined,
        coverImage: body.coverImage || undefined,
        issueNumber: body.issueNumber || undefined,
        month: body.month || undefined,
        featured: body.featured,
        orderNumber: body.orderNumber !== undefined ? body.orderNumber : undefined,
        collectionId: body.collectionId || undefined,
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

// DELETE /api/admin/magazines/[id] - Delete magazine by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
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
