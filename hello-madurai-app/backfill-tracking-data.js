// Backfill tracking data for views and likes with historical timestamps
// This creates fake historical data so period tracking shows activity

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfillTrackingData() {
  console.log('🔄 Starting backfill of tracking data...\n');

  try {
    // ── 1. Backfill News Views (BATCH) ─────────────────────────────────────
    console.log('📰 Backfilling News Views...');
    const newsArticles = await prisma.news.findMany({
      select: { id: true, views: true }
    });

    const newsViewRecords = [];
    for (const article of newsArticles) {
      if (article.views > 0) {
        // Create up to 50 views per article, distributed over last 90 days
        const viewsToCreate = Math.min(article.views, 50);

        for (let i = 0; i < viewsToCreate; i++) {
          const daysAgo = Math.floor(Math.random() * 90);
          const timestamp = new Date();
          timestamp.setDate(timestamp.getDate() - daysAgo);

          newsViewRecords.push({
            newsId: article.id,
            createdAt: timestamp
          });
        }
      }
    }

    if (newsViewRecords.length > 0) {
      await prisma.newsView.createMany({
        data: newsViewRecords,
        skipDuplicates: true
      });
    }
    console.log(`✅ Created ${newsViewRecords.length} news view records\n`);

    // ── 2. Backfill News Likes (BATCH) ─────────────────────────────────────
    console.log('❤️  Backfilling News Likes...');
    const newsWithLikes = await prisma.news.findMany({
      where: { likes: { gt: 0 } },
      select: { id: true, likes: true }
    });

    const newsLikeRecords = [];
    for (const article of newsWithLikes) {
      for (let i = 0; i < article.likes; i++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);

        newsLikeRecords.push({
          newsId: article.id,
          createdAt: timestamp
        });
      }
    }

    if (newsLikeRecords.length > 0) {
      await prisma.newsLike.createMany({
        data: newsLikeRecords,
        skipDuplicates: true
      });
    }
    console.log(`✅ Created ${newsLikeRecords.length} news like records\n`);

    // ── 3. Backfill Video Views (BATCH) ────────────────────────────────────
    console.log('🎥 Backfilling Video Views...');
    const videos = await prisma.video.findMany({
      select: { id: true, views: true }
    });

    const videoViewRecords = [];
    for (const video of videos) {
      if (video.views > 0) {
        const viewsToCreate = Math.min(video.views, 50);

        for (let i = 0; i < viewsToCreate; i++) {
          const daysAgo = Math.floor(Math.random() * 90);
          const timestamp = new Date();
          timestamp.setDate(timestamp.getDate() - daysAgo);

          videoViewRecords.push({
            videoId: video.id,
            createdAt: timestamp
          });
        }
      }
    }

    if (videoViewRecords.length > 0) {
      await prisma.videoView.createMany({
        data: videoViewRecords,
        skipDuplicates: true
      });
    }
    console.log(`✅ Created ${videoViewRecords.length} video view records\n`);

    // ── 4. Backfill Video Likes (BATCH) ────────────────────────────────────
    console.log('❤️  Backfilling Video Likes...');
    const videosWithLikes = await prisma.video.findMany({
      where: { likes: { gt: 0 } },
      select: { id: true, likes: true }
    });

    const videoLikeRecords = [];
    for (const video of videosWithLikes) {
      for (let i = 0; i < video.likes; i++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);

        videoLikeRecords.push({
          videoId: video.id,
          createdAt: timestamp
        });
      }
    }

    if (videoLikeRecords.length > 0) {
      await prisma.videoLike.createMany({
        data: videoLikeRecords,
        skipDuplicates: true
      });
    }
    console.log(`✅ Created ${videoLikeRecords.length} video like records\n`);

    // ── Summary ─────────────────────────────────────────────────────────────
    const totalRecords = newsViewRecords.length + newsLikeRecords.length + videoViewRecords.length + videoLikeRecords.length;

    console.log('═════════════════════════════════════════════════════');
    console.log('🎉 Backfill Complete!');
    console.log('═════════════════════════════════════════════════════');
    console.log(`  News Views:  ${newsViewRecords.length}`);
    console.log(`  News Likes:  ${newsLikeRecords.length}`);
    console.log(`  Video Views: ${videoViewRecords.length}`);
    console.log(`  Video Likes: ${videoLikeRecords.length}`);
    console.log(`  Total:       ${totalRecords}`);
    console.log('═════════════════════════════════════════════════════\n');
    console.log('✅ Period tracking will now show activity for last 7/30/90 days!');

  } catch (error) {
    console.error('❌ Error during backfill:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backfillTrackingData();
