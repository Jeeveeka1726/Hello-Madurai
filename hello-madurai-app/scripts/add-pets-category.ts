import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🐾 Adding Pets category to Digital FM...')

  // Check if Pets category already exists
  const existingPets = await prisma.radioCategory.findFirst({
    where: { slug: 'pets' }
  })

  if (existingPets) {
    console.log('⏭️  Pets category already exists:', existingPets.name)
    return
  }

  // Get the highest order number to add Pets at the end
  const lastCategory = await prisma.radioCategory.findFirst({
    orderBy: { orderNumber: 'desc' }
  })

  const nextOrderNumber = (lastCategory?.orderNumber || 0) + 1

  // Add Pets category
  const petsCategory = await prisma.radioCategory.create({
    data: {
      name: 'Pets',
      name_ta: 'செல்லப்பிராணிகள்',
      slug: 'pets',
      orderNumber: nextOrderNumber
    }
  })

  console.log('✅ Added Pets category:', petsCategory.name, '(', petsCategory.name_ta, ')')

  // Show all categories in order
  const allCategories = await prisma.radioCategory.findMany({
    orderBy: { orderNumber: 'asc' }
  })
  
  console.log('\n📋 All Digital FM Categories:')
  allCategories.forEach(cat => {
    console.log(`  ${cat.orderNumber}. ${cat.name} (${cat.name_ta}) - ${cat.slug}`)
  })

  console.log('\n✅ Done! Pets category added successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
