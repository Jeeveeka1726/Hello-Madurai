const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Checking all authors in database...\n')

  const authors = await prisma.author.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (authors.length === 0) {
    console.log('❌ No authors found in database!')
  } else {
    console.log(`✅ Found ${authors.length} author(s):\n`)
    authors.forEach((author, index) => {
      console.log(`${index + 1}. ${author.name} (${author.name_ta || 'No Tamil name'})`)
      console.log(`   ID: ${author.id}`)
      console.log(`   Slug: ${author.slug}`)
      console.log(`   Active: ${author.active}`)
      console.log(`   Featured: ${author.featured}`)
      console.log(`   Image: ${author.imageUrl || 'No image'}`)
      console.log(`   Created: ${author.createdAt}`)
      console.log('')
    })
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
