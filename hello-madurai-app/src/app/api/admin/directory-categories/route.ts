import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all directory categories with subcategories
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.directoryCategory.findMany({
      include: {
        subcategories: {
          orderBy: { name: 'asc' }
        },
        _count: {
          select: {
            businesses: true,
            subcategories: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching directory categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

// POST: Create new directory category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, name_ta } = body

    if (!name || !name_ta) {
      return NextResponse.json(
        { error: 'Name and Tamil name are required' },
        { status: 400 }
      )
    }

    const category = await prisma.directoryCategory.create({
      data: {
        name,
        name_ta
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

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    console.error('Error creating directory category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

