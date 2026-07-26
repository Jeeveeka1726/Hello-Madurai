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

// GET /api/admin/magazines/[id] - Get magazine by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const magazine = await prisma.magazine.findUnique({
      where: { id },
      include: {
        collection: true
      }
    })

    if (!magazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(magazine)
  } catch (error) {
    console.error('Error fetching magazine:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magazine' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/magazines/[id] - Update magazine by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Check if magazine exists
    const existingMagazine = await prisma.magazine.findUnique({
      where: { id }
    })

    if (!existingMagazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      )
    }

    // If title is being updated, regenerate slug
    let slug = existingMagazine.slug
    if (body.title && body.title !== existingMagazine.title) {
      slug = generateSlug(body.title, id)
    }

    // Update the magazine
    const magazine = await prisma.magazine.update({
      where: { id },
      data: {
        title: body.title,
        title_ta: body.title_ta || undefined,
        slug,
        description: body.description || undefined,
        description_ta: body.description_ta || undefined,
        pdfUrl: body.pdfUrl || undefined,
        coverImage: body.coverImage || undefined,
        issueNumber: body.issueNumber || undefined,
        month: body.month || undefined,
        featured: body.featured,
        orderNumber: body.orderNumber !== undefined ? body.orderNumber : undefined,
        collectionId: body.collectionId || undefined,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined
      },
      include: {
        collection: true
      }
    })

    return NextResponse.json(magazine)
  } catch (error) {
    console.error('Error updating magazine:', error)
    return NextResponse.json(
      { error: 'Failed to update magazine' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/magazines/[id] - Delete magazine by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: 'Magazine ID is required' },
        { status: 400 }
      )
    }

    // Check if magazine exists
    const magazine = await prisma.magazine.findUnique({
      where: { id }
    })

    if (!magazine) {
      return NextResponse.json(
        { error: 'Magazine not found' },
        { status: 404 }
      )
    }

    // Delete the magazine
    await prisma.magazine.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Magazine deleted successfully'
    }, { status: 200 })
    
  } catch (error) {
    console.error('Error deleting magazine:', error)
    return NextResponse.json(
      { error: 'Failed to delete magazine' },
      { status: 500 }
    )
  }
}
