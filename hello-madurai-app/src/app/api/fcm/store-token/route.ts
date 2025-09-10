import { NextRequest, NextResponse } from 'next/server'
import { storeFCMToken } from '@/lib/firebase/fcm'

export async function POST(request: NextRequest) {
  try {
    const { userId, token, locale } = await request.json()

    if (!userId || !token) {
      return NextResponse.json(
        { error: 'Missing userId or token' },
        { status: 400 }
      )
    }

    const success = await storeFCMToken(userId, token, locale || 'en')

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Failed to store token' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in store-token API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
