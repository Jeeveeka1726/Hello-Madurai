import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT update radio category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const category = await prisma.radioCategory.update({
      where: { id },
      data: {
        name: body.name,
        name_ta: body.name_ta,
        slug: body.slug,
        orderNumber: body.orderNumber || 0
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating radio category:', error)
    return NextResponse.json(
      { error: 'Failed to update radio category' },
      { status: 500 }
    )
  }
}

// DELETE radio category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.radioCategory.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting radio category:', error)
    return NextResponse.json(
      { error: 'Failed to delete radio category' },
      { status: 500 }
    )
  }
}

