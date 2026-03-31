import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// PUT update helpline
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const helpline = await prisma.helpline.update({
      where: { id },
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        phone: body.phone,
        categoryId: body.categoryId,
        address: body.address || null,
        address_ta: body.address_ta || null,
        description: body.description || null,
        description_ta: body.description_ta || null,
        featured: body.featured
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(helpline)
  } catch (error) {
    console.error('Error updating helpline:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE helpline
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.helpline.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting helpline:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

