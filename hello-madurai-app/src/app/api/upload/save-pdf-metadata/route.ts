import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, publicId, filename, mimeType, size, magazineId, collectionId } = body

    if (!url || !publicId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Save PDF metadata to database
    const pdfRecord = await prisma.magazinePdf.create({
      data: {
        filename: filename || 'magazine.pdf',
        url,
        publicId,
        mimeType: mimeType || 'application/pdf',
        size: size || 0,
        magazineId: magazineId || null,
        collectionId: collectionId || null,
      },
    })

    console.log('✅ PDF Database record created:', pdfRecord.id)

    return NextResponse.json({
      id: pdfRecord.id,
      url: pdfRecord.url,
      filename: pdfRecord.filename,
    })
  } catch (error) {
    console.error('❌ Error saving PDF metadata:', error)
    return NextResponse.json(
      { error: 'Failed to save PDF metadata' },
      { status: 500 }
    )
  }
}
