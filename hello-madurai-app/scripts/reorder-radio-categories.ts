import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Reordering radio categories...')

  // New order as requested by user:
  // 1. Songs
  // 2. New Songs
  // 3. God Songs
  // 4. Speech
  // 5. Comedy
  // 6. Stories

  const updates = [
    { slug: 'songs', orderNumber: 1 },
    { slug: 'new-songs', orderNumber: 2 },
    { slug: 'god-songs', orderNumber: 3 },
    { slug: 'speech', orderNumber: 4 },
    { slug: 'comedy', orderNumber: 5 },
    { slug: 'stories', orderNumber: 6 }
  ]

  for (const update of updates) {
    await prisma.radioCategory.update({
      where: { slug: update.slug },
      data: { orderNumber: update.orderNumber }
    })
    console.log(`✅ Updated ${update.slug} → orderNumber: ${update.orderNumber}`)
  }

  // Show final order
  const allCategories = await prisma.radioCategory.findMany({
    orderBy: { orderNumber: 'asc' }
  })
  
  console.log('\n📋 Final Radio Categories Order:')
  allCategories.forEach(cat => {
    console.log(`  ${cat.orderNumber}. ${cat.name} (${cat.name_ta})`)
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

