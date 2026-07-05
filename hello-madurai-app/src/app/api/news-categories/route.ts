import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/news-categories - Get all active news categories (public endpoint)
export async function GET() {
  try {
    const categories = await prisma.newsCategory.findMany({
      where: {
        active: true
      },
      orderBy: {
        orderNumber: 'asc'
      },
      select: {
        id: true,
        name: true,
        name_ta: true,
        slug: true,
        orderNumber: true,
        active: true
      }
    })

    return NextResponse.json(categories || [])
  } catch (error) {
    console.error('Error fetching news categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news categories' },
      { status: 500 }
    )
  }
}
