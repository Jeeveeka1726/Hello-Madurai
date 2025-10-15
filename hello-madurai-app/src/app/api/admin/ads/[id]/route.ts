import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { id } = params

    const ad = await prisma.ad.update({
      where: { id },
      data: {
        title: body.title,
        title_ta: body.title_ta,
        imageUrl: body.imageUrl,
        htmlCode: body.htmlCode,
        link: body.link,
        active: body.active,
        position: body.position,
        category: body.category,
      }
    })

    return NextResponse.json(ad)
  } catch (error) {
    console.error('Error updating ad:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    await prisma.ad.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ad:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
