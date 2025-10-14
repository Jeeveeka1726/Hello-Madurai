import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message, category, targetUrl } = body

    if (!title || !message || !category) {
      return NextResponse.json(
        { error: 'Title, message, and category are required' },
        { status: 400 }
      )
    }

    // Create notification record in Hostinger MySQL
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        category,
        targetUrl,
        sent: false
      }
    })

    // Get subscribers for this category
    const subscriptions = await prisma.subscription.findMany({
      where: { active: true }
    })

    const relevantSubscribers = subscriptions.filter(sub => {
      try {
        const categories = JSON.parse(sub.categories)
        return categories.includes(category)
      } catch {
        return false
      }
    })

    // Mark as sent
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        sent: true,
        sentAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      notification,
      subscribersCount: relevantSubscribers.length,
      message: `Notification sent to ${relevantSubscribers.length} subscribers`
    })

  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
