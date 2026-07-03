import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const features = await prisma.homeFeature.findMany({
      where: { active: true },
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
