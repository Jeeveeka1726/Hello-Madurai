import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch helplines from Hostinger MySQL
    const helplines = await prisma.helpline.findMany({
      include: {
        category: true
      },
      orderBy: [
        { featured: 'desc' },
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
    const { name, name_ta, phone, categoryId, address, address_ta, description, description_ta, featured } = body

    if (!name || !phone || !categoryId) {
      return NextResponse.json(
        { error: 'Name, phone, and category are required' },
        { status: 400 }
      )
    }

    // Create helpline in Hostinger MySQL
    const helpline = await prisma.helpline.create({
      data: {
        name,
        name_ta: name_ta || null,
        phone,
        categoryId,
        address: address || null,
        address_ta: address_ta || null,
        description: description || null,
        description_ta: description_ta || null,
        featured: featured || false
      },
      include: {
        category: true
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
