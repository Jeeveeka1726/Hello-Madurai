import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT: Update subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, name_ta, slug, icon, categoryId } = body

    if (!name || !name_ta || !slug || !categoryId) {
      return NextResponse.json(
        { error: 'Name, Tamil name, slug, and category are required' },
        { status: 400 }
      )
    }

    // Check if slug is taken by another subcategory
    const existing = await prisma.directorySubcategory.findFirst({
      where: {
        slug,
        NOT: { id }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'A subcategory with this slug already exists' },
        { status: 400 }
      )
    }

    const subcategory = await prisma.directorySubcategory.update({
      where: { id },
      data: {
        name,
        name_ta,
        slug,
        icon: icon || null,
        categoryId
      },
      include: {
        category: true,
        _count: {
          select: {
            businesses: true
          }
        }
      }
    })

    return NextResponse.json({ subcategory })
  } catch (error) {
    console.error('Error updating subcategory:', error)
    return NextResponse.json({ error: 'Failed to update subcategory' }, { status: 500 })
  }
}

// DELETE: Delete subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if subcategory has businesses
    const subcategory = await prisma.directorySubcategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            businesses: true
          }
        }
      }
    })

    if (!subcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 })
    }

    if (subcategory._count.businesses > 0) {
      return NextResponse.json(
        { error: `Cannot delete subcategory with ${subcategory._count.businesses} businesses. Please reassign or delete them first.` },
        { status: 400 }
      )
    }

    await prisma.directorySubcategory.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Subcategory deleted successfully' })
  } catch (error) {
    console.error('Error deleting subcategory:', error)
    return NextResponse.json({ error: 'Failed to delete subcategory' }, { status: 500 })
  }
}

