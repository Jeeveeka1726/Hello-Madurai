import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT /api/admin/news-categories/[id] - Update news category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const category = await prisma.newsCategory.update({
      where: { id },
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        slug: body.slug,
        orderNumber: body.orderNumber,
        active: body.active
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating news category:', error)
    return NextResponse.json({ error: 'Failed to update news category' }, { status: 500 })
  }
}

// DELETE /api/admin/news-categories/[id] - Delete news category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.newsCategory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting news category:', error)
    return NextResponse.json({ error: 'Failed to delete news category' }, { status: 500 })
  }
}
