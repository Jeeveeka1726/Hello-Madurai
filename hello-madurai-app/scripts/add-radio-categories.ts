import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎵 Adding new radio categories...')

  // Check existing categories
  const existing = await prisma.radioCategory.findMany()
  console.log('📋 Existing categories:', existing.map(c => c.name))

  // Add "New Songs" category
  const newSongsExists = existing.find(c => c.slug === 'new-songs')
  if (!newSongsExists) {
    await prisma.radioCategory.create({
      data: {
        name: 'New Songs',
        name_ta: 'புதிய பாடல்கள்',
        slug: 'new-songs',
        orderNumber: 5
      }
    })
    console.log('✅ Added: New Songs (புதிய பாடல்கள்)')
  } else {
    console.log('⏭️  Skipped: New Songs already exists')
  }

  // Add "Stories" category
  const storiesExists = existing.find(c => c.slug === 'stories')
  if (!storiesExists) {
    await prisma.radioCategory.create({
      data: {
        name: 'Stories',
        name_ta: 'கதைகள்',
        slug: 'stories',
        orderNumber: 6
      }
    })
    console.log('✅ Added: Stories (கதைகள்)')
  } else {
    console.log('⏭️  Skipped: Stories already exists')
  }

  // Show all categories
  const allCategories = await prisma.radioCategory.findMany({
    orderBy: { orderNumber: 'asc' }
  })
  
  console.log('\n📋 All Radio Categories:')
  allCategories.forEach(cat => {
    console.log(`  ${cat.orderNumber}. ${cat.name} (${cat.name_ta}) - ${cat.slug}`)
  })

  console.log('\n✅ Done!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

