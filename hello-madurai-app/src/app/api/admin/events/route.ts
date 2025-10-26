import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/admin/events - Get all events
export async function GET() {
  try {
    // Fetch all events from Hostinger MySQL
    const events = await prisma.event.findMany({
      orderBy: {
        startDate: 'desc'
      }
    })

    return NextResponse.json(events || [])
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

// POST /api/admin/events - Create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.description || !body.startDate || !body.location || !body.category) {
      return NextResponse.json(
        { error: 'Title, description, startDate, location, and category are required' },
        { status: 400 }
      )
    }

    // Create event in Hostinger MySQL
    const event = await prisma.event.create({
      data: {
        title: body.title,
        title_ta: body.title_ta,
        description: body.description,
        description_ta: body.description_ta,
        location: body.location,
        location_ta: body.location_ta,
        featuredImage: body.featuredImage,
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        duration: body.duration,
        category: body.category,
        status: body.status || 'upcoming',
        featured: body.featured || false,
        bookingUrl: body.bookingUrl
      }
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
