import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT: Update directory category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, name_ta, orderNumber } = body

    if (!name || !name_ta) {
      return NextResponse.json(
        { error: 'Name and Tamil name are required' },
        { status: 400 }
      )
    }

    const category = await prisma.directoryCategory.update({
      where: { id },
      data: {
        name,
        name_ta,
        orderNumber: orderNumber || 0
      },
      include: {
        subcategories: true,
        _count: {
          select: {
            businesses: true,
            subcategories: true
          }
        }
      }
    })

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Error updating directory category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

// DELETE: Delete directory category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if category has businesses
    const category = await prisma.directoryCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            businesses: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    if (category._count.businesses > 0) {
      return NextResponse.json(
        { error: `Cannot delete category with ${category._count.businesses} businesses. Please reassign or delete them first.` },
        { status: 400 }
      )
    }

    await prisma.directoryCategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting directory category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}

