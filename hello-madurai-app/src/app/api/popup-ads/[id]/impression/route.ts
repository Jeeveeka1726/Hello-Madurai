import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.popupAd.update({
      where: { id },
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
