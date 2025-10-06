import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, phone, name, categories } = body

    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Either email or phone is required' },
        { status: 400 }
      )
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category must be selected' },
        { status: 400 }
      )
    }

    // Check if subscription already exists
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { phone: phone || undefined }
        ]
      }
    })

    let subscription

    if (existingSubscription) {
      // Update existing subscription
      subscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          name: name || existingSubscription.name,
          email: email || existingSubscription.email,
          phone: phone || existingSubscription.phone,
          categories: JSON.stringify(categories),
          active: true
        }
      })
    } else {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          name,
          email,
          phone,
          categories: JSON.stringify(categories),
          active: true
        }
      })
    }

    return NextResponse.json(subscription, { status: 201 })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    let whereClause: any = {}

    if (active === 'true') {
      whereClause.active = true
    }

    const subscriptions = await prisma.subscription.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    // Filter by category if specified
    let filteredSubscriptions = subscriptions
    if (category) {
      filteredSubscriptions = subscriptions.filter(sub => {
        const categories = JSON.parse(sub.categories)
        return categories.includes(category)
      })
    }

    return NextResponse.json(filteredSubscriptions)
  } catch (error) {
    console.error('Error fetching subscriptions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

