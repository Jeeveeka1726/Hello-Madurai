import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    // Create notification record
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
      where: {
        active: true
      }
    })

    const relevantSubscribers = subscriptions.filter(sub => {
      const categories = JSON.parse(sub.categories)
      return categories.includes(category)
    })

    // In a real implementation, you would send push notifications here
    // For now, we'll just mark as sent and return subscriber count
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        sent: true,
        sentAt: new Date()
      }
    })

    return NextResponse.json({
      notification,
      subscriberCount: relevantSubscribers.length,
      message: `Notification sent to ${relevantSubscribers.length} subscribers`
    }, { status: 201 })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    return NextResponse.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

