import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/authors - Get all active authors (public endpoint)
export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      where: {
        active: true
      },
      orderBy: [
        { featured: 'desc' },
        { orderNumber: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        name_ta: true,
        slug: true,
        imageUrl: true,
        description: true,
        description_ta: true,
        featured: true,
        createdAt: true
      }
    })

    return NextResponse.json(authors || [])
  } catch (error) {
    console.error('Error fetching authors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch authors' },
      { status: 500 }
    )
  }
}
