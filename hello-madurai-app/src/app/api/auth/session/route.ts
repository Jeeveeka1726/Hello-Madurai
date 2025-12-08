import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/auth/session
 * Get or create an anonymous user session
 * Returns session token to be stored in cookie
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user already has a session token in cookie
    const sessionToken = request.cookies.get('session_token')?.value

    if (sessionToken) {
      // Try to find existing user
      const user = await prisma.anonymousUser.findUnique({
        where: { sessionToken }
      })

      if (user) {
        // Update last seen
        await prisma.anonymousUser.update({
          where: { id: user.id },
          data: { lastSeenAt: new Date() }
        })

        return NextResponse.json({
          userId: user.id,
          sessionToken: user.sessionToken,
          isNew: false
        })
      }
    }

    // Create new anonymous user
    const newSessionToken = randomBytes(32).toString('hex')
    const newUser = await prisma.anonymousUser.create({
      data: {
        sessionToken: newSessionToken
      }
    })

    // Set cookie
    const response = NextResponse.json({
      userId: newUser.id,
      sessionToken: newUser.sessionToken,
      isNew: true
    })

    response.cookies.set('session_token', newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    })

    return response
  } catch (error) {
    console.error('Error managing session:', error)
    return NextResponse.json(
      { error: 'Failed to manage session' },
      { status: 500 }
    )
  }
}

