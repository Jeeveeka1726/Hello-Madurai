import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/admin/magazines - Get all magazines
export async function GET() {
  try {
    const magazines = await prisma.magazine.findMany({
      orderBy: {
        publishedAt: 'desc'
      }
    })
    return NextResponse.json(magazines)
  } catch (error) {
    console.error('Error fetching magazines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    )
  }
}

// POST /api/admin/magazines - Create new magazine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const magazine = await prisma.magazine.create({
      data: {
        title: body.title,
        title_ta: body.title_ta,
        description: body.description,
        description_ta: body.description_ta,
        pdfUrl: body.pdfUrl,
        coverImage: body.coverImage,
        issueNumber: body.issueNumber,
        featured: body.featured || false,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date()
      }
    })
    
    return NextResponse.json(magazine, { status: 201 })
  } catch (error) {
    console.error('Error creating magazine:', error)
    return NextResponse.json(
      { error: 'Failed to create magazine' },
      { status: 500 }
    )
  }
}
