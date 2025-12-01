import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT update singer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const singer = await prisma.singer.update({
      where: { id },
      data: {
        name: body.name,
        name_ta: body.name_ta || null,
        imageUrl: body.imageUrl || null,
        featured: body.featured !== undefined ? body.featured : false,
        categoryId: body.categoryId
      },
      include: {
        category: true
      }
    })

    return NextResponse.json(singer)
  } catch (error) {
    console.error('Error updating singer:', error)
    return NextResponse.json(
      { error: 'Failed to update singer' },
      { status: 500 }
    )
  }
}

// DELETE singer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.singer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting singer:', error)
    return NextResponse.json(
      { error: 'Failed to delete singer' },
      { status: 500 }
    )
  }
}

