import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/magazines/collections/[id] - Get collection by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const collection = await prisma.magazineCollection.findUnique({
      where: { id },
      include: {
        magazines: true
      }
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error fetching collection:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    )
  }
}

// PUT /api/magazines/collections/[id] - Update collection by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Check if collection exists
    const existingCollection = await prisma.magazineCollection.findUnique({
      where: { id }
    })

    if (!existingCollection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Update the collection
    const collection = await prisma.magazineCollection.update({
      where: { id },
      data: {
        name: body.name,
        name_ta: body.name_ta || undefined
      },
      include: {
        magazines: true
      }
    })

    return NextResponse.json(collection)
  } catch (error) {
    console.error('Error updating collection:', error)
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    )
  }
}

// DELETE /api/magazines/collections/[id] - Delete collection by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Collection ID is required' },
        { status: 400 }
      )
    }

    // Check if collection exists
    const collection = await prisma.magazineCollection.findUnique({
      where: { id },
      include: {
        magazines: true
      }
    })

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      )
    }

    // Check if collection has magazines
    if (collection.magazines && collection.magazines.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete collection that contains magazines. Please delete or move the magazines first.' },
        { status: 400 }
      )
    }

    // Delete the collection
    await prisma.magazineCollection.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Collection deleted successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('Error deleting collection:', error)
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    )
  }
}
