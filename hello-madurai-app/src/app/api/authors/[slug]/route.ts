import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/authors/[slug] - Get single author by slug (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const author = await prisma.author.findUnique({
      where: { slug, active: true },
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
    console.error('Error fetching author:', error)
    return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 })
  }
}
