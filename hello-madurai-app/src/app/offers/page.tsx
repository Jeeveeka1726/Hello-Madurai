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
  createdAt: string
  updatedAt: string
}

export default function OffersPage() {
  const { t, language } = useLanguage()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOffers()
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
          <div className="flex items-center justify-center mb-4">
            <GiftIcon className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
              {language === 'ta' ? 'சலுகைகள்' : 'Offers'}
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === 'ta' 
              ? 'மதுரை முழுவதும் சிறந்த சலுகைகளைப் பெறுங்கள்'
              : 'Get the best offers across Madurai'}
          </p>
        </div>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div className="text-center py-12">
            <GiftIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {language === 'ta' ? 'தற்போது சலுகைகள் இல்லை' : 'No offers available at the moment'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                {/* Offer Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={offer.imageUrl}
                    alt={language === 'ta' && offer.title_ta ? offer.title_ta : offer.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Offer Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language === 'ta' && offer.title_ta ? offer.title_ta : offer.title}
                  </h3>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <a
                      href={offer.bookNowUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-center transition-colors"
                    >
                      {language === 'ta' ? 'இப்போது முன்பதிவு செய்யுங்கள்' : 'Book Now'}
                    </a>
                    <button
                      onClick={() => handleShare(offer)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                      aria-label="Share"
                    >
                      <ShareIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

