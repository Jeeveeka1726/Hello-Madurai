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
  bookNowUrl: string | null
  bookNowPhone: string | null
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

  // Show all offers if no categories exist
  // If categories exist but offer has no category, show it in all categories
  const filteredOffers = !selectedCategory || categories.length === 0
    ? offers
    : offers.filter(offer => !offer.category || offer.category === selectedCategory)

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
              {language === 'ta' ? 'தள்ளுபடிகள்' : 'Discounts'}
            </h1>
          </div>
          <p className="text-lg text-gray-600 font-medium mb-6">
            {language === 'ta' ? 'எல்லா நாட்களிலும் தள்ளுபடி' : 'Discount On All Days'}
          </p>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-700 font-semibold mb-3 text-center">
                {language === 'ta' ? 'வகையைத் தேர்ந்தெடுக்கவும்' : 'Select Category'}
              </p>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 px-4 min-w-max justify-center">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                        selectedCategory === category.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {language === 'ta' ? category.name_ta || category.name : category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
          <div className="flex flex-col gap-8 max-w-4xl mx-auto">
            {filteredOffers.map((offer) => {
              // Determine the booking link - prefer phone number if available, otherwise use URL
              const bookingContact = offer.bookNowPhone || offer.bookNowUrl
              if (!bookingContact) return null // Skip offers without booking info

              const isPhoneNumber = offer.bookNowPhone || (offer.bookNowUrl && /^[\d\s\-\+\(\)]+$/.test(offer.bookNowUrl))
              const bookNowHref = isPhoneNumber
                ? (bookingContact.startsWith('tel:') ? bookingContact : `tel:${bookingContact}`)
                : bookingContact

              return (
                <div key={offer.id} className="flex flex-col gap-6">
                  {/* Offer Title */}
                  <div className="text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-wide">
                      {language === 'ta' && offer.title_ta ? offer.title_ta : offer.title}
                    </h3>
                  </div>

                  {/* Offer Image - Bigger and Separate */}
                  <div className="relative">
                    <img
                      src={offer.imageUrl}
                      alt={language === 'ta' && offer.title_ta ? offer.title_ta : offer.title}
                      className="w-full h-auto object-contain border-4 border-blue-500 rounded-lg"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 items-center justify-center">
                    <a
                      href={bookNowHref}
                      target={isPhoneNumber ? '_self' : '_blank'}
                      rel={isPhoneNumber ? undefined : 'noopener noreferrer'}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-8 rounded-lg text-center transition-all shadow-md hover:shadow-lg text-base transform hover:scale-105"
                    >
                      {language === 'ta' ? 'முன்பதிவு' : 'Book Now'}
                    </a>
                    <button
                      onClick={() => handleShare(offer)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-3 rounded-lg transition-all shadow-sm hover:shadow-md border border-gray-300"
                      aria-label="Share"
                      title={language === 'ta' ? 'பகிர்' : 'Share'}
                    >
                      <ShareIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

