import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dCode, businessName, businessPhone, shopkeeperName, amount } = body

    if (!dCode || !businessName) {
      return NextResponse.json(
        { error: 'DCode and business name are required' },
        { status: 400 }
      )
    }

    // Find the discount card
    const card = await prisma.discountCard.findUnique({
      where: { dCode },
      include: {
        usages: {
          orderBy: { usedAt: 'desc' }
        }
      }
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 404 }
      )
    }

    if (!card.isActive) {
      return NextResponse.json(
        { error: 'Discount card is inactive' },
        { status: 400 }
      )
    }

    // Record the usage
    const usage = await prisma.discountUsage.create({
      data: {
        cardId: card.id,
        businessName,
        businessPhone: businessPhone || undefined,
        shopkeeperName: shopkeeperName || undefined,
        amount: amount ? parseFloat(amount) : undefined
      }
    })

    // Return card info and usage count for shopkeeper
    const totalUsages = card.usages.length + 1

    return NextResponse.json({
      valid: true,
      cardHolder: card.userName,
      totalUsages,
      usageId: usage.id,
      message: 'Discount code validated successfully'
    })
  } catch (error) {
    console.error('Error validating discount code:', error)
    return NextResponse.json(
      { error: 'Failed to validate discount code' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dCode = searchParams.get('dCode')

    if (!dCode) {
      return NextResponse.json(
        { error: 'DCode is required' },
        { status: 400 }
      )
    }

    // Find the discount card (for verification only, no usage recorded)
    const card = await prisma.discountCard.findUnique({
      where: { dCode },
      include: {
        usages: true
      }
    })

    if (!card) {
      return NextResponse.json(
        { error: 'Invalid discount code' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: card.isActive,
      cardHolder: card.userName,
      totalUsages: card.usages.length,
      isActive: card.isActive
    })
  } catch (error) {
    console.error('Error checking discount code:', error)
    return NextResponse.json(
      { error: 'Failed to check discount code' },
      { status: 500 }
    )
  }
}
