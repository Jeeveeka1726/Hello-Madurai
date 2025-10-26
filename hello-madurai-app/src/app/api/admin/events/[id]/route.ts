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
    console.log('Update data received:', JSON.stringify(data, null, 2))
    
    // Validate required fields
    if (!data.title || !data.description || !data.startDate || !data.location) {
      console.error('Missing required fields:', {
        title: !!data.title,
        description: !!data.description,
        startDate: !!data.startDate,
        location: !!data.location
      })
      return NextResponse.json(
        { error: 'Missing required fields: title, description, startDate, or location' },
        { status: 400 }
      )
    }
    
    // Validate startDate can be converted to Date
    const startDate = new Date(data.startDate)
    if (isNaN(startDate.getTime())) {
      console.error('Invalid startDate:', data.startDate)
      return NextResponse.json(
        { error: 'Invalid startDate format' },
        { status: 400 }
      )
    }
    
    // Prepare update data, filtering out empty strings
    const updateData: any = {
      title: data.title,
      description: data.description,
      location: data.location,
      category: data.category,
      featured: data.featured || false,
      startDate: startDate, // Use the validated startDate
    }
    
    // Only add optional fields if they have values
    if (data.title_ta) updateData.title_ta = data.title_ta
    if (data.description_ta) updateData.description_ta = data.description_ta
    if (data.location_ta) updateData.location_ta = data.location_ta
    if (data.duration) updateData.duration = data.duration
    if (data.featuredImage) updateData.featuredImage = data.featuredImage
    if (data.bookingUrl) updateData.bookingUrl = data.bookingUrl
    
    // Handle endDate specially - could be empty string, null, or a valid date
    if (data.endDate && data.endDate !== '') {
      const endDate = new Date(data.endDate)
      if (isNaN(endDate.getTime())) {
        console.error('Invalid endDate:', data.endDate)
        return NextResponse.json(
          { error: 'Invalid endDate format' },
          { status: 400 }
        )
      }
      updateData.endDate = endDate
    } else {
      updateData.endDate = null
    }
    
    console.log('Prepared update data:', JSON.stringify(updateData, null, 2))
    
    const event = await prisma.event.update({
      where: { id },
      data: updateData
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
