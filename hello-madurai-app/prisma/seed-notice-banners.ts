import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding notice banners...')

  // Create sample notice banners
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

  for (const banner of banners) {
    await prisma.noticeBanner.create({
      data: banner
    })
    console.log(`Created banner: ${banner.titleEn}`)
  }

  console.log('✅ Sample notice banners created successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding notice banners:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
