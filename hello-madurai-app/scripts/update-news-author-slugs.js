const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateNewsAuthorSlugs() {
  console.log('🔄 Updating news articles with author slugs...\n');

  try {
    // Get all news articles
    const allNews = await prisma.news.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        authorSlug: true
      }
    });

    console.log(`📰 Found ${allNews.length} news article(s)\n`);

    // Get all authors
    const authors = await prisma.author.findMany({
      select: {
        name: true,
        slug: true
      }
    });

    console.log(`👥 Found ${authors.length} author(s)\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const news of allNews) {
      // Skip if already has authorSlug
      if (news.authorSlug) {
        console.log(`⏭️  Skipping "${news.title}" - already has authorSlug: ${news.authorSlug}`);
        skippedCount++;
        continue;
      }

      // Find matching author by name (case-insensitive)
      const matchingAuthor = authors.find(
        a => a.name.toLowerCase() === news.author.toLowerCase()
      );

      if (matchingAuthor) {
        // Update the news article with the author slug
        await prisma.news.update({
          where: { id: news.id },
          data: { authorSlug: matchingAuthor.slug }
        });

        console.log(`✅ Updated "${news.title.substring(0, 40)}..." - Author: ${news.author} → Slug: ${matchingAuthor.slug}`);
        updatedCount++;
      } else {
        console.log(`⚠️  No matching author found for "${news.title.substring(0, 40)}..." - Author: ${news.author}`);
        skippedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   📰 Total: ${allNews.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateNewsAuthorSlugs();
