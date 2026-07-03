import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/home-features - Get all home features
export async function GET() {
  try {
    const features = await prisma.homeFeature.findMany({
      orderBy: {
        orderNumber: 'asc'
      }
    })

    return NextResponse.json(features || [])
  } catch (error) {
    console.error('Error fetching home features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch home features' },
      { status: 500 }
    )
  }
}

// POST /api/admin/home-features - Create new home feature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.nameEn || !body.descEn || !body.href) {
      return NextResponse.json(
        { error: 'English name, description, and href are required' },
        { status: 400 }
      )
    }

    const feature = await prisma.homeFeature.create({
      data: {
        nameEn: body.nameEn,
        nameTa: body.nameTa || null,
        descEn: body.descEn,
        descTa: body.descTa || null,
        href: body.href,
        iconColor: body.iconColor || 'bg-blue-500',
        backgroundImage: body.backgroundImage || null,
        orderNumber: body.orderNumber || 0,
        active: body.active ?? true
      }
    })

    return NextResponse.json(feature, { status: 201 })
  } catch (error) {
    console.error('Error creating home feature:', error)
    return NextResponse.json(
      { error: 'Failed to create home feature' },
      { status: 500 }
    )
  }
}
