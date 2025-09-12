import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(businesses)
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const business = await prisma.business.create({
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
    
    return NextResponse.json(business, { status: 201 })
  } catch (error) {
    console.error('Error creating business:', error)
    return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })
  }
}
