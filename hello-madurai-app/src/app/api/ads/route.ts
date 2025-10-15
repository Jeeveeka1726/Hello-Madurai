import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET: Fetch ads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    const where: any = {}
    if (category) where.category = category
    if (active === 'true') where.active = true

    const ads = await prisma.ad.findMany({
      where,
      orderBy: { position: 'asc' },
    })

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

// POST: Create ad
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const ad = await prisma.ad.create({
      data: {
        title: body.title,
        title_ta: body.title_ta,
        imageUrl: body.imageUrl,
        htmlCode: body.htmlCode,
        link: body.link,
        active: body.active ?? true,
        position: body.position ?? 0,
        category: body.category || 'news',
      },
    })

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }
}
