'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import CategoryNavigation from '@/components/CategoryNavigation'
import { PhoneIcon, MapPinIcon, ShareIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface HelplineCategory {
  id: string
  name: string
  name_ta: string | null
}

interface Helpline {
  id: string
  name: string
  name_ta?: string
  phone: string
  categoryId: string
  address?: string | null
  address_ta?: string | null
  description?: string
  description_ta?: string
  featured: boolean
  category?: HelplineCategory
}

export default function HelplinePage() {
  const { t, language } = useLanguage()
  const [helplines, setHelplines] = useState<Helpline[]>([])
  const [categories, setCategories] = useState<HelplineCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchHelplines()
    fetchCategories()
  }, [])

  const fetchHelplines = async () => {
    try {
      const response = await fetch('/api/helplines')
      if (response.ok) {
        const data = await response.json()
        setHelplines(data)
      }
    } catch (error) {
      console.error('Error fetching helplines:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/helpline-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const filteredHelplines = selectedCategory === 'all'
    ? helplines
    : helplines.filter(h => h.categoryId === selectedCategory)

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const handleShare = async (helpline: Helpline) => {
    const shareData = {
      title: language === 'ta' && helpline.name_ta ? helpline.name_ta : helpline.name,
      text: `${language === 'ta' && helpline.name_ta ? helpline.name_ta : helpline.name}\n📞 ${helpline.phone}${helpline.address ? '\n📍 ' + (language === 'ta' && helpline.address_ta ? helpline.address_ta : helpline.address) : ''}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        toast.success(t('shared', 'Shared successfully!', 'வெற்றிகரமாக பகிரப்பட்டது!'))
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.text)
        toast.success(t('copied', 'Copied to clipboard!', 'கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!'))
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <NewHeader />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <PhoneIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-white text-lg sm:text-xl font-semibold mt-6">
            {t('loading', 'Loading helplines...', 'உதவி எண்களை ஏற்றுகிறது...')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
      <NewHeader />
      <CategoryNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Enhanced Header with Icon */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-full mb-4 sm:mb-6">
            <PhoneIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-4 drop-shadow-lg">
            {t('helpline.title', 'Emergency & Helpline Numbers', 'அவசர மற்றும் உதவி எண்கள்')}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            {t('helpline.subtitle', 'Important contact numbers for Madurai', 'மதுரைக்கான முக்கியமான தொடர்பு எண்கள்')}
          </p>
        </div>

        {/* Enhanced Category Filter */}
        <div className="mb-8 sm:mb-10">
          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-md ${
                selectedCategory === 'all'
                  ? 'bg-white text-blue-800 shadow-lg ring-2 ring-white/50'
                  : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
              }`}
            >
              {t('helpline.category.all', 'All', 'அனைத்தும்')}
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base transition-all duration-200 transform hover:scale-105 shadow-md ${
                  selectedCategory === category.id
                    ? 'bg-white text-blue-800 shadow-lg ring-2 ring-white/50'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
              >
                {language === 'ta' && category.name_ta ? category.name_ta : category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Enhanced Helplines - Horizontal Cards */}
        <div className="space-y-4 sm:space-y-5">
          {filteredHelplines.map((helpline, index) => (
            <div
              key={helpline.id}
              className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Featured Badge */}
              {helpline.featured && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-1.5 text-center">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    ⭐ {t('featured', 'Featured', 'சிறப்பு')}
                  </span>
                </div>
              )}

              <div className="p-5 sm:p-7">
                {/* Header with Name and Category */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                      {language === 'ta' && helpline.name_ta ? helpline.name_ta : helpline.name}
                    </h3>
                    {helpline.category && (
                      <span className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-full shadow-sm">
                        {language === 'ta' && helpline.category.name_ta
                          ? helpline.category.name_ta
                          : helpline.category.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Enhanced Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-5">
                  {/* Phone Number with enhanced styling */}
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex-shrink-0">
                      <PhoneIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-0.5">{t('phone', 'Phone', 'தொலைபேசி')}</p>
                      <p className="font-bold text-base sm:text-lg text-gray-900 truncate" dir="ltr">{helpline.phone}</p>
                    </div>
                  </div>

                  {/* Address with enhanced styling */}
                  {helpline.address && (
                    <div className="flex items-start gap-3 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex-shrink-0">
                        <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-0.5">{t('address', 'Address', 'முகவரி')}</p>
                        <p className="text-sm sm:text-base text-gray-900 line-clamp-2">
                          {language === 'ta' && helpline.address_ta ? helpline.address_ta : helpline.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description with enhanced styling */}
                {(helpline.description || helpline.description_ta) && (
                  <div className="p-3 sm:p-4 bg-gray-50 rounded-xl mb-5 border-l-4 border-blue-500">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                      {language === 'ta' && helpline.description_ta ? helpline.description_ta : helpline.description}
                    </p>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => handleCall(helpline.phone)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-sm sm:text-base"
                  >
                    <PhoneIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    {t('helpline.call', 'Call Now', 'இப்போது அழைக்கவும்')}
                  </button>
                  <button
                    onClick={() => handleShare(helpline)}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-bold text-sm sm:text-base"
                  >
                    <ShareIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    {t('helpline.share', 'Share', 'பகிர்')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Empty State */}
        {filteredHelplines.length === 0 && (
          <div className="text-center py-16 sm:py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <PhoneIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white/60" />
            </div>
            <p className="text-white text-lg sm:text-xl font-semibold mb-2">
              {t('helpline.noResults', 'No helpline numbers found', 'உதவி எண்கள் எதுவும் கிடைக்கவில்லை')}
            </p>
            <p className="text-blue-200 text-sm sm:text-base">
              {t('helpline.tryDifferent', 'Try selecting a different category', 'வேறு வகையைத் தேர்ந்தெடுக்க முயற்சிக்கவும்')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

