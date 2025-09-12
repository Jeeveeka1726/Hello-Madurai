'use client'

import { useState } from 'react'
import { PhoneIcon, EnvelopeIcon, MapPinIcon, GlobeAltIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import AppWrapper from '@/components/AppWrapper'
import { useLanguage } from '@/contexts/LanguageContext'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

function DirectoryPageContent() {
  const { t } = useLanguage()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch businesses from database - no hardcoded data
  const businesses = []

  const categories = [
    { id: 'all', name: t('directory.categories.all', 'All Categories', 'அனைத்து வகைகள்') },
    { id: 'medical', name: t('directory.categories.medical', 'Medical', 'மருத்துவம்') },
    { id: 'education', name: t('directory.categories.education', 'Education', 'கல்வி') },
    { id: 'restaurant', name: t('directory.categories.restaurant', 'Restaurants', 'உணவகங்கள்') },
    { id: 'transport', name: t('directory.categories.transport', 'Transport', 'போக்குவரத்து') },
    { id: 'government', name: t('directory.categories.government', 'Government', 'அரசு') },
    { id: 'shops', name: t('directory.categories.shops', 'Shops', 'கடைகள்') }
  ]

  const filteredBusinesses = businesses.filter(business => {
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.name_ta.includes(searchTerm) ||
      business.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description_ta.includes(searchTerm)
    return matchesCategory && matchesSearch
  })

  const featuredBusinesses = filteredBusinesses.filter(business => business.featured)
  const regularBusinesses = filteredBusinesses.filter(business => !business.featured)

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self')
  }

  const handleWebsite = (website: string) => {
    window.open(website, '_blank')
  }

  const handleDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-purple-950 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            {t('directory.title', 'Business Directory', 'வணிக முகவரி நூல்')}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            {t('directory.subtitle', 'Find local businesses and services in Madurai', 'மதுரையில் உள்ளூர் வணிகங்கள் மற்றும் சேவைகளைக் கண்டறியுங்கள்')}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder={t('directory.search', 'Search businesses...', 'வணிகங்களைத் தேடுங்கள்...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "primary" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id 
                  ? "bg-primary-600 text-white" 
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Businesses */}
        {featuredBusinesses.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {t('directory.featured', 'Featured Businesses', 'சிறப்பு வணிகங்கள்')}
            </h2>
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredBusinesses.map((business) => (
                <Card key={business.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-gray-900 dark:text-white">
                          {t(`directory.${business.id}.name`, business.name, business.name_ta)}
                        </CardTitle>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 mt-2">
                          {t('directory.featured', 'Featured', 'சிறப்பு')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {t(`directory.categories.${business.category}`, business.category, business.category)}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {t(`directory.${business.id}.description`, business.description, business.description_ta)}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {t(`directory.${business.id}.address`, business.address, business.address_ta)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {business.phone}
                      </div>
                      {business.email && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {business.email}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => handleCall(business.phone)}>
                        <PhoneIcon className="h-3 w-3 mr-1" />
                        {t('directory.call', 'Call', 'அழைக்க')}
                      </Button>
                      {business.email && (
                        <Button size="sm" variant="outline" onClick={() => handleEmail(business.email)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <EnvelopeIcon className="h-3 w-3 mr-1" />
                          {t('directory.email', 'Email', 'மின்னஞ்சல்')}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleDirections(business.address)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <MapPinIcon className="h-3 w-3 mr-1" />
                        {t('directory.directions', 'Directions', 'திசைகள்')}
                      </Button>
                      {business.website && (
                        <Button size="sm" variant="outline" onClick={() => handleWebsite(business.website)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <GlobeAltIcon className="h-3 w-3 mr-1" />
                          {t('directory.website', 'Website', 'வலைத்தளம்')}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Businesses */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {selectedCategory === 'all' 
              ? t('directory.allBusinesses', 'All Businesses', 'அனைத்து வணிகங்கள்')
              : categories.find(cat => cat.id === selectedCategory)?.name
            }
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(selectedCategory === 'all' ? regularBusinesses : filteredBusinesses.filter(b => !b.featured)).map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-gray-900 dark:text-white text-lg">
                      {t(`directory.${business.id}.name`, business.name, business.name_ta)}
                    </CardTitle>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {t(`directory.categories.${business.category}`, business.category, business.category)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {t(`directory.${business.id}.description`, business.description, business.description_ta)}
                  </p>
                  
                  <div className="space-y-1 mb-3 text-xs">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                      <span className="line-clamp-1">{t(`directory.${business.id}.address`, business.address, business.address_ta)}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                      {business.phone}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" onClick={() => handleCall(business.phone)} className="text-xs">
                      <PhoneIcon className="h-3 w-3 mr-1" />
                      {t('directory.call', 'Call', 'அழைக்க')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDirections(business.address)} className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs">
                      <MapPinIcon className="h-3 w-3 mr-1" />
                      {t('directory.directions', 'Map', 'வரைபடம்')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* No results message */}
        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {t('directory.noResults', 'No businesses found matching your criteria', 'உங்கள் அளவுகோல்களுக்கு பொருந்தும் வணிகங்கள் எதுவும் கிடைக்கவில்லை')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DirectoryPage() {
  return (
    <AppWrapper>
      <DirectoryPageContent />
    </AppWrapper>
  )
}
