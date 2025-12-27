import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎵 Restoring radio data...')

  // Create radio categories
  const categories = [
    { id: 'tamil-hits', name: 'Tamil Hits', name_ta: 'தமிழ் ஹிட்ஸ்', slug: 'tamil-hits', orderNumber: 1 },
    { id: 'classical', name: 'Classical', name_ta: 'கிளாசிக்கல்', slug: 'classical', orderNumber: 2 },
    { id: 'devotional', name: 'Devotional', name_ta: 'பக்தி பாடல்கள்', slug: 'devotional', orderNumber: 3 }
  ]

  for (const category of categories) {
    await prisma.radioCategory.upsert({
      where: { id: category.id },
      update: {},
      create: category
    })
    console.log(`✅ Created category: ${category.name}`)
  }

  // Create singers
  const singers = [
    {
      id: 'ar-rahman',
      name: 'A.R. Rahman',
      name_ta: 'ஏ.ஆர். ரஹ்மான்',
      slug: 'ar-rahman',
      categoryId: 'tamil-hits'
    },
    {
      id: 'ilaiyaraaja',
      name: 'Ilaiyaraaja',
      name_ta: 'இளையராஜா',
      slug: 'ilaiyaraaja',
      categoryId: 'classical'
    },
    {
      id: 'spb',
      name: 'S.P. Balasubrahmanyam',
      name_ta: 'எஸ்.பி. பாலசுப்ரமணியம்',
      slug: 'spb',
      categoryId: 'tamil-hits'
    }
  ]

  for (const singer of singers) {
    await prisma.singer.upsert({
      where: { id: singer.id },
      update: {},
      create: singer
    })
    console.log(`✅ Created singer: ${singer.name}`)
  }

  // Create sample radio songs
  const songs = [
    {
      id: 'vande-mataram',
      title: 'Vande Mataram',
      title_ta: 'வந்தே மாதரம்',
      audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      audioType: 'direct',
      duration: '4:30',
      singerId: 'ar-rahman'
    },
    {
      id: 'ilayaraja-fm',
      title: 'Ilayaraja FM Radio',
      title_ta: 'இளையராஜா எஃப்எம் ரேடியோ',
      audioUrl: 'https://www.tamilradios.com/ilayaraja-fm',
      audioType: 'embed',
      duration: 'Live',
      singerId: 'ilaiyaraaja'
    },
    {
      id: 'tamil-fm',
      title: 'Tamil FM Live',
      title_ta: 'தமிழ் எஃப்எம் லைவ்',
      audioUrl: 'https://www.tamilradios.com/tamil-fm',
      audioType: 'embed',
      duration: 'Live',
      singerId: 'spb'
    }
  ]

  for (const song of songs) {
    await prisma.radioSong.upsert({
      where: { id: song.id },
      update: {},
      create: song
    })
    console.log(`✅ Created song: ${song.title}`)
  }

  console.log('🎉 Radio data restored successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
