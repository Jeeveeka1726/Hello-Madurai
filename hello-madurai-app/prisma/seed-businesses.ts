import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding sample businesses...')

  // Sample Business 1: Silambam Master - Physiotherapy
  const business1 = await prisma.business.upsert({
    where: { id: 'silambam-master-001' },
    update: {},
    create: {
      id: 'silambam-master-001',
      name: 'Silambam Master',
      name_ta: 'சிலம்பம் மாஸ்டர்',
      description: 'Non-Physiotherapy Physiotherapy Treatment Center where stroke patients came to Silambam Master in 30 days. Traditional healing methods combined with modern techniques for faster recovery.',
      description_ta: 'பாரம்பரிய குணப்படுத்தும் முறைகள் நவீன நுட்பங்களுடன் இணைந்து விரைவான மீட்பு.',
      category: 'Healthcare',
      address: '123 Silambam Street, K.K. Nagar, Madurai - 625020, Tamil Nadu',
      address_ta: '123 சிலம்பம் தெரு, கே.கே.நகர், மதுரை - 625020, தமிழ்நாடு',
      phone: '+91 98765 43210',
      email: 'info@silambambaster.com',
      website: 'https://www.silambambaster.com',
      videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      instagramUrl: 'https://instagram.com/silambambaster',
      facebookUrl: 'https://facebook.com/silambambaster',
      bookingUrl: 'https://calendly.com/silambambaster',
      latitude: 9.9252,
      longitude: 78.1198,
      featured: true,
      verified: true
    }
  })

  // Sample Business 2: Meenakshi Mess - Restaurant
  const business2 = await prisma.business.upsert({
    where: { id: 'meenakshi-mess-002' },
    update: {},
    create: {
      id: 'meenakshi-mess-002',
      name: 'Meenakshi Mess',
      name_ta: 'மீனாட்சி மெஸ்',
      description: 'Authentic Madurai style non-vegetarian meals. Famous for our mutton biryani, parotta, and traditional Chettinad cuisine. Family-run restaurant since 1985.',
      description_ta: 'உண்மையான மதுரை பாணி அசைவ உணவுகள். எங்கள் ஆட்டுக்கறி பிரியாணி, பரோட்டா மற்றும் பாரம்பரிய செட்டிநாடு உணவுகளுக்கு பிரபலம்.',
      category: 'Restaurant',
      address: '45 West Masi Street, Near Meenakshi Temple, Madurai - 625001',
      address_ta: '45 மேற்கு மாசி தெரு, மீனாட்சி கோவில் அருகில், மதுரை - 625001',
      phone: '+91 98765 12345',
      email: 'contact@meenakshimess.com',
      website: 'https://www.meenakshimess.com',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      instagramUrl: 'https://instagram.com/meenakshimess',
      facebookUrl: 'https://facebook.com/meenakshimess',
      bookingUrl: 'https://zomato.com/meenakshimess',
      latitude: 9.9195,
      longitude: 78.1193,
      featured: true,
      verified: true
    }
  })

  // Sample Business 3: Kumar Silks - Shopping
  const business3 = await prisma.business.upsert({
    where: { id: 'kumar-silks-003' },
    update: {},
    create: {
      id: 'kumar-silks-003',
      name: 'Kumar Silks & Sarees',
      name_ta: 'குமார் பட்டு & புடவைகள்',
      description: 'Premium silk sarees, wedding collections, and traditional wear. Exclusive Kanchipuram, Banarasi, and handloom collections. Wedding shopping destination in Madurai.',
      description_ta: 'பிரீமியம் பட்டு புடவைகள், திருமண தொகுப்புகள், மற்றும் பாரம்பரிய உடைகள். சிறப்பு காஞ்சிபுரம், பனாரசி மற்றும் கைத்தறி தொகுப்புகள்.',
      category: 'Shopping',
      address: '78 Nethaji Road, Madurai Main, Madurai - 625001',
      address_ta: '78 நேதாஜி சாலை, மதுரை மெயின், மதுரை - 625001',
      phone: '+91 98765 67890',
      email: 'sales@kumarsilks.com',
      website: 'https://www.kumarsilks.com',
      videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      instagramUrl: 'https://instagram.com/kumarsilks',
      facebookUrl: 'https://facebook.com/kumarsilks',
      bookingUrl: 'https://www.kumarsilks.com/book-appointment',
      latitude: 9.9173,
      longitude: 78.1216,
      featured: true,
      verified: true
    }
  })

  // Sample Business 4: Modern Dental Clinic
  const business4 = await prisma.business.upsert({
    where: { id: 'modern-dental-004' },
    update: {},
    create: {
      id: 'modern-dental-004',
      name: 'Modern Dental Clinic',
      name_ta: 'மாடர்ன் பல் மருத்துவமனை',
      description: 'Advanced dental care with latest technology. Root canal, implants, orthodontics, cosmetic dentistry. Experienced dentists with 15+ years of practice.',
      description_ta: 'சமீபத்திய தொழில்நுட்பத்துடன் மேம்பட்ட பல் சிகிச்சை. ரூட் கேனல், பல் நடுதல், ஆர்தோடோன்டிக்ஸ், அழகு பல் மருத்துவம்.',
      category: 'Healthcare',
      address: '156 Bypass Road, Anna Nagar, Madurai - 625020',
      address_ta: '156 பைபாஸ் சாலை, அண்ணா நகர், மதுரை - 625020',
      phone: '+91 98765 11111',
      email: 'info@moderndentalclinic.com',
      website: 'https://www.moderndentalclinic.com',
      instagramUrl: 'https://instagram.com/moderndentalclinic',
      facebookUrl: 'https://facebook.com/moderndentalclinic',
      bookingUrl: 'https://practo.com/modern-dental-clinic',
      latitude: 9.9312,
      longitude: 78.1214,
      featured: false,
      verified: true
    }
  })

  // Sample Business 5: Madurai Photography Studio
  const business5 = await prisma.business.upsert({
    where: { id: 'madurai-photography-005' },
    update: {},
    create: {
      id: 'madurai-photography-005',
      name: 'Madurai Photography Studio',
      name_ta: 'மதுரை புகைப்பட ஸ்டுடியோ',
      description: 'Professional photography and videography services. Weddings, events, portraits, pre-wedding shoots. Drone photography available. Award-winning team.',
      description_ta: 'தொழில்முறை புகைப்படம் மற்றும் வீடியோ சேவைகள். திருமணங்கள், நிகழ்வுகள், உருவப்படங்கள், திருமணத்திற்கு முந்தைய படப்பிடிப்புகள்.',
      category: 'Photography',
      address: '234 TVS Nagar, Near Bus Stand, Madurai - 625003',
      address_ta: '234 டிவிஎஸ் நகர், பஸ் நிலையம் அருகில், மதுரை - 625003',
      phone: '+91 98765 22222',
      email: 'booking@maduraiphotography.com',
      website: 'https://www.maduraiphotography.com',
      videoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      instagramUrl: 'https://instagram.com/maduraiphotography',
      facebookUrl: 'https://facebook.com/maduraiphotography',
      bookingUrl: 'https://calendly.com/maduraiphotography',
      latitude: 9.9248,
      longitude: 78.1141,
      featured: false,
      verified: true
    }
  })

  // Sample Business 6: Heritage Hotel
  const business6 = await prisma.business.upsert({
    where: { id: 'heritage-hotel-006' },
    update: {},
    create: {
      id: 'heritage-hotel-006',
      name: 'Heritage Grand Hotel',
      name_ta: 'ஹெரிடேஜ் கிராண்ட் ஹோட்டல்',
      description: 'Luxury hotel near Meenakshi Temple. AC rooms, conference halls, rooftop restaurant with temple view. 24/7 room service. Perfect for family and business stays.',
      description_ta: 'மீனாட்சி கோவில் அருகில் சொகுசு ஹோட்டல். ஏசி அறைகள், மாநாட்டு அரங்குகள், கோவில் காட்சியுடன் கூரை உணவகம்.',
      category: 'Hotel',
      address: '89 West Tower Street, Temple Area, Madurai - 625001',
      address_ta: '89 மேற்கு டவர் தெரு, கோவில் பகுதி, மதுரை - 625001',
      phone: '+91 98765 33333',
      email: 'reservations@heritagegrand.com',
      website: 'https://www.heritagegrand.com',
      videoUrl: 'https://www.youtube.com/watch?v=QH2-TGUlwu4',
      instagramUrl: 'https://instagram.com/heritagegrand',
      facebookUrl: 'https://facebook.com/heritagegrand',
      bookingUrl: 'https://booking.com/heritagegrand',
      latitude: 9.9185,
      longitude: 78.1189,
      featured: true,
      verified: true
    }
  })

  // Sample Business 7: Auto Repairs
  const business7 = await prisma.business.upsert({
    where: { id: 'raj-auto-service-007' },
    update: {},
    create: {
      id: 'raj-auto-service-007',
      name: 'Raj Auto Service Center',
      name_ta: 'ராஜ் ஆட்டோ சர்வீஸ் சென்டர்',
      description: 'Complete car and bike service center. Engine repair, body work, painting, insurance claim work. Authorized service for all brands. Free pickup and drop.',
      description_ta: 'முழுமையான கார் மற்றும் பைக் சேவை மையம். என்ஜின் பழுது, பாடி வேலை, பெயிண்டிங், காப்பீடு கோரிக்கை வேலை.',
      category: 'Automobile',
      address: '567 Ring Road, Goripalayam, Madurai - 625002',
      address_ta: '567 ரிங் ரோடு, கோரிப்பாளையம், மதுரை - 625002',
      phone: '+91 98765 44444',
      email: 'service@rajauto.com',
      website: 'https://www.rajautoservice.com',
      instagramUrl: 'https://instagram.com/rajautoservice',
      facebookUrl: 'https://facebook.com/rajautoservice',
      bookingUrl: 'https://www.rajautoservice.com/book',
      latitude: 9.9330,
      longitude: 78.1122,
      featured: false,
      verified: true
    }
  })

  // Sample Business 8: Tuition Center
  const business8 = await prisma.business.upsert({
    where: { id: 'bright-minds-008' },
    update: {},
    create: {
      id: 'bright-minds-008',
      name: 'Bright Minds Tuition Center',
      name_ta: 'பிரைட் மைண்ட்ஸ் டியூஷன் சென்டர்',
      description: 'Coaching for classes 6-12, NEET, JEE preparation. Experienced faculty, small batch sizes, regular tests. 95% success rate in competitive exams.',
      description_ta: 'வகுப்புகள் 6-12, NEET, JEE தயாரிப்பு. அனுபவமிக்க ஆசிரியர்கள், சிறிய தொகுதி அளவுகள், வழக்கமான சோதனைகள்.',
      category: 'Education',
      address: '123 Surveyor Colony, SS Colony, Madurai - 625016',
      address_ta: '123 சர்வேயர் காலனி, எஸ்எஸ் காலனி, மதுரை - 625016',
      phone: '+91 98765 55555',
      email: 'admissions@brightminds.com',
      website: 'https://www.brightminds.com',
      videoUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      instagramUrl: 'https://instagram.com/brightminds',
      facebookUrl: 'https://facebook.com/brightminds',
      bookingUrl: 'https://www.brightminds.com/enroll',
      latitude: 9.9397,
      longitude: 78.1212,
      featured: false,
      verified: true
    }
  })

  // Sample Business 9: Gym & Fitness
  const business9 = await prisma.business.upsert({
    where: { id: 'power-gym-009' },
    update: {},
    create: {
      id: 'power-gym-009',
      name: 'Power Gym & Fitness',
      name_ta: 'பவர் ஜிம் & உடற்பயிற்சி',
      description: 'State-of-the-art gym with modern equipment. Personal training, group classes, yoga, Zumba. Separate timings for ladies. Air-conditioned facility.',
      description_ta: 'நவீன உபகரணங்களுடன் அதிநவீன ஜிம். தனிப்பட்ட பயிற்சி, குழு வகுப்புகள், யோகா, ஜும்பா.',
      category: 'Fitness',
      address: '456 Alagarkovil Road, Tallakulam, Madurai - 625002',
      address_ta: '456 அழகர்கோவில் சாலை, தல்லக்குளம், மதுரை - 625002',
      phone: '+91 98765 66666',
      email: 'info@powergym.com',
      website: 'https://www.powergym.com',
      videoUrl: 'https://www.youtube.com/watch?v=EngW7tLk6R8',
      instagramUrl: 'https://instagram.com/powergym',
      facebookUrl: 'https://facebook.com/powergym',
      bookingUrl: 'https://www.powergym.com/membership',
      latitude: 9.9143,
      longitude: 78.1377,
      featured: false,
      verified: true
    }
  })

  // Sample Business 10: Bakery
  const business10 = await prisma.business.upsert({
    where: { id: 'royal-bakery-010' },
    update: {},
    create: {
      id: 'royal-bakery-010',
      name: 'Royal Bakery & Cakes',
      name_ta: 'ராயல் பேக்கரி & கேக்குகள்',
      description: 'Fresh cakes, pastries, breads daily. Custom birthday cakes, wedding cakes. Eggless options available. Home delivery across Madurai. Established 1990.',
      description_ta: 'தினமும் புதிய கேக்குகள், பேஸ்ட்ரிகள், ரொட்டிகள். தனிப்பயன் பிறந்தநாள் கேக்குகள், திருமண கேக்குகள்.',
      category: 'Bakery',
      address: '234 North Veli Street, Madurai - 625001',
      address_ta: '234 வடக்கு வேளி தெரு, மதுரை - 625001',
      phone: '+91 98765 77777',
      email: 'orders@royalbakery.com',
      website: 'https://www.royalbakery.com',
      instagramUrl: 'https://instagram.com/royalbakery',
      facebookUrl: 'https://facebook.com/royalbakery',
      bookingUrl: 'https://swiggy.com/royalbakery',
      latitude: 9.9207,
      longitude: 78.1199,
      featured: false,
      verified: true
    }
  })

  console.log('✅ Sample businesses created successfully!')
  console.log({
    business1: business1.name,
    business2: business2.name,
    business3: business3.name,
    business4: business4.name,
    business5: business5.name,
    business6: business6.name,
    business7: business7.name,
    business8: business8.name,
    business9: business9.name,
    business10: business10.name
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding businesses:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

