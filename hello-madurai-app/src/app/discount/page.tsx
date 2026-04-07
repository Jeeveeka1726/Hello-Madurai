'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import NewHeader from '@/components/layout/NewHeader'
import NewspaperHeader from '@/components/NewspaperHeader'
import TranslatedText from '@/components/TranslatedText'
import { CreditCardIcon, GiftIcon } from '@heroicons/react/24/outline'

interface DiscountCard {
  id: string
  userId: string
  userName: string
  userEmail?: string
  userPhone?: string
  dCode: string
  isActive: boolean
  createdAt: string
  usages: DiscountUsage[]
}

interface DiscountUsage {
  id: string
  businessName: string
  businessPhone?: string
  shopkeeperName?: string
  amount?: number
  usedAt: string
}

export default function DiscountPage() {
  const { t, language } = useLanguage()
  const [card, setCard] = useState<DiscountCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  useEffect(() => {
    fetchOrCreateCard()
  }, [])

  const fetchOrCreateCard = async () => {
    try {
      const response = await fetch('/api/discount-card')
      if (response.ok) {
        const data = await response.json()
        setCard(data)
      } else if (response.status === 404) {
        // No card exists, show form to create one
        setCard(null)
      }
    } catch (error) {
      console.error('Error fetching discount card:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCard = async () => {
    try {
      const response = await fetch('/api/discount-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userInfo)
      })

      if (response.ok) {
        const data = await response.json()
        setCard(data)
      }
    } catch (error) {
      console.error('Error creating discount card:', error)
    }
  }

  const downloadCard = () => {
    // Implementation for downloading card as PDF/image
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <NewspaperHeader showTagline={true} />
        <NewHeader />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              <TranslatedText tamil="ஏற்றப்படுகிறது...">Loading...</TranslatedText>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <NewspaperHeader showTagline={true} />
      <NewHeader />

      {/* Header Section - Matching epaper style */}
      <div className="py-4 bg-white">
        <div className="text-center px-4 md:px-0">
          <div className="flex items-center justify-center mb-1">
            <CreditCardIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              <TranslatedText tamil="டிஜிட்டல் தள்ளுபடி அட்டை">Digital Discount Card</TranslatedText>
            </h1>
          </div>
          <p className="text-sm text-gray-600 font-medium mb-3">
            <TranslatedText tamil="மதுரை மாவட்டம் முழுவதும் தள்ளுபடி பெறுங்கள்">
              Get discounts across Madurai district
            </TranslatedText>
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {!card ? (
          /* Registration Form */
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8 max-w-md mx-auto">
            <div className="text-center mb-6">
              <GiftIcon className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                <TranslatedText tamil="உங்கள் தள்ளுபடி அட்டையைப் பெறுங்கள்">
                  Get Your Discount Card
                </TranslatedText>
              </h2>
              <p className="text-sm text-gray-600">
                <TranslatedText tamil="உங்கள் டிஜிட்டல் தள்ளுபடி அட்டையைப் பெற உங்கள் விவரங்களை நிரப்பவும்">
                  Fill in your details to get your digital discount card
                </TranslatedText>
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createCard(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatedText tamil="முழு பெயர்">Full Name</TranslatedText> *
                </label>
                <input
                  type="text"
                  required
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatedText tamil="மின்னஞ்சல்">Email</TranslatedText>
                </label>
                <input
                  type="email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatedText tamil="தொலைபேசி எண்">Phone Number</TranslatedText>
                </label>
                <input
                  type="tel"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <TranslatedText tamil="என் தள்ளுபடி அட்டையை உருவாக்கவும்">
                  Create My Discount Card
                </TranslatedText>
              </button>
            </form>
          </div>
        ) : (
          /* Discount Card Display */
          <div className="space-y-6">
            {/* Card Preview */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-xl p-6 sm:p-8 text-white max-w-md mx-auto transform hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Hello Madurai</h3>
                  <p className="text-blue-100 text-sm">
                    <TranslatedText tamil="தள்ளுபடி அட்டை">Discount Card</TranslatedText>
                  </p>
                </div>
                <CreditCardIcon className="h-8 w-8" />
              </div>

              <div className="mb-6">
                <p className="text-blue-100 text-xs sm:text-sm mb-1">
                  <TranslatedText tamil="பெயர்">Cardholder Name</TranslatedText>
                </p>
                <p className="text-lg sm:text-xl font-semibold">{card.userName}</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    <TranslatedText tamil="அட்டை ஐடி">Card ID</TranslatedText>
                  </p>
                  <p className="font-mono text-xs sm:text-sm">{card.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-xs sm:text-sm">
                    <TranslatedText tamil="நிலை">Status</TranslatedText>
                  </p>
                  <p className="text-xs sm:text-sm">
                    {card.isActive ? (
                      <TranslatedText tamil="செயலில்">Active</TranslatedText>
                    ) : (
                      <TranslatedText tamil="செயலில் இல்லை">Inactive</TranslatedText>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center">
              <button
                onClick={downloadCard}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <TranslatedText tamil="அட்டையைப் பதிவிறக்கவும்">Download Card</TranslatedText>
              </button>
            </div>

            {/* Usage Stats */}
            {card.usages && card.usages.length > 0 && (
              <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  <TranslatedText tamil="பயன்பாட்டு வரலாறு">Usage History</TranslatedText>
                </h3>
                <div className="space-y-3">
                  {card.usages.slice(0, 5).map((usage) => (
                    <div key={usage.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{usage.businessName}</p>
                        <p className="text-xs text-gray-600">{new Date(usage.usedAt).toLocaleDateString()}</p>
                      </div>
                      {usage.amount && (
                        <p className="text-green-600 font-medium text-sm">₹{usage.amount}</p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-4">
                  <TranslatedText tamil={`மொத்த பயன்பாடுகள்: ${card.usages?.length || 0}`}>
                    Total uses: {card.usages?.length || 0}
                  </TranslatedText>
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3">
                <TranslatedText tamil="எப்படி பயன்படுத்துவது">How to Use</TranslatedText>
              </h3>
              <ul className="space-y-2 text-blue-700 text-sm">
                <li>
                  • <TranslatedText tamil="பங்கேற்கும் கடைக்காரர்களுக்கு உங்கள் தள்ளுபடி அட்டையைக் காண்பிக்கவும்">
                    Show your discount card to participating shopkeepers
                  </TranslatedText>
                </li>
                <li>
                  • <TranslatedText tamil="அவர்கள் உங்கள் அட்டை ஐடியை சரிபார்த்து தள்ளுபடி பயன்படுத்துவார்கள்">
                    They will verify your card ID and apply discount
                  </TranslatedText>
                </li>
                <li>
                  • <TranslatedText tamil="மதுரை மாவட்டம் முழுவதும் தள்ளுபடிகளை அனுபவிக்கவும்">
                    Enjoy discounts across Madurai district
                  </TranslatedText>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

