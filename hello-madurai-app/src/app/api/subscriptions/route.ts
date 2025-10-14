import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Check if subscription already exists in Hostinger MySQL
    const existingSubscription = email 
      ? await prisma.subscription.findUnique({ where: { email } })
      : phone 
      ? await prisma.subscription.findUnique({ where: { phone } })
      : null

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

    return NextResponse.json({ 
      success: true, 
      subscription,
      message: existingSubscription ? 'Subscription updated' : 'Subscription created'
    })

  } catch (error) {
    console.error('Error managing subscription:', error)
    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    )
  }
}
