import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed News
  await prisma.news.createMany({
    data: [
      {
        title: 'Madurai Corporation announces new development projects',
        title_ta: 'மதுரை மாநகராட்சி புதிய வளர்ச்சி திட்டங்களை அறிவித்தது',
        content: 'The Madurai Corporation has unveiled an ambitious set of infrastructure development projects aimed at transforming the city\'s landscape and improving the quality of life for its residents.',
        content_ta: 'மதுரை மாநகராட்சி நகரின் தோற்றத்தை மாற்றுவதற்கும் குடியிருப்பாளர்களின் வாழ்க்கைத் தரத்தை மேம்படுத்துவதற்கும் நோக்கமாகக் கொண்ட ஒரு லட்சிய உள்கட்டமைப்பு வளர்ச்சி திட்டங்களை வெளியிட்டுள்ளது.',
        excerpt: 'The corporation has unveiled plans for infrastructure improvements across the city',
        excerpt_ta: 'நகரம் முழுவதும் உள்கட்டமைப்பு மேம்பாடுகளுக்கான திட்டங்களை மாநகராட்சி வெளியிட்டுள்ளது',
        category: 'corporation',
        author: 'Admin',
        featured: true,
        views: 1250
      },
      {
        title: 'Local farmers adopt modern irrigation techniques',
        title_ta: 'உள்ளூர் விவசாயிகள் நவீன நீர்ப்பாசன நுட்பங்களை பின்பற்றுகின்றனர்',
        content: 'Farmers in the Madurai district are increasingly embracing modern irrigation technologies to improve crop yields and water efficiency.',
        content_ta: 'மதுரை மாவட்ட விவசாயிகள் பயிர் விளைச்சல் மற்றும் நீர் திறனை மேம்படுத்த நவீன நீர்ப்பாசன தொழில்நுட்பங்களை அதிகளவில் ஏற்றுக்கொள்கின்றனர்.',
        excerpt: 'Farmers in Madurai district are embracing new technology for better crop yields',
        excerpt_ta: 'மதுரை மாவட்ட விவசாயிகள் சிறந்த பயிர் விளைச்சலுக்காக புதிய தொழில்நுட்பத்தை ஏற்றுக்கொள்கின்றனர்',
        category: 'agriculture',
        author: 'Reporter',
        featured: false,
        views: 890
      }
    ]
  })

  // Seed Events
  await prisma.event.createMany({
    data: [
      {
        title: 'Meenakshi Temple Annual Festival',
        title_ta: 'மீனாக்ஷி கோவில் வருடாந்திர திருவிழா',
        description: 'The grand annual festival celebrating the divine marriage of Goddess Meenakshi and Lord Sundareswarar',
        description_ta: 'தெய்வீக மீனாக்ஷி அம்மன் மற்றும் சுந்தரேஸ்வரர் திருக்கல்யாணத்தை கொண்டாடும் பெரிய வருடாந்திர திருவிழா',
        location: 'Meenakshi Amman Temple',
        location_ta: 'மீனாக்ஷி அம்மன் கோவில்',
        startDate: new Date('2024-04-15'),
        endDate: new Date('2024-04-25'),
        category: 'religious',
        status: 'upcoming',
        featured: true,
        registrations: 5000
      },
      {
        title: 'Madurai Trade Fair 2024',
        title_ta: 'மதுரை வர்த்தக கண்காட்சி 2024',
        description: 'Annual trade fair showcasing local businesses and products',
        description_ta: 'உள்ளூர் வணிகங்கள் மற்றும் தயாரிப்புகளை காட்சிப்படுத்தும் வருடாந்திர வர்த்தக கண்காட்சி',
        location: 'Tamukkam Grounds',
        location_ta: 'தமுக்கம் மைதானம்',
        startDate: new Date('2024-03-20'),
        endDate: new Date('2024-03-30'),
        category: 'business',
        status: 'ongoing',
        featured: false,
        registrations: 2500
      }
    ]
  })

  // Seed Podcasts
  await prisma.podcast.createMany({
    data: [
      {
        title: 'Madurai Stories',
        title_ta: 'மதுரை கதைகள்',
        description: 'Local stories and legends from Madurai',
        description_ta: 'மதுரையின் உள்ளூர் கதைகள் மற்றும் புராணங்கள்',
        host: 'Ravi Kumar',
        duration: '25:30',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        featured: true,
        plays: 1250
      },
      {
        title: 'Business Talk',
        title_ta: 'வணிக பேச்சு',
        description: 'Interviews with local entrepreneurs',
        description_ta: 'உள்ளூர் தொழில்முனைவோர்களுடன் நேர்காணல்கள்',
        host: 'Priya Sharma',
        duration: '18:45',
        audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-04.wav',
        featured: false,
        plays: 890
      }
    ]
  })

  // Seed Businesses
  await prisma.business.createMany({
    data: [
      {
        name: 'Madurai Silk Palace',
        name_ta: 'மதுரை பட்டு மாளிகை',
        description: 'Traditional silk sarees and textiles',
        description_ta: 'பாரம்பரிய பட்டு புடவைகள் மற்றும் ஜவுளி',
        category: 'textiles',
        phone: '+91 452 234 5678',
        email: 'info@maduraisilkpalace.com',
        website: 'https://maduraisilkpalace.com',
        address: 'West Masi Street, Madurai',
        address_ta: 'மேற்கு மாசி தெரு, மதுரை',
        featured: true,
        verified: true
      },
      {
        name: 'Kumar Restaurant',
        name_ta: 'குமார் உணவகம்',
        description: 'Authentic South Indian cuisine',
        description_ta: 'உண்மையான தென்னிந்திய உணவு',
        category: 'restaurant',
        phone: '+91 452 345 6789',
        email: 'kumar@restaurant.com',
        address: 'Anna Nagar, Madurai',
        address_ta: 'அண்ணா நகர், மதுரை',
        featured: false,
        verified: true
      }
    ]
  })

  // Create sample videos
  await prisma.video.createMany({
    data: [
      {
        title: 'Madurai Temple Architecture',
        title_ta: 'மதுரை கோவில் கட்டிடக்கலை',
        description: 'Exploring the magnificent architecture of Meenakshi Temple',
        description_ta: 'மீனாக்ஷி கோவிலின் அற்புதமான கட்டிடக்கலையை ஆராய்தல்',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtubeId: 'dQw4w9WgXcQ',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'culture',
        duration: '15:30',
        featured: true,
        views: 1250
      },
      {
        title: 'Local Business Spotlight',
        title_ta: 'உள்ளூர் வணிக கவனம்',
        description: 'Featuring successful local entrepreneurs and their stories',
        description_ta: 'வெற்றிகரமான உள்ளூர் தொழில்முனைவோர் மற்றும் அவர்களின் கதைகளை வெளிப்படுத்துதல்',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        youtubeId: 'dQw4w9WgXcQ',
        thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
        category: 'business',
        duration: '12:45',
        featured: false,
        views: 890
      }
    ]
  })

  // Create sample magazines
  await prisma.magazine.createMany({
    data: [
      {
        title: 'Hello Madurai Monthly - March 2024',
        title_ta: 'ஹலோ மதுரை மாதாந்திர - மார்ச் 2024',
        description: 'Monthly magazine covering local news, culture, and community events',
        description_ta: 'உள்ளூர் செய்திகள், கலாச்சாரம் மற்றும் சமூக நிகழ்வுகளை உள்ளடக்கிய மாதாந்திர பத்திரிகை',
        pdfUrl: 'https://example.com/magazine-march-2024.pdf',
        coverImage: 'https://via.placeholder.com/400x600/f59e0b/ffffff?text=Hello+Madurai+March+2024',
        issueNumber: 'Vol 1, Issue 3',
        featured: true,
        downloads: 450
      },
      {
        title: 'Hello Madurai Monthly - February 2024',
        title_ta: 'ஹலோ மதுரை மாதாந்திர - பிப்ரவரி 2024',
        description: 'February edition featuring temple festivals and local artisans',
        description_ta: 'கோவில் திருவிழாக்கள் மற்றும் உள்ளூர் கைவினைஞர்களை வெளிப்படுத்தும் பிப்ரவரி பதிப்பு',
        pdfUrl: 'https://example.com/magazine-february-2024.pdf',
        coverImage: 'https://via.placeholder.com/400x600/0ea5e9/ffffff?text=Hello+Madurai+February+2024',
        issueNumber: 'Vol 1, Issue 2',
        featured: false,
        downloads: 320
      }
    ]
  })

  console.log('Database seeded successfully with news, podcasts, videos, and magazines!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
