import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET all active offers (for public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    const offers = await prisma.offer.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { orderNumber: 'asc' }
    })

    return NextResponse.json(offers)
  } catch (error) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    )
  }
}

// POST create new offer (admin only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, title_ta, imageUrl, bookNowUrl, active, orderNumber } = body

    if (!title || !imageUrl || !bookNowUrl) {
      return NextResponse.json(
        { error: 'Title, image URL, and book now URL are required' },
        { status: 400 }
      )
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        title_ta: title_ta || null,
        imageUrl,
        bookNowUrl,
        active: active !== undefined ? active : true,
        orderNumber: orderNumber || 0
      }
    })

    return NextResponse.json(offer)
  } catch (error) {
    console.error('Error creating offer:', error)
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    )
  }
}

