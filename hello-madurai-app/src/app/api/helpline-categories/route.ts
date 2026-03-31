import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.helplineCategory.findMany({
      where: {
        active: true
      },
      orderBy: {
        orderNumber: 'asc'
      },
      include: {
        _count: {
          select: { helplines: true }
        }
      }
    })

    return NextResponse.json(categories || [])
  } catch (error) {
    console.error('Error fetching helpline categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch helpline categories' },
      { status: 500 }
    )
  }
}

