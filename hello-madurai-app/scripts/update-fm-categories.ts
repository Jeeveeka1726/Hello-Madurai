import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎵 Updating FM categories with new list...')

  // New categories as requested by user
  const newCategories = [
    { name: 'Songs', name_ta: 'பாடல்கள்', slug: 'songs', orderNumber: 1 },
    { name: 'RJ', name_ta: 'ஆர் ஜே', slug: 'rj', orderNumber: 2 },
    { name: 'Old Song', name_ta: 'பழைய பாடல்', slug: 'old-song', orderNumber: 3 },
    { name: 'Devotional', name_ta: 'பக்தி பாடல்', slug: 'devotional', orderNumber: 4 },
    { name: 'News & Music', name_ta: 'செய்தி & இசை', slug: 'news-music', orderNumber: 5 },
    { name: 'Agri', name_ta: 'விவசாயம்', slug: 'agri', orderNumber: 6 },
    { name: 'Business', name_ta: 'தொழில்', slug: 'business', orderNumber: 7 },
    { name: 'Medical', name_ta: 'மருத்துவம்', slug: 'medical', orderNumber: 8 },
    { name: 'Education', name_ta: 'கல்வி', slug: 'education', orderNumber: 9 },
    { name: 'Women', name_ta: 'மகளிர்', slug: 'women', orderNumber: 10 },
    { name: 'Motors', name_ta: 'வாகனங்கள்', slug: 'motors', orderNumber: 11 },
    { name: 'Job', name_ta: 'வேலை', slug: 'job', orderNumber: 12 },
    { name: 'Law', name_ta: 'சட்டம்', slug: 'law', orderNumber: 13 }
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
  
  console.log('\n📋 All FM Categories:')
  allCategories.forEach(cat => {
    console.log(`  ${cat.orderNumber}. ${cat.name} (${cat.name_ta}) - ${cat.slug}`)
  })

  console.log('\n✅ Done! FM categories updated successfully!')
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
