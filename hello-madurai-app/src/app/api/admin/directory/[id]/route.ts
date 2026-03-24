import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()

    console.log('🔧 API PUT - Received data for business:', id)
    console.log('🔧 mainImage:', data.mainImage === '' ? 'EMPTY STRING (will be set to null)' : data.mainImage ? 'exists' : 'undefined')
    console.log('🔧 mainVideoUrl:', data.mainVideoUrl === '' ? 'EMPTY STRING (will be set to null)' : data.mainVideoUrl ? 'exists' : 'undefined')
    console.log('🔧 videoType:', data.videoType || 'not set')

    const business = await prisma.business.update({
      where: { id: id },
      data: {
        name: data.name,
        name_ta: data.name_ta || undefined,
        category: data.category || '',
        categoryId: data.categoryId || null,
        subcategoryId: data.subcategoryId || null,
        address: data.address,
        address_ta: data.address_ta || undefined,
        phone: data.phone,
        email: data.email || undefined,
        website: data.website || undefined,
        // Handle mainImage: empty string should set to null, not undefined
        mainImage: data.mainImage === '' ? null : (data.mainImage || undefined),
        // Handle mainVideoUrl: empty string should set to null, not undefined
        mainVideoUrl: data.mainVideoUrl === '' ? null : (data.mainVideoUrl || undefined),
        // Handle videoType: empty string should set to null, not undefined
        videoType: data.videoType === '' ? null : (data.videoType || undefined),
        youtubeUrl: data.youtubeUrl || undefined,
        instagramUrl: data.instagramUrl || undefined,
        facebookUrl: data.facebookUrl || undefined,
        bookingUrl: data.bookingUrl || undefined,
        // bookingPhone: data.bookingPhone || undefined, // Will be enabled after database migration
        directionsUrl: data.directionsUrl || undefined,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
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

    console.log('✅ API PUT - Business updated successfully')
    console.log('✅ Updated mainImage:', business.mainImage ? 'exists' : 'null')
    console.log('✅ Updated mainVideoUrl:', business.mainVideoUrl ? 'exists' : 'null')

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

    await prisma.business.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
  }
}
