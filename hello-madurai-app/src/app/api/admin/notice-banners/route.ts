import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/notice-banners - Get all notice banners
export async function GET() {
  try {
    const banners = await prisma.noticeBanner.findMany({
      orderBy: {
        orderNumber: 'asc'
      }
    })

    return NextResponse.json(banners || [])
  } catch (error) {
    console.error('Error fetching notice banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notice banners' },
      { status: 500 }
    )
  }
}

// POST /api/admin/notice-banners - Create new notice banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.titleEn || !body.descriptionEn) {
      return NextResponse.json(
        { error: 'English title and description are required' },
        { status: 400 }
      )
    }

    const banner = await prisma.noticeBanner.create({
      data: {
        titleEn: body.titleEn,
        titleTa: body.titleTa || null,
        descriptionEn: body.descriptionEn,
        descriptionTa: body.descriptionTa || null,
        imageUrl: body.imageUrl || null,
        mobileImageUrl: body.mobileImageUrl || null,
        link: body.link || null,
        orderNumber: body.orderNumber || 0,
        active: body.active ?? true
      }
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error('Error creating notice banner:', error)
    return NextResponse.json(
      { error: 'Failed to create notice banner' },
      { status: 500 }
    )
  }
}
