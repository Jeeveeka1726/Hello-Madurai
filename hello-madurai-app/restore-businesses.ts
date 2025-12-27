import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Restoring businesses with correct schema...')

  // Create some basic businesses that match the current schema
  const businesses = [
    {
      id: 'silambam-master-001',
      name: 'Silambam Master',
      name_ta: 'சிலம்பம் மாஸ்டர்',
      category: 'Healthcare',
      address: '123 Silambam Street, K.K. Nagar, Madurai - 625020',
      address_ta: '123 சிலம்பம் தெரு, கே.கே.நகர், மதுரை - 625020',
      phone: '+91 98765 43210',
      email: 'info@silambambaster.com',
      website: 'https://www.silambambaster.com',
      mainVideoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
      instagramUrl: 'https://instagram.com/silambambaster',
      facebookUrl: 'https://facebook.com/silambambaster',
      bookingUrl: 'https://calendly.com/silambambaster',
      verified: true,
      orderNumber: 1
    },
    {
      id: 'meenakshi-mess-002',
      name: 'Meenakshi Mess',
      name_ta: 'மீனாட்சி மெஸ்',
      category: 'Restaurant',
      address: '45 West Masi Street, Near Meenakshi Temple, Madurai - 625001',
      address_ta: '45 மேற்கு மாசி தெரு, மீனாட்சி கோவில் அருகில், மதுரை - 625001',
      phone: '+91 98765 12345',
      email: 'contact@meenakshimess.com',
      website: 'https://www.meenakshimess.com',
      mainVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      instagramUrl: 'https://instagram.com/meenakshimess',
      facebookUrl: 'https://facebook.com/meenakshimess',
      bookingUrl: 'https://zomato.com/meenakshimess',
      verified: true,
      orderNumber: 2
    },
    {
      id: 'kumar-silks-003',
      name: 'Kumar Silks & Sarees',
      name_ta: 'குமார் பட்டு & புடவைகள்',
      category: 'Shopping',
      address: '78 Nethaji Road, Madurai Main, Madurai - 625001',
      address_ta: '78 நேதாஜி சாலை, மதுரை மெயின், மதுரை - 625001',
      phone: '+91 98765 67890',
      email: 'sales@kumarsilks.com',
      website: 'https://www.kumarsilks.com',
      mainVideoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      instagramUrl: 'https://instagram.com/kumarsilks',
      facebookUrl: 'https://facebook.com/kumarsilks',
      bookingUrl: 'https://www.kumarsilks.com/book-appointment',
      verified: true,
      orderNumber: 3
    },
    {
      id: 'modern-dental-004',
      name: 'Modern Dental Clinic',
      name_ta: 'மாடர்ன் பல் மருத்துவமனை',
      category: 'Healthcare',
      address: '156 Bypass Road, Anna Nagar, Madurai - 625020',
      address_ta: '156 பைபாஸ் சாலை, அண்ணா நகர், மதுரை - 625020',
      phone: '+91 98765 11111',
      email: 'info@moderndentalclinic.com',
      website: 'https://www.moderndentalclinic.com',
      instagramUrl: 'https://instagram.com/moderndentalclinic',
      facebookUrl: 'https://facebook.com/moderndentalclinic',
      bookingUrl: 'https://practo.com/modern-dental-clinic',
      verified: true,
      orderNumber: 4
    },
    {
      id: 'madurai-photography-005',
      name: 'Madurai Photography Studio',
      name_ta: 'மதுரை புகைப்பட ஸ்டுடியோ',
      category: 'Photography',
      address: '234 TVS Nagar, Near Bus Stand, Madurai - 625003',
      address_ta: '234 டிவிஎஸ் நகர், பஸ் நிலையம் அருகில், மதுரை - 625003',
      phone: '+91 98765 22222',
      email: 'booking@maduraiphotography.com',
      website: 'https://www.maduraiphotography.com',
      mainVideoUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
      instagramUrl: 'https://instagram.com/maduraiphotography',
      facebookUrl: 'https://facebook.com/maduraiphotography',
      bookingUrl: 'https://calendly.com/maduraiphotography',
      verified: true,
      orderNumber: 5
    }
  ]

  for (const business of businesses) {
    try {
      const created = await prisma.business.upsert({
        where: { id: business.id },
        update: {},
        create: business
      })
      console.log(`✅ Created: ${created.name}`)
    } catch (error) {
      console.error(`❌ Error creating ${business.name}:`, error)
    }
  }

  console.log('🎉 Businesses restored successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
