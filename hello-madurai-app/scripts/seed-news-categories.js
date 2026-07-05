const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding news categories...')

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
    console.log(`Categories already exist (${existingCount} found). Skipping seed.`)
    return
  }

  // Create all categories
  for (const category of defaultCategories) {
    await prisma.newsCategory.create({
      data: {
        ...category,
        active: true
      }
    })
    console.log(`✓ Created: ${category.name} (${category.name_ta})`)
  }

  console.log(`\n✅ Successfully seeded ${defaultCategories.length} news categories!`)
}

main()
  .catch((e) => {
    console.error('Error seeding categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
