import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const businessId = parseInt(id)
    
    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: data.name,
        name_ta: data.name_ta || undefined,
        description: data.description || undefined,
        description_ta: data.description_ta || undefined,
        category: data.category || '',
        categoryId: data.categoryId || null,
        subcategoryId: data.subcategoryId || null,
        address: data.address,
        address_ta: data.address_ta || undefined,
        phone: data.phone,
        email: data.email || undefined,
        website: data.website || undefined,
        youtubeUrl: data.youtubeUrl || undefined,
        instagramUrl: data.instagramUrl || undefined,
        facebookUrl: data.facebookUrl || undefined,
        bookingUrl: data.bookingUrl || undefined,
        orderNumber: data.orderNumber !== undefined ? data.orderNumber : 0,
        hasProfile: data.hasProfile !== undefined ? data.hasProfile : false,
        profileContent: data.profileContent || undefined,
        profileContent_ta: data.profileContent_ta || undefined,
        profileImage: data.profileImage || undefined,
        profileVideo: data.profileVideo || undefined,
        verified: data.verified !== undefined ? data.verified : false
      },
      include: {
        mainCategory: true,
        subcategory: true
      }
    })

    return NextResponse.json(business)
  } catch (error) {
    console.error('Error updating business:', error)
    return NextResponse.json({ error: 'Failed to update business' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const businessId = parseInt(id)
    
    await prisma.business.delete({
      where: { id: businessId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
  }
}
