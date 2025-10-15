import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all businesses from Hostinger MySQL
    const businesses = await prisma.business.findMany({
      orderBy: {
        createdAt: 'desc'
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
