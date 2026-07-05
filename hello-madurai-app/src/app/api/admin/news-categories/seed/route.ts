import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/admin/news-categories/seed - Seed initial categories
export async function POST() {
  try {
    const defaultCategories = [
      { name: 'General', name_ta: 'பொதுவானது', slug: 'general', orderNumber: 1 },
      { name: 'Collector', name_ta: 'கலெக்டர்', slug: 'collector', orderNumber: 2 },
      { name: 'Corporation', name_ta: 'மாநகராட்சி', slug: 'corporation', orderNumber: 3 },
      { name: 'Education', name_ta: 'கல்வி', slug: 'education', orderNumber: 4 },
      { name: 'Devotion', name_ta: 'ஆன்மிகம்', slug: 'religious', orderNumber: 5 },
      { name: 'Cinema', name_ta: 'சினிமா', slug: 'cinema', orderNumber: 6 },
      { name: 'Games', name_ta: 'விளையாட்டு', slug: 'games', orderNumber: 7 },
      { name: 'Minister', name_ta: 'அமைச்சர்', slug: 'political', orderNumber: 8 },
      { name: 'Police', name_ta: 'போலீஸ்', slug: 'police', orderNumber: 9 },
      { name: 'Agriculture', name_ta: 'விவசாயம்', slug: 'agri', orderNumber: 10 },
      { name: 'Jobs', name_ta: 'வேலைவாய்ப்பு', slug: 'jobs', orderNumber: 11 },
      { name: 'Article', name_ta: 'கட்டுரை', slug: 'article', orderNumber: 12 },
      { name: 'Others', name_ta: 'மற்றவை', slug: 'others', orderNumber: 13 }
    ]

    // Check if categories already exist
    const existingCount = await prisma.newsCategory.count()
    if (existingCount > 0) {
      return NextResponse.json(
        { message: 'Categories already exist', count: existingCount },
        { status: 200 }
      )
    }

    // Create all categories
    const created = await prisma.newsCategory.createMany({
      data: defaultCategories
    })

    return NextResponse.json({
      message: 'Categories seeded successfully',
      count: created.count
    })
  } catch (error) {
    console.error('Error seeding categories:', error)
    return NextResponse.json(
      { error: 'Failed to seed categories' },
      { status: 500 }
    )
  }
}
