import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Serve images from Hostinger database
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    // Retrieve image from Hostinger MySQL database
    const image = await prisma.image.findUnique({
      where: { id: filename }
    })
    
    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }
    
    // Return the actual image data
    return new NextResponse(image.data, {
      headers: {
        'Content-Type': image.mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': image.size.toString(),
      },
    })
    
  } catch (error) {
    console.error('Image serving error:', error)
    return NextResponse.json({ error: 'Failed to retrieve image' }, { status: 500 })
  }
}
