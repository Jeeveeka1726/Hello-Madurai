import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all magazines from Hostinger MySQL
    const magazines = await prisma.magazine.findMany({
      include: {
        collection: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(magazines || [])
  } catch (error) {
    console.error('Error fetching magazines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    )
  }
}
