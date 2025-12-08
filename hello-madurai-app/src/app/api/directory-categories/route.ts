import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch all directory categories for public use
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.directoryCategory.findMany({
      include: {
        subcategories: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { orderNumber: 'asc' }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching directory categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

