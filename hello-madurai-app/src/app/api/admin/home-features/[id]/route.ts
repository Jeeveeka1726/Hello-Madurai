import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/home-features/[id] - Get single feature
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const feature = await prisma.homeFeature.findUnique({
      where: { id }
    })

    if (!feature) {
      return NextResponse.json({ error: 'Feature not found' }, { status: 404 })
    }

    return NextResponse.json(feature)
  } catch (error) {
    console.error('Error fetching feature:', error)
    return NextResponse.json({ error: 'Failed to fetch feature' }, { status: 500 })
  }
}

// PUT /api/admin/home-features/[id] - Update feature
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const feature = await prisma.homeFeature.update({
      where: { id },
      data: {
        nameEn: body.nameEn,
        nameTa: body.nameTa || null,
        descEn: body.descEn,
        descTa: body.descTa || null,
        href: body.href,
        iconColor: body.iconColor,
        backgroundImage: body.backgroundImage || null,
        orderNumber: body.orderNumber,
        active: body.active
      }
    })

    return NextResponse.json(feature)
  } catch (error) {
    console.error('Error updating feature:', error)
    return NextResponse.json({ error: 'Failed to update feature' }, { status: 500 })
  }
}

// DELETE /api/admin/home-features/[id] - Delete feature
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.homeFeature.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feature:', error)
    return NextResponse.json({ error: 'Failed to delete feature' }, { status: 500 })
  }
}
