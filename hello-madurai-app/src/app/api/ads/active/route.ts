import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || 'news'

    const ads = await prisma.ad.findMany({
      where: {
        active: true,
        OR: [
          { category },
          { category: 'all' }
        ]
      },
      orderBy: {
        position: 'asc'
      }
    })

    return NextResponse.json(ads)
  } catch (error) {
    console.error('Error fetching active ads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
