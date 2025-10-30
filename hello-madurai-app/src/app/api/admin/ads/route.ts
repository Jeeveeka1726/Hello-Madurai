import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: {
        position: 'asc'
      }
    })

    return NextResponse.json(ads)
  } catch (error) {
    console.error('Error fetching ads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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
      }
    })

    return NextResponse.json(ad)
  } catch (error) {
    console.error('Error creating ad:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}




