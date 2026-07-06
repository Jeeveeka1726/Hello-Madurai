import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/authors/by-name/[name] - Get author by name (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params
    const decodedName = decodeURIComponent(name)

    const author = await prisma.author.findFirst({
      where: { 
        name: {
          equals: decodedName,
          mode: 'insensitive'
        },
        active: true 
      },
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

    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    return NextResponse.json(author)
  } catch (error) {
    console.error('Error fetching author by name:', error)
    return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 })
  }
}
