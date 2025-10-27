import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/events - Get all events
export async function GET() {
  try {
    console.log('Fetching events...')
    // Fetch all events from Hostinger MySQL
    const events = await prisma.event.findMany({
      orderBy: {
        startDate: 'desc'
      }
    })

    console.log(`Found ${events.length} events`)
    return NextResponse.json(events || [])
  } catch (error: any) {
    console.error('Error fetching events:', error)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Creating event with data:', JSON.stringify(body, null, 2))

    // Validate required fields
    if (!body.title || !body.description || !body.startDate || !body.location || !body.category) {
      console.error('Missing required fields:', {
        title: !!body.title,
        description: !!body.description,
        startDate: !!body.startDate,
        location: !!body.location,
        category: !!body.category
      })
      return NextResponse.json(
        { error: 'Title, description, startDate, location, and category are required' },
        { status: 400 }
      )
    }

    // Prepare data, ensuring no undefined values
    const eventData: any = {
      title: body.title,
      description: body.description,
      location: body.location,
      category: body.category,
      startDate: new Date(body.startDate),
      status: body.status || 'upcoming',
    }
    
    // Add optional fields only if they exist
    if (body.title_ta) eventData.title_ta = body.title_ta
    if (body.description_ta) eventData.description_ta = body.description_ta
    if (body.location_ta) eventData.location_ta = body.location_ta
    if (body.featuredImage) eventData.featuredImage = body.featuredImage
    if (body.endDate) eventData.endDate = new Date(body.endDate)
    if (body.duration) eventData.duration = body.duration
    if (body.website) eventData.website = body.website
    if (body.phone) eventData.phone = body.phone
    
    console.log('Prepared event data:', JSON.stringify(eventData, null, 2))

    // Create event in Hostinger MySQL
    const event = await prisma.event.create({
      data: eventData
    })

    console.log('Event created successfully:', event.id)
    return NextResponse.json(event, { status: 201 })
  } catch (error: any) {
    console.error('Error creating event:', error)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    )
  }
}
