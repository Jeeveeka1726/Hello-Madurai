import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const businessId = parseInt(params.id)
    
    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        name: data.name,
        name_ta: data.name_ta || '',
        description: data.description || '',
        description_ta: data.description_ta || '',
        category: data.category,
        address: data.address,
        address_ta: data.address_ta || '',
        phone: data.phone,
        email: data.email || null,
        website: data.website || null,
        featured: data.featured || false,
        image: data.image || null
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
  { params }: { params: { id: string } }
) {
  try {
    const businessId = parseInt(params.id)
    
    await prisma.business.delete({
      where: { id: businessId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting business:', error)
    return NextResponse.json({ error: 'Failed to delete business' }, { status: 500 })
  }
}
