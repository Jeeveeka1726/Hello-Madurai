import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all magazines from Hostinger MySQL with their collections
    const magazines = await prisma.magazine.findMany({
      include: {
        collection: {
          select: {
            id: true,
            name: true,
            name_ta: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📄 API: Fetched magazines with collections:', magazines.map(m => ({
      id: m.id,
      title: m.title,
      pdfUrl: m.pdfUrl,
      coverImage: m.coverImage,
      featuredImage: m.featuredImage,
      collection: m.collection
    })))

    console.log('📊 API: Total magazines found:', magazines.length)

    return NextResponse.json(magazines || [])
  } catch (error) {
    console.error('Error fetching magazines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    )
  }
}
