import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch all magazines from Hostinger MySQL with their PDFs
    const magazines = await prisma.magazine.findMany({
      include: {
        collection: true,
        pdfs: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Get the most recent PDF for each magazine
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform the data to include PDF URL directly in magazine object
    const magazinesWithPdf = magazines.map(magazine => ({
      ...magazine,
      pdfUrl: magazine.pdfs[0]?.url || null,
      pdfs: undefined // Remove the pdfs array from response
    }))

    return NextResponse.json(magazinesWithPdf || [])
  } catch (error) {
    console.error('Error fetching magazines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    )
  }
}
