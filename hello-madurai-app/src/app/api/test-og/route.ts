import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const offerId = searchParams.get('offerId')
  const epaperId = searchParams.get('epaperId')

  try {
    let result = {}

    if (offerId) {
      const offer = await prisma.offer.findUnique({
        where: { id: offerId }
      })

      if (offer) {
        let imageUrl = offer.imageUrl
        if (!imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'
          imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
        }

        result = {
          type: 'offer',
          id: offer.id,
          title: offer.title,
          description: offer.title_ta || offer.title,
          imageUrl,
          shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/offers/share/${offer.id}`,
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL
        }
      }
    }

    if (epaperId) {
      const magazine = await prisma.magazine.findUnique({
        where: { id: epaperId }
      })

      if (magazine) {
        const imageUrl = magazine.coverImage || magazine.featuredImage || ''
        let absoluteImageUrl = imageUrl
        if (imageUrl && !imageUrl.startsWith('http')) {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:4000'
          absoluteImageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
        }

        result = {
          type: 'epaper',
          id: magazine.id,
          title: magazine.title,
          description: magazine.title_ta || magazine.title,
          imageUrl: absoluteImageUrl,
          shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/epaper/share/${magazine.id}`,
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL
        }
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
