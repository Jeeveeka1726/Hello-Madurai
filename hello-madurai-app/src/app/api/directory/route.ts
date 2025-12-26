import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all businesses from Hostinger MySQL
    // Explicitly select fields to avoid issues with missing bookingPhone column
    const businesses = await prisma.business.findMany({
      select: {
        id: true,
        name: true,
        name_ta: true,
        description: true,
        description_ta: true,
        category: true,
        categoryId: true,
        subcategoryId: true,
        phone: true,
        email: true,
        website: true,
        mainImage: true,
        mainVideoUrl: true,
        address: true,
        address_ta: true,
        instagramUrl: true,
        facebookUrl: true,
        bookingUrl: true,
        // bookingPhone: true, // Will be enabled after database migration
        youtubeUrl: true,
        orderNumber: true,
        hasProfile: true,
        profileContent: true,
        profileContent_ta: true,
        profileImage: true,
        profileVideo: true,
        verified: true,
        createdAt: true,
        updatedAt: true,
        mainCategory: true,
        subcategory: true,
        comments: {
          select: {
            id: true,
            content: true,
            author: true,
            email: true,
            rating: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: {
        orderNumber: 'asc'
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
