import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Updating radio categories...')

  // New categories as requested
  const newCategories = [
    { name: 'Talk', name_ta: 'பேசுவோம்', slug: 'talk', orderNumber: 1 },
    { name: 'Agri', name_ta: 'விவசாயம்', slug: 'agri', orderNumber: 2 },
    { name: 'Spirituality', name_ta: 'ஆன்மீகம்', slug: 'spirituality', orderNumber: 3 },
    { name: 'Business', name_ta: 'தொழில்', slug: 'business', orderNumber: 4 },
    { name: 'Medical', name_ta: 'மருத்துவம்', slug: 'medical', orderNumber: 5 },
    { name: 'Education', name_ta: 'கல்வி', slug: 'education', orderNumber: 6 },
    { name: 'Women', name_ta: 'மகளிர்', slug: 'women', orderNumber: 7 },
    { name: 'Motors', name_ta: 'வாகனங்கள்', slug: 'motors', orderNumber: 8 },
    { name: 'Job', name_ta: 'வேலை', slug: 'job', orderNumber: 9 },
    { name: 'Law', name_ta: 'சட்டம்', slug: 'law', orderNumber: 10 }
  ]

  // Get all existing categories
  const existingCategories = await prisma.radioCategory.findMany()
  console.log(`📋 Found ${existingCategories.length} existing categories`)

  // Delete all existing categories (this will also delete associated singers and songs due to CASCADE)
  console.log('🗑️  Deleting all existing categories...')
  await prisma.radioCategory.deleteMany({})
  console.log('✅ Deleted all existing categories')

  // Create new categories
  console.log('➕ Creating new categories...')
  for (const category of newCategories) {
    await prisma.radioCategory.create({
      data: category
    })
    console.log(`✅ Created: ${category.name} (${category.name_ta})`)
  }

  // Show all categories
  const allCategories = await prisma.radioCategory.findMany({
    orderBy: { orderNumber: 'asc' }
  })
  
  console.log('\n📋 All Radio Categories:')
  allCategories.forEach(cat => {
    console.log(`  ${cat.orderNumber}. ${cat.name} (${cat.name_ta}) - ${cat.slug}`)
  })

  console.log('\n✅ Done! Radio categories updated successfully!')
  console.log('⚠️  Note: All existing singers and songs have been removed.')
  console.log('   You can now add new content through the admin panel.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

