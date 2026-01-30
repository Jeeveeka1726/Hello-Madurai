'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import { GiftIcon, ShareIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface Offer {
  id: string
  title: string
  title_ta: string | null
  imageUrl: string
  bookNowUrl: string
  active: boolean
  orderNumber: number
  category?: string
  createdAt: string
  updatedAt: string
}

interface Category {
  id: string
  name: string
  name_ta: string | null
  orderNumber: number
  active: boolean
}

export default function OffersPage() {
  const { t, language } = useLanguage()
  const [offers, setOffers] = useState<Offer[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetchOffers()
    fetchCategories()
  }, [])

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers')
      if (response.ok) {
        const data = await response.json()
        setOffers(data)
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/offer-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
        // Set first category as default
        if (data.length > 0) {
          setSelectedCategory(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleShare = async (offer: Offer) => {
    const shareData = {
      title: language === 'ta' && offer.title_ta ? offer.title_ta : offer.title,
      text: `Check out this offer: ${language === 'ta' && offer.title_ta ? offer.title_ta : offer.title}`,
      url: offer.bookNowUrl
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(offer.bookNowUrl)
        toast.success(language === 'ta' ? 'இணைப்பு நகலெடுக்கப்பட்டது!' : 'Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const filteredOffers = selectedCategory
    ? offers.filter(offer => offer.category === selectedCategory)
    : offers

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NewspaperHeader showTagline={true} />
        <NewHeader />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600 text-xl">
            {language === 'ta' ? 'ஏற்றுகிறது...' : 'Loading...'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NewspaperHeader showTagline={true} />
      <NewHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-2">
            <GiftIcon className="h-10 w-10 text-blue-600 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {language === 'ta' ? 'ஹலோ மதுரை தள்ளுபடி' : 'Hello Madurai Discount'}
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-medium mb-6">
            {language === 'ta' ? 'எல்லா நாட்களிலும் தள்ளுபடி' : 'Discount On All Days'}
          </p>

          {/* Category Filter */}
          <div className="mb-6">
            <p className="text-gray-700 font-semibold mb-3">
              {language === 'ta' ? 'வகையைத் தேர்ந்தெடுக்கவும்' : 'Select Category'}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {language === 'ta' ? category.name_ta : category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length === 0 ? (
          <div className="text-center py-12">
            <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'ta' ? 'தற்போது சலுகைகள் இல்லை' : 'No offers available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {/* Offer Title */}
                <div className="p-3 text-center border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 uppercase">
                    {language === 'ta' && offer.title_ta ? offer.title_ta : offer.title}
                  </h3>
                </div>

                {/* Offer Image */}
                <div className="relative bg-white">
                  <img
                    src={offer.imageUrl}
                    alt={language === 'ta' && offer.title_ta ? offer.title_ta : offer.title}
                    className="w-full h-auto object-contain"
                  />
                </div>

                {/* Action Buttons */}
                <div className="p-3 flex gap-2 border-t border-gray-200">
                  <a
                    href={offer.bookNowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-center transition-colors"
                  >
                    {language === 'ta' ? 'இப்போது முன்பதிவு செய்யுங்கள்' : 'Book Now'}
                  </a>
                  <button
                    onClick={() => handleShare(offer)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded transition-colors"
                    aria-label="Share"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

