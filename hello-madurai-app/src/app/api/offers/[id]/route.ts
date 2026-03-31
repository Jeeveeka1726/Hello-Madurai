import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET single offer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const offer = await prisma.offer.findUnique({
      where: { id }
    })

    if (!offer) {
      return NextResponse.json(
        { error: 'Offer not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(offer)
  } catch (error) {
    console.error('Error fetching offer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch offer' },
      { status: 500 }
    )
  }
}

// PUT update offer (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { title, title_ta, imageUrl, bookNowUrl, bookNowPhone, category, active, orderNumber } = body

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(title_ta !== undefined && { title_ta }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(bookNowUrl !== undefined && { bookNowUrl }),
        ...(bookNowPhone !== undefined && { bookNowPhone }),
        ...(category !== undefined && { category }),
        ...(active !== undefined && { active }),
        ...(orderNumber !== undefined && { orderNumber })
      }
    })

    return NextResponse.json(offer)
  } catch (error) {
    console.error('Error updating offer:', error)
    return NextResponse.json(
      { error: 'Failed to update offer' },
      { status: 500 }
    )
  }
}

// DELETE offer (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.offer.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Offer deleted successfully' })
  } catch (error) {
    console.error('Error deleting offer:', error)
    return NextResponse.json(
      { error: 'Failed to delete offer' },
      { status: 500 }
    )
  }
}

