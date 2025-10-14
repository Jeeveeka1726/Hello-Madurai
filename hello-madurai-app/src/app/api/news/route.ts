import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch all news articles from Hostinger MySQL
    const news = await prisma.news.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(news || [])
  } catch (error) {
    console.error('Error in news API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

