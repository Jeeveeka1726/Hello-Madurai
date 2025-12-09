import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
}

async function main() {
  console.log('🔄 Generating slugs for existing singers...')

  const singers = await prisma.singer.findMany({
    where: {
      slug: null
    }
  })

  console.log(`Found ${singers.length} singers without slugs`)

  for (const singer of singers) {
    let slug = generateSlug(singer.name)
    let counter = 1

    // Check if slug already exists
    while (await prisma.singer.findUnique({ where: { slug } })) {
      slug = `${generateSlug(singer.name)}-${counter}`
      counter++
    }

    await prisma.singer.update({
      where: { id: singer.id },
      data: { slug }
    })

    console.log(`✅ Generated slug for "${singer.name}": ${slug}`)
  }

  console.log('✨ Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

