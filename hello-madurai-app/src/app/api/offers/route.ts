import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Cache for 5 minutes
export const revalidate = 300

// GET all active offers (for public)
export async function GET(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    console.log('📦 Fetching offers from database...')

    const offers = await prisma.offer.findMany({
      where: includeInactive ? {} : { active: true },
      orderBy: { orderNumber: 'asc' },
      take: 500 // Maximum 500 offers
    })

    const duration = Date.now() - startTime
    console.log(`✅ Offers API completed in ${duration}ms (${offers.length} offers, ${includeInactive ? 'all' : 'active only'})`)

    return NextResponse.json(offers || [], {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'X-Response-Time': `${duration}ms`,
        'X-Offer-Count': offers.length.toString()
      }
    })
  } catch (error) {
    console.error('❌ Error fetching offers:', error)
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
    const { title, title_ta, imageUrl, bookNowUrl, bookNowPhone, category, active, orderNumber } = body

    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'Title and image URL are required' },
        { status: 400 }
      )
    }

    const offer = await prisma.offer.create({
      data: {
        title,
        title_ta: title_ta || null,
        imageUrl,
        bookNowUrl: bookNowUrl || null,
        bookNowPhone: bookNowPhone || null,
        category: category || null,
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

