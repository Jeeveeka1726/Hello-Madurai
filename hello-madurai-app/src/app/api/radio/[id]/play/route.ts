import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Update play count
    const radioShow = await prisma.radioShow.update({
      where: { id },
      data: {
        plays: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ plays: radioShow.plays })
  } catch (error) {
    console.error('Error updating radio play count:', error)
    return NextResponse.json(
      { error: 'Failed to update play count' },
      { status: 500 }
    )
  }
}
