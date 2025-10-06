'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import { PhoneIcon } from '@heroicons/react/24/outline'

interface Helpline {
  id: string
  name: string
  name_ta?: string
  phone: string
  category: string
  description?: string
  description_ta?: string
  featured: boolean
}

export default function HelplinePage() {
  const { t, language } = useLanguage()
  const [helplines, setHelplines] = useState<Helpline[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchHelplines()
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

  const categories = ['all', 'emergency', 'medical', 'police', 'fire', 'transport', 'utility', 'government']

  const filteredHelplines = selectedCategory === 'all' 
    ? helplines 
    : helplines.filter(h => h.category === selectedCategory)

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-800">
        <NewHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-blue-800">
      <NewHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            {t('helpline.title', 'Emergency & Helpline Numbers', 'அவசர மற்றும் உதவி எண்கள்')}
          </h1>
          <p className="text-blue-200 text-lg">
            {t('helpline.subtitle', 'Important contact numbers for Madurai', 'மதுரைக்கான முக்கியமான தொடர்பு எண்கள்')}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-white text-blue-800'
                    : 'bg-blue-600 text-white hover:bg-blue-500'
                }`}
              >
                {t(`helpline.category.${category}`, category.charAt(0).toUpperCase() + category.slice(1), category)}
              </button>
            ))}
          </div>
        </div>

        {/* Helplines Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHelplines.map((helpline) => (
            <div key={helpline.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {language === 'ta' && helpline.name_ta ? helpline.name_ta : helpline.name}
                  </h3>
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {helpline.category}
                  </span>
                </div>
              </div>

              {(helpline.description || helpline.description_ta) && (
                <p className="text-gray-600 text-sm mb-4">
                  {language === 'ta' && helpline.description_ta ? helpline.description_ta : helpline.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center text-gray-700">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  <span className="font-medium">{helpline.phone}</span>
                </div>
                <button
                  onClick={() => handleCall(helpline.phone)}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
                >
                  <PhoneIcon className="h-4 w-4 mr-1" />
                  {t('helpline.call', 'Call', 'அழைக்க')}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredHelplines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-blue-200 text-lg">
              {t('helpline.noResults', 'No helpline numbers found for this category', 'இந்த வகைக்கு உதவி எண்கள் எதுவும் கிடைக்கவில்லை')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

