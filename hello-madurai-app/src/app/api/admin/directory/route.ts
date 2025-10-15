import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/directory - Get all businesses
export async function GET() {
  try {
    // Fetch all businesses from Hostinger MySQL
    const businesses = await prisma.business.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(businesses || [])
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch businesses' },
      { status: 500 }
    )
  }
}

// POST /api/admin/directory - Create new business
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.category || !body.address) {
      return NextResponse.json(
        { error: 'Name, category, and address are required' },
        { status: 400 }
      )
    }

    // Create business in Hostinger MySQL
    const business = await prisma.business.create({
      data: {
        name: body.name,
        name_ta: body.name_ta,
        description: body.description || '',
        description_ta: body.description_ta,
        category: body.category,
        phone: body.phone,
        email: body.email,
        website: body.website,
        address: body.address,
        address_ta: body.address_ta,
        videoUrl: body.videoUrl,
        instagramUrl: body.instagramUrl,
        facebookUrl: body.facebookUrl,
        bookingUrl: body.bookingUrl,
        latitude: body.latitude ? parseFloat(body.latitude) : undefined,
        longitude: body.longitude ? parseFloat(body.longitude) : undefined,
        featured: body.featured || false,
        verified: body.verified || false
      }
    })

    return NextResponse.json(business, { status: 201 })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json(
      { error: 'Failed to create business' },
      { status: 500 }
    )
  }
}
