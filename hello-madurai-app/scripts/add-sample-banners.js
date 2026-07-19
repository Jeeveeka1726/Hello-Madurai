const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Adding sample notice banners...')

  // Sample banners data
  const banners = [
    {
      titleEn: 'Welcome to Hello Madurai',
      titleTa: 'ஹலோ மதுரைக்கு வரவேற்கிறோம்',
      descriptionEn: 'Your trusted source for local news, events, and community information',
      descriptionTa: 'உள்ளூர் செய்திகள், நிகழ்வுகள் மற்றும் சமூக தகவல்களுக்கான உங்கள் நம்பகமான ஆதாரம்',
      active: true,
      orderNumber: 0
    },
    {
      titleEn: 'Breaking News Updates',
      titleTa: 'முக்கிய செய்தி புதுப்பிப்புகள்',
      descriptionEn: 'Stay connected with the latest news from Madurai and Tamil Nadu',
      descriptionTa: 'மதுரை மற்றும் தமிழ்நாட்டின் சமீபத்திய செய்திகளுடன் இணைந்திருங்கள்',
      active: true,
      orderNumber: 1
    },
    {
      titleEn: 'Digital FM Radio 24/7',
      titleTa: 'டிஜிட்டல் எஃப்.எம் வானொலி 24/7',
      descriptionEn: 'Listen to Tamil music, podcasts, and shows anytime, anywhere',
      descriptionTa: 'தமிழ் இசை, பாட்காஸ்ட்கள் மற்றும் நிகழ்ச்சிகளை எப்போது வேண்டுமானாலும் கேளுங்கள்',
      active: true,
      orderNumber: 2
    },
    {
      titleEn: 'Upcoming Events in Madurai',
      titleTa: 'மதுரையில் வரவிருக்கும் நிகழ்வுகள்',
      descriptionEn: 'Discover festivals, concerts, and cultural events happening in your city',
      descriptionTa: 'உங்கள் நகரத்தில் நடக்கும் திருவிழாக்கள், கச்சேரிகள் மற்றும் கலாச்சார நிகழ்வுகளைக் கண்டறியுங்கள்',
      active: true,
      orderNumber: 3
    },
    {
      titleEn: 'Local Business Directory',
      titleTa: 'உள்ளூர் வணிக அடைவு',
      descriptionEn: 'Find trusted local businesses, services, and contact information',
      descriptionTa: 'நம்பகமான உள்ளூர் வணிகங்கள், சேவைகள் மற்றும் தொடர்பு தகவல்களைக் கண்டறியுங்கள்',
      active: true,
      orderNumber: 4
    }
  ]

  // Check if banners already exist
  const existingBanners = await prisma.noticeBanner.findMany()
  
  if (existingBanners.length > 0) {
    console.log(`⚠️  Found ${existingBanners.length} existing banners.`)
    console.log('   Skipping sample data creation to avoid duplicates.')
    console.log('   Delete existing banners first if you want to add samples.')
    return
  }

  // Create sample banners
  let count = 0
  for (const banner of banners) {
    try {
      await prisma.noticeBanner.create({
        data: banner
      })
      count++
      console.log(`✅ Created: ${banner.titleEn}`)
    } catch (error) {
      console.error(`❌ Error creating banner: ${banner.titleEn}`, error)
    }
  }

  console.log(`\n🎉 Successfully created ${count} sample notice banners!`)
  console.log('   Visit your homepage to see them in action.')
  console.log('   Manage them at: /admin/notice-banners')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
