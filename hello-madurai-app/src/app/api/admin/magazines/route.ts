import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Helper function to generate slug from title
function generateSlug(title: string, id: string): string {
  // Remove all Tamil characters, special characters, and extra spaces
  let slug = title
    .replace(/[\u0B80-\u0BFF]/g, '') // Remove Tamil characters
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  // If slug is empty (e.g., title was all Tamil), use a generic name
  if (!slug || slug.length < 3) {
    slug = 'magazine'
  }

  // Append short ID to ensure uniqueness (last 8 characters)
  const shortId = id.slice(-8)
  slug = `${slug}-${shortId}`

  // Limit total length to 200 characters
  if (slug.length > 200) {
    slug = slug.substring(0, 191) + '-' + shortId
  }

  return slug
}

// GET /api/admin/magazines - Get all magazines
export async function GET() {
  try {
    // Fetch all magazines from Hostinger MySQL
    const magazines = await prisma.magazine.findMany({
      include: {
        collection: true
      },
      orderBy: [
        { orderNumber: 'asc' },   // First by manual order
        { publishedAt: 'desc' }   // Then by newest
      ]
    })

    return NextResponse.json(magazines || [])
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

    // Validate required fields
    if (!body.title || !body.collectionId) {
      return NextResponse.json(
        { error: 'Title and collectionId are required' },
        { status: 400 }
      )
    }

    // Create magazine in Hostinger MySQL (first without slug)
    const magazine = await prisma.magazine.create({
      data: {
        title: body.title,
        title_ta: body.title_ta,
        description: body.description || '',
        description_ta: body.description_ta,
        pdfUrl: body.pdfUrl || '',
        coverImage: body.coverImage,
        featuredImage: body.featuredImage,
        issueNumber: body.issueNumber || '',
        month: body.month,
        collectionId: body.collectionId,
        featured: body.featured || false,
        orderNumber: body.orderNumber || 0,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date()
      },
      include: {
        collection: true
      }
    })

    // Generate and update slug after creation (to use the generated ID)
    const slug = generateSlug(magazine.title, magazine.id)
    const updatedMagazine = await prisma.magazine.update({
      where: { id: magazine.id },
      data: { slug },
      include: {
        collection: true
      }
    })

    return NextResponse.json(updatedMagazine, { status: 201 })
  } catch (error) {
    console.error('Error creating magazine:', error)
    return NextResponse.json(
      { error: 'Failed to create magazine' },
      { status: 500 }
    )
  }
}
