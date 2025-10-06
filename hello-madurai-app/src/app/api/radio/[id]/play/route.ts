import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const radioShowId = params.id

    // Update play count
    const radioShow = await prisma.radioShow.update({
      where: { id: radioShowId },
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

