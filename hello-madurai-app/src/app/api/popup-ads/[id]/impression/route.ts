import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const adId = params.id

    await prisma.popupAd.update({
      where: { id: adId },
      data: {
        impressions: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording popup impression:', error)
    return NextResponse.json(
      { error: 'Failed to record impression' },
      { status: 500 }
    )
  }
}

