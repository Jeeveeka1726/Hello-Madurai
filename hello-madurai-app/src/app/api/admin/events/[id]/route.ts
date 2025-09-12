import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json()
    const eventId = parseInt(params.id)
    
    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: data.title,
        title_ta: data.title_ta || '',
        description: data.description,
        description_ta: data.description_ta || '',
        date: new Date(data.date),
        location: data.location,
        location_ta: data.location_ta || '',
        category: data.category,
        featured: data.featured || false,
        featuredImage: data.featuredImage || null
      }
    })
    
    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = parseInt(params.id)
    
    await prisma.event.delete({
      where: { id: eventId }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
  }
}
