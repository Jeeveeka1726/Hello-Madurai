const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLikes() {
  const [newsLikes, videoLikes, magazineLikes, reelLikes, songLikes, videoComments, radioComments, businessComments] = await Promise.all([
    prisma.news.aggregate({ _sum: { likes: true } }),
    prisma.video.aggregate({ _sum: { likes: true } }),
    prisma.magazine.aggregate({ _sum: { likes: true } }),
    prisma.reel.aggregate({ _sum: { likes: true } }),
    prisma.songLike.count(),
    prisma.videoComment.count(),
    prisma.radioComment.count(),
    prisma.businessComment.count(),
  ]);
  
  console.log('=== LIKES ===');
  console.log('News likes:', newsLikes._sum.likes || 0);
  console.log('Video likes:', videoLikes._sum.likes || 0);
  console.log('Magazine likes:', magazineLikes._sum.likes || 0);
  console.log('Reel likes:', reelLikes._sum.likes || 0);
  console.log('Song likes:', songLikes);
  console.log('---');
  console.log('TOTAL LIKES:', (newsLikes._sum.likes || 0) + (videoLikes._sum.likes || 0) + (magazineLikes._sum.likes || 0) + (reelLikes._sum.likes || 0) + songLikes);
  
  console.log('\n=== COMMENTS ===');
  console.log('Video comments:', videoComments);
  console.log('Radio comments:', radioComments);
  console.log('Business comments:', businessComments);
  
  await prisma.$disconnect();
}

checkLikes();
