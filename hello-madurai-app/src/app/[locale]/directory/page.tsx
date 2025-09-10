import Link from 'next/link'
import { 
  BuildingOfficeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  ClockIcon,
  StarIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface DirectoryPageProps {
  params: Promise<{ locale: string }>
}

const businesses = [
  {
    id: 1,
    name: 'Madurai Textiles',
    name_ta: 'மதுரை ஜவுளி',
    category: 'textiles',
    description: 'Traditional silk sarees and cotton fabrics',
    description_ta: 'பாரம்பரிய பட்டு புடவைகள் மற்றும் பருத்தி துணிகள்',
    address: 'West Masi Street, Madurai',
    address_ta: 'மேற்கு மாசி தெரு, மதுரை',
    phone: '+91 452 234 5678',
    rating: 4.5,
    hours: '9:00 AM - 8:00 PM',
    featured: true
  },
  {
    id: 2,
    name: 'Kumar Medical Store',
    name_ta: 'குமார் மருந்தகம்',
    category: 'healthcare',
    description: 'Complete pharmacy with 24/7 service',
    description_ta: '24/7 சேவையுடன் முழுமையான மருந்தகம்',
    address: 'Anna Nagar, Madurai',
    address_ta: 'அண்ணா நகர், மதுரை',
    phone: '+91 452 345 6789',
    rating: 4.8,
    hours: '24 Hours',
    featured: false
  },
  {
    id: 3,
    name: 'Meenakshi Restaurant',
    name_ta: 'மீனாக்ஷி உணவகம்',
    category: 'restaurant',
    description: 'Authentic South Indian cuisine',
    description_ta: 'உண்மையான தென்னிந்திய உணவு வகைகள்',
    address: 'Town Hall Road, Madurai',
    address_ta: 'டவுன் ஹால் சாலை, மதுரை',
    phone: '+91 452 456 7890',
    rating: 4.3,
    hours: '6:00 AM - 11:00 PM',
    featured: true
  },
  {
    id: 4,
    name: 'Madurai Auto Parts',
    name_ta: 'மதுரை வாகன பாகங்கள்',
    category: 'automotive',
    description: 'All types of vehicle spare parts',
    description_ta: 'அனைத்து வகையான வாகன உதிரி பாகங்கள்',
    address: 'Bypass Road, Madurai',
    address_ta: 'பைபாஸ் சாலை, மதுரை',
    phone: '+91 452 567 8901',
    rating: 4.1,
    hours: '8:00 AM - 7:00 PM',
    featured: false
  },
  {
    id: 5,
    name: 'Sri Krishna Electronics',
    name_ta: 'ஸ்ரீ கிருஷ்ணா எலக்ட்ரானிக்ஸ்',
    category: 'electronics',
    description: 'Home appliances and electronic goods',
    description_ta: 'வீட்டு உபகரணங்கள் மற்றும் மின்னணு பொருட்கள்',
    address: 'Periyar Bus Stand, Madurai',
    address_ta: 'பெரியார் பேருந்து நிலையம், மதுரை',
    phone: '+91 452 678 9012',
    rating: 4.4,
    hours: '9:00 AM - 9:00 PM',
    featured: false
  },
  {
    id: 6,
    name: 'Pandian Book Store',
    name_ta: 'பாண்டியன் புத்தக கடை',
    category: 'books',
    description: 'Books, stationery and educational materials',
    description_ta: 'புத்தகங்கள், எழுதுபொருட்கள் மற்றும் கல்வி பொருட்கள்',
    address: 'Tallakulam, Madurai',
    address_ta: 'தல்லாகுளம், மதுரை',
    phone: '+91 452 789 0123',
    rating: 4.2,
    hours: '8:00 AM - 8:00 PM',
    featured: true
  }
]

const categories = [
  { id: 'all', name: 'All Categories', name_ta: 'அனைத்து வகைகள்' },
  { id: 'textiles', name: 'Textiles', name_ta: 'ஜவுளி' },
  { id: 'healthcare', name: 'Healthcare', name_ta: 'சுகாதாரம்' },
  { id: 'restaurant', name: 'Restaurants', name_ta: 'உணவகங்கள்' },
  { id: 'automotive', name: 'Automotive', name_ta: 'வாகனம்' },
  { id: 'electronics', name: 'Electronics', name_ta: 'மின்னணு' },
  { id: 'books', name: 'Books & Stationery', name_ta: 'புத்தகங்கள்' }
]

export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { locale } = await params;

  const featuredBusinesses = businesses.filter(business => business.featured)
  const allBusinesses = businesses

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<StarIcon key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarIcon key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400 opacity-50" />)
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {locale === 'ta' ? 'வணிக முகவரி நூல்' : 'Business Directory'}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {locale === 'ta' 
              ? 'மதுரையில் உள்ள உள்ளூர் வணிகங்கள், சேவைகள் மற்றும் தொடர்பு தகவல்களை கண்டறியுங்கள்'
              : 'Find local businesses, services and contact information in Madurai'
            }
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={locale === 'ta' ? 'வணிகங்களை தேடுங்கள்...' : 'Search businesses...'}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="text-sm"
              >
                {locale === 'ta' ? category.name_ta : category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Businesses */}
        {featuredBusinesses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {locale === 'ta' ? 'சிறப்பு வணிகங்கள்' : 'Featured Businesses'}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {featuredBusinesses.map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {locale === 'ta' ? business.name_ta : business.name}
                      </CardTitle>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {locale === 'ta' ? 'சிறப்பு' : 'Featured'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {renderStars(business.rating)}
                      <span className="ml-2 text-sm text-gray-600">({business.rating})</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      {locale === 'ta' ? business.description_ta : business.description}
                    </p>
                    <div className="space-y-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {locale === 'ta' ? business.address_ta : business.address}
                      </div>
                      <div className="flex items-center">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        {business.phone}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {business.hours}
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button size="sm" className="flex-1">
                        {locale === 'ta' ? 'தொடर்பு கொள்ளுங்கள்' : 'Contact'}
                      </Button>
                      <Button variant="outline" size="sm">
                        {locale === 'ta' ? 'விவரங்கள்' : 'Details'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Businesses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {locale === 'ta' ? 'அனைத்து வணிகங்கள்' : 'All Businesses'}
          </h2>
          <div className="grid gap-4">
            {allBusinesses.map((business) => (
              <Card key={business.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {locale === 'ta' ? business.name_ta : business.name}
                        </h3>
                        {business.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {locale === 'ta' ? 'சிறப்பு' : 'Featured'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mb-2">
                        {renderStars(business.rating)}
                        <span className="ml-2 text-sm text-gray-600">({business.rating})</span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {locale === 'ta' ? business.description_ta : business.description}
                      </p>
                      <div className="grid md:grid-cols-3 gap-2 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {locale === 'ta' ? business.address_ta : business.address}
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-2" />
                          {business.phone}
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {business.hours}
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex flex-col space-y-2">
                      <Button size="sm">
                        {locale === 'ta' ? 'தொடர்பு' : 'Contact'}
                      </Button>
                      <Button variant="outline" size="sm">
                        {locale === 'ta' ? 'விவரங்கள்' : 'Details'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Add Business CTA */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            {locale === 'ta' ? 'உங்கள் வணிகத்தை பட்டியலிடுங்கள்' : 'List Your Business'}
          </h3>
          <p className="text-gray-600 mb-6">
            {locale === 'ta' 
              ? 'உங்கள் வணிகத்தை எங்கள் டைரக்டரியில் சேர்த்து அதிக வாடிக்கையாளர்களை அடையுங்கள்'
              : 'Add your business to our directory and reach more customers'
            }
          </p>
          <Button size="lg">
            {locale === 'ta' ? 'இப்போது பட்டியலிடுங்கள்' : 'List Now'}
          </Button>
        </div>
      </div>
    </div>
  )
}
