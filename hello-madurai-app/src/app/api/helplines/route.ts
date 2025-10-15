import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch helplines from Hostinger MySQL
    const helplines = await prisma.helpline.findMany({
      orderBy: [
        { featured: 'desc' },
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(helplines || [])
  } catch (error) {
    console.error('Error fetching helplines:', error)
    return NextResponse.json(
      { error: 'Failed to fetch helplines' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, name_ta, phone, category, description, description_ta, featured } = body

    // Create helpline in Hostinger MySQL
    const helpline = await prisma.helpline.create({
      data: {
        name,
        name_ta,
        phone,
        category,
        description,
        description_ta,
        featured: featured || false
      }
    })

    return NextResponse.json(helpline, { status: 201 })
  } catch (error) {
    console.error('Error creating helpline:', error)
    return NextResponse.json(
      { error: 'Failed to create helpline' },
      { status: 500 }
    )
  }
}
