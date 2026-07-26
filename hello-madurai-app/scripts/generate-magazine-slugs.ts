import prisma from '../src/lib/prisma'

function generateSlug(title: string, id: string): string {
  // Remove all Tamil characters, special characters, and extra spaces
  let slug = title
    .replace(/[\u0B80-\u0BFF]/g, '') // Remove Tamil characters
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

  // If slug is empty (e.g., title was all Tamil), use a generic name
  if (!slug || slug.length < 3) {
    slug = 'magazine'
  }

  // Append short ID to ensure uniqueness (last 8 characters)
  const shortId = id.slice(-8)
  slug = `${slug}-${shortId}`

  // Limit total length to 200 characters
  if (slug.length > 200) {
    slug = slug.substring(0, 191) + '-' + shortId
  }

  return slug
}

async function generateMagazineSlugs() {
  try {
    console.log('🔍 Fetching all magazines...')
    
    const magazines = await prisma.magazine.findMany({
      select: {
        id: true,
        title: true,
        title_ta: true,
        slug: true,
      },
    })

    console.log(`📊 Found ${magazines.length} magazines`)
    
    let updated = 0
    let skipped = 0

    for (const magazine of magazines) {
      // Prefer English title, fallback to Tamil
      const titleToUse = magazine.title || magazine.title_ta || 'Magazine'
      const newSlug = generateSlug(titleToUse, magazine.id)

      // Only update if slug is missing or different
      if (!magazine.slug || magazine.slug !== newSlug) {
        await prisma.magazine.update({
          where: { id: magazine.id },
          data: { slug: newSlug },
        })
        console.log(`✅ Updated: "${titleToUse}" -> ${newSlug}`)
        updated++
      } else {
        console.log(`⏭️  Skipped: "${titleToUse}" (already has slug: ${magazine.slug})`)
        skipped++
      }
    }

    console.log('\n📈 Summary:')
    console.log(`   ✅ Updated: ${updated}`)
    console.log(`   ⏭️  Skipped: ${skipped}`)
    console.log(`   📊 Total: ${magazines.length}`)
    console.log('\n✨ Magazine slug generation complete!')
  } catch (error) {
    console.error('❌ Error generating magazine slugs:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

generateMagazineSlugs()
