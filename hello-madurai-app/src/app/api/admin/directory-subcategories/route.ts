import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST: Create new subcategory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, name_ta, icon, categoryId } = body

    if (!name || !name_ta || !categoryId) {
      return NextResponse.json(
        { error: 'Name, Tamil name, and category are required' },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await prisma.directoryCategory.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    const subcategory = await prisma.directorySubcategory.create({
      data: {
        name,
        name_ta,
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

    return NextResponse.json({ subcategory }, { status: 201 })
  } catch (error) {
    console.error('Error creating subcategory:', error)
    return NextResponse.json({ error: 'Failed to create subcategory' }, { status: 500 })
  }
}

