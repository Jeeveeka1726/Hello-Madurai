import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/directory - Get all businesses
export async function GET() {
  try {
    // Fetch all businesses from Hostinger MySQL
    const businesses = await prisma.business.findMany({
      include: {
        mainCategory: true,
        subcategory: true
      },
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
    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: 'Name and address are required' },
        { status: 400 }
      )
    }

    // Create business in Hostinger MySQL
    const business = await prisma.business.create({
      data: {
        name: body.name,
        name_ta: body.name_ta,
        category: body.category || '',
        categoryId: body.categoryId || null,
        subcategoryId: body.subcategoryId || null,
        phone: body.phone,
        email: body.email,
        website: body.website,
        mainImage: body.mainImage,
        mainVideoUrl: body.mainVideoUrl,
        address: body.address,
        address_ta: body.address_ta,
        youtubeUrl: body.youtubeUrl,
        instagramUrl: body.instagramUrl,
        facebookUrl: body.facebookUrl,
        bookingUrl: body.bookingUrl,
        // bookingPhone: body.bookingPhone, // Will be enabled after database migration
        directionsUrl: body.directionsUrl,
        latitude: body.latitude ? parseFloat(body.latitude) : null,
        longitude: body.longitude ? parseFloat(body.longitude) : null,
        orderNumber: body.orderNumber || 0,
        hasProfile: body.hasProfile || false,
        profileContent: body.profileContent,
        profileContent_ta: body.profileContent_ta,
        profileImage: body.profileImage,
        profileVideo: body.profileVideo,
        verified: body.verified || false
      },
      include: {
        mainCategory: true,
        subcategory: true
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
