import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { cookies } from 'next/headers'

// Generate a unique discount code
function generateDCode(): string {
  const prefix = 'HM'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export async function GET() {
  try {
    // In a real app, you'd get the user ID from authentication
    // For now, we'll use a cookie-based approach
    const cookieStore = cookies()
    const userId = cookieStore.get('discount_user_id')?.value

    if (!userId) {
      return NextResponse.json(
        { error: 'No discount card found' },
        { status: 404 }
      )
    }

    const card = await prisma.discountCard.findUnique({
      where: { userId },
      include: {
        usages: {
          orderBy: { usedAt: 'desc' },
          take: 10
        }
      }
    })

    if (!card) {
      return NextResponse.json(
        { error: 'No discount card found' },
        { status: 404 }
      )
    }

    return NextResponse.json(card)
  } catch (error) {
    console.error('Error fetching discount card:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discount card' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Generate a unique user ID (in a real app, this would come from authentication)
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const dCode = generateDCode()

    const card = await prisma.discountCard.create({
      data: {
        userId,
        userName: name,
        userEmail: email,
        userPhone: phone,
        dCode,
        isActive: true
      },
      include: {
        usages: true
      }
    })

    // Set cookie to remember the user
    const response = NextResponse.json(card, { status: 201 })
    response.cookies.set('discount_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    })

    return response
  } catch (error) {
    console.error('Error creating discount card:', error)
    return NextResponse.json(
      { error: 'Failed to create discount card' },
      { status: 500 }
    )
  }
}

