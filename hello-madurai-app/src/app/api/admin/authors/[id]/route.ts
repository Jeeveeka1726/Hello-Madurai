import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/authors/[id] - Get single author
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const author = await prisma.author.findUnique({
      where: { id }
    })

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error fetching author:', error)
    return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 })
  }
}

// PUT /api/admin/authors/[id] - Update author
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const author = await prisma.author.update({
      where: { id },
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        slug: body.slug,
        imageUrl: body.imageUrl || null,
        description: body.description || null,
        description_ta: body.description_ta || null,
        active: body.active,
        featured: body.featured || false,
        orderNumber: body.orderNumber
      }
    })

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error updating author:', error)
    return NextResponse.json({ error: 'Failed to update author' }, { status: 500 })
  }
}

// DELETE /api/admin/authors/[id] - Delete author
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.author.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting author:', error)
    return NextResponse.json({ error: 'Failed to delete author' }, { status: 500 })
  }
}
