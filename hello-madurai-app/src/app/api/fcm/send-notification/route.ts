import { NextRequest, NextResponse } from 'next/server'
import { sendNotificationToTopic, sendNotificationToToken, sendContentNotification } from '@/lib/firebase/fcm'
import { requireAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    await requireAdmin()

    const { 
      type, 
      target, 
      title, 
      body, 
      title_ta, 
      body_ta, 
      image, 
      link,
      contentType 
    } = await request.json()

    if (!title || !body) {
      return NextResponse.json(
        { error: 'Missing title or body' },
        { status: 400 }
      )
    }

    let success = false

    switch (type) {
      case 'token':
        if (!target) {
          return NextResponse.json(
            { error: 'Missing token' },
            { status: 400 }
          )
        }
        success = await sendNotificationToToken(target, {
          title,
          body,
          title_ta,
          body_ta,
          image,
          click_action: link,
        })
        break

      case 'topic':
        if (!target) {
          return NextResponse.json(
            { error: 'Missing topic' },
            { status: 400 }
          )
        }
        success = await sendNotificationToTopic(target, {
          title,
          body,
          title_ta,
          body_ta,
          image,
          click_action: link,
        })
        break

      case 'content':
        if (!contentType) {
          return NextResponse.json(
            { error: 'Missing contentType' },
            { status: 400 }
          )
        }
        success = await sendContentNotification(
          contentType,
          title,
          body,
          title_ta,
          body_ta,
          link
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        )
    }

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in send-notification API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
