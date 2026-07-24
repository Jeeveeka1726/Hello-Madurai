/**
 * Script to generate slugs for existing News and Business records
 * Run this after adding the slug field to the schema
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Slug generation functions (inline to avoid import issues)
function slugify(text: string, maxLength: number = 100): string {
  if (!text) return ''

  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0B80-\u0BFF\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')

  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength)
    const lastHyphen = slug.lastIndexOf('-')
    if (lastHyphen > 0) {
      slug = slug.substring(0, lastHyphen)
    }
  }

  return slug
}

function generateUniqueSlug(baseSlug: string, uniqueId: string): string {
  const shortId = uniqueId.substring(0, 8)
  return `${baseSlug}-${shortId}`
}

function generateNewsSlug(title: string, titleTa: string | null | undefined, id: string): string {
  const preferredTitle = title || titleTa || 'news'
  const baseSlug = slugify(preferredTitle, 80)
  return generateUniqueSlug(baseSlug, id)
}

function generateBusinessSlug(name: string, nameTa: string | null | undefined, id: string): string {
  const preferredName = name || nameTa || 'business'
  const baseSlug = slugify(preferredName, 80)
  return generateUniqueSlug(baseSlug, id)
}

async function generateSlugsForNews() {
  console.log('🔄 Regenerating ALL slugs for News articles (English names)...')

  // Get ALL news articles to regenerate slugs with English names
  const newsArticles = await prisma.news.findMany({
    select: {
      id: true,
      title: true,
      title_ta: true,
      slug: true,
    }
  })

  console.log(`📰 Found ${newsArticles.length} news articles - regenerating with English names`)

  let updated = 0
  for (const article of newsArticles) {
    try {
      const slug = generateNewsSlug(article.title, article.title_ta, article.id)

      await prisma.news.update({
        where: { id: article.id },
        data: { slug }
      })

      updated++
      if (updated % 50 === 0) {
        console.log(`✅ Updated ${updated}/${newsArticles.length} news articles`)
      }
    } catch (error) {
      console.error(`❌ Error updating news ${article.id}:`, error)
    }
  }

  console.log(`✅ Successfully generated slugs for ${updated} news articles`)
}

async function generateSlugsForBusinesses() {
  console.log('🔄 Regenerating ALL slugs for Businesses (English names)...')

  // Get ALL businesses to regenerate slugs with English names
  const businesses = await prisma.business.findMany({
    select: {
      id: true,
      name: true,
      name_ta: true,
      slug: true,
    }
  })

  console.log(`🏢 Found ${businesses.length} businesses - regenerating with English names`)

  let updated = 0
  for (const business of businesses) {
    try {
      const slug = generateBusinessSlug(business.name, business.name_ta, business.id)

      await prisma.business.update({
        where: { id: business.id },
        data: { slug }
      })

      updated++
      if (updated % 50 === 0) {
        console.log(`✅ Updated ${updated}/${businesses.length} businesses`)
      }
    } catch (error) {
      console.error(`❌ Error updating business ${business.id}:`, error)
    }
  }

  console.log(`✅ Successfully generated slugs for ${updated} businesses`)
}

async function main() {
  try {
    console.log('🚀 Starting slug generation...\n')

    await generateSlugsForNews()
    console.log('')
    await generateSlugsForBusinesses()

    console.log('\n✅ Slug generation completed successfully!')
  } catch (error) {
    console.error('❌ Error during slug generation:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
