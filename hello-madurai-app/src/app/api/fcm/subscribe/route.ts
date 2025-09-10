import { NextRequest, NextResponse } from 'next/server'
import { subscribeToTopic } from '@/lib/firebase/fcm'

export async function POST(request: NextRequest) {
  try {
    const { token, topic } = await request.json()

    if (!token || !topic) {
      return NextResponse.json(
        { error: 'Missing token or topic' },
        { status: 400 }
      )
    }

    const success = await subscribeToTopic([token], topic)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to subscribe to topic' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in subscribe API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
