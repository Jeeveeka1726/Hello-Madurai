import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const event = await prisma.event.create({
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
    
    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
