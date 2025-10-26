import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    console.log('Updating event with ID:', id)
    console.log('Update data:', data)
    
    // Validate required fields
    if (!data.title || !data.description || !data.startDate || !data.location) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, startDate, or location' },
        { status: 400 }
      )
    }
    
    const event = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        title_ta: data.title_ta || undefined,
        description: data.description,
        description_ta: data.description_ta || undefined,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        duration: data.duration || undefined,
        location: data.location,
        location_ta: data.location_ta || undefined,
        category: data.category,
        featured: data.featured || false,
        featuredImage: data.featuredImage || undefined,
        bookingUrl: data.bookingUrl || undefined
      }
    })
    
    console.log('Event updated successfully:', event.id)
    return NextResponse.json(event)
  } catch (error: any) {
    console.error('Error updating event:', error)
    console.error('Error details:', error.message, error.code)
    return NextResponse.json(
      { error: 'Failed to update event', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.event.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
